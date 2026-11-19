export interface CatalogSkill {
  name: string;
  category: CatalogCategory;
  aliases?: string[];
  popular?: boolean;
}

export type CatalogCategory =
  | "Languages"
  | "Frontend"
  | "Backend"
  | "Databases"
  | "Cloud & DevOps"
  | "AI & Machine Learning"
  | "Mobile"
  | "Testing & QA"
  | "Architecture & Tools";

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  "Languages",
  "Frontend",
  "Backend",
  "Databases",
  "Cloud & DevOps",
  "AI & Machine Learning",
  "Mobile",
  "Testing & QA",
  "Architecture & Tools",
];

export const SKILLS_CATALOG: CatalogSkill[] = [
  // --- Languages ---
  { name: "TypeScript", category: "Languages", popular: true, aliases: ["ts"] },
  { name: "JavaScript (ESNext)", category: "Languages", popular: true, aliases: ["js", "javascript"] },
  { name: "Python", category: "Languages", popular: true, aliases: ["py"] },
  { name: "Java", category: "Languages", popular: true },
  { name: "C++", category: "Languages", popular: true, aliases: ["cpp"] },
  { name: "C", category: "Languages" },
  { name: "C#", category: "Languages", popular: true, aliases: ["csharp", ".net"] },
  { name: "Rust", category: "Languages", popular: true },
  { name: "Go (Golang)", category: "Languages", popular: true, aliases: ["go", "golang"] },
  { name: "Swift", category: "Languages", popular: true },
  { name: "Kotlin", category: "Languages", popular: true },
  { name: "PHP", category: "Languages" },
  { name: "Ruby", category: "Languages" },
  { name: "SQL", category: "Languages", popular: true },
  { name: "R", category: "Languages" },
  { name: "Scala", category: "Languages" },
  { name: "Dart", category: "Languages" },
  { name: "Elixir", category: "Languages" },
  { name: "Haskell", category: "Languages" },
  { name: "Shell / Bash", category: "Languages", popular: true, aliases: ["bash", "shell", "sh"] },
  { name: "PowerShell", category: "Languages" },
  { name: "Lua", category: "Languages" },
  { name: "Perl", category: "Languages" },
  { name: "Julia", category: "Languages" },
  { name: "Zig", category: "Languages" },

  // --- Frontend ---
  { name: "React", category: "Frontend", popular: true, aliases: ["react.js", "reactjs"] },
  { name: "Next.js", category: "Frontend", popular: true, aliases: ["nextjs"] },
  { name: "Vue.js", category: "Frontend", popular: true, aliases: ["vue", "vuejs"] },
  { name: "Nuxt.js", category: "Frontend", aliases: ["nuxt"] },
  { name: "Angular", category: "Frontend", popular: true },
  { name: "Svelte", category: "Frontend", popular: true },
  { name: "SvelteKit", category: "Frontend" },
  { name: "Solid.js", category: "Frontend", aliases: ["solidjs"] },
  { name: "Remix", category: "Frontend" },
  { name: "Astro", category: "Frontend" },
  { name: "HTML5", category: "Frontend", popular: true, aliases: ["html"] },
  { name: "CSS3", category: "Frontend", popular: true, aliases: ["css"] },
  { name: "Tailwind CSS", category: "Frontend", popular: true, aliases: ["tailwind"] },
  { name: "Sass / SCSS", category: "Frontend", aliases: ["sass", "scss"] },
  { name: "CSS Modules", category: "Frontend" },
  { name: "Styled Components", category: "Frontend" },
  { name: "Shadcn UI", category: "Frontend", popular: true, aliases: ["shadcn"] },
  { name: "Radix UI", category: "Frontend" },
  { name: "Material-UI (MUI)", category: "Frontend", aliases: ["mui", "material ui"] },
  { name: "Chakra UI", category: "Frontend" },
  { name: "Ant Design", category: "Frontend" },
  { name: "Bootstrap", category: "Frontend" },
  { name: "Redux Toolkit", category: "Frontend", popular: true, aliases: ["redux", "rtk"] },
  { name: "Zustand", category: "Frontend", popular: true },
  { name: "Jotai", category: "Frontend" },
  { name: "TanStack Query", category: "Frontend", popular: true, aliases: ["react query", "react-query"] },
  { name: "SWR", category: "Frontend" },
  { name: "Framer Motion", category: "Frontend", popular: true },
  { name: "Three.js", category: "Frontend", aliases: ["webgl"] },
  { name: "Vite", category: "Frontend", popular: true },
  { name: "Webpack", category: "Frontend" },
  { name: "Turbopack", category: "Frontend" },

  // --- Backend ---
  { name: "Node.js", category: "Backend", popular: true, aliases: ["nodejs", "node"] },
  { name: "Express.js", category: "Backend", popular: true, aliases: ["express"] },
  { name: "NestJS", category: "Backend", popular: true, aliases: ["nest"] },
  { name: "Fastify", category: "Backend" },
  { name: "FastAPI", category: "Backend", popular: true },
  { name: "Django", category: "Backend", popular: true },
  { name: "Flask", category: "Backend" },
  { name: "Spring Boot", category: "Backend", popular: true, aliases: ["spring"] },
  { name: "ASP.NET Core", category: "Backend", popular: true, aliases: ["asp.net", "dotnet"] },
  { name: "Ruby on Rails", category: "Backend", aliases: ["rails"] },
  { name: "Laravel", category: "Backend", popular: true },
  { name: "Gin", category: "Backend" },
  { name: "Actix Web", category: "Backend" },
  { name: "Axum", category: "Backend" },
  { name: "RESTful APIs", category: "Backend", popular: true, aliases: ["rest api", "restful"] },
  { name: "GraphQL", category: "Backend", popular: true },
  { name: "Apollo GraphQL", category: "Backend", aliases: ["apollo"] },
  { name: "gRPC", category: "Backend", popular: true },
  { name: "tRPC", category: "Backend", popular: true },
  { name: "WebSockets", category: "Backend", aliases: ["socket.io"] },
  { name: "Apache Kafka", category: "Backend", popular: true, aliases: ["kafka"] },
  { name: "RabbitMQ", category: "Backend", popular: true },
  { name: "Celery", category: "Backend" },

  // --- Databases ---
  { name: "PostgreSQL", category: "Databases", popular: true, aliases: ["postgres", "psql"] },
  { name: "MySQL", category: "Databases", popular: true },
  { name: "SQLite", category: "Databases", popular: true },
  { name: "MongoDB", category: "Databases", popular: true, aliases: ["mongo"] },
  { name: "Redis", category: "Databases", popular: true },
  { name: "Amazon DynamoDB", category: "Databases", aliases: ["dynamodb"] },
  { name: "Elasticsearch", category: "Databases", popular: true },
  { name: "Supabase", category: "Databases", popular: true },
  { name: "Firebase Firestore", category: "Databases", aliases: ["firebase", "firestore"] },
  { name: "Apache Cassandra", category: "Databases", aliases: ["cassandra"] },
  { name: "Neo4j", category: "Databases" },
  { name: "Prisma ORM", category: "Databases", popular: true, aliases: ["prisma"] },
  { name: "Drizzle ORM", category: "Databases", popular: true, aliases: ["drizzle"] },
  { name: "TypeORM", category: "Databases" },
  { name: "SQLAlchemy", category: "Databases" },
  { name: "Mongoose", category: "Databases" },

  // --- Cloud & DevOps ---
  { name: "Docker", category: "Cloud & DevOps", popular: true },
  { name: "Kubernetes", category: "Cloud & DevOps", popular: true, aliases: ["k8s"] },
  { name: "Terraform", category: "Cloud & DevOps", popular: true },
  { name: "AWS", category: "Cloud & DevOps", popular: true, aliases: ["amazon web services"] },
  { name: "AWS Lambda", category: "Cloud & DevOps" },
  { name: "Amazon S3", category: "Cloud & DevOps" },
  { name: "Amazon ECS / EKS", category: "Cloud & DevOps" },
  { name: "Google Cloud (GCP)", category: "Cloud & DevOps", popular: true, aliases: ["gcp", "google cloud platform"] },
  { name: "Microsoft Azure", category: "Cloud & DevOps", popular: true, aliases: ["azure"] },
  { name: "GitHub Actions", category: "Cloud & DevOps", popular: true, aliases: ["github action"] },
  { name: "GitLab CI/CD", category: "Cloud & DevOps", aliases: ["gitlab ci"] },
  { name: "CI/CD Pipelines", category: "Cloud & DevOps", popular: true, aliases: ["ci/cd", "cicd"] },
  { name: "Linux / Unix", category: "Cloud & DevOps", popular: true, aliases: ["linux", "unix"] },
  { name: "Nginx", category: "Cloud & DevOps", popular: true },
  { name: "Helm", category: "Cloud & DevOps" },
  { name: "Ansible", category: "Cloud & DevOps" },
  { name: "Cloudflare", category: "Cloud & DevOps", aliases: ["cloudflare workers"] },
  { name: "Vercel", category: "Cloud & DevOps", popular: true },
  { name: "Datadog", category: "Cloud & DevOps" },
  { name: "Prometheus", category: "Cloud & DevOps" },
  { name: "Grafana", category: "Cloud & DevOps" },

  // --- AI & Machine Learning ---
  { name: "PyTorch", category: "AI & Machine Learning", popular: true },
  { name: "TensorFlow", category: "AI & Machine Learning", popular: true },
  { name: "Scikit-Learn", category: "AI & Machine Learning", popular: true, aliases: ["sklearn"] },
  { name: "Pandas", category: "AI & Machine Learning", popular: true },
  { name: "NumPy", category: "AI & Machine Learning", popular: true },
  { name: "OpenCV", category: "AI & Machine Learning" },
  { name: "Hugging Face", category: "AI & Machine Learning", popular: true },
  { name: "LangChain", category: "AI & Machine Learning", popular: true },
  { name: "LlamaIndex", category: "AI & Machine Learning" },
  { name: "Google Gemini API", category: "AI & Machine Learning", popular: true, aliases: ["gemini", "gemini api"] },
  { name: "OpenAI API", category: "AI & Machine Learning", popular: true, aliases: ["openai", "gpt-4"] },
  { name: "Vector Databases (Pinecone / Chroma)", category: "AI & Machine Learning", aliases: ["pinecone", "chromadb", "vector db"] },
  { name: "RAG Architecture", category: "AI & Machine Learning", aliases: ["rag"] },

  // --- Mobile ---
  { name: "React Native", category: "Mobile", popular: true },
  { name: "Flutter", category: "Mobile", popular: true },
  { name: "Expo", category: "Mobile", popular: true },
  { name: "iOS (Swift / SwiftUI)", category: "Mobile", aliases: ["swiftui", "ios"] },
  { name: "Android (Jetpack Compose)", category: "Mobile", aliases: ["jetpack compose", "android"] },
  { name: "Electron", category: "Mobile" },
  { name: "Tauri", category: "Mobile" },

  // --- Testing & QA ---
  { name: "Jest", category: "Testing & QA", popular: true },
  { name: "Vitest", category: "Testing & QA", popular: true },
  { name: "Cypress", category: "Testing & QA", popular: true },
  { name: "Playwright", category: "Testing & QA", popular: true },
  { name: "React Testing Library", category: "Testing & QA", aliases: ["rtl"] },
  { name: "Postman", category: "Testing & QA", popular: true },
  { name: "Selenium", category: "Testing & QA" },
  { name: "PyTest", category: "Testing & QA", popular: true },
  { name: "JUnit", category: "Testing & QA" },

  // --- Architecture & Tools ---
  { name: "Git", category: "Architecture & Tools", popular: true },
  { name: "Microservices", category: "Architecture & Tools", popular: true },
  { name: "System Design", category: "Architecture & Tools", popular: true },
  { name: "Serverless Architecture", category: "Architecture & Tools" },
  { name: "Event-Driven Architecture", category: "Architecture & Tools" },
  { name: "Agile / Scrum", category: "Architecture & Tools", popular: true, aliases: ["agile", "scrum"] },
  { name: "JIRA", category: "Architecture & Tools" },
  { name: "Figma", category: "Architecture & Tools" },
];

