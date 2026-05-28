import { oklch, formatHex, parseHex, clampChroma } from "culori";

export const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// Approximation of standard Tailwind OKLCH lightness stops
const TARGET_LIGHTNESS: Record<number, number> = {
  50: 0.98,
  100: 0.95,
  200: 0.88,
  300: 0.8,
  400: 0.7,
  500: 0.6,
  600: 0.5,
  700: 0.4,
  800: 0.3,
  900: 0.2,
  950: 0.13,
};

export interface GenerateConfig {
  hueShift: number; // -180 to 180 (degrees per side)
  chromaFalloff: number; // 0 to 1
  lightnessCurve: number; // -0.05 to 0.05
}

/**
 * Generate a standard 11-stop standard palette around a hex color.
 */
export function generateScaleFromHex(
  hex: string,
  config: GenerateConfig = { hueShift: 0, chromaFalloff: 0.2, lightnessCurve: 0 },
): Record<string, string> {
  const parsed = parseHex(hex);
  const colorOkLch = oklch(parsed);
  if (!colorOkLch) return {};

  const l = colorOkLch.l;
  const c = colorOkLch.c || 0;
  const h = colorOkLch.h || 0;

  // Find the closest stop based on lightness
  let closestStop = 500;
  let minDiff = Infinity;
  for (const stop of STOPS) {
    const diff = Math.abs(TARGET_LIGHTNESS[stop] - l);
    if (diff < minDiff) {
      minDiff = diff;
      closestStop = stop;
    }
  }

  const result: Record<string, string> = {};
  const stopIndex = STOPS.indexOf(closestStop);

  for (let i = 0; i < STOPS.length; i++) {
    const stop = STOPS[i];

    if (stop === closestStop) {
      // Force exact match for the closest stop so the user's color is exactly in the scale
      result[stop.toString()] = formatHex(colorOkLch)!;
      continue;
    }

    // Relative position from the closest stop (e.g. -5 to +5)
    // We normalize this to [-1, 1] across the entire range
    const posRelative = (i - stopIndex) / (STOPS.length - 1);

    // Lightness curve
    const targetL = TARGET_LIGHTNESS[stop] + posRelative * config.lightnessCurve;

    // Hue shift curve
    const hueShiftAmount = posRelative * config.hueShift;
    let targetH = h + hueShiftAmount;
    if (targetH > 360) targetH -= 360;
    if (targetH < 0) targetH += 360;

    // Chroma falloff at the ends (lighter / darker)
    // Distance from the center max saturation (usually around 500 is max)
    const distFromCenter = Math.abs(500 - stop) / 450;
    const targetC = c * (1 - distFromCenter * config.chromaFalloff);

    const finalColor = { mode: "oklch" as const, l: targetL, c: Math.max(0, targetC), h: targetH };

    // Clamp to RGB gamut, then format hex
    const clamped = clampChroma(finalColor, "oklch");
    result[stop.toString()] = formatHex(clamped)!;
  }

  return result;
}

export function guessPaletteName(hex: string): string {
  const c = oklch(parseHex(hex));
  if (!c || (c.c ?? 0) < 0.02) return "slate";

  const h = c.h || 0;
  if (h >= 0 && h < 30) return "rose";
  if (h >= 30 && h < 60) return "orange";
  if (h >= 60 && h < 90) return "yellow";
  if (h >= 90 && h < 130) return "lime";
  if (h >= 130 && h < 170) return "green";
  if (h >= 170 && h < 210) return "teal";
  if (h >= 210 && h < 260) return "blue";
  if (h >= 260 && h < 300) return "indigo";
  if (h >= 300 && h < 340) return "fuchsia";
  return "pink";
}

/** Parses uicolors URL */
export function extractHexFromUiColorsUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const color = u.searchParams.get("color");
    if (color && /^[0-9A-Fa-f]{6}$/.test(color)) return "#" + color;
  } catch {
    // If it's not a full URL but maybe `?color=...`
    const match = url.match(/\?color=([0-9A-Fa-f]{6})/);
    if (match) return "#" + match[1];
  }
  return null;
}

/** Parses raw JS/JSON structure text to extract palettes */
export function parseTailwindConfigSnippet(text: string): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};

  try {
    // Attempt standard JSON first
    const json: unknown = JSON.parse(text);
    if (typeof json === "object" && json !== null) {
      const parsed = json as Record<string, unknown>;

      // if we pasted a single palette { "50": "...", "100": "..." }
      if (typeof parsed["50"] === "string") {
        result["imported-palette"] = parsed as Record<string, string>;
        return result;
      }

      // if we pasted a full library { "blue": { "50": "..." } }
      for (const [key, val] of Object.entries(parsed)) {
        if (typeof val === "object" && val !== null && "50" in val) {
          result[key] = val as Record<string, string>;
        }
      }
      if (Object.keys(result).length > 0) return result;
    }
  } catch {
    // Proceed to Regex matching for JS objects
  }

  // Very naive JS Object string parser
  // Matches structured looking like: brand: { '50': '#fff', ... }
  const paletteRegex = /(['"]?[\w-]+['"]?)\s*:\s*\{([^}]+)\}/g;
  let match;

  // Try to find grouped blocks
  while ((match = paletteRegex.exec(text)) !== null) {
    const name = match[1].replace(/['"]/g, "");
    const block = match[2];

    const colors: Record<string, string> = {};
    const colorRegex = /(['"]?\d+['"]?)\s*:\s*['"](#[0-9A-Fa-f]{3,8})['"]/g;
    let colorMatch;
    while ((colorMatch = colorRegex.exec(block)) !== null) {
      const stop = colorMatch[1].replace(/['"]/g, "");
      const hex = colorMatch[2];
      colors[stop] = hex;
    }

    if (Object.keys(colors).length >= 5) {
      result[name] = colors;
    }
  }

  return result;
}
