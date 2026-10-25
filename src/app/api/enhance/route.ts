import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, type, context } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Graceful high-quality heuristic fallback if API key is not yet set
      const enhanced = enhanceBulletLocal(text, type);
      return NextResponse.json({
        enhancedText: enhanced,
        source: "local-fallback",
        note: "Add OPENAI_API_KEY to .env.local for full LLM-driven polishing.",
      });
    }

    // Call OpenAI API when key is configured
    const prompt = `You are an executive resume editor and ATS specialist. 
Your goal is to optimize the following resume ${type || "bullet point"} to be concise, impactful, metric-driven, and begin with a strong active verb.
Context: ${context || "Professional resume"}
Original: "${text}"

Rules:
1. Return ONLY the enhanced version, with no quotation marks or meta commentary.
2. Maximize readability and ATS keyword relevance.
3. Quantify results where implied.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert resume writer." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: "OpenAI error", details: err }, { status: 500 });
    }

    const data = await response.json();
    const enhancedText = data.choices?.[0]?.message?.content?.trim() || text;

    return NextResponse.json({ enhancedText, source: "openai" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

function enhanceBulletLocal(text: string, type?: string): string {
  let cleaned = text.trim().replace(/^[-•*]\s*/, "");
  
  // Power verbs replacement map for starter words
  const powerVerbStarters = [
    { from: /^(responsible for|worked on|helped with|did)\s+/i, to: "Spearheaded " },
    { from: /^(managed|led)\s+/i, to: "Orchestrated " },
    { from: /^(created|built|made)\s+/i, to: "Architected and engineered " },
    { from: /^(changed|updated|improved)\s+/i, to: "Optimized and modernized " },
  ];

  for (const { from, to } of powerVerbStarters) {
    if (from.test(cleaned)) {
      cleaned = cleaned.replace(from, to);
      break;
    }
  }

  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Ensure trailing period
  if (!cleaned.endsWith(".")) {
    cleaned += ".";
  }

  return cleaned;
}
