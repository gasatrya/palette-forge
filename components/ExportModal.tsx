"use client";

import React, { useState } from "react";
import { Palette, usePaletteStore } from "../store/store";
import { X, Copy, Download, Code } from "lucide-react";
import toast from "react-hot-toast";

interface ExportModalProps {
  onClose: () => void;
  singlePalette?: Palette; // If undefined, export entire library
}

export function ExportModal({ onClose, singlePalette }: ExportModalProps) {
  const { palettes } = usePaletteStore();
  const [format, setFormat] = useState<"tailwind3" | "tailwind4" | "css" | "json">("tailwind3");

  const targets = singlePalette ? [singlePalette] : palettes;

  const generateCode = () => {
    switch (format) {
      case "tailwind3": {
        const colorsObj = targets.reduce(
          (acc, p) => {
            acc[p.id] = p.colors;
            return acc;
          },
          {} as Record<string, Record<string, string>>,
        );
        return `module.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(colorsObj, null, 8).replace(/\n/g, "\n      ").replace(/}$/, "    }")}\n    }\n  }\n};`;
      }
      case "tailwind4": {
        let code = `@theme {\n`;
        targets.forEach((p) => {
          code += `  /* ${p.id} */\n`;
          Object.entries(p.colors).forEach(([stop, hex]) => {
            code += `  --color-${p.id}-${stop}: ${hex};\n`;
          });
          code += `\n`;
        });
        code += `}`;
        return code;
      }
      case "css": {
        let code = `:root {\n`;
        targets.forEach((p) => {
          Object.entries(p.colors).forEach(([stop, hex]) => {
            code += `  --color-${p.id}-${stop}: ${hex};\n`;
          });
        });
        code += `}`;
        return code;
      }
      case "json": {
        const colorsObj = targets.reduce(
          (acc, p) => {
            acc[p.id] = p.colors;
            return acc;
          },
          {} as Record<string, Record<string, string>>,
        );
        return JSON.stringify(colorsObj, null, 2);
      }
    }
  };

  const codeString = generateCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([codeString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    let ext = ".js";
    if (format === "json") ext = ".json";
    if (format === "css" || format === "tailwind4") ext = ".css";

    // In actual JS context it could be tailwind.config.js
    const fileName =
      format === "tailwind3"
        ? "tailwind.config.js"
        : format === "tailwind4"
          ? "theme.css"
          : `palette${ext}`;

    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-semibold dark:text-white flex items-center gap-2">
            <Code size={20} />
            Export {singlePalette ? "Palette" : "Library"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex gap-2 bg-gray-100 dark:bg-zinc-950 p-1 rounded-xl w-fit">
            <button
              onClick={() => setFormat("tailwind3")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${format === "tailwind3" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
            >
              Tailwind v3
            </button>
            <button
              onClick={() => setFormat("tailwind4")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${format === "tailwind4" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
            >
              Tailwind v4
            </button>
            <button
              onClick={() => setFormat("css")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${format === "css" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
            >
              CSS Variables
            </button>
            <button
              onClick={() => setFormat("json")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${format === "json" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
            >
              JSON
            </button>
          </div>

          <div className="relative group">
            <div className="absolute right-3 top-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-2 bg-white/10 dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 backdrop-blur-sm rounded-lg text-gray-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                title="Copy code"
              >
                <Copy size={16} />
              </button>
            </div>
            <pre className="w-full h-80 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-mono text-gray-800 dark:text-gray-300 overflow-auto">
              <code>{codeString}</code>
            </pre>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold flex items-center justify-center gap-2 rounded-lg transition-colors hover:opacity-90 align-middle active:scale-95"
          >
            <Download size={18} />
            Download File
          </button>
        </div>
      </div>
    </div>
  );
}
