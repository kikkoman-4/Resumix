"use client";

import React, { useState } from "react";
import {
  GripVertical,
  Layers,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  FileText,
  Briefcase,
  Code2,
  FolderGit2,
  GraduationCap,
} from "lucide-react";

interface Props {
  sectionOrder: string[];
  disabledSections?: string[];
  onChangeOrder: (newOrder: string[]) => void;
  onToggleSection: (sectionId: string) => void;
  onEnableAll?: () => void;
  onResetOrder?: () => void;
}

const SECTION_CONFIG: Record<
  string,
  { label: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  summary: {
    label: "Professional Summary",
    description: "Brief career overview and value proposition",
    icon: FileText,
  },
  workExperiences: {
    label: "Work Experience",
    description: "Roles, achievements, metrics, and employment history",
    icon: Briefcase,
  },
  skills: {
    label: "Skills & Expertise",
    description: "Technical stack, tools, libraries, and proficiencies",
    icon: Code2,
  },
  projects: {
    label: "Key Projects",
    description: "Highlighted work, repositories, and technical impact",
    icon: FolderGit2,
  },
  educations: {
    label: "Education",
    description: "Degrees, institutions, GPA, and academic honors",
    icon: GraduationCap,
  },
};

export default function DraggableSectionOrder({
  sectionOrder,
  disabledSections = [],
  onChangeOrder,
  onToggleSection,
  onEnableAll,
  onResetOrder,
}: Props) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const updated = [...sectionOrder];
    const [draggedItem] = updated.splice(draggedIdx, 1);
    updated.splice(index, 0, draggedItem);
    setDraggedIdx(index);
    onChangeOrder(updated);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...sectionOrder];
    const item = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = item;
    onChangeOrder(updated);
  };

  const moveDown = (index: number) => {
    if (index >= sectionOrder.length - 1) return;
    const updated = [...sectionOrder];
    const item = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = item;
    onChangeOrder(updated);
  };

  const disabledSet = new Set(disabledSections);
  const activeCount = sectionOrder.filter((id) => !disabledSet.has(id)).length;

  return (
    <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-4">
      {/* Header with Title and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-400" />
            Resume Categories & Order
          </label>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {activeCount} of {sectionOrder.length} categories active in PDF output
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {disabledSections.length > 0 && onEnableAll && (
            <button
              onClick={onEnableAll}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/80 rounded-lg transition"
              title="Enable all hidden categories"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Enable All</span>
            </button>
          )}

          {onResetOrder && (
            <button
              onClick={onResetOrder}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg transition"
              title="Reset order to default standard layout"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Draggable Category Items List */}
      <div className="space-y-2">
        {sectionOrder.map((sectionId, idx) => {
          const config = SECTION_CONFIG[sectionId] || {
            label: sectionId,
            description: "Custom Section",
            icon: Layers,
          };
          const Icon = config.icon;
          const isDisabled = disabledSet.has(sectionId);

          return (
            <div
              key={sectionId}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 rounded-xl border transition select-none ${
                draggedIdx === idx
                  ? "border-sky-500 bg-sky-950/40 opacity-75 shadow-lg"
                  : isDisabled
                  ? "bg-zinc-900/40 border-zinc-800/60 opacity-60 text-zinc-500"
                  : "bg-zinc-800/70 hover:bg-zinc-800 border-zinc-700/60 text-zinc-200 shadow-sm"
              }`}
            >
              {/* Drag Handle */}
              <div
                className="cursor-grab active:cursor-grabbing p-1 text-zinc-500 hover:text-zinc-300 shrink-0"
                title="Drag to reorder"
              >
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Position Number Badge */}
              <span className="w-5 text-center font-mono text-[11px] font-bold text-zinc-500 shrink-0">
                #{idx + 1}
              </span>

              {/* Category Icon */}
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isDisabled
                    ? "bg-zinc-800 text-zinc-500"
                    : "bg-zinc-900/90 text-sky-400 border border-zinc-700/50"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Category Label and Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold truncate ${
                      isDisabled ? "line-through text-zinc-500" : "text-zinc-200"
                    }`}
                  >
                    {config.label}
                  </span>
                  {isDisabled ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-medium">
                      Hidden
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-medium border border-emerald-800/60">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                  {config.description}
                </p>
              </div>

              {/* Up & Down Quick Reorder Buttons */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 rounded disabled:opacity-20 transition"
                  title="Move section up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === sectionOrder.length - 1}
                  className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 rounded disabled:opacity-20 transition"
                  title="Move section down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Visibility / Disable Toggle Button */}
              <button
                type="button"
                onClick={() => onToggleSection(sectionId)}
                className={`p-2 rounded-lg border transition shrink-0 ${
                  isDisabled
                    ? "bg-zinc-800 text-zinc-500 border-zinc-700/60 hover:text-zinc-300"
                    : "bg-emerald-950/60 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900/60"
                }`}
                title={isDisabled ? "Enable this section in PDF" : "Disable/hide this section in PDF"}
              >
                {isDisabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
