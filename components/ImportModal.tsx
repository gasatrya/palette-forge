"use client";

import React, { useState } from "react";
import { extractHexFromUiColorsUrl, parseTailwindConfigSnippet } from "../lib/colors";
import { Palette, usePaletteStore } from "../store/store";
import { X, Upload, Link2, Code } from "lucide-react";
import toast from "react-hot-toast";

interface ImportModalProps {
  onClose: () => void;
  onGoToGenerator: (hex: string) => void;
}

export function ImportModal({ onClose, onGoToGenerator }: ImportModalProps) {
  const [inputText, setInputText] = useState("");
  const importLibrary = usePaletteStore((s) => s.importLibrary);

  const handleImport = () => {
    if (!inputText.trim()) {
      toast.error("Please enter something to import");
      return;
    }

    // Try URL first
    const hexFromUrl = extractHexFromUiColorsUrl(inputText);
    if (hexFromUrl) {
      toast.success("Found color in URL!");
      onGoToGenerator(hexFromUrl);
      onClose();
      return;
    }

    // Try parsing snippet/JSON
    const palettes = parseTailwindConfigSnippet(inputText);
    const names = Object.keys(palettes);
    if (names.length > 0) {
      const newPalettes: Palette[] = names.map((name) => ({
        id: name,
        colors: palettes[name],
        createdAt: Date.now(),
      }));
      importLibrary(newPalettes);
      toast.success(`Imported ${names.length} palette(s) to Library`);
      onClose();
      return;
    }

    toast.error(
      "Could not auto-detect format. Make sure it is a valid hex, URL, or JSON/JS snippet.",
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-semibold dark:text-white flex items-center gap-2">
            <Upload size={20} />
            Import Palette
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-gray-600 dark:text-zinc-400 text-balance">
            Paste a <strong>uicolors.app URL</strong>, a{" "}
            <strong>Tailwind config format snippet</strong>, or <strong>raw JSON</strong>. We will
            auto-detect the format.
          </p>

          <div className="flex gap-4 mb-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-950 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800">
              <Link2 size={14} /> <code>uicolors.app/create?...</code>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-950 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800">
              <Code size={14} /> <code>&#123; &quot;50&quot;: &quot;#fff&quot; &#125;</code>
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your source text here..."
            className="w-full h-40 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none dark:text-zinc-300 placeholder:text-gray-400"
          />
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 rounded-lg transition-colors"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
