"use client";

import React, { useState } from "react";
import { SkillCategory } from "@/types/resume";
import { 
  Sparkles, 
  X, 
  Check, 
  Bot, 
  Key, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentSkills: SkillCategory[];
  jobTitle?: string;
  onApplySkills: (newSkills: SkillCategory[]) => void;
}

const LOCAL_STORAGE_GEMINI_KEY = "resumix_gemini_api_key";

export default function GeminiSkillsTailorModal({
  isOpen,
  onClose,
  currentSkills,
  jobTitle = "",
  onApplySkills,
}: Props) {
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState(() => jobTitle || "");
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LOCAL_STORAGE_GEMINI_KEY) || "";
    }
    return "";
  });
  const [tailorMode, setTailorMode] = useState<"replace" | "merge">("replace");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [tailoredPreview, setTailoredPreview] = useState<SkillCategory[] | null>(null);

  if (!isOpen) return null;

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (typeof window !== "undefined") {
      try {
        if (key.trim()) {
          localStorage.setItem(LOCAL_STORAGE_GEMINI_KEY, key.trim());
        } else {
          localStorage.removeItem(LOCAL_STORAGE_GEMINI_KEY);
        }
      } catch {
        // ignore
      }
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setErrorMessage("Please paste the job description or requirements first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessInfo(null);
    setTailoredPreview(null);

    try {
      const res = await fetch("/api/tailor-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          targetRole: targetRole.trim() || undefined,
          existingSkills: currentSkills,
          mode: tailorMode,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to tailor skills.");
      }

      if (data.categories && Array.isArray(data.categories)) {
        setTailoredPreview(data.categories);
        if (data.source === "gemini") {
          setSuccessInfo("Successfully tailored skills using Google Gemini AI!");
        } else {
          setSuccessInfo(data.note || "Extracted skills using ATS keyword scanner.");
        }
      } else {
        throw new Error("Invalid response format received from AI.");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to generate tailored skills.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePreviewSkill = (catIdx: number, skillName: string) => {
    if (!tailoredPreview) return;
    const copy = [...tailoredPreview];
    const category = { ...copy[catIdx] };
    if (category.items.includes(skillName)) {
      category.items = category.items.filter((s) => s !== skillName);
    } else {
      category.items = [...category.items, skillName];
    }
    copy[catIdx] = category;
    setTailoredPreview(copy);
  };

  const handleApply = () => {
    if (!tailoredPreview || tailoredPreview.length === 0) return;
    const nonEmpty = tailoredPreview.filter((c) => c.items.length > 0);
    onApplySkills(nonEmpty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                AI Automatic Skills Tailor
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-400 border border-sky-800/80">
                  Google Gemini
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Paste job requirements to extract and prioritize ATS-tailored technical skills
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Target Role & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-zinc-300">Target Role / Job Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Full-Stack Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-300">Tailoring Mode</label>
              <div className="mt-1 flex items-center gap-2 bg-zinc-800/60 p-1 border border-zinc-700/80 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTailorMode("replace")}
                  className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition ${
                    tailorMode === "replace"
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Replaces current skills with dedicated categories matched to this job"
                >
                  Smart Replace
                </button>
                <button
                  type="button"
                  onClick={() => setTailorMode("merge")}
                  className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition ${
                    tailorMode === "merge"
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Preserves existing skills and appends newly matched requirements"
                >
                  Smart Merge
                </button>
              </div>
            </div>
          </div>

          {/* Job Requirements Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-300">
                Job Requirements / ATS Description <span className="text-red-400">*</span>
              </label>
              <span className="text-[11px] text-zinc-500">
                Paste requirements, tech stack, or job posting
              </span>
            </div>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job posting here... (e.g. 'We are seeking a Backend Engineer with strong proficiency in Go, Docker, Kubernetes, PostgreSQL, gRPC, and AWS. Experience with distributed microservices and CI/CD pipelines is required.')"
              className="w-full px-3 py-2.5 bg-zinc-800/90 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed"
            />
          </div>

          {/* Optional Free Gemini API Key Collapsible Bar */}
          <div className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                <Key className="w-3.5 h-3.5 text-sky-400" />
                Free Google Gemini API Key (Optional)
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Get free Gemini key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="Paste Gemini API Key (stored locally in your browser)"
              value={apiKey}
              onChange={(e) => handleSaveApiKey(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono text-[11px]"
            />
            <p className="text-[10px] text-zinc-500 leading-normal">
              Gemini 2.5 Flash is 100% free with generous rate limits. If blank, Resumix will use your server .env or our built-in ATS keyword engine.
            </p>
          </div>

          {/* Errors or Success */}
          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* Extracted Categories Review Preview */}
          {tailoredPreview && (
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  Review Generated Categories & Skills
                </label>
                <span className="text-[11px] text-zinc-500">
                  Click any pill to toggle on/off
                </span>
              </div>

              <div className="space-y-2.5">
                {tailoredPreview.map((category, catIdx) => (
                  <div
                    key={category.id || catIdx}
                    className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-xl space-y-2"
                  >
                    <span className="font-semibold text-zinc-200 text-xs">
                      {category.categoryName}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {category.items.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleTogglePreviewSkill(catIdx, skill)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-sky-950/70 text-sky-200 border border-sky-800/80 hover:bg-sky-900/60 transition"
                        >
                          <Check className="w-3 h-3 text-sky-400" />
                          <span>{skill}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!tailoredPreview ? (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-lg shadow-md shadow-sky-600/20 disabled:opacity-50 transition"
              >
                {isLoading ? (
                  <>
                    <Bot className="w-4 h-4 animate-spin text-sky-200" />
                    <span>Analyzing Job Requirements...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sky-200" />
                    <span>Tailor Skills with Gemini</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-800 border border-zinc-700 rounded-lg transition"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md shadow-emerald-600/20 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Tailored Skills to Resume</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
