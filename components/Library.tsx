"use client";

import React, { useState } from "react";
import { usePaletteStore, Palette } from "../store/store";
import { STOPS } from "../lib/colors";
import { Copy, Trash2, Edit2, Download, Search, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import { oklch, parseHex } from "culori";

interface LibraryProps {
  onEdit: (hex: string) => void;
  onExport: (palette?: Palette) => void;
}

export function Library({ onEdit, onExport }: LibraryProps) {
  const { palettes, deletePalette, addPalette } = usePaletteStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "hue">("date");

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`Copied ${color}`);
  };

  const getSortHue = (palette: Palette) => {
    const hex = palette.colors["500"];
    if (!hex) return 0;
    const lchObj = oklch(parseHex(hex));
    return lchObj && lchObj.h ? lchObj.h : 0;
  };

  const filteredPalettes = palettes
    .filter((p) => p.id.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.id.localeCompare(b.id);
      if (sortBy === "hue") return getSortHue(a) - getSortHue(b);
      return b.createdAt - a.createdAt; // Default to date descending
    });

  const handleDuplicate = (palette: Palette) => {
    let finalName = palette.id + "-copy";
    let counter = 1;
    const baseName = finalName;
    while (palettes.some((p) => p.id === finalName)) {
      counter++;
      finalName = `${baseName}-${counter}`;
    }

    addPalette({
      ...palette,
      id: finalName,
      createdAt: Date.now(),
    });
    toast.success(`Duplicated ${palette.id}`);
  };

  if (palettes.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto py-24 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 mb-6 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded flex items-center justify-center text-gray-400 dark:text-zinc-600">
          <Settings2 size={24} />
        </div>
        <h2 className="text-sm font-bold tracking-widest uppercase dark:text-white mb-2">
          Your library is empty
        </h2>
        <p className="text-xs text-gray-400 dark:text-zinc-500 max-w-sm mb-8 tracking-wide">
          Generated palettes will appear here. Start creating colors or import them directly.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search palettes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-zinc-950 px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800">
            <span className="text-gray-500 dark:text-zinc-400">Sort:</span>
            <select
              className="bg-transparent font-medium text-gray-900 dark:text-white outline-none cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "name" | "hue")}
            >
              <option value="date">Newest</option>
              <option value="name">Name</option>
              <option value="hue">Hue</option>
            </select>
          </div>
          <button
            onClick={() => onExport()}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            <Download size={16} />
            Export Library
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filteredPalettes.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 flex flex-col md:flex-row items-center gap-6 transition-shadow group"
          >
            <div className="w-full md:w-48 flex-shrink-0">
              <h3
                className="font-bold text-sm tracking-widest uppercase dark:text-white truncate"
                title={p.id}
              >
                {p.id}
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 uppercase tracking-widest">
                {new Date(p.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex-1 w-full h-12 rounded overflow-hidden flex border border-gray-200 dark:border-zinc-800">
              {STOPS.map((stop) => (
                <div
                  key={stop}
                  className="flex-1 h-full cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: p.colors[stop] }}
                  onClick={() => handleCopy(p.colors[stop] || "")}
                  title={`${stop}: ${p.colors[stop]}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(p.colors["500"] || "#ffffff")}
                className="p-2 text-gray-400 border border-gray-200 dark:border-zinc-800 rounded hover:text-black dark:hover:text-white dark:hover:border-zinc-600 transition-colors"
                title="Edit Base Color in Generator"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => handleDuplicate(p)}
                className="p-2 text-gray-400 border border-gray-200 dark:border-zinc-800 rounded hover:text-black dark:hover:text-white dark:hover:border-zinc-600 transition-colors"
                title="Duplicate"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={() => onExport(p)}
                className="p-2 text-gray-400 border border-gray-200 dark:border-zinc-800 rounded hover:text-black dark:hover:text-white dark:hover:border-zinc-600 transition-colors"
                title="Export this palette"
              >
                <Download size={14} />
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this palette?")) {
                    deletePalette(p.id);
                  }
                }}
                className="p-2 text-gray-400 border border-gray-200 dark:border-zinc-800 rounded hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {filteredPalettes.length === 0 && searchTerm && (
          <div className="py-12 text-center text-gray-500 dark:text-zinc-400">
            No palettes found matching &quot;{searchTerm}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
