declare module "culori" {
  export interface OklchColor {
    mode?: "oklch";
    l: number;
    c?: number;
    h?: number;
  }

  export type ColorInput = OklchColor | Record<string, unknown> | string | null | undefined;

  export function oklch(color: ColorInput): OklchColor | undefined;
  export function formatHex(color: ColorInput): string;
  export function parseHex(hex: string): ColorInput;
  export function interpolate(colors: ColorInput[], mode?: string): (value: number) => ColorInput;
  export function clampChroma(color: ColorInput, mode: string): ColorInput;
  export function wcagContrast(colorBase: ColorInput, colorOther: ColorInput): number;
}
