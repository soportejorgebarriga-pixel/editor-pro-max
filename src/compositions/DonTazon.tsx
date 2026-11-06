import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  Easing,
} from "remotion";
import captions from "./dontazon-captions.json";

// ---------- Marca Don Tazón ----------
export const CORAL = "#E8503A";
export const SKY = "#2F9BD5";
export const WARM_WHITE = "#F7F4EE";
export const WARM_BLACK = "#1F1B1C";
const ANTON = "'Anton', sans-serif";
const DMSANS = "'DM Sans Bold', sans-serif";

export const FPS = 30;
export const VIDEO_FRAMES = 1018; // 33.933 s, igual que el video original
export const END_FRAMES = 150; // tarjeta de cierre, 5 s
export const TOTAL_FRAMES = VIDEO_FRAMES + END_FRAMES;

// ---------- Fuentes locales ----------
let fontsPromise: Promise<void> | null = null;
const loadFonts = () => {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      [
        new FontFace("Anton", `url(${staticFile("fonts/Anton-Regular.ttf")})`),
        new FontFace("DM Sans Bold", `url(${staticFile("fonts/DMSans-Bold.ttf")})`),
      ].map((f) => f.load().then((ff) => void document.fonts.add(ff))),
    ).then(() => undefined);
  }
  return fontsPromise;
};
const useFonts = () => {
  const [handle] = React.useState(() =>
    delayRender("Cargando Anton y DM Sans", {timeoutInMilliseconds: 120000}),
  );
  React.useEffect(() => {
    loadFonts()
      .then(() => continueRender(handle))
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const easeOut = Easing.out(Easing.cubic);

// ---------- Toldo (semicírculos coral / azul) ----------
const Toldo: React.FC<{width: number; diameter: number}> = ({width, diameter}) => {
  const n = Math.max(2, Math.round(width / diameter));
  const d = width / n;
  return (
    <svg width={width} height={d / 2} style={{display: "block"}}>
      {Array.from({length: n}).map((_, i) => (
        <path
          key={i}
          d={`M ${i * d} 0 A ${d / 2} ${d / 2} 0 0 0 ${(i + 1) * d} 0 Z`}
          fill={i % 2 === 0 ? CORAL : SKY}
        />
      ))}
    </svg>
  );
};

// ---------- Zooms (sin tocar cortes) ----------
// Cortes reales: 2.30 s, 5.733 s, 21.80 s, 30.20 s
const SLOW_ZOOMS: {from: number; to: number; ox: number; oy: number}[] = [
  {from: 0, to: 69, ox: 500, oy: 560}, // ella a cámara
  {from: 69, to: 172, ox: 560, oy: 660}, // ella a cámara
  {from: 906, to: VIDEO_FRAMES, ox: 620, oy: 580}, // cierre a cámara
];
const PUNCH_FRAME = Math.round(31.64 * FPS); // "Don Tazón"

const BaseVideo: React.FC = () => {
  const frame = useCurrentFrame();
  let scale = 1;
  let origin = "50% 50%";
  const z = SLOW_ZOOMS.find((s) => frame >= s.from && frame < s.to);
  if (z) {
    scale = interpolate(frame, [z.from, z.to - 1], [1, 1.05], clamp);
    origin = `${z.ox}px ${z.oy}px`;
  }
  if (frame >= PUNCH_FRAME) {
    scale *= interpolate(frame, [PUNCH_FRAME, PUNCH_FRAME + 4.2], [1, 1.16], {
      ...clamp,
      easing: easeOut,
    });
  }
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: origin}}>
      <OffthreadVideo
        src={staticFile("assets/base1080.mp4")}
        muted
        style={{width: 1080, height: 1920}}
      />
    </AbsoluteFill>
  );
};

// ---------- Gancho ----------
const HOOK_LINES: {text: string; accent?: string}[] = [
  {text: "¿QUÉ REGALAS"},
  {text: "A QUIEN LO"},
  {text: "TIENE ", accent: "TODO?"},
];
const HOOK_END = 2.1; // termina la pregunta
const HOOK_FADE = 0.2;

