"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { ResumeData } from "@/types/resume";
import { generateLatexDocument } from "@/lib/latexGenerator";
import {
  Code,
  Copy,
  Check,
  Download,
  RotateCcw,
  Play,
  Loader2,
  AlertCircle,
  Maximize2,
  Minimize2,
  Search,
  ChevronUp,
  ChevronDown,
  Replace,
  CaseSensitive,
  X,
  WrapText,
} from "lucide-react";

interface Props {
  resume: ResumeData;
  code: string;
  onChange: (newCode: string) => void;
  onResetToForm: () => void;
  onCompile: () => void;
  isCompiling?: boolean;
  compileError?: string | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function LatexCodeEditor({
  resume,
  code,
  onChange,
  onResetToForm,
  onCompile,
  isCompiling = false,
  compileError = null,
  isExpanded = false,
  onToggleExpand,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const shadowMeasureRef = useRef<HTMLDivElement>(null);

  // Word wrap state (enabled by default, persisted in localStorage)
  const [wordWrap, setWordWrap] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("resumix_code_word_wrap");
        if (saved !== null) {
          return saved === "true";
        }
      } catch {
        // fallback
      }
    }
    return true;
  });

  const [lineHeights, setLineHeights] = useState<number[]>([]);

  // Find & Replace state
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute live generated code from form data to check if customized
  const formGeneratedLatex = useMemo(() => {
    return generateLatexDocument(resume);
  }, [resume]);

  const isCustomized = code.trim() !== formGeneratedLatex.trim();

  // Total lines
  const linesCount = useMemo(() => {
    return (code.match(/\n/g) || []).length + 1;
  }, [code]);

  // Find all matches in code
  const matches = useMemo(() => {
    if (!searchTerm) return [];
    const results: { start: number; end: number }[] = [];
    const source = caseSensitive ? code : code.toLowerCase();
    const query = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    let index = source.indexOf(query);
    while (index !== -1) {
      results.push({ start: index, end: index + query.length });
      index = source.indexOf(query, index + query.length || index + 1);
    }
    return results;
  }, [code, searchTerm, caseSensitive]);

  // Safe match index
  const safeMatchIdx = matches.length > 0 ? Math.min(currentMatchIdx, matches.length - 1) : 0;

  // Toggle word wrap
  const toggleWordWrap = () => {
    setWordWrap((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("resumix_code_word_wrap", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Synchronize dynamic line heights for the gutter when word wrap is enabled
  useEffect(() => {
    if (!wordWrap) {
      return;
    }

    const measureHeights = () => {
      const container = shadowMeasureRef.current;
      if (!container) return;
      const children = container.children;
      const heights = new Array(children.length);
      for (let i = 0; i < children.length; i++) {
        heights[i] = (children[i] as HTMLElement).offsetHeight;
      }
      setLineHeights(heights);
    };

    const animId = requestAnimationFrame(measureHeights);
    return () => cancelAnimationFrame(animId);
  }, [code, wordWrap]);

  // Synchronize scrolling between textarea and line numbers gutter
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Track cursor line & col
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart || 0;
    const textBefore = code.substring(0, pos);
    const lines = textBefore.split("\n");
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  // Navigate to a specific match
  const goToMatch = (targetIdx: number) => {
    if (matches.length === 0) return;
    const safeIdx = (targetIdx + matches.length) % matches.length;
    setCurrentMatchIdx(safeIdx);
    const match = matches[safeIdx];
    if (match && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      textarea.setSelectionRange(match.start, match.end);

      // Scroll textarea to line of match
      const linesBefore = code.substring(0, match.start).split("\n").length;
      const lineHeight = 24; // 1.5rem
      const targetScroll = Math.max(0, (linesBefore - 4) * lineHeight);
      textarea.scrollTop = targetScroll;
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = targetScroll;
      }
      updateCursorPosition();
    }
  };

  const handleNextMatch = () => {
    goToMatch(safeMatchIdx + 1);
  };

  const handlePrevMatch = () => {
    goToMatch(safeMatchIdx - 1);
  };

  const handleReplaceCurrent = () => {
    if (matches.length === 0 || !textareaRef.current) return;
    const match = matches[safeMatchIdx];
    if (!match) return;

    const newCode = code.substring(0, match.start) + replaceTerm + code.substring(match.end);
    onChange(newCode);

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          match.start,
          match.start + replaceTerm.length
        );
      }
    });
  };

  const handleReplaceAll = () => {
    if (!searchTerm || matches.length === 0) return;
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, caseSensitive ? "g" : "gi");
    const newCode = code.replace(regex, replaceTerm);
    onChange(newCode);
  };

  // Keyboard shortcut handlers (Tab, Shift+Tab, Ctrl+Enter, Ctrl+F, Ctrl+H, Alt+Z)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Alt+Z -> Toggle Word Wrap
    if (e.altKey && (e.key === "z" || e.key === "Z")) {
      e.preventDefault();
      toggleWordWrap();
      return;
    }

    // Ctrl+F or Cmd+F -> Open Find Bar
    if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F")) {
      e.preventDefault();
      setShowSearch(true);
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      if (start !== end) {
        const selectedText = code.substring(start, end);
        if (selectedText.length < 80 && !selectedText.includes("\n")) {
          setSearchTerm(selectedText);
        }
      }
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 50);
      return;
    }

    // Ctrl+H -> Open Find & Replace Bar
    if ((e.ctrlKey || e.metaKey) && (e.key === "h" || e.key === "H")) {
      e.preventDefault();
      setShowSearch(true);
      setShowReplace(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 50);
      return;
    }

    // Ctrl+Enter or Cmd+Enter -> Compile
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onCompile();
      return;
    }

    // Tab & Shift+Tab
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        // Shift+Tab: Unindent
        const linesBefore = code.substring(0, start).split("\n");
        const currentLineIdx = linesBefore.length - 1;
        const allLines = code.split("\n");
        const currentLine = allLines[currentLineIdx];

        if (currentLine.startsWith("  ")) {
          allLines[currentLineIdx] = currentLine.substring(2);
          const newCode = allLines.join("\n");
          onChange(newCode);
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(0, start - 2);
          });
        }
      } else {
        // Tab: Insert 2 spaces
        const newCode = code.substring(0, start) + "  " + code.substring(end);
        onChange(newCode);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
          updateCursorPosition();
        });
      }
    }
  };

  // Snippet inserters
  const insertSnippet = (snippet: string, cursorOffset = 0) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = code.substring(start, end);

    let insertion = snippet;
    if (selected && snippet.includes("{text}")) {
      insertion = snippet.replace("{text}", selected);
    }

    const newCode = code.substring(0, start) + insertion + code.substring(end);
    onChange(newCode);

    requestAnimationFrame(() => {
      textarea.focus();
      const targetPos = start + insertion.length + cursorOffset;
      textarea.selectionStart = textarea.selectionEnd = targetPos;
      updateCursorPosition();
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
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

  const handleResetConfirmation = () => {
    if (
      isCustomized &&
      !window.confirm(
        "Re-syncing from Form will overwrite your custom LaTeX changes with the current form fields. Proceed?"
      )
    ) {
      return;
    }
    onResetToForm();
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl relative">
      {/* 1. Header Toolbar */}
      <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
            <Code className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-200">LaTeX Code Editor</span>
              {isCustomized ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/80 font-medium">
                  Custom Mode
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800/80 font-medium">
                  Synced with Form
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 truncate">
              Direct TeX markup • Ctrl+F to Find • Alt+Z for Word Wrap
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Word Wrap Toggle */}
          <button
            onClick={toggleWordWrap}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border transition ${
              wordWrap
                ? "bg-sky-600/30 border-sky-500 text-sky-300"
                : "text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700"
            }`}
            title="Toggle Word Wrap (Alt+Z)"
          >
            <WrapText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wrap</span>
          </button>

          {/* Find Button */}
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              if (!showSearch) {
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }
            }}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border transition ${
              showSearch
                ? "bg-sky-600/30 border-sky-500 text-sky-300"
                : "text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
            }`}
            title="Find & Replace in editor (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Find</span>
          </button>

          {/* Re-sync Button */}
          <button
            onClick={handleResetConfirmation}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition"
            title="Re-sync code from form data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Re-sync Form</span>
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg border border-transparent hover:border-zinc-700 transition"
            title="Copy LaTeX source"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* Download .tex */}
          <button
            onClick={handleDownload}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg border border-transparent hover:border-zinc-700 transition"
            title="Download .tex file"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Expand Toggle if provided */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg border border-transparent hover:border-zinc-700 transition"
              title={isExpanded ? "Collapse Editor Width" : "Expand Editor Width"}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Compile Button */}
          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg shadow-sm transition disabled:opacity-50"
            title="Compile LaTeX with pdfTeX (Ctrl+Enter)"
          >
            {isCompiling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Compile</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Interactive Find & Replace Bar (Floating overlay inside editor) */}
      {showSearch && (
        <div className="absolute top-12 right-4 z-30 w-80 sm:w-96 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl p-2.5 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
          {/* Search Row */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Find in code..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentMatchIdx(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (e.shiftKey) {
                      handlePrevMatch();
                    } else {
                      handleNextMatch();
                    }
                  } else if (e.key === "Escape") {
                    setShowSearch(false);
                    textareaRef.current?.focus();
                  }
                }}
                className="w-full pl-7 pr-16 py-1.5 text-xs bg-zinc-950 border border-zinc-700/80 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-2.5 pointer-events-none" />

              {/* Match Counter Badge */}
              <span className="absolute right-2 top-2 text-[10px] font-mono text-zinc-400 select-none">
                {searchTerm ? (
                  matches.length > 0 ? (
                    `${safeMatchIdx + 1} of ${matches.length}`
                  ) : (
                    <span className="text-amber-400">0 found</span>
                  )
                ) : (
                  ""
                )}
              </span>
            </div>

            {/* Case Sensitive Toggle */}
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
              className={`p-1.5 rounded-lg border transition ${
                caseSensitive
                  ? "bg-sky-600/30 border-sky-500 text-sky-300"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
              }`}
              title="Match Case (Aa)"
            >
              <CaseSensitive className="w-3.5 h-3.5" />
            </button>

            {/* Previous Match */}
            <button
              onClick={handlePrevMatch}
              disabled={matches.length === 0}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 border border-zinc-700 text-zinc-300 rounded-lg transition"
              title="Previous match (Shift+Enter)"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            {/* Next Match */}
            <button
              onClick={handleNextMatch}
              disabled={matches.length === 0}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 border border-zinc-700 text-zinc-300 rounded-lg transition"
              title="Next match (Enter)"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Toggle Replace Mode */}
            <button
              onClick={() => setShowReplace(!showReplace)}
              className={`p-1.5 rounded-lg border transition ${
                showReplace
                  ? "bg-sky-600/30 border-sky-500 text-sky-300"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
              }`}
              title="Toggle Replace mode"
            >
              <Replace className="w-3.5 h-3.5" />
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowSearch(false);
                textareaRef.current?.focus();
              }}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
              title="Close search (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Replace Row */}
          {showReplace && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-800 animate-in fade-in">
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleReplaceCurrent();
                  } else if (e.key === "Escape") {
                    setShowSearch(false);
                    textareaRef.current?.focus();
                  }
                }}
                className="flex-1 px-2.5 py-1 text-xs bg-zinc-950 border border-zinc-700/80 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
              />
              <button
                onClick={handleReplaceCurrent}
                disabled={matches.length === 0}
                className="px-2 py-1 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 border border-zinc-700 rounded-lg transition"
                title="Replace current occurrence"
              >
                Replace
              </button>
              <button
                onClick={handleReplaceAll}
                disabled={matches.length === 0}
                className="px-2 py-1 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 border border-zinc-700 rounded-lg transition"
                title="Replace all occurrences"
              >
                All
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Snippets Bar */}
      <div className="px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center gap-1 overflow-x-auto text-xs shrink-0 select-none">
        <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1.5 shrink-0">
          Snippets:
        </span>

        <button
          onClick={() => insertSnippet("\n\\resumesection{Section Title}\n")}
          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-mono shrink-0 transition"
          title="Insert \\resumesection{...}"
        >
          + Section
        </button>

        <button
          onClick={() =>
            insertSnippet(
              "\n\\resumeSubheading{Position / Degree}{2024 -- Present}{Company / Institution}{Location}\n"
            )
          }
          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-mono shrink-0 transition"
          title="Insert \\resumeSubheading{...}{...}{...}{...}"
        >
          + Subheading
        </button>

        <button
          onClick={() =>
            insertSnippet(
              "\\begin{resumeItemList}\n  \\item First accomplishment bullet point\n  \\item Second accomplishment bullet point\n\\end{resumeItemList}\n"
            )
          }
          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-mono shrink-0 transition"
          title="Insert \\begin{resumeItemList} ... \\end{resumeItemList}"
        >
          + Bullets
        </button>

        <button
          onClick={() => insertSnippet("\\pdflink{https://example.com}{display text}")}
          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-mono shrink-0 transition"
          title="Insert \\pdflink{url}{label}"
        >
          + Link
        </button>

        <button
          onClick={() => insertSnippet("\\textbf{text}")}
          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-mono shrink-0 transition"
          title="Bold text: \\textbf{...}"
        >
          <b>B</b>
        </button>

        <button
          onClick={() => insertSnippet("\\textit{text}")}
          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-mono shrink-0 transition"
          title="Italic text: \\textit{...}"
        >
          <i>I</i>
        </button>

        <button
          onClick={() => insertSnippet("\n\\vspace{4pt}\n")}
          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-mono shrink-0 transition"
          title="Add vertical space: \\vspace{...}"
        >
          + Space
        </button>

        <button
          onClick={() => insertSnippet("\n\\hrule height 0.75pt\\relax\n")}
          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-mono shrink-0 transition"
          title="Horizontal line: \\hrule"
        >
          — Line
        </button>
      </div>

      {/* 4. Main Editor Workspace: Gutter + Textarea */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-12 bg-zinc-950 py-3 text-right pr-3 select-none text-zinc-600 font-mono text-xs overflow-hidden border-r border-zinc-800/80 leading-[1.5rem]"
        >
          {Array.from({ length: linesCount }).map((_, i) => (
            <div
              key={i}
              style={{
                height: wordWrap && lineHeights[i] ? `${lineHeights[i]}px` : undefined,
              }}
              className={`${
                cursorPos.line === i + 1 ? "text-sky-400 font-bold" : ""
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => {
            onChange(e.target.value);
            updateCursorPosition();
          }}
          onScroll={handleScroll}
          onSelect={updateCursorPosition}
          onClick={updateCursorPosition}
          onKeyUp={updateCursorPosition}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className={`flex-1 h-full p-3 bg-zinc-950 text-zinc-100 font-mono text-xs leading-[1.5rem] resize-none outline-none selection:bg-sky-800/50 ${
            wordWrap
              ? "whitespace-pre-wrap break-words overflow-y-auto overflow-x-hidden"
              : "whitespace-pre overflow-auto"
          }`}
        />

        {/* Invisible shadow container to mirror wrapped line heights */}
        {wordWrap && (
          <div
            ref={shadowMeasureRef}
            aria-hidden="true"
            className="absolute top-0 left-12 right-0 p-3 font-mono text-xs leading-[1.5rem] whitespace-pre-wrap break-words opacity-0 pointer-events-none -z-10"
          >
            {code.split("\n").map((line, idx) => (
              <div key={idx}>{line || "\u00A0"}</div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Compile Error Notification (if compile fails) */}
      {compileError && (
        <div className="p-3 bg-red-950/40 border-t border-red-800/80 flex flex-col gap-1.5 text-xs text-red-300 shrink-0">
          <div className="flex items-center gap-1.5 font-semibold text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>LaTeX Compile Warning / Error</span>
          </div>
          <pre className="font-mono text-[11px] bg-black/60 p-2 rounded border border-red-900/60 max-h-24 overflow-auto text-red-300 whitespace-pre-wrap">
            {compileError}
          </pre>
        </div>
      )}

      {/* 6. Status Footer */}
      <div className="px-4 py-1.5 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
        <div className="flex items-center gap-3">
          <span>
            Ln <strong className="text-zinc-200">{cursorPos.line}</strong>, Col{" "}
            <strong className="text-zinc-200">{cursorPos.col}</strong>
          </span>
          <span>{linesCount} lines</span>
          <span>{code.length} chars</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-500">
          <button
            onClick={toggleWordWrap}
            className="hover:text-zinc-300 transition cursor-pointer flex items-center gap-1"
            title="Toggle Word Wrap (Alt+Z)"
          >
            <WrapText className="w-3 h-3 text-zinc-400" />
            <span>
              Wrap:{" "}
              <strong className={wordWrap ? "text-sky-400" : "text-zinc-400"}>
                {wordWrap ? "On" : "Off"}
              </strong>
            </span>
          </button>
          <span>•</span>
          <span>Ctrl+F: Find</span>
          <span>•</span>
          <span>Tab: Indent</span>
          <span>•</span>
          <span>Ctrl+Enter: Compile</span>
        </div>
      </div>
    </div>
  );
}
