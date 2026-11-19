"use client";

import React, { useState } from "react";
import { Copy, Check, Download, X, Code, Sparkles } from "lucide-react";

interface Props {
  latexSource: string;
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
}

export default function LatexSourceModal({
  latexSource,
  isOpen,
  onClose,
  fileName = "resume.tex",
}: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(latexSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([latexSource], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName.endsWith(".tex") ? fileName : `${fileName}.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                LaTeX Document Source
                <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  .tex
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                100% clean, compile-ready LaTeX for pdfTeX, TeX Live, or Overleaf
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition"
              title="Copy LaTeX source to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition"
              title="Download resume.tex"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .tex</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 bg-zinc-950 font-mono text-xs text-zinc-300 leading-relaxed select-text">
          <pre className="whitespace-pre-wrap">{latexSource}</pre>
        </div>

        {/* Footer tip */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>
              Tip: You can paste this code directly into <strong className="text-zinc-300">Overleaf</strong> or compile it offline with <code className="text-sky-300 bg-zinc-800 px-1 py-0.5 rounded">pdflatex resume.tex</code>.
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
