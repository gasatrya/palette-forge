"use client";

import React, { useMemo, useState } from "react";
import { generateScaleFromHex, guessPaletteName, GenerateConfig, STOPS } from "../lib/colors";
import { MockUI } from "./MockUI";
import { usePaletteStore, Palette } from "../store/store";
import toast from "react-hot-toast";
import { Save } from "lucide-react";

interface GeneratorProps {
  initialHex?: string;
  onGoToLibrary?: () => void;
}

export function Generator({ initialHex = "#3b82f6", onGoToLibrary }: GeneratorProps) {
  const [baseHex, setBaseHex] = useState(initialHex);
  const [config, setConfig] = useState<GenerateConfig>({
    hueShift: 0,
    chromaFalloff: 0.2,
    lightnessCurve: 0,
  });
  const [paletteName, setPaletteName] = useState(() => guessPaletteName(initialHex));

  const palette = useMemo(() => {
    if (/^#[0-9A-F]{6}$/i.test(baseHex)) {
      return generateScaleFromHex(baseHex, config);
    }

    return {};
  }, [baseHex, config]);

  const addPalette = usePaletteStore((state) => state.addPalette);
  const palettes = usePaletteStore((state) => state.palettes);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`Copied ${color}`);
  };

  const handleSave = () => {
    if (!paletteName.trim()) {
      toast.error("Please enter a palette name");
      return;
    }

    // Check dupe
    let finalName = paletteName.trim().toLowerCase().replace(/\s+/g, "-");
    let counter = 1;
    const baseName = finalName;
    while (palettes.some((p) => p.id === finalName)) {
      counter++;
      finalName = `${baseName}-${counter}`;
    }

    const newPal: Palette = {
      id: finalName,
      colors: palette,
      createdAt: Date.now(),
    };

    addPalette(newPal);
    toast.success(`Saved as ${finalName}`);
    if (onGoToLibrary) {
      onGoToLibrary();
    }
  };

  return (
    <div className="flex flex-1 w-full overflow-hidden">
      {/* Sidebar Controls */}
      <aside className="w-80 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col gap-8 shrink-0 overflow-y-auto">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
            Base Color
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={baseHex}
              onChange={(e) => setBaseHex(e.target.value)}
              className="flex-1 font-mono text-sm border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white uppercase"
            />
            <label className="relative w-10 h-10 rounded border border-gray-200 dark:border-zinc-700 cursor-pointer overflow-hidden block">
              <input
                type="color"
                value={baseHex}
                onChange={(e) => setBaseHex(e.target.value)}
                className="absolute inset-[-10px] w-24 h-24 cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Lightness Curve
              </label>
              <span className="text-[10px] font-mono dark:text-zinc-400">
                {config.lightnessCurve.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min="-0.1"
              max="0.1"
              step="0.01"
              value={config.lightnessCurve}
              onChange={(e) => setConfig({ ...config, lightnessCurve: parseFloat(e.target.value) })}
              className="w-full accent-black dark:accent-white"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Hue Shift
              </label>
              <span className="text-[10px] font-mono dark:text-zinc-400">{config.hueShift}°</span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              step="1"
              value={config.hueShift}
              onChange={(e) => setConfig({ ...config, hueShift: parseFloat(e.target.value) })}
              className="w-full accent-black dark:accent-white"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Saturation Falloff
              </label>
              <span className="text-[10px] font-mono dark:text-zinc-400">
                {config.chromaFalloff}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.chromaFalloff}
              onChange={(e) => setConfig({ ...config, chromaFalloff: parseFloat(e.target.value) })}
              className="w-full accent-black dark:accent-white"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
            Palette Name
          </label>
          <input
            type="text"
            value={paletteName}
            onChange={(e) => setPaletteName(e.target.value)}
            className="w-full font-mono text-sm border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            placeholder="e.g. brand-primary"
          />
        </div>

        <div className="mt-auto pt-8">
          <button
            onClick={handleSave}
            className="w-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors uppercase tracking-widest"
          >
            <Save size={16} />
            Save to Library
          </button>
        </div>
      </aside>

      {/* Main Preview Area */}
      <section className="flex-1 p-8 overflow-y-auto bg-[#FAFAFA] dark:bg-zinc-950 flex flex-col gap-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-8 shadow-sm">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight dark:text-white">
                {paletteName || "Untitled Scale"}
              </h2>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                Generated using OKLCH smoothing
              </p>
            </div>
            {/* Can add additional actions here */}
          </div>

          <div className="grid grid-cols-11 gap-px bg-gray-200 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-800">
            {STOPS.map((stop) => {
              const hex = palette[stop] || "#ffffff";
              const isBase = stop === 500; // rough heuristic
              return (
                <div
                  key={stop}
                  className={`flex flex-col bg-white dark:bg-zinc-900 cursor-pointer group hover:bg-gray-50 transition-colors ${isBase ? "ring-2 ring-black dark:ring-white z-10" : ""}`}
                  onClick={() => handleCopy(hex)}
                  title={`Copy ${hex}`}
                >
                  <div
                    className="h-24 transition-opacity group-hover:opacity-90"
                    style={{ backgroundColor: hex }}
                  ></div>
                  <div className="p-3">
                    <div className="text-[10px] font-bold dark:text-white">{stop}</div>
                    <div className="text-[9px] font-mono text-gray-400 dark:text-zinc-500">
                      {hex.toUpperCase()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mock UI */}
        <MockUI palette={palette} />
      </section>
    </div>
  );
}
