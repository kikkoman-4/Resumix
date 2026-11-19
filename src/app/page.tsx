"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { 
  initialResumeData, 
  ResumeData, 
  WorkExperience, 
  Project, 
  defaultTypography 
} from "@/types/resume";
import DraggableSectionOrder from "@/components/DraggableSectionOrder";
import TypographyModal from "@/components/TypographyModal";
import { 
  User, 
  FileText, 
  Briefcase, 
  Code2, 
  FolderGit2, 
  GraduationCap, 
  Type, 
  Layers, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Wand2, 
  Sparkles
} from "lucide-react";

const LOCAL_STORAGE_KEY = "resumix_current_resume_v1";

// Dynamic imports to guarantee client-only execution
const ResumePdfExport = dynamic(() => import("@/components/ResumePdfExport"), {
  ssr: false,
  loading: () => <div className="h-9 w-28 bg-zinc-800 animate-pulse rounded-lg" />,
});

const RealPdfViewer = dynamic(() => import("@/components/RealPdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-900 animate-pulse rounded-2xl border border-zinc-800" />
  ),
});

type SidebarTab = 
  | "personal" 
  | "summary" 
  | "experience" 
  | "skills" 
  | "projects" 
  | "education" 
  | "layout" 
  | "typography";

export default function ResumixStudio() {
  const [resume, setResume] = useState<ResumeData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.personalInfo) {
            return {
              ...parsed,
              typography: { ...defaultTypography, ...(parsed.typography || {}) },
            };
          }
        }
      } catch (e) {
        console.warn("Could not load from localStorage:", e);
      }
    }
    return initialResumeData;
  });
  const [activeTab, setActiveTab] = useState<SidebarTab>("personal");
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  // Auto-save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resume));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [resume]);

  // Reset to default
  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset your resume to the sample template? This cannot be undone.")) {
      setResume(initialResumeData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialResumeData));
    }
  };

  // AI Polisher Trigger
  const handleEnhanceBullet = async (
    fieldId: string, 
    currentText: string, 
    onUpdate: (newText: string) => void
  ) => {
    setEnhancingId(fieldId);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentText, type: "bullet" }),
      });
      const data = await res.json();
      if (data.enhancedText) {
        onUpdate(data.enhancedText);
      }
    } catch (e) {
      console.error("AI enhancement failed", e);
    } finally {
      setEnhancingId(null);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 flex font-sans select-none">
      {/* 1. Left Vertical Icon Sidebar */}
      <aside className="w-16 shrink-0 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-3 justify-between z-30">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Logo Icon */}
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="w-8 h-[1px] bg-zinc-800 my-1" />

          {/* Navigation Section Icons */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            <button
              onClick={() => setActiveTab("personal")}
              title="Personal Details"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
                activeTab === "personal"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
              }`}
            >
              <User className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab("summary")}
              title="Professional Summary"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
                activeTab === "summary"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
              }`}
            >
              <FileText className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab("experience")}
              title="Work Experience"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
                activeTab === "experience"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
              }`}
            >
              <Briefcase className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab("skills")}
              title="Skills & Expertise"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
                activeTab === "skills"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
              }`}
            >
              <Code2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab("projects")}
              title="Key Projects"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
                activeTab === "projects"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
              }`}
            >
              <FolderGit2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab("education")}
              title="Education"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
                activeTab === "education"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
              }`}
            >
              <GraduationCap className="w-5 h-5" />
            </button>

            <div className="w-8 h-[1px] bg-zinc-800 my-1" />

            <button
              onClick={() => setActiveTab("layout")}
              title="Drag & Drop Section Order"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
                activeTab === "layout"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
              }`}
            >
              <Layers className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab("typography")}
              title="Typography & Font Customizer"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
                activeTab === "typography"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
              }`}
            >
              <Type className="w-5 h-5" />
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleResetData}
            title="Reset to template"
            className="w-10 h-10 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 flex items-center justify-center transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. Middle Editor Panel (Takes fixed width, fits screen height with internal scroll) */}
      <section className="w-[480px] xl:w-[520px] shrink-0 h-full flex flex-col bg-zinc-900/90 border-r border-zinc-800">
        {/* Editor Top Bar with Title and Actions */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
              {activeTab === "personal" && <User className="w-4 h-4 text-blue-400" />}
              {activeTab === "summary" && <FileText className="w-4 h-4 text-emerald-400" />}
              {activeTab === "experience" && <Briefcase className="w-4 h-4 text-amber-400" />}
              {activeTab === "skills" && <Code2 className="w-4 h-4 text-purple-400" />}
              {activeTab === "projects" && <FolderGit2 className="w-4 h-4 text-cyan-400" />}
              {activeTab === "education" && <GraduationCap className="w-4 h-4 text-indigo-400" />}
              {activeTab === "layout" && <Layers className="w-4 h-4 text-sky-400" />}
              {activeTab === "typography" && <Type className="w-4 h-4 text-pink-400" />}
              {activeTab.replace(/([A-Z])/g, " $1")}
            </h2>
            <p className="text-[11px] text-zinc-500">Live synchronized with PDF</p>
          </div>

          <ResumePdfExport resume={resume} />
        </div>

        {/* Scrollable Content Area within panel */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 select-text">
          {/* PERSONAL INFO TAB */}
          {activeTab === "personal" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400">Full Name</label>
                <input
                  type="text"
                  value={resume.personalInfo.fullName}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, fullName: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-xs bg-zinc-800/80 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Target Role / Title</label>
                <input
                  type="text"
                  value={resume.personalInfo.jobTitle}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, jobTitle: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-xs bg-zinc-800/80 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400">Email Address</label>
                  <input
                    type="email"
                    value={resume.personalInfo.email}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        personalInfo: { ...resume.personalInfo, email: e.target.value },
                      })
                    }
                    className="mt-1 w-full px-3 py-2 text-xs bg-zinc-800/80 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400">Phone</label>
                  <input
                    type="text"
                    value={resume.personalInfo.phone}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        personalInfo: { ...resume.personalInfo, phone: e.target.value },
                      })
                    }
                    className="mt-1 w-full px-3 py-2 text-xs bg-zinc-800/80 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400">Location</label>
                  <input
                    type="text"
                    value={resume.personalInfo.location}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        personalInfo: { ...resume.personalInfo, location: e.target.value },
                      })
                    }
                    className="mt-1 w-full px-3 py-2 text-xs bg-zinc-800/80 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400">Website</label>
                  <input
                    type="text"
                    value={resume.personalInfo.website}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        personalInfo: { ...resume.personalInfo, website: e.target.value },
                      })
                    }
                    className="mt-1 w-full px-3 py-2 text-xs bg-zinc-800/80 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400">LinkedIn</label>
                  <input
                    type="text"
                    value={resume.personalInfo.linkedin}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        personalInfo: { ...resume.personalInfo, linkedin: e.target.value },
                      })
                    }
                    className="mt-1 w-full px-3 py-2 text-xs bg-zinc-800/80 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400">GitHub</label>
                  <input
                    type="text"
                    value={resume.personalInfo.github}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        personalInfo: { ...resume.personalInfo, github: e.target.value },
                      })
                    }
                    className="mt-1 w-full px-3 py-2 text-xs bg-zinc-800/80 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PROFESSIONAL SUMMARY TAB */}
          {activeTab === "summary" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Executive Summary</span>
                <button
                  onClick={() =>
                    handleEnhanceBullet("summary", resume.summary, (res) =>
                      setResume({ ...resume, summary: res })
                    )
                  }
                  disabled={enhancingId === "summary"}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline font-medium disabled:opacity-50"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  {enhancingId === "summary" ? "Polishing..." : "AI Enhance"}
                </button>
              </div>
              <textarea
                rows={7}
                value={resume.summary}
                onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                className="w-full px-3 py-2.5 text-xs bg-zinc-800/80 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                placeholder="Write your professional summary..."
              />
            </div>
          )}

          {/* WORK EXPERIENCE TAB */}
          {activeTab === "experience" && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  const newExp: WorkExperience = {
                    id: `exp-${Date.now()}`,
                    company: "Company Name",
                    position: "Role / Title",
                    location: "Remote / City",
                    startDate: "2024",
                    endDate: "Present",
                    current: true,
                    highlights: ["Spearheaded key initiatives driving efficiency and customer growth."],
                  };
                  setResume({ ...resume, workExperiences: [newExp, ...resume.workExperiences] });
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-400 bg-blue-950/40 hover:bg-blue-950/60 border border-blue-900/50 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Experience
              </button>

              {resume.workExperiences.map((exp, expIdx) => (
                <div
                  key={exp.id}
                  className="p-3.5 bg-zinc-800/50 rounded-xl border border-zinc-700/60 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <input
                        type="text"
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => {
                          const copy = [...resume.workExperiences];
                          copy[expIdx].company = e.target.value;
                          setResume({ ...resume, workExperiences: copy });
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold bg-zinc-800 border border-zinc-700 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Position"
                        value={exp.position}
                        onChange={(e) => {
                          const copy = [...resume.workExperiences];
                          copy[expIdx].position = e.target.value;
                          setResume({ ...resume, workExperiences: copy });
                        }}
                        className="px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-md"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const filtered = resume.workExperiences.filter((item) => item.id !== exp.id);
                        setResume({ ...resume, workExperiences: filtered });
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-md"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) => {
                        const copy = [...resume.workExperiences];
                        copy[expIdx].location = e.target.value;
                        setResume({ ...resume, workExperiences: copy });
                      }}
                      className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Start Date"
                      value={exp.startDate}
                      onChange={(e) => {
                        const copy = [...resume.workExperiences];
                        copy[expIdx].startDate = e.target.value;
                        setResume({ ...resume, workExperiences: copy });
                      }}
                      className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="End Date"
                      value={exp.endDate}
                      onChange={(e) => {
                        const copy = [...resume.workExperiences];
                        copy[expIdx].endDate = e.target.value;
                        setResume({ ...resume, workExperiences: copy });
                      }}
                      className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    {exp.highlights.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-1.5">
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => {
                            const copy = [...resume.workExperiences];
                            copy[expIdx].highlights[bIdx] = e.target.value;
                            setResume({ ...resume, workExperiences: copy });
                          }}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() =>
                            handleEnhanceBullet(`exp-${exp.id}-${bIdx}`, bullet, (res) => {
                              const copy = [...resume.workExperiences];
                              copy[expIdx].highlights[bIdx] = res;
                              setResume({ ...resume, workExperiences: copy });
                            })
                          }
                          disabled={enhancingId === `exp-${exp.id}-${bIdx}`}
                          className="p-1.5 text-blue-400 hover:bg-blue-950/50 rounded-md mt-1"
                          title="AI Polish bullet"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const copy = [...resume.workExperiences];
                        copy[expIdx].highlights.push("New metric-driven project contribution");
                        setResume({ ...resume, workExperiences: copy });
                      }}
                      className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" /> Add bullet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === "skills" && (
            <div className="space-y-3">
              {resume.skills.map((skillGroup, idx) => (
                <div key={skillGroup.id} className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/60 space-y-2">
                  <input
                    type="text"
                    value={skillGroup.categoryName}
                    onChange={(e) => {
                      const copy = [...resume.skills];
                      copy[idx].categoryName = e.target.value;
                      setResume({ ...resume, skills: copy });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-zinc-800 border border-zinc-700 rounded-md"
                  />
                  <textarea
                    rows={2}
                    value={skillGroup.items.join(", ")}
                    onChange={(e) => {
                      const copy = [...resume.skills];
                      copy[idx].items = e.target.value.split(",").map((s) => s.trim());
                      setResume({ ...resume, skills: copy });
                    }}
                    placeholder="Comma-separated items"
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-md"
                  />
                </div>
              ))}
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === "projects" && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  const newProj: Project = {
                    id: `proj-${Date.now()}`,
                    name: "Project Name",
                    description: "High impact software tool solving a real developer problem.",
                    technologies: ["React", "TypeScript", "Node.js"],
                    highlights: ["Built scalable workflows improving performance by 30%."],
                  };
                  setResume({ ...resume, projects: [...resume.projects, newProj] });
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-400 bg-blue-950/40 hover:bg-blue-950/60 border border-blue-900/50 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>

              {resume.projects.map((proj, projIdx) => (
                <div key={proj.id} className="p-3.5 bg-zinc-800/50 rounded-xl border border-zinc-700/60 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Project Name"
                      value={proj.name}
                      onChange={(e) => {
                        const copy = [...resume.projects];
                        copy[projIdx].name = e.target.value;
                        setResume({ ...resume, projects: copy });
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs font-semibold bg-zinc-800 border border-zinc-700 rounded-md"
                    />
                    <button
                      onClick={() => {
                        const filtered = resume.projects.filter((item) => item.id !== proj.id);
                        setResume({ ...resume, projects: filtered });
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Technologies (comma separated)"
                    value={proj.technologies.join(", ")}
                    onChange={(e) => {
                      const copy = [...resume.projects];
                      copy[projIdx].technologies = e.target.value.split(",").map((s) => s.trim());
                      setResume({ ...resume, projects: copy });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-md"
                  />
                  <textarea
                    rows={2}
                    placeholder="Brief description"
                    value={proj.description}
                    onChange={(e) => {
                      const copy = [...resume.projects];
                      copy[projIdx].description = e.target.value;
                      setResume({ ...resume, projects: copy });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-md"
                  />
                </div>
              ))}
            </div>
          )}

          {/* EDUCATION TAB */}
          {activeTab === "education" && (
            <div className="space-y-4">
              {resume.educations.map((edu, eduIdx) => (
                <div key={edu.id} className="p-3.5 bg-zinc-800/50 rounded-xl border border-zinc-700/60 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => {
                        const copy = [...resume.educations];
                        copy[eduIdx].degree = e.target.value;
                        setResume({ ...resume, educations: copy });
                      }}
                      className="px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => {
                        const copy = [...resume.educations];
                        copy[eduIdx].institution = e.target.value;
                        setResume({ ...resume, educations: copy });
                      }}
                      className="px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-md"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Field of Study"
                    value={edu.fieldOfStudy}
                    onChange={(e) => {
                      const copy = [...resume.educations];
                      copy[eduIdx].fieldOfStudy = e.target.value;
                      setResume({ ...resume, educations: copy });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-md"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Start - End"
                      value={`${edu.startDate} - ${edu.endDate}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("-").map((s) => s.trim());
                        const copy = [...resume.educations];
                        copy[eduIdx].startDate = parts[0] || "";
                        copy[eduIdx].endDate = parts[1] || "";
                        setResume({ ...resume, educations: copy });
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="GPA (optional)"
                      value={edu.gpa || ""}
                      onChange={(e) => {
                        const copy = [...resume.educations];
                        copy[eduIdx].gpa = e.target.value;
                        setResume({ ...resume, educations: copy });
                      }}
                      className="w-24 px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LAYOUT DRAG & DROP TAB */}
          {activeTab === "layout" && (
            <DraggableSectionOrder
              sectionOrder={resume.sectionOrder}
              onChange={(newOrder) => setResume({ ...resume, sectionOrder: newOrder })}
            />
          )}

          {/* TYPOGRAPHY & FONT TAB */}
          {activeTab === "typography" && (
            <TypographyModal
              resume={resume}
              onChange={(updated) => setResume(updated)}
            />
          )}
        </div>
      </section>

      {/* 3. Right Real PDF Viewport (Takes remaining width and 100% viewport height, no outside scrolling) */}
      <section className="flex-1 h-full bg-zinc-950 p-4 flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full h-full max-w-[950px] flex flex-col items-center justify-center">
          <RealPdfViewer resume={resume} />
        </div>
      </section>
    </div>
  );
}
