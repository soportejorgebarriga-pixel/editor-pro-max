import React, {useEffect, useState} from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  ANTON,
  Balance,
  Bars,
  BlackScreen,
  C,
  CheckList,
  ConnectDots,
  Credit,
  DMSANS,
  EASE,
  FPS,
  Flag,
  GoldWord,
  Glass,
  InBand,
  KineticTitle,
  NumbersCard,
  PhoneNotif,
  Reveal,
  SplitCompare,
  GreenBar,
  prog,
} from "./brand";
import {
  FACE_J,
  FACE_STEP,
  FACE_V,
  HOOK_SUBS,
  HOOK_SRC,
  MAIN_SRC,
  MAIN_SUBS,
  Sub,
} from "./data";

// ── Línea de tiempo ─────────────────────────────────────────────────────────
// Gancho (frase de Vero movida al inicio) → destello → entrevista completa con
// sus pausas naturales → tarjeta de cierre.
export const HOOK_F = Math.round((HOOK_SRC[1] - HOOK_SRC[0]) * FPS);
export const MAIN_F = Math.round((MAIN_SRC[1] - MAIN_SRC[0]) * FPS);
export const END_F = 96;
export const TRIBU_DURATION = HOOK_F + MAIN_F + END_F;

/** Segundo del video original (tramo principal) → frame de salida. */
const m = (src: number) => HOOK_F + Math.round((src - MAIN_SRC[0]) * FPS);
/** Segundo del video original (tramo del gancho) → frame de salida. */
const h = (src: number) => Math.round((src - HOOK_SRC[0]) * FPS);

const VIDEO = staticFile("tribu/video_hd.mp4");
const VOICE = staticFile("tribu/voz.wav");
const W = 1080;
const H = 1920;

// ── Cámara virtual: encuadres que siguen las caras ──────────────────────────
type Mode = "WIDE" | "MED" | "CJ" | "CV" | "GA" | "GJ" | "GV" | "COVER";
export type Shot = {at: number; mode: Mode; punch?: number};

const MODES: Record<Mode, {z: number; who: "J" | "V" | "both"; sx: number; sy: number}> = {
  WIDE: {z: 1.0, who: "both", sx: -1, sy: -1},
  MED: {z: 1.42, who: "both", sx: 520, sy: 650},
  CJ: {z: 1.75, who: "J", sx: 520, sy: 610},
  CV: {z: 1.75, who: "V", sx: 520, sy: 610},
  // Encuadres con la cara abajo para dejar libre la banda de rótulos (250–640 px)
  GA: {z: 1.22, who: "both", sx: 520, sy: 900},
  GJ: {z: 1.5, who: "J", sx: 500, sy: 920},
  GV: {z: 1.5, who: "V", sx: 500, sy: 920},
  COVER: {z: 1.6, who: "both", sx: 540, sy: 1010},
};

const face = (arr: number[][], t: number) => {
  const i = Math.max(0, Math.min(arr.length - 1.001, t / FACE_STEP));
  const a = arr[Math.floor(i)];
  const b = arr[Math.min(arr.length - 1, Math.floor(i) + 1)];
  const k = i - Math.floor(i);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
};

