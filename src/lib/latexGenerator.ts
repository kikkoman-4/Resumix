import { ResumeData, defaultTypography } from "@/types/resume";

/**
 * Escapes characters that have special meaning in LaTeX.
 */
export function escapeLatex(text: string | undefined | null): string {
  if (!text) return "";
  return text
    // Replace backslash first
    .replace(/\\/g, "\\textbackslash{}")
    // Escape standard special LaTeX characters
    .replace(/([&%$#_{}])/g, "\\$1")
    // Replace tilde and caret
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    // Clean up curly quotes or bullet symbols
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/•/g, "");
}

/**
 * Clean URL for native pdfTeX \pdflink URI parameter
 */
export function escapeLatexUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  // Ensure protocol
  const fullUrl = /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  // Escape parentheses in URL for pdfTeX dictionary
  return fullUrl.replace(/([\\()])/g, "\\$1");
}

/**
 * Strips http://, https://, and trailing slashes for clean link presentation
 */
export function formatDisplayUrl(url: string | undefined | null): string {
  if (!url) return "";
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

/**
 * Converts a hex color string like #0284c7 to uppercase 6-char hex without hash
 */
function cleanHexColor(hex: string | undefined | null): string {
  if (!hex) return "0284C7";
  const cleaned = hex.replace(/[^0-9a-fA-F]/g, "");
  if (cleaned.length === 3) {
    return cleaned
      .split("")
      .map((c) => c + c)
      .join("")
      .toUpperCase();
  }
  if (cleaned.length >= 6) {
    return cleaned.slice(0, 6).toUpperCase();
  }
  return "0284C7";
}

/**
 * Maps typography font choice to LaTeX package / font switch
 */
function getFontPackageDirective(fontFamily: string): string {
  switch (fontFamily) {
    case "Helvetica":
      return `\\usepackage[scaled=0.92]{helvet}\n\\renewcommand{\\familydefault}{\\sfdefault}`;
    case "Times-Roman":
      return `\\usepackage{times}`;
    case "Palatino":
      return `\\usepackage{palatino}`;
    case "Courier":
      return `\\usepackage{courier}\n\\renewcommand{\\familydefault}{\\ttdefault}`;
    case "Computer-Modern":
    default:
      return `% Standard Computer Modern fonts`;
  }
}

/**
 * Generates the full LaTeX document source from ResumeData
 */
export function generateLatexDocument(resume: ResumeData): string {
  const typo = resume.typography || defaultTypography;
  const p = resume.personalInfo;
  const primaryHex = cleanHexColor(typo.primaryColor);

  // Font styling helpers
  const nameStyleCmd = `${typo.nameBold ? "\\bfseries" : ""}${typo.nameItalic ? "\\itshape" : ""}`;
  const jobTitleStyleCmd = `${typo.jobTitleBold ? "\\bfseries" : ""}${typo.jobTitleItalic ? "\\itshape" : ""}`;
  const sectionTitleStyleCmd = `${typo.sectionTitleBold ? "\\bfseries" : ""}${typo.sectionTitleItalic ? "\\itshape" : ""}`;

  // Contact items row
  const contactLinks: string[] = [];

  if (p.email) {
    const cleanMail = escapeLatex(p.email.trim());
    contactLinks.push(`\\pdflink{mailto:${p.email.trim()}}{${cleanMail}}`);
  }
  if (p.phone) {
    const cleanPhone = escapeLatex(p.phone.trim());
    const telNumber = p.phone.replace(/[^0-9+]/g, "");
    contactLinks.push(`\\pdflink{tel:${telNumber}}{${cleanPhone}}`);
  }
  if (p.location) {
    contactLinks.push(escapeLatex(p.location.trim()));
  }
  if (p.website) {
    const displayWeb = escapeLatex(formatDisplayUrl(p.website));
    const targetUrl = escapeLatexUrl(p.website);
    contactLinks.push(`\\pdflink{${targetUrl}}{${displayWeb}}`);
  }
  if (p.linkedin) {
    const displayLinkedin = escapeLatex(formatDisplayUrl(p.linkedin));
    const targetUrl = escapeLatexUrl(p.linkedin);
    contactLinks.push(`\\pdflink{${targetUrl}}{${displayLinkedin}}`);
  }
  if (p.github) {
    const displayGithub = escapeLatex(formatDisplayUrl(p.github));
    const targetUrl = escapeLatexUrl(p.github);
    contactLinks.push(`\\pdflink{${targetUrl}}{${displayGithub}}`);
  }

  const contactLine = contactLinks.length > 0 
    ? `{\\small\\color{subtext} ${contactLinks.join(" \\ $|$ \\ ")}}` 
    : "";

  // Section generators
  const renderSummary = (): string => {
    if (!resume.summary || !resume.summary.trim()) return "";
    return `
\\resumesection{Professional Summary}
${escapeLatex(resume.summary.trim())}
`;
  };

  const renderWorkExperience = (): string => {
    if (!resume.workExperiences || resume.workExperiences.length === 0) return "";
    const items = resume.workExperiences.map((w) => {
      const dates = [w.startDate, w.current ? "Present" : w.endDate].filter(Boolean).join(" -- ");
      const company = escapeLatex(w.company);
      const position = escapeLatex(w.position);
      const location = escapeLatex(w.location);

      const bullets = (w.highlights || [])
        .map((h) => h.trim())
        .filter(Boolean)
        .map((h) => `    \\item ${escapeLatex(h)}`)
        .join("\n");

      return `
\\resumeSubheading{${position}}{${escapeLatex(dates)}}{${company}}{${location}}
${bullets ? `\\begin{resumeItemList}\n${bullets}\n\\end{resumeItemList}` : "\\vspace{2pt}"}
`;
    }).join("\n");

    return `
\\resumesection{Work Experience}
${items}
`;
  };

  const renderEducation = (): string => {
    if (!resume.educations || resume.educations.length === 0) return "";
    const items = resume.educations.map((edu) => {
      const dates = [edu.startDate, edu.endDate].filter(Boolean).join(" -- ");
      const degreeLine = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(", ");
      const degreeText = escapeLatex(degreeLine);
      const institution = escapeLatex(edu.institution);
      const location = escapeLatex(edu.location);

      const extraNotes: string[] = [];
      if (edu.gpa) {
        extraNotes.push(`GPA: ${escapeLatex(edu.gpa)}`);
      }
      if (edu.honors && edu.honors.length > 0) {
        extraNotes.push(`Honors: ${escapeLatex(edu.honors.join(", "))}`);
      }

      const noteBullets = extraNotes
        .map((note) => `    \\item ${note}`)
        .join("\n");

      return `
\\resumeSubheading{${institution}}{${escapeLatex(dates)}}{${degreeText}}{${location}}
${noteBullets ? `\\begin{resumeItemList}\n${noteBullets}\n\\end{resumeItemList}` : "\\vspace{2pt}"}
`;
    }).join("\n");

    return `
\\resumesection{Education}
${items}
`;
  };

  const renderProjects = (): string => {
    if (!resume.projects || resume.projects.length === 0) return "";
    const items = resume.projects.map((proj) => {
      const name = escapeLatex(proj.name);
      const tech = proj.technologies && proj.technologies.length > 0
        ? escapeLatex(proj.technologies.join(", "))
        : "";
      
      const linkLabel = proj.link ? escapeLatex(formatDisplayUrl(proj.link)) : "";
      const linkUrl = proj.link ? escapeLatexUrl(proj.link) : "";
      const linkCmd = proj.link ? `\\pdflink{${linkUrl}}{${linkLabel}}` : "";

      const bullets: string[] = [];
      if (proj.description && proj.description.trim()) {
        bullets.push(`    \\item ${escapeLatex(proj.description.trim())}`);
      }
      if (proj.highlights && proj.highlights.length > 0) {
        proj.highlights
          .map((h) => h.trim())
          .filter(Boolean)
          .forEach((h) => bullets.push(`    \\item ${escapeLatex(h)}`));
      }

      return `
\\resumeProjectHeading{${name}}{${linkCmd}}{${tech ? `Technologies: ${tech}` : ""}}
${bullets.length > 0 ? `\\begin{resumeItemList}\n${bullets.join("\n")}\n\\end{resumeItemList}` : "\\vspace{2pt}"}
`;
    }).join("\n");

    return `
\\resumesection{Projects}
${items}
`;
  };

  const renderSkills = (): string => {
    if (!resume.skills || resume.skills.length === 0) return "";
    const rows = resume.skills.map((skillGroup) => {
      const category = escapeLatex(skillGroup.categoryName);
      const items = escapeLatex(skillGroup.items.join(", "));
      return `\\textbf{${category}:} ${items} \\\\`;
    }).join("\n");

    return `
\\resumesection{Skills \\& Technologies}
\\vspace{1pt}
${rows}
\\vspace{2pt}
`;
  };

  // Build sections according to user's defined sectionOrder
  const sectionRenderers: Record<string, () => string> = {
    summary: renderSummary,
    workExperiences: renderWorkExperience,
    work: renderWorkExperience,
    experience: renderWorkExperience,
    educations: renderEducation,
    education: renderEducation,
    projects: renderProjects,
    skills: renderSkills,
  };

  const renderedSections = (resume.sectionOrder || ["summary", "workExperiences", "skills", "projects", "educations"])
    .map((key) => sectionRenderers[key]?.() || "")
    .filter(Boolean)
    .join("\n");

  const fontDirectives = getFontPackageDirective(typo.fontFamily || "Helvetica");

  return `%--------------------------------------------------------------------------------
% Resumix LaTeX Resume Builder
% Compiled with pdfTeX (Zero external dependencies)
%--------------------------------------------------------------------------------
\\documentclass[letterpaper,10pt]{article}

% Base dimension geometry settings
\\setlength{\\topmargin}{-0.65in}
\\setlength{\\textheight}{10.3in}
\\setlength{\\oddsidemargin}{-0.5in}
\\setlength{\\evensidemargin}{-0.5in}
\\setlength{\\textwidth}{7.5in}
\\setlength{\\headheight}{0pt}
\\setlength{\\headsep}{0pt}
\\setlength{\\footskip}{12pt}
\\pagestyle{empty}
\\raggedbottom
\\raggedright

% Packages
\\usepackage{xcolor}
${fontDirectives}

% Palette
\\definecolor{primary}{HTML}{${primaryHex}}
\\definecolor{dark}{HTML}{0F172A}
\\definecolor{subtext}{HTML}{475569}

% Native pdfTeX link macro
\\newcommand{\\pdflink}[2]{%
  \\leavevmode%
  \\pdfstartlink user{/Subtype /Link /Border [0 0 0] /A << /S /URI /URI (#1) >>}%
  {\\color{primary}#2}%
  \\pdfendlink%
}

% Section Header Command
\\newcommand{\\resumesection}[1]{%
  \\vspace{7pt}%
  {\\color{primary}${sectionTitleStyleCmd}\\large #1}%
  ${typo.showSectionLines ? `\\\\[2pt]\n  \\hrule height 0.75pt\\relax%` : `\\\\[1pt]`}%
  \\vspace{4pt}%
}

% Subheading: [Title/Position, Date, Company/Institution, Location]
\\newcommand{\\resumeSubheading}[4]{%
  \\vspace{2pt}%
  \\noindent\\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}%
    \\textbf{#1} & \\textbf{#2} \\\\%
    {\\color{subtext}\\textit{#3}} & {\\color{subtext}\\textit{#4}} \\\\%
  \\end{tabular*}\\par%
  \\vspace{-2pt}%
}

% Project Heading: [Name, Link/Date, Technologies]
\\newcommand{\\resumeProjectHeading}[3]{%
  \\vspace{2pt}%
  \\noindent\\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}%
    \\textbf{#1} & #2 \\\\%
  \\end{tabular*}\\par%
  \\ifx&#3&%
  \\else%
    {\\small\\color{subtext}#3}\\par%
  \\fi%
  \\vspace{-2pt}%
}

% Tight bullet list
\\newenvironment{resumeItemList}{%
  \\begin{itemize}%
    \\setlength{\\topsep}{2pt}%
    \\setlength{\\itemsep}{1.5pt}%
    \\setlength{\\parskip}{0pt}%
    \\setlength{\\parsep}{0pt}%
    \\setlength{\\leftmargin}{14pt}%
}{%
  \\end{itemize}%
}

\\begin{document}

% Header
{\\Huge${nameStyleCmd} ${escapeLatex(p.fullName)}} \\\\[2pt]
{\\color{primary}\\large${jobTitleStyleCmd} ${escapeLatex(p.jobTitle)}} \\\\[4pt]
${contactLine ? `${contactLine}\\\\[6pt]` : ""}
${typo.showHeaderLine ? `\\hrule height 1.2pt\\relax\n\\vspace{6pt}` : ""}

% Sections
${renderedSections}

\\end{document}
`;
}
