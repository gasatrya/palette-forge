declare module "culori" {
  export function oklch(color: any): any;
  export function formatHex(color: any): string;
  export function parseHex(hex: string): any;
  export function interpolate(colors: any[], mode?: string): any;
  export function clampChroma(color: any, mode: string): any;
  export function wcagContrast(colorBase: any, colorOther: any): number;
}
