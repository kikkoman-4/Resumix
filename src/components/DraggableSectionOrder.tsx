"use client";

import React, { useState } from "react";
import { GripVertical, Layers } from "lucide-react";

interface Props {
  sectionOrder: string[];
  onChange: (newOrder: string[]) => void;
}

const SECTION_LABELS: Record<string, string> = {
  summary: "Professional Summary",
  workExperiences: "Work Experience",
  skills: "Skills & Expertise",
  projects: "Key Projects",
  educations: "Education",
};

export default function DraggableSectionOrder({ sectionOrder, onChange }: Props) {
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
    onChange(updated);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  return (
    <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-sky-400" /> Reorder Layout (Drag & Drop)
        </label>
        <span className="text-[11px] text-zinc-500">Drag to re-sequence PDF</span>
      </div>

      <div className="space-y-1.5">
        {sectionOrder.map((sectionId, idx) => (
          <div
            key={sectionId}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2.5 px-3 py-2 bg-zinc-800/80 hover:bg-zinc-800 border rounded-lg cursor-grab active:cursor-grabbing select-none transition ${
              draggedIdx === idx
                ? "border-sky-500 bg-sky-950/30 opacity-80"
                : "border-zinc-700/60 text-zinc-200"
            }`}
          >
            <GripVertical className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="text-xs font-medium flex-1">
              {SECTION_LABELS[sectionId] || sectionId}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">#{idx + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
