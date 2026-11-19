"use client";

import React, { useState, useMemo } from "react";
import { SkillCategory } from "@/types/resume";
import { 
  SKILLS_CATALOG, 
  CATALOG_CATEGORIES, 
  CatalogCategory, 
  CatalogSkill 
} from "@/lib/skillsCatalog";
import { 
  Search, 
  X, 
  Check, 
  Plus, 
  BookOpen, 
  SlidersHorizontal,
  Layers,
  Sparkles
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentSkills: SkillCategory[];
  onUpdateSkills: (updatedSkills: SkillCategory[]) => void;
}

export default function SkillCatalogModal({
  isOpen,
  onClose,
  currentSkills,
  onUpdateSkills,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | "All">("All");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [targetCategoryOption, setTargetCategoryOption] = useState<string>("auto");
  const [customSkillName, setCustomSkillName] = useState("");

  // Map to quickly check which skills are currently selected and in which category
  const selectedSkillsMap = useMemo(() => {
    const map = new Map<string, string>(); // skillLower -> categoryName
    currentSkills.forEach((cat) => {
      cat.items.forEach((item) => {
        map.set(item.trim().toLowerCase(), cat.categoryName);
      });
    });
    return map;
  }, [currentSkills]);

  // Filter skills according to search, category, and selected-only toggle
  const filteredSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return SKILLS_CATALOG.filter((skill) => {
      const isSelected = selectedSkillsMap.has(skill.name.toLowerCase());
      if (showSelectedOnly && !isSelected) return false;

      if (selectedCategory !== "All" && skill.category !== selectedCategory) {
        return false;
      }

      if (query) {
        const matchesName = skill.name.toLowerCase().includes(query);
        const matchesCategory = skill.category.toLowerCase().includes(query);
        const matchesAlias = (skill.aliases || []).some((a) => a.toLowerCase().includes(query));
        return matchesName || matchesCategory || matchesAlias;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, showSelectedOnly, selectedSkillsMap]);

  if (!isOpen) return null;

  // Find or create appropriate category for a skill
  const getDestinationCategoryName = (skill: CatalogSkill): string => {
    if (targetCategoryOption !== "auto") {
      return targetCategoryOption;
    }

    // Auto-map based on skill's category
    switch (skill.category) {
      case "Languages": {
        const existing = currentSkills.find((c) => /language/i.test(c.categoryName));
        return existing ? existing.categoryName : "Languages";
      }
      case "Frontend":
      case "Backend":
      case "Mobile": {
        const existing = currentSkills.find((c) => /framework|frontend|backend|web/i.test(c.categoryName));
        return existing ? existing.categoryName : "Frameworks & Libraries";
      }
      case "Databases": {
        const existing = currentSkills.find((c) => /database|storage|data/i.test(c.categoryName));
        return existing ? existing.categoryName : "Databases & Storage";
      }
      case "Cloud & DevOps": {
        const existing = currentSkills.find((c) => /cloud|devops|infra/i.test(c.categoryName));
        return existing ? existing.categoryName : "Cloud & Infrastructure";
      }
      default: {
        const existing = currentSkills.find((c) => /tool|tech|architecture/i.test(c.categoryName));
        return existing ? existing.categoryName : "Developer Tools";
      }
    }
  };

  const handleToggleSkill = (skill: CatalogSkill) => {
    const skillLower = skill.name.toLowerCase();
    const isCurrentlySelected = selectedSkillsMap.has(skillLower);

    if (isCurrentlySelected) {
      // Remove the skill from whichever category holds it
      const updated = currentSkills.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.trim().toLowerCase() !== skillLower),
      }));
      onUpdateSkills(updated);
    } else {
      // Add the skill
      const destCatName = getDestinationCategoryName(skill);
      let found = false;
      const updated = currentSkills.map((cat) => {
        if (cat.categoryName.toLowerCase() === destCatName.toLowerCase()) {
          found = true;
          return {
            ...cat,
            items: [...cat.items, skill.name],
          };
        }
        return cat;
      });

      if (!found) {
        // Create new category if none exists
        updated.push({
          id: `skill-cat-${destCatName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          categoryName: destCatName,
          items: [skill.name],
        });
      }

      onUpdateSkills(updated);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSkillName.trim();
    if (!trimmed) return;

    const destCatName =
      targetCategoryOption !== "auto"
        ? targetCategoryOption
        : currentSkills[0]?.categoryName || "Skills & Technologies";

    let found = false;
    const updated = currentSkills.map((cat) => {
      if (cat.categoryName.toLowerCase() === destCatName.toLowerCase()) {
        found = true;
        if (!cat.items.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
          return { ...cat, items: [...cat.items, trimmed] };
        }
      }
      return cat;
    });

    if (!found) {
      updated.push({
        id: `skill-cat-${destCatName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        categoryName: destCatName,
        items: [trimmed],
      });
    }

    onUpdateSkills(updated);
    setCustomSkillName("");
  };

  const totalSelectedCount = selectedSkillsMap.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                Languages & Frameworks Catalog
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                  {totalSelectedCount} Selected
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Check and uncheck languages, frameworks, and technologies to customize your resume
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

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search languages, frameworks, databases, or tools (e.g. React, Go, Docker)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-800/80 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-zinc-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Target Category Destination */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 text-xs">
              <span className="text-zinc-400 flex items-center gap-1 shrink-0">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Add to:
              </span>
              <select
                value={targetCategoryOption}
                onChange={(e) => setTargetCategoryOption(e.target.value)}
                className="px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              >
                <option value="auto">Auto-route by Type</option>
                {currentSkills.map((cat) => (
                  <option key={cat.id} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* View Selected Only Toggle */}
            <button
              type="button"
              onClick={() => setShowSelectedOnly(!showSelectedOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition shrink-0 ${
                showSelectedOnly
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/80"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showSelectedOnly ? "Showing Selected" : "Selected Only"}</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg shrink-0 transition ${
                selectedCategory === "All"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60"
              }`}
            >
              All ({SKILLS_CATALOG.length})
            </button>
            {CATALOG_CATEGORIES.map((cat) => {
              const countInCat = SKILLS_CATALOG.filter((s) => s.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg shrink-0 transition ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60"
                  }`}
                >
                  {cat} ({countInCat})
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Skills Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          {filteredSkills.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-zinc-400 text-sm">No matching technologies found.</p>
              <p className="text-zinc-500 text-xs">
                You can add any custom framework or language using the quick-add bar below!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredSkills.map((skill) => {
                const isSelected = selectedSkillsMap.has(skill.name.toLowerCase());
                const holdingCat = selectedSkillsMap.get(skill.name.toLowerCase());

                return (
                  <button
                    key={skill.name}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition select-none ${
                      isSelected
                        ? "bg-emerald-950/40 border-emerald-700/70 text-emerald-200 shadow-sm"
                        : "bg-zinc-800/40 hover:bg-zinc-800/90 border-zinc-700/60 text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? "bg-emerald-500 text-zinc-950 font-bold"
                          : "border border-zinc-600 bg-zinc-800"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold truncate">
                          {skill.name}
                        </span>
                        {skill.popular && (
                          <span title="High-demand industry skill">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 truncate block">
                        {isSelected ? `in ${holdingCat}` : skill.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Skill Quick Add & Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Custom Skill Form */}
          <form onSubmit={handleAddCustomSkill} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
            <input
              type="text"
              placeholder="Don't see your skill? Add custom..."
              value={customSkillName}
              onChange={(e) => setCustomSkillName(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={!customSkillName.trim()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 rounded-lg disabled:opacity-40 transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Close / Apply */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md shadow-emerald-600/20 transition w-full sm:w-auto"
            >
              Done ({totalSelectedCount} Selected)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
