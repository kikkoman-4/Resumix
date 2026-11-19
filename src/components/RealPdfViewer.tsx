"use client";

import React, { useEffect, useState, useMemo, useRef, useSyncExternalStore } from "react";
import { ResumeData } from "@/types/resume";
import { generateLatexDocument } from "@/lib/latexGenerator";
import LatexSourceModal from "./LatexSourceModal";
import {
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  Download,
  Code,
  FileText,
} from "lucide-react";

interface Props {
  resume: ResumeData;
  customLatex?: string;
}

const emptySubscribe = () => () => {};

export default function RealPdfViewer({ resume, customLatex }: Props) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [zoomLevel, setZoomLevel] = useState(100);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [showLatexModal, setShowLatexModal] = useState(false);
  const activeBlobRef = useRef<string | null>(null);

  // Compute live LaTeX markup (respecting custom code if provided)
  const latexSource = useMemo(() => {
    return customLatex !== undefined ? customLatex : generateLatexDocument(resume);
  }, [resume, customLatex]);

  // Debounced compilation to pdflatex backend
  useEffect(() => {
    if (!isClient) return;

    let isAborted = false;
    const timer = setTimeout(async () => {
      setIsCompiling(true);
      setCompileError(null);

      try {
        const payload = customLatex !== undefined
          ? { latexCode: customLatex }
          : { resume };

        const response = await fetch("/api/compile-latex", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (isAborted) return;

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          const message = errData?.error || `LaTeX compilation failed with status ${response.status}`;
          setCompileError(message);
          setIsCompiling(false);
          return;
        }

        const blob = await response.blob();
        if (isAborted) return;

        // Revoke previous URL to prevent memory leaks
        if (activeBlobRef.current) {
          URL.revokeObjectURL(activeBlobRef.current);
        }

        const newUrl = URL.createObjectURL(blob);
        activeBlobRef.current = newUrl;
        setPdfBlobUrl(newUrl);
        setCompileError(null);
      } catch (err: unknown) {
        if (!isAborted) {
          const msg = err instanceof Error ? err.message : "Network error connecting to LaTeX compiler";
          setCompileError(msg);
        }
      } finally {
        if (!isAborted) {
          setIsCompiling(false);
        }
      }
    }, 350);

    return () => {
      isAborted = true;
      clearTimeout(timer);
    };
  }, [resume, customLatex, isClient]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (activeBlobRef.current) {
        URL.revokeObjectURL(activeBlobRef.current);
      }
    };
  }, []);

  const handleDownloadPdf = () => {
    if (!pdfBlobUrl) return;
    const a = document.createElement("a");
    a.href = pdfBlobUrl;
    const safeName = (resume.personalInfo.fullName || "Resume").replace(/\s+/g, "_");
    a.download = `${safeName}_Resume.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadTex = () => {
    const blob = new Blob([latexSource], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeName = (resume.personalInfo.fullName || "Resume").replace(/\s+/g, "_");
    link.download = `${safeName}_Resume.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleManualRecompile = async () => {
    setIsCompiling(true);
    setCompileError(null);
    try {
      const payload = customLatex !== undefined
        ? { latexCode: customLatex }
        : { resume };

      const response = await fetch("/api/compile-latex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        setCompileError(errData?.error || "Recompilation failed");
        return;
      }
      const blob = await response.blob();
      if (activeBlobRef.current) URL.revokeObjectURL(activeBlobRef.current);
      const newUrl = URL.createObjectURL(blob);
      activeBlobRef.current = newUrl;
      setPdfBlobUrl(newUrl);
      setCompileError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to trigger recompile";
      setCompileError(msg);
    } finally {
      setIsCompiling(false);
    }
  };

  if (!isClient) {
    return (
      <div className="w-full h-[840px] flex items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Initializing LaTeX Engine...
      </div>
    );
  }

  const safeFileName = `${(resume.personalInfo.fullName || "Resume").replace(/\s+/g, "_")}.tex`;

  return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden">
      {/* Top Bar Controls */}
      <div className="w-full max-w-[850px] mb-2 shrink-0 flex items-center justify-between px-4 py-2 bg-zinc-900/90 backdrop-blur rounded-xl border border-zinc-800 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-[11px]">
              {customLatex !== undefined ? "Custom LaTeX Engine" : "LaTeX Document Builder"}
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 hidden sm:inline">• pdfTeX Engine</span>
          {isCompiling && (
            <span className="flex items-center gap-1 text-[11px] text-sky-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Compiling...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* View LaTeX Code Button */}
          <button
            onClick={() => setShowLatexModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[11px] font-medium border border-zinc-700 transition"
            title="Inspect & Copy LaTeX (.tex) Source Code"
          >
            <Code className="w-3.5 h-3.5 text-sky-400" />
            <span>LaTeX Source</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={!pdfBlobUrl}
            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[11px] font-medium border border-zinc-700 transition disabled:opacity-40"
            title="Download compiled PDF directly"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* Download .tex Button */}
          <button
            onClick={handleDownloadTex}
            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[11px] font-medium border border-zinc-700 transition"
            title="Download .tex file directly"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">.tex</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border-l border-zinc-800 pl-2 ml-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-300 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] w-10 text-center text-zinc-300">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-300 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="px-2 py-1 hover:bg-zinc-800 rounded text-zinc-300 text-[11px] font-medium transition"
              title="Reset Zoom to 100%"
            >
              Fit
            </button>
          </div>

          {/* Recompile Button */}
          <button
            onClick={handleManualRecompile}
            disabled={isCompiling}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition disabled:opacity-50"
            title="Force Recompile LaTeX"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isCompiling ? "animate-spin text-sky-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="w-full flex-1 flex items-center justify-center overflow-hidden min-h-0 relative">
        {compileError ? (
          <div className="w-full max-w-[850px] p-6 bg-red-950/20 border border-red-800/80 rounded-2xl text-red-300 flex flex-col gap-3">
            <div className="flex items-center gap-2 font-semibold text-red-200">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>LaTeX Compilation Warning / Error</span>
            </div>
            <pre className="p-3 bg-black/50 border border-red-900/50 rounded-lg font-mono text-xs overflow-auto max-h-48 text-red-300 whitespace-pre-wrap">
              {compileError}
            </pre>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleManualRecompile}
                className="px-3 py-1.5 bg-red-800/60 hover:bg-red-700/80 text-white text-xs font-medium rounded-lg transition"
              >
                Retry Compilation
              </button>
              <button
                onClick={() => setShowLatexModal(true)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition border border-zinc-700"
              >
                View Generated LaTeX Code
              </button>
            </div>
          </div>
        ) : !pdfBlobUrl ? (
          <div className="w-full h-full max-w-[850px] flex flex-col items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-300 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-sm font-medium">Compiling LaTeX Document via pdfTeX...</p>
            <p className="text-xs text-zinc-500">Generating publication-grade vector PDF</p>
          </div>
        ) : (
          <div className="w-full h-full max-w-[850px] flex items-center justify-center overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl relative">
            {/* Subtle compiling badge overlay */}
            {isCompiling && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-sky-500/40 text-sky-300 text-xs shadow-lg backdrop-blur">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating PDF...</span>
              </div>
            )}

            <div
              className="w-full h-full transition-transform duration-200 origin-top flex justify-center"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full rounded-xl bg-white border-0 shadow-xl"
                title="LaTeX PDF Preview"
              />
            </div>
          </div>
        )}
      </div>

      {/* LaTeX Source Inspector Modal */}
      <LatexSourceModal
        isOpen={showLatexModal}
        onClose={() => setShowLatexModal(false)}
        latexSource={latexSource}
        fileName={safeFileName}
      />
    </div>
  );
}
