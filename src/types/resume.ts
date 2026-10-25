export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  highlights: string[];
}

export interface SkillCategory {
  id: string;
  categoryName: string;
  items: string[];
}

export interface ResumeData {
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  workExperiences: WorkExperience[];
  educations: Education[];
  projects: Project[];
  skills: SkillCategory[];
  sectionOrder: string[]; // e.g. ['summary', 'work', 'skills', 'projects', 'education']
}

export const initialResumeData: ResumeData = {
  title: "Software Engineer Resume",
  personalInfo: {
    fullName: "Alex Rivera",
    jobTitle: "Senior Full-Stack Engineer",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    website: "https://alexrivera.dev",
    linkedin: "https://linkedin.com/in/alexrivera",
    github: "https://github.com/alexrivera",
  },
  summary:
    "Product-minded Senior Full-Stack Engineer with 6+ years of experience engineering high-performance web applications, distributed cloud services, and responsive design systems. Passionate about developer ergonomics, ATS optimization, and AI tooling.",
  workExperiences: [
    {
      id: "exp-1",
      company: "Apex Tech Labs",
      position: "Lead Software Engineer",
      location: "San Francisco, CA",
      startDate: "2023",
      endDate: "Present",
      current: true,
      highlights: [
        "Architected Next.js and TypeScript micro-frontends serving 1.2M+ monthly active users, improving core web vitals by 42%.",
        "Pioneered LLM-assisted workflow features reducing customer resume creation turnaround from 45 minutes to under 8 minutes.",
        "Mentored a distributed engineering team of 7 and introduced end-to-end automated testing pipelines.",
      ],
    },
    {
      id: "exp-2",
      company: "CloudScale Systems",
      position: "Full-Stack Developer",
      location: "Austin, TX",
      startDate: "2020",
      endDate: "2023",
      current: false,
      highlights: [
        "Engineered real-time collaboration dashboards using WebSocket streams and React with zero-downtime deployments.",
        "Refactored legacy document generation pipeline into asynchronous serverless workers, decreasing latency by 65%.",
      ],
    },
  ],
  educations: [
    {
      id: "edu-1",
      institution: "University of California, Berkeley",
      degree: "B.S. in Computer Science",
      fieldOfStudy: "Computer Science & Engineering",
      location: "Berkeley, CA",
      startDate: "2016",
      endDate: "2020",
      gpa: "3.85 / 4.0",
      honors: ["Dean's Honors List (All Quarters)", "Summa Cum Laude"],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Resumix Studio",
      description: "AI-driven resume tailoring engine with instant PDF preview and layout reordering.",
      technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "OpenAI API"],
      link: "https://github.com/example/resumix",
      highlights: [
        "Designed modular drag-and-drop section reordering system with instant state persistence.",
        "Built dynamic ATS keyword analyzer benchmarking resume fit against live job descriptions.",
      ],
    },
  ],
  skills: [
    {
      id: "skill-1",
      categoryName: "Languages & Frameworks",
      items: ["TypeScript", "JavaScript (ESNext)", "React", "Next.js", "Node.js", "Python", "Tailwind CSS"],
    },
    {
      id: "skill-2",
      categoryName: "Cloud & Infrastructure",
      items: ["Docker", "AWS", "PostgreSQL", "Redis", "Vercel", "Git / GitHub Actions"],
    },
  ],
  sectionOrder: ["summary", "workExperiences", "skills", "projects", "educations"],
};