export const HookCard: React.FC<{
  top: number;
  centerX: number;
  fontSize: number;
  width: number;
  animate?: boolean;
}> = ({top, centerX, fontSize, width, animate = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cardOpacity = animate
    ? interpolate(t, [0, 0.12], [0, 1], clamp) *
      interpolate(t, [HOOK_END, HOOK_END + HOOK_FADE], [1, 0], clamp)
    : 1;
  if (cardOpacity <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: centerX - width / 2,
        width,
        borderRadius: 28,
        overflow: "hidden",
        background: "rgba(31,27,28,0.6)",
        opacity: cardOpacity,
      }}
    >
      <Toldo width={width} diameter={56} />
      <div style={{padding: "14px 0 26px", textAlign: "center"}}>
        {HOOK_LINES.map((l, i) => {
          const start = 0.04 + i * 0.06;
          const p = animate ? interpolate(t, [start, start + 0.18], [0, 1], {...clamp, easing: easeOut}) : 1;
          return (
            <div
              key={i}
              style={{
                fontFamily: ANTON,
                fontSize,
                lineHeight: 1.04,
                color: WARM_WHITE,
                opacity: p,
                transform: `translateY(${(1 - p) * 28}px)`,
                whiteSpace: "nowrap",
              }}
            >
              {l.text}
              {l.accent ? <span style={{color: CORAL}}>{l.accent}</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Subtítulos ----------
type Tok = {t: string; k: boolean; s: number; e: number};
type Phrase = {toks: Tok[]; start: number; end: number};
const PHRASES = captions as unknown as Phrase[];
const CAPTION_CX = 480;
const CAPTION_BASELINE = 1330;

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const p = PHRASES.find((ph) => t >= ph.start && t < ph.end);
  if (!p) return null;
  const k = interpolate(t, [p.start, p.start + 0.12], [0, 1], {...clamp, easing: easeOut});
  return (
    <div
      style={{
        position: "absolute",
        left: CAPTION_CX,
        // la caja termina 30 px bajo la línea base (descendentes + padding)
        bottom: 1920 - (CAPTION_BASELINE + 30),
        transform: `translate(-50%, ${(1 - k) * 16}px)`,
        opacity: k,
        background: "rgba(31,27,28,0.72)",
        borderRadius: 14,
        padding: "12px 16px 16px",
        display: "flex",
        alignItems: "baseline",
        gap: 17,
        whiteSpace: "nowrap",
      }}
    >
      {p.toks.map((tok, i) =>
        tok.k ? (
          <span
            key={i}
            style={{
              fontFamily: ANTON,
              fontSize: 88,
              lineHeight: 1,
              color: t >= tok.s ? CORAL : WARM_WHITE,
            }}
          >
            {tok.t}
          </span>
        ) : (
          <span key={i} style={{fontFamily: DMSANS, fontSize: 68, lineHeight: 1, color: WARM_WHITE}}>
            {tok.t}
          </span>
        ),
      )}
    </div>
  );
};

// ---------- Rótulos de categoría ----------
export const LABELS = [
  {text: "SUPERHÉROES", start: 6.42, end: 8.22, cx: 540},
  {text: "VIDEOJUEGOS", start: 13.28, end: 14.88, cx: 660}, // a la derecha: su cabeza entra a la izquierda en el paneo
  {text: "ANIMALES", start: 22.84, end: 24.54, cx: 540},
];
const LABEL_TOP = 255;

const CategoryLabels: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const l = LABELS.find((x) => t >= x.start && t < x.end);
  if (!l) return null;
  const pin = interpolate(t, [l.start, l.start + 0.16], [0, 1], {...clamp, easing: easeOut});
  const pout = interpolate(t, [l.end - 0.18, l.end], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: LABEL_TOP,
        left: l.cx,
        transform: `translate(-50%, ${(pin - 1) * 22}px)`,
        opacity: pin * pout,
        background: WARM_WHITE,
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <LabelInner text={l.text} />
    </div>
  );
};

const LabelInner: React.FC<{text: string}> = ({text}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(0);
  React.useLayoutEffect(() => {
    if (ref.current) setW(ref.current.offsetWidth);
  }, [text]);
  return (
    <div ref={ref}>
      {w > 0 ? <Toldo width={w} diameter={34} /> : <div style={{height: 17}} />}
      <div
        style={{
          fontFamily: ANTON,
          fontSize: 62,
          lineHeight: 1,
          color: WARM_BLACK,
          padding: "12px 40px 16px",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ---------- Tarjeta de cierre ----------
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const enter = (start: number) => {
    const p = interpolate(t, [start, start + 0.35], [0, 1], {...clamp, easing: easeOut});
    return {opacity: p, transform: `translateY(${(1 - p) * 24}px)`};
  };
  return (
    <AbsoluteFill>
      <Img
        src={staticFile("assets/end_bg.jpg")}
        style={{
          position: "absolute",
          width: 1080,
          height: 1920,
          objectFit: "cover",
          filter: "blur(28px)",
          transform: "scale(1.12)",
        }}
      />
      <AbsoluteFill style={{background: "rgba(31,27,28,0.6)"}} />
      <div style={{position: "absolute", top: 560, left: 0, width: 1080, textAlign: "center"}}>
        <div style={{fontFamily: ANTON, fontSize: 110, lineHeight: 1.06, color: WARM_WHITE, ...enter(0.05)}}>
          ¿PARA QUIÉN ES
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 110,
            lineHeight: 1.06,
            color: WARM_WHITE,
            whiteSpace: "nowrap",
            ...enter(0.2),
          }}
        >
          TU PRÓXIMO <span style={{color: CORAL}}>REGALO?</span>
        </div>
      </div>
      <div style={{position: "absolute", top: 900, left: 480, transform: "translateX(-50%)"}}>
        <div
          style={{
            ...enter(0.75),
            background: CORAL,
            color: WARM_WHITE,
            fontFamily: DMSANS,
            fontSize: 52,
            lineHeight: 1,
            padding: "22px 40px 24px",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          Coméntalo aquí →
        </div>
      </div>
      <div style={{position: "absolute", top: 1040, left: 480, transform: "translateX(-50%)"}}>
        <div
          style={{
            ...enter(1.1),
            color: WARM_WHITE,
            fontFamily: DMSANS,
            fontSize: 44,
            lineHeight: 1,
            letterSpacing: 1,
            whiteSpace: "nowrap",
          }}
        >
          DON TAZÓN · MORELIA · URUAPAN
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Video completo ----------
export const DonTazonReel: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: WARM_BLACK}}>
      <Sequence durationInFrames={VIDEO_FRAMES}>
        <BaseVideo />
        <HookCard top={740} centerX={480} fontSize={126} width={790} />
        <CategoryLabels />
        <Captions />
      </Sequence>
      <Sequence from={VIDEO_FRAMES} durationInFrames={END_FRAMES}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

// ---------- Portada ----------
// Cuadro de 31.3 s (ella sonriendo). Se amplía y baja para que la cara quede
// debajo del título; todo dentro del recorte central 4:5 (285–1635 px).
export const DonTazonCover: React.FC = () => {
  useFonts();
  const s = 1.65;
  return (
    <AbsoluteFill style={{background: WARM_BLACK, overflow: "hidden"}}>
      <Img
        src={staticFile("assets/cover_src.jpg")}
        style={{
          position: "absolute",
          width: 1080 * s,
          height: 1920 * s,
          left: 540 - 620 * s,
          top: Math.min(0, 930 - 580 * s),
        }}
      />
      <HookCard top={285} centerX={540} fontSize={92} width={620} animate={false} />
    </AbsoluteFill>
  );
};
