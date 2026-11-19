import { NextRequest, NextResponse } from "next/server";
import { extractSkillsFromText } from "@/lib/skillsCatalog";
import { SkillCategory } from "@/types/resume";

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, targetRole, existingSkills, mode, apiKey } = await req.json();

    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return NextResponse.json({ error: "Job description is required." }, { status: 400 });
    }

    const geminiKey = apiKey || process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const tailoredCategories = await callGeminiSkills(
          geminiKey,
          jobDescription.trim(),
          targetRole,
          existingSkills,
          mode
        );
        if (tailoredCategories && tailoredCategories.length > 0) {
          return NextResponse.json({
            categories: tailoredCategories,
            source: "gemini",
            model: "gemini-2.5-flash",
          });
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to local ATS keyword extractor:", geminiError);
      }
    }

    // High-precision local ATS keyword extractor fallback
    const extracted = extractSkillsFromText(jobDescription);
    const fallbackCategories: SkillCategory[] = Object.entries(extracted).map(([catName, items], idx) => ({
      id: `skill-cat-ats-${Date.now()}-${idx}`,
      categoryName: catName,
      items: items.slice(0, 10),
    }));

    // If merge mode is requested, combine with existing skills
    let finalCategories = fallbackCategories;
    if (mode === "merge" && existingSkills && existingSkills.length > 0) {
      const mergedMap = new Map<string, Set<string>>();
      existingSkills.forEach((group: SkillCategory) => {
        mergedMap.set(group.categoryName, new Set(group.items));
      });
      fallbackCategories.forEach((cat) => {
        const existingSet = mergedMap.get(cat.categoryName) || new Set();
        cat.items.forEach((item) => existingSet.add(item));
        mergedMap.set(cat.categoryName, existingSet);
      });
      finalCategories = Array.from(mergedMap.entries()).map(([catName, set], idx) => ({
        id: `skill-cat-merged-${Date.now()}-${idx}`,
        categoryName: catName,
        items: Array.from(set),
      }));
    }

    return NextResponse.json({
      categories: finalCategories.length > 0 ? finalCategories : getDefaultFallbackSkills(),
      source: "local-ats-extractor",
      note: geminiKey
        ? "Gemini API failed or rate-limited; extracted skills using local ATS scanner."
        : "Provide a free Google Gemini API Key for deep contextual reasoning.",
    });
  } catch (error) {
    console.error("Error in tailor-skills route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function callGeminiSkills(
  apiKey: string,
  jobDescription: string,
  targetRole?: string,
  existingSkills?: SkillCategory[],
  mode?: "replace" | "merge"
): Promise<SkillCategory[] | null> {
  const existingContext =
    mode === "merge" && existingSkills && existingSkills.length > 0
      ? `\nExisting Candidate Skills:\n${JSON.stringify(
          existingSkills.map((s) => ({ category: s.categoryName, items: s.items }))
        )}\n(Preserve relevant candidate skills while adding job-required skills).`
      : "";

  const systemPrompt = `You are a Principal Technical Recruiter and ATS Resume Optimization Specialist.
Your task is to analyze the following target job description and extract the most impactful, high-relevance technical skills.
Organize them into 3 to 5 logical skill categories (such as "Languages", "Frameworks & Libraries", "Cloud & DevOps", "Databases & Storage", "Tools & Methodologies").

Rules:
1. Return ONLY a valid JSON array of objects.
2. Each object MUST strictly follow this schema:
   {
     "categoryName": "Category Name",
     "items": ["Skill 1", "Skill 2", "Skill 3"]
   }
3. Each category should contain between 4 and 8 concise, industry-standard skill names (e.g. "TypeScript", "React", "PostgreSQL", "Docker", "AWS", "CI/CD").
4. Order categories and items by descending relevance to the target job.
5. Do not include markdown code block backticks if possible, return raw valid JSON.`;

  const userPrompt = `Target Role: ${targetRole || "Software Engineer"}
${existingContext}

Job Description & Requirements:
${jobDescription}`;

  // Try gemini-2.5-flash first, then gemini-1.5-flash
  const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash"];

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Gemini model ${model} returned error status ${response.status}:`, errorText);
        continue;
      }

      const json = await response.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      // Clean any potential markdown wrapping
      const cleanedText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(cleanedText);

      if (Array.isArray(parsed)) {
        return parsed
          .filter((cat) => cat && typeof cat.categoryName === "string" && Array.isArray(cat.items))
          .map((cat, idx) => ({
            id: `skill-cat-gemini-${Date.now()}-${idx}`,
            categoryName: cat.categoryName.trim(),
            items: cat.items.map((it: unknown) => String(it).trim()).filter(Boolean),
          }));
      }
    } catch (err) {
      console.warn(`Failed call to ${model}:`, err);
    }
  }

  return null;
}

function getDefaultFallbackSkills(): SkillCategory[] {
  return [
    {
      id: "skill-cat-default-1",
      categoryName: "Languages",
      items: ["TypeScript", "JavaScript", "Python", "SQL"],
    },
    {
      id: "skill-cat-default-2",
      categoryName: "Frameworks & Libraries",
      items: ["React", "Next.js", "Node.js", "Tailwind CSS"],
    },
    {
      id: "skill-cat-default-3",
      categoryName: "Cloud & DevOps",
      items: ["Docker", "AWS", "Git", "CI/CD Pipelines"],
    },
  ];
}
