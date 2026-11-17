// Edit decision list for "Entrevista Pablo Cejas" (Jorge Barriga – Estilo 1).
// All "src" values are seconds in the raw interview (IMG_6822.MOV).

export const FPS = 30;
export const W = 1080;
export const H = 1920;

// ---- Brand (Estilo 1) ----
export const C = {
  green: "#1D9E75",
  navy: "#0E2A3B",
  gold: "#F2C14E",
  white: "#F7F4EE",
};

// ---- Segments (in playback order) ----
export type Segment = {
  id: "hook" | "main" | "breath2" | "closing" | "cta";
  srcStart: number;
  srcEnd: number;
  // "room" = mute the picture and play room tone (ambience) under it
  audio: "source" | "room" | "none";
};

export const SEGMENTS: Segment[] = [
  // Gancho: Jorge's question moved to frame 0
  {id: "hook", srcStart: 61.5, srcEnd: 66.25, audio: "source"},
  // The conversation flows uncut (natural pauses kept); starts at "Pablo, cuéntanos"
  {id: "main", srcStart: 5.3, srcEnd: 116.8, audio: "source"},
  // 2 s breath: Pablo listening, room tone under it
  {id: "breath2", srcStart: 117.05, srcEnd: 119.05, audio: "room"},
  // Closing (skip the "esa parte la podemos cortar" chatter)
  {id: "closing", srcStart: 135.4, srcEnd: 145.3, audio: "source"},
  // Comment card
  {id: "cta", srcStart: 143.4, srcEnd: 146.4, audio: "none"},
];

export const ROOM_TONE_SRC = 0.45; // quiet ambience at the head of the raw file

export type PlacedSegment = Segment & {from: number; dur: number};

export const PLACED: PlacedSegment[] = (() => {
  let f = 0;
  return SEGMENTS.map((s) => {
    const dur = Math.round((s.srcEnd - s.srcStart) * FPS);
    const p = {...s, from: f, dur};
    f += dur;
    return p;
  });
})();

export const TOTAL_FRAMES = PLACED.reduce((a, s) => a + s.dur, 0);

export const seg = (id: Segment["id"]) => PLACED.find((s) => s.id === id)!;

/** Output frame of a source time inside a given segment. */
export const srcToFrame = (id: Segment["id"], src: number) => {
  const s = seg(id);
  return s.from + Math.round((src - s.srcStart) * FPS);
};

/** Find the segment + source time shown at an output frame. */
export const frameToSrc = (frame: number) => {
  const s = PLACED.find((p) => frame >= p.from && frame < p.from + p.dur) ?? PLACED[PLACED.length - 1];
  return {seg: s, src: s.srcStart + (frame - s.from) / FPS};
};

// ---- Camera framings (simulated 2-camera coverage on the wide shot) ----
// focus point (fx,fy) in the 1080x1920 source maps to (tx,ty) on screen.
export type Framing = {s: number; fx: number; fy: number; tx: number; ty: number};
export const FRAMINGS = {
  wide: {s: 1.0, fx: 540, fy: 960, tx: 540, ty: 960},
  medium: {s: 1.25, fx: 575, fy: 560, tx: 540, ty: 540},
  pablo: {s: 1.6, fx: 400, fy: 580, tx: 540, ty: 560},
  jorge: {s: 1.6, fx: 745, fy: 545, tx: 540, ty: 560},
  // both faces high in frame so titles sit well below them
  duo: {s: 1.35, fx: 575, fy: 555, tx: 540, ty: 460},
} satisfies Record<string, Framing>;
export type FramingName = keyof typeof FRAMINGS;

export type Shot = {
  seg: Segment["id"];
  src: number; // shot starts at this src time (until next shot in same segment)
  f: FramingName;
  punch?: boolean; // +22% punch-in
  bw?: boolean; // black & white
};

export const SHOTS: Shot[] = [
  {seg: "hook", src: 61.5, f: "duo", punch: true},
  // main
  {seg: "main", src: 5.3, f: "medium"},
  {seg: "main", src: 8.38, f: "pablo"},
  {seg: "main", src: 13.2, f: "medium"},
  {seg: "main", src: 18.16, f: "pablo"},
  {seg: "main", src: 22.0, f: "wide"},
  {seg: "main", src: 26.0, f: "jorge"},
  {seg: "main", src: 29.6, f: "medium"},
  {seg: "main", src: 32.45, f: "pablo"},
  {seg: "main", src: 37.78, f: "wide"},
  {seg: "main", src: 43.57, f: "medium"},
  {seg: "main", src: 48.85, f: "pablo"},
  {seg: "main", src: 53.06, f: "medium"},
  {seg: "main", src: 56.8, f: "pablo"},
  {seg: "main", src: 60.42, f: "wide"},
  {seg: "main", src: 61.5, f: "jorge", punch: true},
  {seg: "main", src: 66.25, f: "medium"},
  {seg: "main", src: 68.74, f: "pablo", punch: true},
  {seg: "main", src: 72.66, f: "wide"},
  {seg: "main", src: 77.2, f: "medium"},
  {seg: "main", src: 81.3, f: "pablo"},
  {seg: "main", src: 86.74, f: "wide"},
  {seg: "main", src: 89.94, f: "pablo"},
  {seg: "main", src: 94.11, f: "medium"},
  {seg: "main", src: 97.43, f: "wide"},
  {seg: "main", src: 102.44, f: "pablo"},
  {seg: "main", src: 106.6, f: "medium"},
  {seg: "main", src: 110.0, f: "pablo", bw: true},
  {seg: "main", src: 113.75, f: "medium", bw: true},
  {seg: "breath2", src: 117.05, f: "pablo", bw: true},
  // closing
  {seg: "closing", src: 135.4, f: "jorge"},
  {seg: "closing", src: 139.8, f: "wide"},
];

