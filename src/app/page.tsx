"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  initialResumeData,
  ResumeData,
  WorkExperience,
  Project,
  Education,
  defaultTypography
} from "@/types/resume";
import DraggableSectionOrder from "@/components/DraggableSectionOrder";
import TypographyModal from "@/components/TypographyModal";
import LatexCodeEditor from "@/components/LatexCodeEditor";
import GeminiSkillsTailorModal from "@/components/GeminiSkillsTailorModal";
import SkillCatalogModal from "@/components/SkillCatalogModal";
import { generateLatexDocument } from "@/lib/latexGenerator";
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
  Sparkles,
  Terminal,
  PenTool,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  BookOpen
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

function SectionHeaderBanner({
  title,
  sectionId,
  disabledSections,
  onToggle,
}: {
  title: string;
  sectionId: string;
  disabledSections?: string[];
  onToggle: (id: string) => void;
}) {
  const isHidden = (disabledSections || []).includes(sectionId);

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border transition ${isHidden
          ? "bg-amber-950/25 border-amber-800/40 text-amber-200"
          : "bg-zinc-800/40 border-zinc-700/50 text-zinc-300"
        }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold">{title}</span>
        {isHidden ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/80 font-medium">
            Hidden from PDF
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-medium">
            Active in PDF
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onToggle(sectionId)}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition ${isHidden
            ? "bg-amber-900/40 text-amber-300 border-amber-700/60 hover:bg-amber-900/60"
            : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-zinc-100 hover:bg-zinc-700"
          }`}
        title={isHidden ? "Include this category in PDF" : "Exclude this category from PDF"}
      >
        {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-400" />}
        <span>{isHidden ? "Show in PDF" : "Hide from PDF"}</span>
      </button>
    </div>
  );
}

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
  const [editorMode, setEditorMode] = useState<"form" | "code">("form");
  const [editorWidth, setEditorWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("resumix_editor_width");
        if (saved) {
          const val = parseInt(saved, 10);
          if (!isNaN(val) && val >= 340 && val <= 1800) {
            return val;
          }
        }
      } catch {
        // fallback
      }
    }
    return 520;
  });
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isGeminiTailorOpen, setIsGeminiTailorOpen] = useState<boolean>(false);
  const [isSkillCatalogOpen, setIsSkillCatalogOpen] = useState<boolean>(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = editorWidth;
    let latestWidth = startWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const minWidth = 340;
      const maxWidth = Math.max(480, window.innerWidth - 380);
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
      latestWidth = newWidth;
      setEditorWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      try {
        localStorage.setItem("resumix_editor_width", String(latestWidth));
      } catch {
        // ignore
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

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

  const handleToggleSection = (sectionId: string) => {
    const current = new Set(resume.disabledSections || []);
    if (current.has(sectionId)) {
      current.delete(sectionId);
    } else {
      current.add(sectionId);
    }
    setResume({ ...resume, disabledSections: Array.from(current) });
  };

  const moveItem = <T,>(list: T[], index: number, direction: "up" | "down"): T[] => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return list;
    const copy = [...list];
    const item = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = item;
    return copy;
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
              onClick={() => {
                setActiveTab("personal");
                setEditorMode("form");
              }}
              title="Personal Details"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${editorMode === "form" && activeTab === "personal"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                }`}
            >
              <User className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setActiveTab("summary");
                setEditorMode("form");
              }}
              title={`Professional Summary${(resume.disabledSections || []).includes("summary") ? " (Hidden from PDF)" : ""}`}
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition ${editorMode === "form" && activeTab === "summary"
                  ? "bg-blue-600 text-white shadow"
                  : (resume.disabledSections || []).includes("summary")
                    ? "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                }`}
            >
              <FileText className="w-5 h-5" />
              {(resume.disabledSections || []).includes("summary") && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("experience");
                setEditorMode("form");
              }}
              title={`Work Experience${(resume.disabledSections || []).includes("workExperiences") ? " (Hidden from PDF)" : ""}`}
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition ${editorMode === "form" && activeTab === "experience"
                  ? "bg-blue-600 text-white shadow"
                  : (resume.disabledSections || []).includes("workExperiences")
                    ? "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                }`}
            >
              <Briefcase className="w-5 h-5" />
              {(resume.disabledSections || []).includes("workExperiences") && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("skills");
                setEditorMode("form");
              }}
              title={`Skills & Expertise${(resume.disabledSections || []).includes("skills") ? " (Hidden from PDF)" : ""}`}
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition ${editorMode === "form" && activeTab === "skills"
                  ? "bg-blue-600 text-white shadow"
                  : (resume.disabledSections || []).includes("skills")
                    ? "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                }`}
            >
              <Code2 className="w-5 h-5" />
              {(resume.disabledSections || []).includes("skills") && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("projects");
                setEditorMode("form");
              }}
              title={`Key Projects${(resume.disabledSections || []).includes("projects") ? " (Hidden from PDF)" : ""}`}
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition ${editorMode === "form" && activeTab === "projects"
                  ? "bg-blue-600 text-white shadow"
                  : (resume.disabledSections || []).includes("projects")
                    ? "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                }`}
            >
              <FolderGit2 className="w-5 h-5" />
              {(resume.disabledSections || []).includes("projects") && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("education");
                setEditorMode("form");
              }}
              title={`Education${(resume.disabledSections || []).includes("educations") ? " (Hidden from PDF)" : ""}`}
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition ${editorMode === "form" && activeTab === "education"
                  ? "bg-blue-600 text-white shadow"
                  : (resume.disabledSections || []).includes("educations")
                    ? "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                }`}
            >
              <GraduationCap className="w-5 h-5" />
              {(resume.disabledSections || []).includes("educations") && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>

            <div className="w-8 h-[1px] bg-zinc-800 my-1" />

            <button
              onClick={() => {
                setActiveTab("layout");
                setEditorMode("form");
              }}
              title="Drag & Drop Section Order"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${editorMode === "form" && activeTab === "layout"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                }`}
            >
              <Layers className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setActiveTab("typography");
                setEditorMode("form");
              }}
              title="Typography & Font Customizer"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${editorMode === "form" && activeTab === "typography"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                }`}
            >
              <Type className="w-5 h-5" />
            </button>

            <div className="w-8 h-[1px] bg-zinc-800 my-1" />

            <button
              onClick={() => setEditorMode(editorMode === "code" ? "form" : "code")}
              title="LaTeX Code Editor Mode (Advanced TeX)"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${editorMode === "code"
                  ? "bg-sky-600 text-white shadow shadow-sky-500/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                }`}
            >
              <Terminal className="w-5 h-5" />
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

      {/* 2. Middle Editor Panel (Adjustable Width via Splitter) */}
      <section
        style={{ width: `${editorWidth}px` }}
        className="shrink-0 h-full flex flex-col bg-zinc-900/90 border-r border-zinc-800 overflow-hidden relative select-text"
      >
        {/* Editor Top Bar with Mode Switcher & Export */}
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center p-0.5 bg-zinc-800/90 rounded-lg border border-zinc-700">
              <button
                onClick={() => setEditorMode("form")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition ${editorMode === "form"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                  }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Form</span>
              </button>
              <button
                onClick={() => setEditorMode("code")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition ${editorMode === "code"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                  }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>LaTeX Code</span>
              </button>
            </div>

            {editorMode === "form" && (
              <span className="text-xs font-medium text-zinc-400 hidden sm:inline">
                • {activeTab.replace(/([A-Z])/g, " $1")}
              </span>
            )}
          </div>

          <ResumePdfExport resume={resume} customLatex={resume.customLatex} />
        </div>

        {/* Content: Either Code Editor or Visual Form */}
        {editorMode === "code" ? (
          <div className="flex-1 p-3 overflow-hidden">
            <LatexCodeEditor
              resume={resume}
              code={
                resume.customLatex !== undefined
                  ? resume.customLatex
                  : generateLatexDocument(resume)
              }
              onChange={(newCode) =>
                setResume({ ...resume, customLatex: newCode })
              }
              onResetToForm={() =>
                setResume({ ...resume, customLatex: undefined })
              }
              onCompile={() => {
                setResume((prev) => ({
                  ...prev,
                  customLatex:
                    prev.customLatex !== undefined
                      ? prev.customLatex
                      : generateLatexDocument(prev),
                }));
              }}
              isExpanded={editorWidth > 680}
              onToggleExpand={() => {
                if (editorWidth > 680) {
                  setEditorWidth(520);
                } else {
                  setEditorWidth(Math.round(window.innerWidth * 0.55));
                }
              }}
            />
          </div>
        ) : (
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
              <div className="space-y-4">
                <SectionHeaderBanner
                  title="Professional Summary"
                  sectionId="summary"
                  disabledSections={resume.disabledSections}
                  onToggle={handleToggleSection}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Executive Summary</span>
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
                <SectionHeaderBanner
                  title="Work Experience"
                  sectionId="workExperiences"
                  disabledSections={resume.disabledSections}
                  onToggle={handleToggleSection}
                />

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-zinc-400 font-medium">
                    Experience History{" "}
                    <span className="text-zinc-500">
                      ({resume.workExperiences.filter((w) => !w.disabled).length} of {resume.workExperiences.length} visible in PDF)
                    </span>
                  </span>
                  {resume.workExperiences.some((w) => w.disabled) && (
                    <button
                      type="button"
                      onClick={() => {
                        const enabled = resume.workExperiences.map((w) => ({ ...w, disabled: false }));
                        setResume({ ...resume, workExperiences: enabled });
                      }}
                      className="text-[11px] text-emerald-400 hover:underline font-medium"
                    >
                      Show All
                    </button>
                  )}
                </div>

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

                        {resume.workExperiences.map((exp, expIdx) => {
                          const isExpDisabled = exp.disabled === true;
                          return (
                  <div
                    key={exp.id}
                    className={`p-3.5 rounded-xl border space-y-2.5 transition ${
                      isExpDisabled
                        ? "bg-zinc-900/40 border-zinc-800/80 opacity-60"
                        : "bg-zinc-800/50 border-zinc-700/60"
                    }`}
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
                          className={`px-2.5 py-1.5 text-xs font-semibold bg-zinc-800 border rounded-md ${
                            isExpDisabled
                              ? "line-through text-zinc-500 border-zinc-700/50"
                              : "text-zinc-200 border-zinc-700"
                          }`}
                        />
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Position"
                            value={exp.position}
                            onChange={(e) => {
                              const copy = [...resume.workExperiences];
                              copy[expIdx].position = e.target.value;
                              setResume({ ...resume, workExperiences: copy });
                            }}
                            className={`flex-1 px-2.5 py-1.5 text-xs bg-zinc-800 border rounded-md ${
                              isExpDisabled
                                ? "text-zinc-500 border-zinc-700/50"
                                : "text-zinc-200 border-zinc-700"
                            }`}
                          />
                          {isExpDisabled && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium shrink-0">
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setResume({
                              ...resume,
                              workExperiences: moveItem(resume.workExperiences, expIdx, "up"),
                            })
                          }
                          disabled={expIdx === 0}
                          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 rounded disabled:opacity-20 transition"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setResume({
                              ...resume,
                              workExperiences: moveItem(resume.workExperiences, expIdx, "down"),
                            })
                          }
                          disabled={expIdx === resume.workExperiences.length - 1}
                          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 rounded disabled:opacity-20 transition"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...resume.workExperiences];
                            copy[expIdx] = {
                              ...copy[expIdx],
                              disabled: !copy[expIdx].disabled,
                            };
                            setResume({ ...resume, workExperiences: copy });
                          }}
                          className={`p-1.5 rounded transition ${
                            isExpDisabled
                              ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                              : "text-emerald-400 hover:bg-emerald-950/60"
                          }`}
                          title={isExpDisabled ? "Show this experience in PDF" : "Hide this experience from PDF"}
                        >
                          {isExpDisabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            const filtered = resume.workExperiences.filter((item) => item.id !== exp.id);
                            setResume({ ...resume, workExperiences: filtered });
                          }}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded-md ml-0.5 transition"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                      );
            })}
                    </div>
          )}

                    {/* SKILLS TAB */}
                    {activeTab === "skills" && (
                      <div className="space-y-4">
                        <SectionHeaderBanner
                          title="Skills & Expertise"
                          sectionId="skills"
                          disabledSections={resume.disabledSections}
                          onToggle={handleToggleSection}
                        />

                        {/* Automatic & Manual Override Action Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* 1. Automatic AI Job Tailor */}
                          <button
                            type="button"
                            onClick={() => setIsGeminiTailorOpen(true)}
                            className="flex items-center gap-3 p-3 text-left rounded-xl bg-gradient-to-br from-sky-950/60 to-blue-950/40 hover:from-sky-900/60 hover:to-blue-900/50 border border-sky-800/60 hover:border-sky-600 transition shadow-sm group"
                          >
                            <div className="p-2 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30 group-hover:bg-sky-600 group-hover:text-white transition shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-zinc-100 group-hover:text-sky-300 transition">
                                  AI Job Tailor
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-sky-900 text-sky-300 font-bold border border-sky-700/60">
                                  Gemini
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                Paste job requirements to auto-tailor skills
                              </p>
                            </div>
                          </button>

                          {/* 2. Manual Override Catalog Picker */}
                          <button
                            type="button"
                            onClick={() => setIsSkillCatalogOpen(true)}
                            className="flex items-center gap-3 p-3 text-left rounded-xl bg-gradient-to-br from-emerald-950/60 to-teal-950/40 hover:from-emerald-900/60 hover:to-teal-900/50 border border-emerald-800/60 hover:border-emerald-600 transition shadow-sm group"
                          >
                            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white transition shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-zinc-100 group-hover:text-emerald-300 transition">
                                  Manual Override
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-900 text-emerald-300 font-bold border border-emerald-700/60">
                                  Catalog
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                Browse & check languages and frameworks
                              </p>
                            </div>
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-xs text-zinc-400 font-medium">Skill Categories</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newSkillCat = {
                                id: `skill-${Date.now()}`,
                                categoryName: "New Category",
                                items: ["Skill 1", "Skill 2"],
                              };
                              setResume({ ...resume, skills: [...resume.skills, newSkillCat] });
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-400 bg-blue-950/40 hover:bg-blue-950/60 border border-blue-900/50 rounded-lg transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Skill Category</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {resume.skills.map((skillGroup, idx) => {
                            const isCatDisabled = skillGroup.disabled === true;
                            return (
                              <div
                                key={skillGroup.id}
                                className={`p-3.5 rounded-xl border space-y-2.5 transition ${isCatDisabled
                                    ? "bg-zinc-900/50 border-zinc-800/80 opacity-60"
                                    : "bg-zinc-800/50 border-zinc-700/60"
                                  }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      type="text"
                                      value={skillGroup.categoryName}
                                      onChange={(e) => {
                                        const copy = [...resume.skills];
                                        copy[idx].categoryName = e.target.value;
                                        setResume({ ...resume, skills: copy });
                                      }}
                                      placeholder="Category Name (e.g. Languages & Frameworks)"
                                      className={`flex-1 px-2.5 py-1.5 text-xs font-semibold bg-zinc-800 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${isCatDisabled
                                          ? "line-through text-zinc-500 border-zinc-700/50"
                                          : "text-zinc-200 border-zinc-700"
                                        }`}
                                    />
                                    {isCatDisabled && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium shrink-0">
                                        Hidden
                                      </span>
                                    )}
                                  </div>

                                  {/* Reorder and Toggle Controls */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setResume({
                                          ...resume,
                                          skills: moveItem(resume.skills, idx, "up"),
                                        })
                                      }
                                      disabled={idx === 0}
                                      className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 rounded disabled:opacity-20 transition"
                                      title="Move Category Up"
                                    >
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setResume({
                                          ...resume,
                                          skills: moveItem(resume.skills, idx, "down"),
                                        })
                                      }
                                      disabled={idx === resume.skills.length - 1}
                                      className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 rounded disabled:opacity-20 transition"
                                      title="Move Category Down"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const copy = [...resume.skills];
                                        copy[idx] = {
                                          ...copy[idx],
                                          disabled: !copy[idx].disabled,
                                        };
                                        setResume({ ...resume, skills: copy });
                                      }}
                                      className={`p-1.5 rounded transition ${isCatDisabled
                                          ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                                          : "text-emerald-400 hover:bg-emerald-950/60"
                                        }`}
                                      title={isCatDisabled ? "Enable this skill category in PDF" : "Disable/hide this skill category from PDF"}
                                    >
                                      {isCatDisabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const filtered = resume.skills.filter((item) => item.id !== skillGroup.id);
                                        setResume({ ...resume, skills: filtered });
                                      }}
                                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded transition"
                                      title="Delete Category"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                <textarea
                                  rows={2}
                                  value={skillGroup.items.join(", ")}
                                  onChange={(e) => {
                                    const copy = [...resume.skills];
                                    copy[idx].items = e.target.value.split(",").map((s) => s.trim());
                                    setResume({ ...resume, skills: copy });
                                  }}
                                  placeholder="Comma-separated items (e.g. React, TypeScript, Next.js)"
                                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* PROJECTS TAB */}
                    {activeTab === "projects" && (
                      <div className="space-y-4">
                        <SectionHeaderBanner
                          title="Key Projects"
                          sectionId="projects"
                          disabledSections={resume.disabledSections}
                          onToggle={handleToggleSection}
                        />

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-zinc-400 font-medium">
                            Project Portfolio{" "}
                            <span className="text-zinc-500">
                              ({resume.projects.filter((p) => !p.disabled).length} of {resume.projects.length} visible in PDF)
                            </span>
                          </span>
                          {resume.projects.some((p) => p.disabled) && (
                            <button
                              type="button"
                              onClick={() => {
                                const enabled = resume.projects.map((p) => ({ ...p, disabled: false }));
                                setResume({ ...resume, projects: enabled });
                              }}
                              className="text-[11px] text-emerald-400 hover:underline font-medium"
                            >
                              Show All
                            </button>
                          )}
                        </div>

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

                              {resume.projects.map((proj, projIdx) => {
                                const isProjDisabled = proj.disabled === true;
                                return (
                  <div
                    key={proj.id}
                    className={`p-3.5 rounded-xl border space-y-2 transition ${
                      isProjDisabled
                        ? "bg-zinc-900/40 border-zinc-800/80 opacity-60"
                        : "bg-zinc-800/50 border-zinc-700/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Project Name"
                          value={proj.name}
                          onChange={(e) => {
                            const copy = [...resume.projects];
                            copy[projIdx].name = e.target.value;
                            setResume({ ...resume, projects: copy });
                          }}
                          className={`flex-1 px-2.5 py-1.5 text-xs font-semibold bg-zinc-800 border rounded-md ${
                            isProjDisabled
                              ? "line-through text-zinc-500 border-zinc-700/50"
                              : "text-zinc-200 border-zinc-700"
                          }`}
                        />
                        {isProjDisabled && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium shrink-0">
                            Hidden
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setResume({
                              ...resume,
                              projects: moveItem(resume.projects, projIdx, "up"),
                            })
                          }
                          disabled={projIdx === 0}
                          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 rounded disabled:opacity-20 transition"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setResume({
                              ...resume,
                              projects: moveItem(resume.projects, projIdx, "down"),
                            })
                          }
                          disabled={projIdx === resume.projects.length - 1}
                          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 rounded disabled:opacity-20 transition"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...resume.projects];
                            copy[projIdx] = {
                              ...copy[projIdx],
                              disabled: !copy[projIdx].disabled,
                            };
                            setResume({ ...resume, projects: copy });
                          }}
                          className={`p-1.5 rounded transition ${
                            isProjDisabled
                              ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                              : "text-emerald-400 hover:bg-emerald-950/60"
                          }`}
                          title={isProjDisabled ? "Show this project in PDF" : "Hide this project from PDF"}
                        >
                          {isProjDisabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            const filtered = resume.projects.filter((item) => item.id !== proj.id);
                            setResume({ ...resume, projects: filtered });
                          }}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded-md ml-0.5 transition"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                            );
              })}
                          </div>
                        )}

                        {/* EDUCATION TAB */}
                        {activeTab === "education" && (
                          <div className="space-y-4">
                            <SectionHeaderBanner
                              title="Education"
                              sectionId="educations"
                              disabledSections={resume.disabledSections}
                              onToggle={handleToggleSection}
                            />

                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-zinc-400 font-medium">
                                Academic History{" "}
                                <span className="text-zinc-500">
                                  ({resume.educations.filter((e) => !e.disabled).length} of {resume.educations.length} visible in PDF)
                                </span>
                              </span>
                              {resume.educations.some((e) => e.disabled) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const enabled = resume.educations.map((e) => ({ ...e, disabled: false }));
                                    setResume({ ...resume, educations: enabled });
                                  }}
                                  className="text-[11px] text-emerald-400 hover:underline font-medium"
                                >
                                  Show All
                                </button>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                const newEdu: Education = {
                                  id: `edu-${Date.now()}`,
                                  institution: "University / College Name",
                                  degree: "Bachelor of Science",
                                  fieldOfStudy: "Computer Science",
                                  location: "City, Country",
                                  startDate: "2020",
                                  endDate: "2024",
                                };
                                setResume({ ...resume, educations: [...resume.educations, newEdu] });
                              }}
                              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-400 bg-blue-950/40 hover:bg-blue-950/60 border border-blue-900/50 rounded-lg transition"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Education
                            </button>

                                    {resume.educations.map((edu, eduIdx) => {
                                      const isEduDisabled = edu.disabled === true;
                                      return (
                  <div
                    key={edu.id}
                    className={`p-3.5 rounded-xl border space-y-2 transition ${
                      isEduDisabled
                        ? "bg-zinc-900/40 border-zinc-800/80 opacity-60"
                        : "bg-zinc-800/50 border-zinc-700/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Degree"
                          value={edu.degree}
                          onChange={(e) => {
                            const copy = [...resume.educations];
                            copy[eduIdx].degree = e.target.value;
                            setResume({ ...resume, educations: copy });
                          }}
                          className={`px-2.5 py-1.5 text-xs bg-zinc-800 border rounded-md ${
                            isEduDisabled
                              ? "line-through text-zinc-500 border-zinc-700/50"
                              : "text-zinc-200 border-zinc-700"
                          }`}
                        />
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Institution"
                            value={edu.institution}
                            onChange={(e) => {
                              const copy = [...resume.educations];
                              copy[eduIdx].institution = e.target.value;
                              setResume({ ...resume, educations: copy });
                            }}
                            className={`flex-1 px-2.5 py-1.5 text-xs bg-zinc-800 border rounded-md ${
                              isEduDisabled
                                ? "text-zinc-500 border-zinc-700/50"
                                : "text-zinc-200 border-zinc-700"
                            }`}
                          />
                          {isEduDisabled && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium shrink-0">
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setResume({
                              ...resume,
                              educations: moveItem(resume.educations, eduIdx, "up"),
                            })
                          }
                          disabled={eduIdx === 0}
                          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 rounded disabled:opacity-20 transition"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setResume({
                              ...resume,
                              educations: moveItem(resume.educations, eduIdx, "down"),
                            })
                          }
                          disabled={eduIdx === resume.educations.length - 1}
                          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 rounded disabled:opacity-20 transition"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...resume.educations];
                            copy[eduIdx] = {
                              ...copy[eduIdx],
                              disabled: !copy[eduIdx].disabled,
                            };
                            setResume({ ...resume, educations: copy });
                          }}
                          className={`p-1.5 rounded transition ${
                            isEduDisabled
                              ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                              : "text-emerald-400 hover:bg-emerald-950/60"
                          }`}
                          title={isEduDisabled ? "Show this education in PDF" : "Hide this education from PDF"}
                        >
                          {isEduDisabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            const filtered = resume.educations.filter((item) => item.id !== edu.id);
                            setResume({ ...resume, educations: filtered });
                          }}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded-md ml-0.5 transition"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                                  );
              })}
                                </div>
          )}

                                {/* LAYOUT DRAG & DROP TAB */}
                                {activeTab === "layout" && (
                                  <DraggableSectionOrder
                                    sectionOrder={resume.sectionOrder}
                                    disabledSections={resume.disabledSections || []}
                                    onChangeOrder={(newOrder) => setResume({ ...resume, sectionOrder: newOrder })}
                                    onToggleSection={handleToggleSection}
                                    onEnableAll={() => setResume({ ...resume, disabledSections: [] })}
                                    onResetOrder={() =>
                                      setResume({
                                        ...resume,
                                        sectionOrder: ["summary", "workExperiences", "skills", "projects", "educations"],
                                      })
                                    }
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
                            )}
                          </section>

      {/* Resize Splitter Divider Handle */}
                        <div
                          onMouseDown={startResizing}
                          onDoubleClick={() => setEditorWidth(520)}
                          title="Drag horizontally to resize editor (Double-click to reset to 520px)"
                          className={`group relative w-2 shrink-0 cursor-col-resize select-none flex items-center justify-center transition-colors z-30 ${isResizing
                              ? "bg-sky-500 shadow-md shadow-sky-500/30"
                              : "bg-zinc-900 hover:bg-sky-500/80 border-r border-zinc-800"
                            }`}
                        >
                          <div className="w-0.5 h-8 rounded-full bg-zinc-700 group-hover:bg-white transition-colors" />
                        </div>

                        {/* 3. Right Real PDF Viewport (Takes remaining width and 100% viewport height, no outside scrolling) */}
                        <section className="flex-1 h-full bg-zinc-950 p-4 flex flex-col items-center justify-center overflow-hidden relative">
                          {/* Invisible dragging overlay prevents iframe from capturing mouse pointer */}
                          {isResizing && (
                            <div className="absolute inset-0 z-50 cursor-col-resize select-none bg-transparent pointer-events-auto" />
                          )}
                          <div className="w-full h-full max-w-[950px] flex flex-col items-center justify-center">
                            <RealPdfViewer resume={resume} customLatex={resume.customLatex} />
                          </div>
                        </section>

                        {/* AI Job Tailoring Modal (Gemini) */}
                        <GeminiSkillsTailorModal
                          isOpen={isGeminiTailorOpen}
                          onClose={() => setIsGeminiTailorOpen(false)}
                          currentSkills={resume.skills}
                          jobTitle={resume.personalInfo.jobTitle}
                          onApplySkills={(newSkills) => setResume({ ...resume, skills: newSkills })}
                        />

                        {/* Manual Skill Catalog Checklist Modal */}
                        <SkillCatalogModal
                          isOpen={isSkillCatalogOpen}
                          onClose={() => setIsSkillCatalogOpen(false)}
                          currentSkills={resume.skills}
                          onUpdateSkills={(updatedSkills) => setResume({ ...resume, skills: updatedSkills })}
                        />
                      </div>
                    );
}
