"use client";

import React from "react";
import { ResumeData, TypographySettings, defaultTypography } from "@/types/resume";
import { Type, Sliders, Bold, Italic, Minus } from "lucide-react";

interface Props {
  resume: ResumeData;
  onChange: (updatedResume: ResumeData) => void;
}

const PRESET_FONTS = [
  { label: "Helvetica (Modern Sans)", value: "Helvetica" },
  { label: "Times Roman (Classic Serif)", value: "Times-Roman" },
  { label: "Palatino (Editorial Serif)", value: "Palatino" },
  { label: "Computer Modern (LaTeX)", value: "Computer-Modern" },
  { label: "Courier (Monospace)", value: "Courier" },
];

export default function TypographyModal({ resume, onChange }: Props) {
  const typo = resume.typography || defaultTypography;

  const updateTypo = (partial: Partial<TypographySettings>) => {
    onChange({
      ...resume,
      typography: {
        ...typo,
        ...partial,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Font Family Selection */}
      <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-blue-400" /> LaTeX Font Family
          </label>
          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
            {typo.fontFamily || "Helvetica"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {PRESET_FONTS.map((font) => (
            <button
              key={font.value}
              onClick={() =>
                updateTypo({
                  fontFamily: font.value,
                })
              }
              className={`p-2.5 rounded-lg border text-xs font-medium text-left transition ${
                typo.fontFamily === font.value
                  ? "bg-blue-600/20 border-blue-500 text-blue-300"
                  : "bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Sizes Sliders */}
      <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-purple-400" /> LaTeX Font Scale (pt)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs text-zinc-300 mb-1">
              <span>Full Name</span>
              <span className="font-mono text-blue-400">{typo.nameSize} pt</span>
            </div>
            <input
              type="range"
              min="16"
              max="32"
              step="0.5"
              value={typo.nameSize}
              onChange={(e) => updateTypo({ nameSize: parseFloat(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-zinc-300 mb-1">
              <span>Job Title</span>
              <span className="font-mono text-blue-400">{typo.jobTitleSize} pt</span>
            </div>
            <input
              type="range"
              min="10"
              max="18"
              step="0.5"
              value={typo.jobTitleSize}
              onChange={(e) => updateTypo({ jobTitleSize: parseFloat(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-zinc-300 mb-1">
              <span>Section Titles</span>
              <span className="font-mono text-blue-400">{typo.sectionTitleSize} pt</span>
            </div>
            <input
              type="range"
              min="9"
              max="16"
              step="0.5"
              value={typo.sectionTitleSize}
              onChange={(e) => updateTypo({ sectionTitleSize: parseFloat(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-zinc-300 mb-1">
              <span>Body & Bullet Text</span>
              <span className="font-mono text-blue-400">{typo.bodySize} pt</span>
            </div>
            <input
              type="range"
              min="8"
              max="13"
              step="0.25"
              value={typo.bodySize}
              onChange={(e) => updateTypo({ bodySize: parseFloat(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Font Styles: Bold & Italic Toggles */}
      <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Bold className="w-3.5 h-3.5 text-emerald-400" /> Typography Styles (Bold / Italic)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-300">Full Name</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => updateTypo({ nameBold: !typo.nameBold })}
                className={`p-1.5 rounded flex items-center gap-1 text-xs font-bold border transition ${
                  typo.nameBold
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Bold className="w-3.5 h-3.5" /> Bold
              </button>
              <button
                onClick={() => updateTypo({ nameItalic: !typo.nameItalic })}
                className={`p-1.5 rounded flex items-center gap-1 text-xs italic border transition ${
                  typo.nameItalic
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Italic className="w-3.5 h-3.5" /> Italic
              </button>
            </div>
          </div>

          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-300">Job Title</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => updateTypo({ jobTitleBold: !typo.jobTitleBold })}
                className={`p-1.5 rounded flex items-center gap-1 text-xs font-bold border transition ${
                  typo.jobTitleBold
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Bold className="w-3.5 h-3.5" /> Bold
              </button>
              <button
                onClick={() => updateTypo({ jobTitleItalic: !typo.jobTitleItalic })}
                className={`p-1.5 rounded flex items-center gap-1 text-xs italic border transition ${
                  typo.jobTitleItalic
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Italic className="w-3.5 h-3.5" /> Italic
              </button>
            </div>
          </div>

          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-300">Section Titles</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => updateTypo({ sectionTitleBold: !typo.sectionTitleBold })}
                className={`p-1.5 rounded flex items-center gap-1 text-xs font-bold border transition ${
                  typo.sectionTitleBold
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Bold className="w-3.5 h-3.5" /> Bold
              </button>
              <button
                onClick={() => updateTypo({ sectionTitleItalic: !typo.sectionTitleItalic })}
                className={`p-1.5 rounded flex items-center gap-1 text-xs italic border transition ${
                  typo.sectionTitleItalic
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Italic className="w-3.5 h-3.5" /> Italic
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Rules & Theme Colors */}
      <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Minus className="w-3.5 h-3.5 text-amber-400" /> Section Dividers & Accent Color
        </label>

        <div className="space-y-3">
          <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer">
            <input
              type="checkbox"
              checked={typo.showSectionLines}
              onChange={(e) => updateTypo({ showSectionLines: e.target.checked })}
              className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-blue-600 accent-blue-500"
            />
            <span>Show horizontal rule under section titles (\titlerule)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer">
            <input
              type="checkbox"
              checked={typo.showHeaderLine}
              onChange={(e) => updateTypo({ showHeaderLine: e.target.checked })}
              className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-blue-600 accent-blue-500"
            />
            <span>Show header divider rule</span>
          </label>

          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-zinc-400">Accent Color:</span>
            <div className="flex items-center gap-2">
              {["#0284c7", "#2563eb", "#4f46e5", "#059669", "#dc2626", "#0f172a"].map((color) => (
                <button
                  key={color}
                  onClick={() => updateTypo({ primaryColor: color })}
                  style={{ backgroundColor: color }}
                  className={`w-6 h-6 rounded-full border-2 transition ${
                    typo.primaryColor === color ? "border-white scale-110" : "border-transparent"
                  }`}
                />
              ))}
              <input
                type="color"
                value={typo.primaryColor || "#0284c7"}
                onChange={(e) => updateTypo({ primaryColor: e.target.value })}
                className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                title="Custom color picker"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