// ---- Graphics (motion graphics), placed by src time inside a segment ----
export type Gfx =
  | {kind: "tag"; text: string}
  | {kind: "kinetic"; lines: {t: string; gold?: boolean}[]; size?: number}
  | {kind: "lowerThird"; name: string; role: string; ig?: string}
  | {kind: "location"}
  | {kind: "years"}
  | {kind: "icons"; at: number[]}
  | {kind: "definition"}
  | {kind: "split"; bajaAt: number; delegarAt: number}
  | {kind: "example"}
  | {kind: "phone"}
  | {kind: "genericSpecific"; specificAt: number}
  | {kind: "checklist"; at: number[]};

export type GfxCue = {seg: Segment["id"]; src: number; dur: number; zone: "top" | "low"; g: Gfx};

export const GFX: GfxCue[] = [
  // Hook – pregunta al dolor
  {
    seg: "hook", src: 61.55, dur: 4.65, zone: "low",
    g: {kind: "kinetic", size: 112, lines: [{t: "¿TRABAJAS TODO"}, {t: "EL DÍA Y NO"}, {t: "AVANZAS?", gold: true}]},
  },
  {seg: "main", src: 5.35, dur: 3.45, zone: "low", g: {kind: "lowerThird", name: "PABLO CEJAS", role: "CEO de Bermarys", ig: "@pablocejas.mkt"}},
  {seg: "main", src: 8.9, dur: 4.3, zone: "low", g: {kind: "location"}},
  {seg: "main", src: 13.3, dur: 5.1, zone: "low", g: {kind: "years"}},
  {seg: "main", src: 18.4, dur: 7.4, zone: "low", g: {kind: "icons", at: [20.5, 21.3, 22.0, 23.4]}},
  {
    seg: "main", src: 26.7, dur: 5.1, zone: "low",
    g: {kind: "kinetic", size: 104, lines: [{t: "¿QUÉ MERECE"}, {t: "TU TIEMPO?", gold: true}]},
  },
  {
    seg: "main", src: 33.8, dur: 4.0, zone: "low",
    g: {kind: "kinetic", size: 118, lines: [{t: "TAREAS DE ALTA"}, {t: "RENTABILIDAD", gold: true}]},
  },
  {seg: "main", src: 37.9, dur: 5.6, zone: "low", g: {kind: "definition"}},
  {seg: "main", src: 43.6, dur: 9.3, zone: "low", g: {kind: "split", bajaAt: 44.3, delegarAt: 51.74}},
  {seg: "main", src: 53.1, dur: 6.6, zone: "low", g: {kind: "example"}},
  {seg: "main", src: 61.5, dur: 4.7, zone: "top", g: {kind: "tag", text: "LA PREGUNTA CLAVE"}},
  {
    seg: "main", src: 68.74, dur: 3.9, zone: "low",
    g: {kind: "kinetic", size: 112, lines: [{t: "PLANIFICACIÓN"}, {t: "CONSCIENTE", gold: true}]},
  },
  {seg: "main", src: 77.3, dur: 7.6, zone: "low", g: {kind: "phone"}},
  {seg: "main", src: 86.8, dur: 5.6, zone: "low", g: {kind: "genericSpecific", specificAt: 89.94}},
  {seg: "main", src: 97.5, dur: 12.3, zone: "low", g: {kind: "checklist", at: [100.08, 102.6]}},
  {
    seg: "main", src: 110.1, dur: 6.6, zone: "low",
    g: {kind: "kinetic", size: 112, lines: [{t: "SIN PLAN,"}, {t: "ANDAS A LA"}, {t: "DERIVA", gold: true}]},
  },
  {
    seg: "closing", src: 136.3, dur: 3.3, zone: "low",
    g: {kind: "kinetic", size: 104, lines: [{t: "GANA MÁS DINERO"}, {t: "MANEJANDO TU"}, {t: "TIEMPO", gold: true}]},
  },
];

// White flashes (whoosh + flash), in output-frame positions
export const FLASHES: number[] = [seg("main").from, srcToFrame("main", 110.0), seg("closing").from];

export const CTA_QUESTION = ["¿QUÉ TAREA DE BAJA", "RENTABILIDAD VAS A", "DELEGAR ESTA SEMANA?"];
