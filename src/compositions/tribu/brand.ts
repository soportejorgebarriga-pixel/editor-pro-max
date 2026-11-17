export const BRAND = {
  navy: "#0B1D3A",
  navyGlass: "rgba(11, 29, 58, 0.88)",
  gold: "#E6BF8A",
  goldLight: "#F3D3A6",
  goldDeep: "#CEAB83",
  white: "#FFFFFF",
  font: "'Montserrat', sans-serif",
  cta: "TRIBU",
} as const;

export const FPS = 30;
export const msToFrames = (ms: number) => Math.round((ms / 1000) * FPS);
