"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { initialResumeData, ResumeData, WorkExperience, SkillCategory, Project, Education } from "@/types/resume";
import { 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Trash2, 
  Wand2, 
  FileText, 
  Layers, 
  GraduationCap, 
  Briefcase, 
  FolderGit2, 
  Code2, 
  User, 
  CheckCircle2,
  RefreshCw
} from "lucide-react";

// Dynamically import PDF export button to guarantee client-only execution
const ResumePdfExport = dynamic(() => import("@/components/ResumePdfExport"), {
  ssr: false,
  loading: () => (
    <div className="h-9 w-32 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-lg" />
  ),
});

export default function ResumixStudio() {
  const [resume, setResume] = useState<ResumeData>(initialResumeData);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  // Section reordering
  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...resume.sectionOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setResume({ ...resume, sectionOrder: newOrder });
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-sm flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
              Resumix <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">Studio</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">AI-Powered Resume Builder & Tailor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === "edit"
                  ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === "preview"
                  ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              Live Sheet View
            </button>
          </div>

          <ResumePdfExport resume={resume} />
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form Columns (Visible in Edit mode or dual view) */}
        <div className={`${activeTab === "edit" ? "lg:col-span-7" : "hidden"} space-y-6`}>
          {/* Section: Personal Info */}
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" /> Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Full Name</label>
                <input
                  type="text"
                  value={resume.personalInfo.fullName}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, fullName: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Target Role / Title</label>
                <input
                  type="text"
                  value={resume.personalInfo.jobTitle}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, jobTitle: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Email Address</label>
                <input
                  type="email"
                  value={resume.personalInfo.email}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, email: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Phone</label>
                <input
                  type="text"
                  value={resume.personalInfo.phone}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, phone: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Location</label>
                <input
                  type="text"
                  value={resume.personalInfo.location}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, location: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">LinkedIn / Portfolio</label>
                <input
                  type="text"
                  value={resume.personalInfo.linkedin}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, linkedin: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Draggable/Reorderable Section Manager */}
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Section Order
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Click arrows to reorder resume layout</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {resume.sectionOrder.map((sectionId, idx) => (
                <div
                  key={sectionId}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm text-xs font-medium"
                >
                  <span className="capitalize">{sectionId.replace(/([A-Z])/g, " $1")}</span>
                  <div className="flex items-center gap-0.5 ml-1 border-l pl-1 border-zinc-200 dark:border-zinc-700">
                    <button
                      onClick={() => moveSection(idx, "up")}
                      disabled={idx === 0}
                      className="p-0.5 hover:text-blue-600 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, "down")}
                      disabled={idx === resume.sectionOrder.length - 1}
                      className="p-0.5 hover:text-blue-600 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Professional Summary */}
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" /> Professional Summary
              </h2>
              <button
                onClick={() =>
                  handleEnhanceBullet("summary", resume.summary, (res) =>
                    setResume({ ...resume, summary: res })
                  )
                }
                disabled={enhancingId === "summary"}
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {enhancingId === "summary" ? "Polishing..." : "AI Enhance"}
              </button>
            </div>
            <textarea
              rows={3}
              value={resume.summary}
              onChange={(e) => setResume({ ...resume, summary: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          {/* Section: Work Experience */}
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-500" /> Work Experience
              </h2>
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
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg dark:bg-blue-950/50 dark:text-blue-300"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {resume.workExperiences.map((exp, expIdx) => (
              <div
                key={exp.id}
                className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-3"
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
                      className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md"
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
                      className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const filtered = resume.workExperiences.filter((item) => item.id !== exp.id);
                      setResume({ ...resume, workExperiences: filtered });
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md"
                    title="Remove experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Bullet Highlights
                  </label>
                  {exp.highlights.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <span className="text-zinc-400 mt-2 text-xs">•</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => {
                          const copy = [...resume.workExperiences];
                          copy[expIdx].highlights[bIdx] = e.target.value;
                          setResume({ ...resume, workExperiences: copy });
                        }}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md mt-1"
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
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium mt-1"
                  >
                    <Plus className="w-3 h-3" /> Add bullet point
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section: Skills */}
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-500" /> Skills Categories
            </h2>
            {resume.skills.map((skillGroup, idx) => (
              <div key={skillGroup.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={skillGroup.categoryName}
                  onChange={(e) => {
                    const copy = [...resume.skills];
                    copy[idx].categoryName = e.target.value;
                    setResume({ ...resume, skills: copy });
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md"
                />
                <input
                  type="text"
                  value={skillGroup.items.join(", ")}
                  onChange={(e) => {
                    const copy = [...resume.skills];
                    copy[idx].items = e.target.value.split(",").map((s) => s.trim());
                    setResume({ ...resume, skills: copy });
                  }}
                  placeholder="Comma-separated items"
                  className="sm:col-span-2 px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live Resume Sheet View Column */}
        <div className={`${activeTab === "preview" ? "lg:col-span-12" : "lg:col-span-5"} transition-all`}>
          <div className="sticky top-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md p-6 sm:p-8 overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Live Document Sheet
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
              </span>
            </div>

            {/* Resume Content Preview */}
            <div className="border-b-2 border-sky-600 pb-4 mb-4">
              <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                {resume.personalInfo.fullName || "Your Full Name"}
              </h2>
              <p className="text-sm font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                {resume.personalInfo.jobTitle}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
                {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
                {resume.personalInfo.location && <span>• {resume.personalInfo.location}</span>}
                {resume.personalInfo.linkedin && <span>• {resume.personalInfo.linkedin}</span>}
              </div>
            </div>

            {/* Resume Body */}
            <div className="space-y-4 text-xs">
              {resume.summary && (
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-1 mb-1.5">
                    Professional Summary
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{resume.summary}</p>
                </div>
              )}

              {resume.workExperiences.length > 0 && (
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-1 mb-2">
                    Work Experience
                  </h3>
                  <div className="space-y-3">
                    {resume.workExperiences.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline font-semibold text-zinc-800 dark:text-zinc-200">
                          <span>
                            {exp.position} — <span className="text-sky-700 dark:text-sky-400">{exp.company}</span>
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {exp.startDate} - {exp.endDate}
                          </span>
                        </div>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-zinc-600 dark:text-zinc-300">
                          {exp.highlights.map((h, i) => (
                            <li key={i} className="leading-snug">{h}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resume.skills.length > 0 && (
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-1 mb-2">
                    Skills
                  </h3>
                  <div className="space-y-1 text-zinc-600 dark:text-zinc-300">
                    {resume.skills.map((s) => (
                      <p key={s.id}>
                        <strong className="text-zinc-800 dark:text-zinc-200">{s.categoryName}: </strong>
                        {s.items.join(", ")}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
