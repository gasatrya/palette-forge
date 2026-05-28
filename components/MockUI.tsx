"use client";

import React from "react";
import { Palette } from "../store/store";

interface MockUIProps {
  palette: Record<string, string>;
}

export function MockUI({ palette }: MockUIProps) {
  // Convert palette into React CSS Properties so we can use arbitrary values in Tailwind classNames
  const styleVariables = Object.entries(palette).reduce(
    (acc, [stop, hex]) => {
      acc[`--c-${stop}`] = hex;
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <div
      style={styleVariables as React.CSSProperties}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col gap-4 transition-colors duration-300 w-full"
    >
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UI Preview</h3>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-[var(--c-50)] dark:bg-[var(--c-950)] rounded-lg p-6 border border-[var(--c-100)] dark:border-[var(--c-900)] min-h-[200px]">
        <button className="px-6 py-2 bg-[var(--c-500)] text-white dark:text-black rounded font-medium text-sm shadow-sm hover:opacity-90 transition-opacity">
          Click Action
        </button>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-[var(--c-400)] text-white dark:text-black text-[10px] font-bold rounded uppercase tracking-wide">
            Active
          </span>
          <span className="px-2 py-1 border border-[var(--c-500)] text-[var(--c-600)] dark:text-[var(--c-400)] text-[10px] font-bold rounded uppercase tracking-wide">
            Outline
          </span>
        </div>
      </div>
    </div>
  );
}
