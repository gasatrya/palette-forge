import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Palette {
  id: string; // The kebab case name
  colors: Record<string, string>; // e.g. "50": "#f9fde8", etc.
  createdAt: number;
}

interface PaletteState {
  palettes: Palette[];
  addPalette: (palette: Palette) => void;
  updatePalette: (id: string, newPalette: Palette) => void;
  deletePalette: (id: string) => void;
  importLibrary: (palettes: Palette[]) => void;
  clearLibrary: () => void;
}

export const usePaletteStore = create<PaletteState>()(
  persist(
    (set) => ({
      palettes: [],
      addPalette: (palette) =>
        set((state) => ({
          palettes: [...state.palettes.filter((p) => p.id !== palette.id), palette],
        })),
      updatePalette: (id, newPalette) =>
        set((state) => ({
          palettes: state.palettes.map((p) => (p.id === id ? newPalette : p)),
        })),
      deletePalette: (id) =>
        set((state) => ({
          palettes: state.palettes.filter((p) => p.id !== id),
        })),
      importLibrary: (newPalettes) =>
        set((state) => {
          const merged = [...state.palettes];
          for (const newP of newPalettes) {
            const existingIdx = merged.findIndex((p) => p.id === newP.id);
            if (existingIdx >= 0) {
              merged[existingIdx] = newP;
            } else {
              merged.push(newP);
            }
          }
          return { palettes: merged };
        }),
      clearLibrary: () => set({ palettes: [] }),
    }),
    {
      name: "palette-forge-library",
    },
  ),
);
