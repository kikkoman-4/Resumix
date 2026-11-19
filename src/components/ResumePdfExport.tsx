"use client";

import React, { useState } from "react";
import { ResumeData } from "@/types/resume";
import { Download, Loader2, Eye, FileText, ChevronDown } from "lucide-react";
import { generateLatexDocument } from "@/lib/latexGenerator";

interface Props {
  resume: ResumeData;
}

export default function ResumePdfExport({ resume }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const safeFileName = `${(resume.personalInfo.fullName || "Resume").replace(/\s+/g, "_")}_Resume`;

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    setShowDropdown(false);
    try {
      const response = await fetch("/api/compile-latex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        alert(`Failed to compile LaTeX PDF: ${err?.error || response.statusText}`);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeFileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "An error occurred";
      alert(`Download failed: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPreviewTab = async () => {
    setIsGenerating(true);
    setShowDropdown(false);
    try {
      const response = await fetch("/api/compile-latex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });

      if (!response.ok) {
        alert("Failed to generate PDF for preview tab");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "An error occurred";
      alert(`Preview failed: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTex = () => {
    setShowDropdown(false);
    const latexSource = generateLatexDocument(resume);
    const blob = new Blob([latexSource], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeFileName}.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={handleOpenPreviewTab}
        disabled={isGenerating}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg shadow-sm transition disabled:opacity-50"
        title="Open PDF preview in a new browser tab"
      >
        <Eye className="w-3.5 h-3.5 text-zinc-400" />
        <span className="hidden sm:inline">Preview Tab</span>
      </button>

      <div className="flex items-center rounded-lg shadow bg-sky-600 hover:bg-sky-500 transition">
        <button
          onClick={handleDownloadPdf}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white focus:outline-none disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-1.5 text-sky-200 hover:text-white border-l border-sky-700/60 rounded-r-lg transition"
          title="More export options"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-30 animate-in fade-in slide-in-from-top-1 text-xs">
          <button
            onClick={handleDownloadPdf}
            className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-800 flex items-center gap-2 transition"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Download Vector PDF</span>
          </button>
          <button
            onClick={handleDownloadTex}
            className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-800 flex items-center gap-2 transition"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download LaTeX (.tex)</span>
          </button>
        </div>
      )}
    </div>
  );
}
