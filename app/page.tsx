"use client";

import React, { useState, useEffect } from "react";
import { Generator } from "../components/Generator";
import { Library } from "../components/Library";
import { ImportModal } from "../components/ImportModal";
import { ExportModal } from "../components/ExportModal";
import { usePaletteStore, Palette } from "../store/store";
import {
  Download,
  Upload,
  Palette as PaletteIcon,
  Library as LibraryIcon,
  Moon,
  Sun,
} from "lucide-react";

export default function Page() {
  const [activeView, setActiveView] = useState<"generator" | "library">("generator");
  const [generatorHex, setGeneratorHex] = useState("#3b82f6");

  const [showImport, setShowImport] = useState(false);
  const [exportTarget, setExportTarget] = useState<Palette | "all" | null>(null);

  const [isDark, setIsDark] = useState(false);
  const palettes = usePaletteStore((state) => state.palettes);

  // Initialize dark mode from user preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = localStorage.getItem("theme");
      if (theme === "dark" || (!theme && isSystemDark)) {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const toggleDark = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleEditFromLibrary = (hex: string) => {
    setGeneratorHex(hex);
    setActiveView("generator");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-white dark:bg-black rotate-45"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase dark:text-white">
            Palette Forge <span className="text-gray-400 font-normal ml-1 text-xs">v1.2</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Nav Tabs */}
          <nav className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setActiveView("generator")}
              className={`px-4 py-1.5 text-xs font-semibold rounded ${activeView === "generator" ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
            >
              Generator
            </button>
            <button
              onClick={() => setActiveView("library")}
              className={`px-4 py-1.5 text-xs font-semibold rounded ${activeView === "library" ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
            >
              Library {palettes.length > 0 && `(${palettes.length})`}
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title="Import Palette"
            >
              <Upload size={20} />
            </button>
            <button
              onClick={() => setExportTarget("all")}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title="Export Library"
            >
              <Download size={20} />
            </button>
            <button
              onClick={toggleDark}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        {activeView === "generator" ? (
          <Generator initialHex={generatorHex} onGoToLibrary={() => setActiveView("library")} />
        ) : (
          <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA] dark:bg-zinc-950">
            <Library
              onEdit={handleEditFromLibrary}
              onExport={(palette) => setExportTarget(palette ? palette : "all")}
            />
          </div>
        )}
      </main>

      <footer className="px-8 py-2 bg-gray-900 border-t border-gray-800 text-gray-400 flex justify-between items-center text-[10px] uppercase tracking-widest shrink-0">
        <div className="flex gap-4 items-center">
          <span>Local Storage Active</span>
          <span className="text-gray-700">|</span>
          <span>{palettes.length} Palettes Stored</span>
        </div>
        <div className="flex gap-4">
          <span className="text-gray-100 hidden sm:block">v4-css-vars.css</span>
          <span className="text-gray-100 hidden sm:block">tailwind.config.js</span>
          <span className="text-gray-100">palette.json</span>
        </div>
      </footer>

      {/* Modals */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onGoToGenerator={(hex) => {
            setGeneratorHex(hex);
            setActiveView("generator");
          }}
        />
      )}

      {exportTarget && (
        <ExportModal
          singlePalette={exportTarget === "all" ? undefined : exportTarget}
          onClose={() => setExportTarget(null)}
        />
      )}
    </div>
  );
}