export const Camera: React.FC<{
  shots: Shot[];
  srcStart: number;
  offset: number;
  children: React.ReactNode;
}> = ({shots, srcStart, offset, children}) => {
  const local = useCurrentFrame();
  const g = local + offset; // frame global
  const t = srcStart + local / FPS;
  let idx = 0;
  for (let i = 0; i < shots.length; i++) if (shots[i].at <= g) idx = i;
  const shot = shots[idx];
  const next = shots[idx + 1]?.at ?? shot.at + 90;
  const p = Math.min(1, (g - shot.at) / Math.max(1, next - shot.at));
  const cfg = MODES[shot.mode];
  const J = face(FACE_J, t);
  const V = face(FACE_V, t);
  const [fx, fy] =
    cfg.who === "J" ? J : cfg.who === "V" ? V : [(J[0] + V[0]) / 2, (J[1] + V[1]) / 2];
  // Zoom lento (+5 %) en cada plano y zoom de golpe (+22 % en 4 frames)
  let z = cfg.z * (1 + (shot.mode === "WIDE" ? 0.04 : 0.05) * p);
  let blur = 0;
  if (shot.punch !== undefined && g >= shot.punch) {
    const k = interpolate(g, [shot.punch, shot.punch + 4], [0, 1], {
      extrapolateRight: "clamp",
      easing: EASE,
    });
    z *= 1 + 0.22 * k;
    blur = (1 - k) * 7 * (k > 0 ? 1 : 0);
  }
  const sx = cfg.sx < 0 ? fx : cfg.sx;
  const sy = cfg.sy < 0 ? fy : cfg.sy;
  let tx = sx - fx * z;
  let ty = sy - fy * z;
  tx = Math.min(0, Math.max(W - W * z, tx));
  ty = Math.min(0, Math.max(H - H * z, ty));
  return (
    <AbsoluteFill style={{overflow: "hidden", background: "#000"}}>
      <AbsoluteFill
        style={{
          transformOrigin: "0 0",
          transform: `translate(${tx}px, ${ty}px) scale(${z})`,
          filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Plan de encuadres (tiempos del video original). Nunca dos iguales seguidos.
const HOOK_SHOTS: Shot[] = [{at: 0, mode: "GV", punch: h(75.9)}];
const MAIN_PLAN: [number, Mode, number?][] = [
  [4.86, "WIDE"],
  [7.82, "CV"],
  [10.08, "MED"],
  [12.34, "CV"],
  [14.08, "MED"],
  [15.38, "GA"],
  [20.08, "CJ"],
  [22.3, "MED"],
  [24.0, "GA"],
  [26.9, "CV"],
  [29.3, "GV"],
  [31.86, "GJ"],
  [34.0, "GV"],
  [36.86, "CV"],
  [39.32, "MED"],
  [41.5, "GV", 43.78],
  [45.06, "WIDE"],
  [47.22, "GV"],
  [49.66, "GJ"],
  [51.98, "CJ"],
  [54.86, "MED"],
  [57.62, "CJ"],
  [60.3, "CV"],
  [62.0, "GV"],
  [65.24, "GJ"],
  [68.42, "GV"],
  [70.38, "MED"],
  [72.4, "CV", 75.9],
  [76.54, "MED"],
  [78.72, "GV"],
  [81.54, "GJ"],
  [84.34, "CJ"],
  [87.0, "GA"],
  [89.2, "GJ"],
  [91.0, "CV"],
  [93.12, "MED"],
  [95.22, "CV"],
  [97.56, "CJ"],
  [99.9, "GA"],
  [101.82, "GJ"],
  [103.4, "CJ"],
  [104.88, "CV"],
  [107.06, "MED"],
  [109.2, "GV"],
  [112.38, "GJ"],
  [114.86, "GV"],
  [117.68, "CV"],
  [118.6, "GV"],
  [120.66, "GJ"],
  [123.58, "GV"],
  [126.06, "GJ"],
  [128.64, "GV"],
  [131.32, "GJ"],
  [132.8, "GV"],
  [135.08, "GJ"],
  [137.84, "GV", 139.1],
];
const MAIN_SHOTS: Shot[] = MAIN_PLAN.map(([s, mode, punch]) => ({
  at: m(s),
  mode,
  punch: punch === undefined ? undefined : m(punch),
}));

// ── Subtítulos: una línea, una palabra clave en dorado ──────────────────────
const Subtitles: React.FC<{
  subs: Sub[];
  toFrame: (s: number) => number;
  hidden: [number, number][];
  noGold: [number, number][];
}> = ({subs, toFrame, hidden, noGold}) => {
  const frame = useCurrentFrame();
  if (hidden.some(([a, b]) => frame >= a && frame < b)) return null;
  const cur = subs.find((s) => frame >= toFrame(s.s) && frame < toFrame(s.e));
  if (!cur) return null;
  const st = toFrame(cur.s);
  const p = prog(frame, st, 5);
  // Un solo dorado por pantalla: si hay un título con dorado, la clave queda en blanco
  const gold = !noGold.some(([a, b]) => frame >= a && frame < b);
  return (
    <div
      style={{
        position: "absolute",
        left: 480 - 400,
        width: 800,
        top: 1250,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "rgba(14,42,59,0.84)",
          borderRadius: 16,
          padding: "8px 24px 10px",
          whiteSpace: "nowrap",
          maxWidth: 800,
          opacity: interpolate(frame, [st, st + 3], [0, 1], {extrapolateRight: "clamp"}),
          transform: `translateY(${(1 - p) * 16}px) scale(${0.94 + 0.06 * p})`,
          display: "flex",
          alignItems: "baseline",
          gap: 16,
        }}
      >
        {cur.words.map((w, i) =>
          i === cur.kw ? (
            <span
              key={i}
              style={{fontFamily: ANTON, fontSize: 82, lineHeight: 1.05, textTransform: "uppercase", letterSpacing: 0.5}}
            >
              <GoldWord at={gold ? toFrame(w.s) : 1e9}>{w.t.replace(/[.,]$/, "")}</GoldWord>
              <span style={{color: C.white}}>{/[.,]$/.test(w.t) ? w.t.slice(-1) : ""}</span>
            </span>
          ) : (
            <span key={i} style={{fontFamily: DMSANS, fontWeight: 700, fontSize: 66, color: C.white, lineHeight: 1.05}}>
              {w.t}
            </span>
          ),
        )}
      </div>
    </div>
  );
};

// ── Efectos de sonido (siempre por debajo de la voz) ────────────────────────
type Sfx = [number, "pop" | "whoosh" | "boom" | "tick" | "check" | "flash", number?];
const SFX: Sfx[] = [
  [2, "boom", 0.35],
  [3, "pop"],
  [h(73.0), "pop"],
  [h(74.98), "whoosh", 0.25],
  [h(75.58), "pop"],
  [h(75.9), "boom", 0.4],
  [HOOK_F - 6, "flash", 0.35],
  [m(8.4), "pop"],
  [m(10.1), "whoosh", 0.18],
  [m(15.5), "pop"],
  [m(24.0), "pop"],
  [m(25.28), "pop"],
  [m(29.4), "whoosh", 0.18],
  [m(30.4), "check"],
  [m(32.9), "pop"],
  [m(42.38), "pop"],
  [m(43.38), "pop"],
  [m(43.78), "boom", 0.38],
  [m(47.3), "whoosh", 0.18],
  [m(47.74), "tick"],
  [m(53.1), "boom", 0.3],
  [m(54.4), "pop"],
  [m(62.0), "pop"],
  [m(64.7), "check"],
  [m(67.08), "check"],
  [m(69.28), "check"],
  [m(72.4), "whoosh", 0.15],
  [m(75.9), "boom", 0.38],
  [m(79.3), "whoosh", 0.18],
  [m(81.0), "pop"],
  [m(83.1), "check"],
  [m(87.04), "pop"],
  [m(88.18), "pop"],
  [m(88.92), "pop"],
  [m(89.4), "tick"],
  [m(89.6), "tick"],
  [m(89.8), "tick"],
  [m(90.1), "whoosh", 0.18],
  [m(95.22), "boom", 0.3],
  [m(97.0), "pop"],
  [m(99.95), "pop"],
  [m(109.72), "pop"],
  [m(114.28), "pop"],
  [m(117.2), "pop"],
  [m(118.6), "whoosh", 0.15],
  [m(120.66), "check"],
  [m(123.3), "check"],
  [m(127.48), "check"],
  [m(129.56), "check"],
  [m(132.9), "whoosh", 0.15],
  [m(134.08), "tick"],
  [m(135.3), "pop"],
  [m(137.9), "pop"],
  [m(139.1), "boom", 0.4],
  [HOOK_F + MAIN_F, "whoosh", 0.25],
  [HOOK_F + MAIN_F + 14, "pop"],
  [HOOK_F + MAIN_F + 26, "pop"],
];
const SFX_VOL: Record<Sfx[1], number> = {
  pop: 0.22,
  whoosh: 0.2,
  boom: 0.32,
  tick: 0.18,
  check: 0.2,
  flash: 0.3,
};

// ── Fuentes de marca ────────────────────────────────────────────────────────
export const useBrandFonts = () => {
  const [handle] = useState(() => delayRender("fuentes"));
  useEffect(() => {
    const faces = [
      new FontFace("Anton", `url(${staticFile("fonts/Anton.ttf")})`),
      new FontFace("DM Sans", `url(${staticFile("fonts/DMSans-Bold.ttf")})`, {weight: "700"}),
      new FontFace("DM Sans", `url(${staticFile("fonts/DMSans-Medium.ttf")})`, {weight: "500"}),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
};

// ── Gancho: frase contraintuitiva ───────────────────────────────────────────
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const strikeAt = h(74.98);
  const strike = prog(frame, strikeAt, 7);
  const oldOut = strikeAt + 9;
  const showOld = frame < oldOut + 10;
  const l1 = h(72.06) + 3;
  return (
    <>
      {showOld && (
        <div style={{position: "absolute", left: 80, width: 800, top: 270, display: "flex", flexDirection: "column", alignItems: "center"}}>
          <div style={{position: "relative"}}>
            {[
              {t: "LA MEDICINA", at: l1},
              {t: "ES ALTRUISMO", at: h(73.92)},
            ].map((l, i) => (
              <Reveal key={i} at={l.at} out={oldOut}>
                <div style={{fontFamily: ANTON, fontSize: 128, lineHeight: 1.08, color: C.white, textAlign: "center", whiteSpace: "nowrap", textShadow: "0 6px 24px rgba(0,0,0,0.45)"}}>
                  {l.t}
                </div>
              </Reveal>
            ))}
            <div
              style={{
                position: "absolute",
                left: -20,
                top: "50%",
                height: 14,
                width: `${(frame < oldOut ? strike : 1 - prog(frame, oldOut, 8)) * 108}%`,
                background: C.green,
                borderRadius: 7,
                transform: "rotate(-8deg)",
                boxShadow: `0 0 18px ${C.green}`,
              }}
            />
          </div>
        </div>
      )}
      {frame >= oldOut + 2 && (
        <KineticTitle
          start={oldOut + 2}
          end={HOOK_F + 2}
          fontSize={128}
          lines={[
            {text: "LOS MÉDICOS", at: oldOut + 2},
            {
              text: (
                <>
                  TAMBIÉN <GoldWord at={h(75.9)}>COMEN</GoldWord>
                </>
              ),
              at: h(75.58),
            },
          ]}
        />
      )}
    </>
  );
};

// ── Tarjeta de cierre ───────────────────────────────────────────────────────
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const pill = prog(frame, 22, 10);
  const arrow = prog(frame, 30, 12);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: "blur(22px) saturate(1.1)", transform: "scale(1.12)"}}>
        <OffthreadVideo src={VIDEO} muted trimBefore={Math.round(16.0 * FPS)} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: "rgba(14,42,59,0.74)"}} />
      <div style={{position: "absolute", left: 80, width: 800, top: 520, display: "flex", flexDirection: "column", alignItems: "center"}}>
        {[
          {t: "¿TU CONSULTORIO", at: 4},
          {t: <>YA ES UN <GoldWord at={14}>NEGOCIO</GoldWord></>, at: 9},
          {t: "O UN PASATIEMPO CARO?", at: 14},
        ].map((l, i) => (
          <Reveal key={i} at={l.at}>
            <div style={{fontFamily: ANTON, fontSize: 92, lineHeight: 1.12, color: C.white, textAlign: "center", whiteSpace: "nowrap"}}>
              {l.t}
            </div>
          </Reveal>
        ))}
        <GreenBar at={18} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 250,
          top: 1150,
          opacity: pill,
          transform: `scale(${0.85 + 0.15 * pill})`,
          background: C.green,
          borderRadius: 60,
          padding: "20px 40px",
          fontFamily: DMSANS,
          fontWeight: 700,
          fontSize: 48,
          color: C.white,
          boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
        }}
      >
        Coméntalo aquí
      </div>
      <svg width={260} height={220} style={{position: "absolute", left: 620, top: 1170}} viewBox="0 0 260 220">
        <path
          d="M 20 40 Q 170 20 240 170"
          fill="none"
          stroke={C.white}
          strokeWidth={9}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrow}
        />
        <path
          d="M 205 150 L 242 178 L 252 132"
          fill="none"
          stroke={C.white}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={arrow > 0.92 ? 1 : 0}
        />
      </svg>
    </AbsoluteFill>
  );
};