/**
 * Intelligent keyword scanner to extract matching catalog skills from raw text
 */
export function extractSkillsFromText(text: string): Record<string, string[]> {
  const normalized = text.toLowerCase();
  const grouped: Record<string, Set<string>> = {
    "Languages": new Set(),
    "Frameworks & Libraries": new Set(),
    "Cloud & Infrastructure": new Set(),
    "Databases & Storage": new Set(),
    "Developer Tools & Architecture": new Set(),
  };

  const mapCategoryToResumeCat = (cat: CatalogCategory): string => {
    switch (cat) {
      case "Languages":
        return "Languages";
      case "Frontend":
      case "Backend":
      case "Mobile":
        return "Frameworks & Libraries";
      case "Databases":
        return "Databases & Storage";
      case "Cloud & DevOps":
        return "Cloud & Infrastructure";
      case "AI & Machine Learning":
      case "Testing & QA":
      case "Architecture & Tools":
      default:
        return "Developer Tools & Architecture";
    }
  };

  for (const skill of SKILLS_CATALOG) {
    const namesToMatch = [skill.name.toLowerCase(), ...(skill.aliases || []).map((a) => a.toLowerCase())];
    for (const token of namesToMatch) {
      // Escape for regex boundary
      const safeToken = token.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const pattern = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${safeToken}(?:$|[^a-zA-Z0-9_#+])`, "i");
      if (pattern.test(normalized)) {
        const targetCat = mapCategoryToResumeCat(skill.category);
        grouped[targetCat].add(skill.name);
        break;
      }
    }
  }

  const result: Record<string, string[]> = {};
  for (const [cat, set] of Object.entries(grouped)) {
    if (set.size > 0) {
      result[cat] = Array.from(set);
    }
  }
  return result;
}