// ── Destello de luz (gancho → entrevista) ───────────────────────────────────
const FlashAt: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - 3, at, at + 7], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: "#fffaf0", opacity: o}} />;
};

// ── Composición ─────────────────────────────────────────────────────────────
export const TribuFinanciera: React.FC = () => {
  useBrandFonts();
  const black1: [number, number] = [m(53.1), m(54.86)];
  const black2: [number, number] = [m(95.22), m(97.56)];
  const endStart = HOOK_F + MAIN_F;
  // Tramos donde un título ya lleva la palabra en dorado
  const goldTitles: [number, number][] = [
    [h(75.85), HOOK_F + 2],
    [m(16.5), m(20.0)],
    [m(25.2), m(26.85)],
    [m(43.7), m(45.0)],
    [m(100.2), m(103.4)],
    [m(139.0), endStart],
  ];
  const voiceFade = (len: number) => (f: number) =>
    interpolate(f, [0, 2, len - 3, len], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{background: "#000"}}>
      {/* Gancho */}
      <Sequence durationInFrames={HOOK_F} name="Gancho">
        <Camera shots={HOOK_SHOTS} srcStart={HOOK_SRC[0]} offset={0}>
          <OffthreadVideo src={VIDEO} muted trimBefore={Math.round(HOOK_SRC[0] * FPS)} />
        </Camera>
        <Audio src={VOICE} trimBefore={Math.round(HOOK_SRC[0] * FPS)} volume={voiceFade(HOOK_F)} />
      </Sequence>

      {/* Entrevista con pausas naturales */}
      <Sequence from={HOOK_F} durationInFrames={MAIN_F} name="Entrevista">
        <Camera shots={MAIN_SHOTS} srcStart={MAIN_SRC[0]} offset={HOOK_F}>
          <OffthreadVideo src={VIDEO} muted trimBefore={Math.round(MAIN_SRC[0] * FPS)} />
        </Camera>
        <Audio src={VOICE} trimBefore={Math.round(MAIN_SRC[0] * FPS)} volume={voiceFade(MAIN_F)} />
      </Sequence>

      {/* Gráficos (uno a la vez, en la banda segura o sobre la ropa) */}
      <Hook />
      <Flag start={m(8.4)} end={m(9.95)} src={staticFile("tribu/ec.svg")} label="Ecuador" />
      <Credit start={m(10.1)} end={m(15.0)} name="Vero" role="Nefróloga · Centro Médico de Especialidades" />
      <InBand start={m(15.5)} end={m(20.0)}>
        <Glass style={{display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 50px"}}>
          <Reveal at={m(15.5)}>
            <div style={{fontFamily: DMSANS, fontWeight: 700, fontSize: 40, letterSpacing: 4, color: C.white, opacity: 0.85}}>ALUMNA DE</div>
          </Reveal>
          <Reveal at={m(16.36)}>
            <div style={{fontFamily: ANTON, fontSize: 110, color: C.white, lineHeight: 1.05, whiteSpace: "nowrap"}}>
              TRIBU <GoldWord at={m(16.58)}>FINANCIERA</GoldWord>
            </div>
          </Reveal>
          <GreenBar at={m(16.8)} />
        </Glass>
      </InBand>
      <KineticTitle
        start={m(24.0)}
        end={m(26.85)}
        lines={[
          {text: "¿POR QUÉ NO SE", at: m(24.0)},
          {text: <GoldWord at={m(25.28)}>CAPACITAN?</GoldWord>, at: m(25.1)},
        ]}
      />
      <SplitCompare start={m(29.4)} end={m(36.3)} leftAt={m(30.3)} rightAt={m(32.78)} />
      <KineticTitle
        start={m(41.6)}
        end={m(45.0)}
        fontSize={104}
        lines={[
          {text: "TU CONSULTORIO", at: m(42.2)},
          {text: <>YA ES UN <GoldWord at={m(43.78)}>NEGOCIO</GoldWord></>, at: m(43.3)},
        ]}
      />
      <Balance start={m(47.3)} end={m(51.95)} tiltAt={m(47.74)} />
      <CheckList
        start={m(62.0)}
        end={m(70.3)}
        title="Lo que faltaba"
        items={[
          {text: "Estructura", at: m(64.7)},
          {text: "Finanzas", at: m(67.08)},
          {text: "Ventas", at: m(69.28)},
        ]}
      />
      <PhoneNotif start={m(79.3)} end={m(84.25)} notifAt={m(81.0)} okAt={m(83.1)} />
      <NumbersCard
        start={m(87.0)}
        end={m(90.95)}
        chips={[
          {text: "DOCTORES", at: m(87.52)},
          {text: "MÉDICOS", at: m(88.18)},
          {text: "ODONTÓLOGOS", at: m(88.92)},
        ]}
        numbersAt={m(89.36)}
        strikeAt={m(90.1)}
      />
      <KineticTitle
        start={m(99.9)}
        end={m(103.4)}
        fontSize={140}
        lines={[{text: <>EL <GoldWord at={m(100.32)}>CONSEJO</GoldWord></>, at: m(99.95)}]}
      />
      <ConnectDots
        start={m(109.3)}
        end={m(117.7)}
        nodes={[
          {label: "SERVICIO", at: m(109.72), icon: "cross"},
          {label: "CONSULTORIO", at: m(114.28), icon: "clinic"},
          {label: "NEGOCIO", at: m(117.04), icon: "money"},
        ]}
      />
      <CheckList
        start={m(118.6)}
        end={m(132.75)}
        title="Capacítate en"
        fontSize={54}
        rowH={68}
        items={[
          {text: "Finanzas", at: m(120.66)},
          {text: "Equipo de trabajo", at: m(123.3)},
          {text: "Ventas", at: m(127.48)},
          {text: "Sistemas", at: m(129.56)},
        ]}
      />
      <Bars start={m(132.85)} end={m(137.8)} growAt={m(134.08)} arrowAt={m(135.3)} />
      <KineticTitle
        start={m(137.9)}
        end={endStart}
        fontSize={132}
        lines={[
          {text: "CAPACÍTATE", at: m(138.38)},
          {text: <GoldWord at={m(139.1)}>SIEMPRE</GoldWord>, at: m(138.9)},
        ]}
      />

      {/* Pantallas negras con una sola frase */}
      <BlackScreen
        start={black1[0]}
        end={black1[1]}
        lines={[
          {text: "¿CUÁL FUE", at: m(53.1)},
          {text: <>EL <GoldWord at={m(54.4)}>PROBLEMA?</GoldWord></>, at: m(54.1)},
        ]}
        fontSize={128}
      />
      <BlackScreen
        start={black2[0]}
        end={black2[1]}
        fontSize={92}
        lines={[
          {text: "«ME HICE MÉDICO", at: m(95.4)},
          {text: "PORQUE NO ME", at: m(96.02)},
          {text: <>GUSTAN LOS <GoldWord at={m(97.0)}>NÚMEROS»</GoldWord></>, at: m(96.6)},
        ]}
      />

      {/* Subtítulos */}
      <Subtitles subs={HOOK_SUBS} toFrame={(s) => Math.max(0, h(s))} hidden={[[HOOK_F, 1e9]]} noGold={goldTitles} />
      <Subtitles
        subs={MAIN_SUBS}
        toFrame={(s) => Math.max(HOOK_F, m(s))}
        hidden={[[0, HOOK_F], black1, black2, [endStart, 1e9]]}
        noGold={goldTitles}
      />

      <FlashAt at={HOOK_F} />

      {/* Cierre */}
      <Sequence from={endStart} durationInFrames={END_F} name="Cierre">
        <EndCard />
      </Sequence>

      {/* Sonido */}
      {SFX.map(([at, kind, vol], i) => (
        <Sequence key={i} from={Math.max(0, at)} durationInFrames={30} name={`sfx-${kind}`}>
          <Audio src={staticFile(`tribu/sfx/${kind}.wav`)} volume={vol ?? SFX_VOL[kind]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
