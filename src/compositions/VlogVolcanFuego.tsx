import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {Audio, Video} from "@remotion/media";
import {loadFont} from "@remotion/fonts";
import {ANTON_WOFF2, MONTSERRAT_WOFF2} from "./vlogFonts";
import {RouteAnimation} from "./volcan/RouteAnimation";
import {BrujulaCard, BRUJULA_GREEN, BRUJULA_NAVY} from "./volcan/BrujulaCard";

// Fonts embedded as data URLs so they never wait behind video downloads.
const ANTON = "VlogAnton";
const MONT = "VlogMontserrat";
loadFont({family: ANTON, url: ANTON_WOFF2, format: "woff2"});
loadFont({family: MONT, url: MONTSERRAT_WOFF2, format: "woff2", weight: "100 900"});

const FPS = 30;
const ACCENT = "#FF7A1A"; // lava orange
const f = (s: number) => Math.round(s * FPS);
const A = (name: string) => staticFile(`assets/volcan/${name}`);

// ---------------------------------------------------------------------------
// Edit decision list — storytelling order:
//   HOOK (summit: where we are + what we saw) → soft fade → airport + flight
//   map → 10 PM start → night climb → full summit story in the order it was
//   told (Brújula + fogata, reflection, route animation, volcano shots) →
//   the moment watching the eruption (real reaction only) → CTA.
//
// Voice comes from studio-processed tracks (voz*.wav). Each segment plays one
// slice (voiceIn → voiceOut, seconds of that source clip) + optional `tail`.
// Visual / caption / overlay `t` values are SOURCE times of the voice clip.
// False starts removed: 3109 6.04–7.61 ("Entonces va a ser una…") and
// 3187 8.2–10.8 ("ok… la cumbre, la cumbre").
// ---------------------------------------------------------------------------
type Visual = {
  src?: string;
  t: number;
  from?: number;
  aroll?: boolean; // clip on the same timeline as the voice (lip-sync)
  zoom?: number;
  anim?: "route";
  rate?: number;
};
type Cap = {t: number; text: string; hl?: string[]};
type Overlay = {
  t: number;
  dur: number;
  kind: "pin" | "brujula" | "rewind" | "chip";
  label?: string;
  sub?: string;
};
type Segment = {
  name: string;
  voice: string;
  voiceIn: number;
  voiceOut: number;
  tail?: number;
  fadeIn?: number; // frames, from black
  fadeOut?: number; // frames, to black
  visuals: Visual[];
  caps: Cap[];
  overlays?: Overlay[];
};

const SEGMENTS: Segment[] = [
  // HOOK 1 — dónde están y qué vieron
  {
    name: "Hook cumbre",
    fadeOut: 12,
    voice: "voz3187.wav",
    voiceIn: 10.82,
    voiceOut: 17.15,
    visuals: [{src: "a3187.mp4", t: 10.82, aroll: true}],
    overlays: [{t: 11.3, dur: 5.6, kind: "pin", label: "Cumbre Acatenango", sub: "3,976 m · Guatemala"}],
    caps: [
      {t: 10.86, text: "estamos ya en la"},
      {t: 11.88, text: "cumbre del volcán", hl: ["cumbre"]},
      {t: 12.78, text: "Acatenango", hl: ["Acatenango"]},
      {t: 13.98, text: "vimos el volcán de fuego", hl: ["fuego"]},
      {t: 15.6, text: "vimos varias erupciones", hl: ["erupciones"]},
    ],
  },
  // FLASHBACK — aeropuerto + animación del vuelo
  {
    name: "Aeropuerto",
    fadeIn: 14,
    voice: "voz3014.wav",
    voiceIn: 0.18,
    voiceOut: 10.5,
    visuals: [
      {src: "a3014.mp4", t: 0.18, aroll: true},
      {src: "vuelo.mp4", t: 0.81, from: 0.2},
      {src: "a3014.mp4", t: 4.74, aroll: true},
    ],
    caps: [
      {t: 0.2, text: "estamos listos"},
      {t: 0.81, text: "ya vamos desde México", hl: ["México"]},
      {t: 2.2, text: "¿a dónde?"},
      {t: 2.78, text: "Guatemala", hl: ["Guatemala"]},
      {t: 3.62, text: "vamos a subir un volcán", hl: ["volcán"]},
      {t: 4.78, text: "el volcán de fuego", hl: ["fuego"]},
      {t: 5.84, text: "estamos muy emocionados", hl: ["emocionados"]},
      {t: 6.82, text: "algo que queríamos hacer"},
      {t: 8.0, text: "hace mucho tiempo"},
      {t: 9.12, text: "y nos animamos", hl: ["animamos"]},
      {t: 9.68, text: "¡vamos para allá!"},
    ],
  },
  // 10 PM — arranque
  {
    name: "10PM",
    voice: "voz3109.wav",
    voiceIn: 1.45,
    voiceOut: 5.5,
    visuals: [{src: "a3109.mp4", t: 1.45, aroll: true}],
    overlays: [{t: 1.45, dur: 3, kind: "chip", label: "10:00 PM · EMPIEZA LA SUBIDA"}],
    caps: [
      {t: 1.5, text: "son las 10 de la noche", hl: ["10"]},
      {t: 3.0, text: "vamos a empezar a subir"},
      {t: 4.1, text: "el volcán ahorita", hl: ["volcán"]},
    ],
  },
  // Subida nocturna (sin el tropiezo)
  {
    name: "Noche",
    voice: "voz3109.wav",
    voiceIn: 8.5,
    voiceOut: 17.55,
    visuals: [
      {src: "b3120.mp4", t: 8.5, from: 0.3, zoom: 0.05},
      {src: "b3120.mp4", t: 10.5, from: 4.2, zoom: 0.05},
      {src: "b3130.mp4", t: 13.3, from: 0.3, zoom: 0.05},
      {src: "b3130.mp4", t: 15.9, from: 5.0, zoom: 0.05},
    ],
    caps: [
      {t: 8.52, text: "va a ser una aventura", hl: ["aventura"]},
      {t: 9.62, text: "espectacular", hl: ["espectacular"]},
      {t: 10.52, text: "nunca he subido un volcán", hl: ["volcán"]},
      {t: 12.16, text: "empezando a esta hora", hl: ["hora"]},
      {t: 13.33, text: "nos tocaba de madrugada", hl: ["madrugada"]},
      {t: 14.46, text: "a ver qué tal"},
      {t: 15.0, text: "si vemos la lava", hl: ["lava"]},
      {t: 16.67, text: "¡ahí les contamos!"},
    ],
  },
  // Cumbre: relato completo, en el orden en que se dijo (sin recortes)
  {
    name: "Cumbre relato",
    voice: "voz3187.wav",
    voiceIn: 17.15,
    voiceOut: 46.36,
    tail: 0.6,
    visuals: [
      {src: "b3153.mp4", t: 17.15, from: 0.0, zoom: 0.04},
      {src: "b3153.mp4", t: 23.7, from: 10.5, zoom: 0.04},
      {src: "a3187.mp4", t: 26.3, aroll: true},
      {src: "b3164.mp4", t: 28.68, from: 0.0, zoom: 0.06},
      {src: "a3187.mp4", t: 30.9, aroll: true},
      {t: 33.9, anim: "route"},
      {src: "b3185.mp4", t: 40.5, from: 2.0, zoom: 0.06},
      {src: "b3165.mp4", t: 42.3, from: 0.6, zoom: 0.1},
      {src: "b3164.mp4", t: 44.6, from: 26.3, zoom: 0.08},
    ],
    overlays: [{t: 17.15, dur: 4.5, kind: "brujula"}],
    caps: [
      {t: 17.17, text: "y gracias"},
      {t: 18.34, text: "a Brújula Expeditions", hl: ["Brújula", "Expeditions"]},
      {t: 20.0, text: "que nos ayudaron en todo"},
      {t: 21.6, text: "tuvimos un break"},
      {t: 22.6, text: "nos hicieron una fogata", hl: ["fogata"]},
      {t: 23.6, text: "un chocolatito caliente", hl: ["chocolatito"]},
      {t: 24.76, text: "porque hacía bastante frío", hl: ["frío"]},
      {t: 26.35, text: "pero es una experiencia", hl: ["experiencia"]},
      {t: 28.68, text: "que va a quedar marcada", hl: ["marcada"]},
      {t: 29.82, text: "para toda la vida", hl: ["vida"]},
      {t: 30.92, text: "ha sido increíble", hl: ["increíble"]},
      {t: 32.3, text: "lo que hemos vivido"},
      {t: 33.94, text: "son ya como siete horas", hl: ["siete", "horas"]},
      {t: 36.44, text: "de camino desde la noche", hl: ["noche"]},
      {t: 38.6, text: "y ahorita"},
      {t: 39.4, text: "6 de la mañana", hl: ["6", "mañana"]},
      {t: 40.56, text: "de verdad, una aventura increíble", hl: ["increíble"]},
      {t: 42.34, text: "para todos"},
      {t: 43.04, text: "este tipo de cosas"},
      {t: 44.62, text: "realmente no tienen valor", hl: ["valor"]},
      {t: 45.6, text: "son priceless", hl: ["priceless"]},
    ],
  },
  // El momento: la toma donde están viendo la montaña, solo con la reacción real
  {
    name: "Momento",
    voice: "reaccion.wav",
    voiceIn: 2.6,
    voiceOut: 9.2,
    visuals: [{src: "b3164.mp4", t: 2.6, aroll: true, zoom: 0.06}],
    overlays: [{t: 6.4, dur: 2.8, kind: "pin", label: "Volcán de Fuego", sub: "en erupción"}],
    caps: [],
  },
];

const CTA_SECONDS = 4.0;

const segFrames = SEGMENTS.map((s) => f(s.voiceOut - s.voiceIn + (s.tail ?? 0)));
const segStarts = segFrames.reduce<number[]>((acc, _d, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + segFrames[i - 1]);
  return acc;
}, []);
const VOICE_FRAMES = segFrames.reduce((a, b) => a + b, 0);
export const VLOG_VOLCAN_DURATION = VOICE_FRAMES + f(CTA_SECONDS);

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------
const Clip: React.FC<{src: string; from: number; zoom?: number; dur: number; flash?: boolean; rate?: number}> = ({
  src,
  from,
  zoom = 0,
  dur,
  flash = true,
  rate = 1,
}) => {
  const frame = useCurrentFrame();
  const scale = 1 + zoom * (frame / Math.max(1, dur));
  const flashOpacity = flash ? interpolate(frame, [0, 4], [0.3, 0], {extrapolateRight: "clamp"}) : 0;
  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: "black"}}>
      <AbsoluteFill style={{transform: `scale(${scale})`}}>
        <Video
          src={A(src)}
          trimBefore={f(from)}
          playbackRate={rate}
          muted
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: "white", opacity: flashOpacity}} />
    </AbsoluteFill>
  );
};

/** Voice slice with micro fades so edits never click. */
const Voice: React.FC<{src: string; from: number; frames: number}> = ({src, from, frames}) => (
  <Sequence durationInFrames={frames} layout="none">
    <Audio
      src={A(src)}
      trimBefore={f(from)}
      volume={(fr) =>
        interpolate(fr, [0, 2, frames - 3, frames - 1], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
  </Sequence>
);

const Caption: React.FC<{text: string; hl?: string[]}> = ({text, hl = []}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 12, stiffness: 220, mass: 0.6}});
  const scale = interpolate(pop, [0, 1], [0.8, 1]);
  const words = text.split(" ");
  return (
    <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", paddingBottom: 520}}>
      <div
        style={{
          transform: `scale(${scale})`,
          opacity: interpolate(frame, [0, 3], [0, 1], {extrapolateRight: "clamp"}),
          maxWidth: 900,
          textAlign: "center",
          fontFamily: MONT,
          fontWeight: 900,
          fontSize: 70,
          lineHeight: 1.12,
          textTransform: "uppercase",
          color: "white",
          WebkitTextStroke: "3px black",
          paintOrder: "stroke fill",
          textShadow: "0 6px 18px rgba(0,0,0,0.75)",
        }}
      >
        {words.map((w, i) => {
          const isHl = hl.some((h) => w.toLowerCase().includes(h.toLowerCase()));
          return (
            <span key={i} style={{color: isHl ? ACCENT : "white"}}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Chip: React.FC<{text: string; dur: number}> = ({text, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 14, stiffness: 140}});
  const out = interpolate(frame, [dur - 10, dur], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{alignItems: "center", paddingTop: 250}}>
      <div
        style={{
          transform: `translateY(${interpolate(p, [0, 1], [-40, 0])}px)`,
          opacity: p * out,
          background: "rgba(0,0,0,0.55)",
          border: `3px solid ${ACCENT}`,
          borderRadius: 999,
          padding: "16px 36px",
          fontFamily: MONT,
          fontWeight: 800,
          fontSize: 40,
          letterSpacing: 2,
          color: "white",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

/** Map-pin label (same look as the flight animation): red pin drops, label box slides out. */
const LocationPin: React.FC<{label: string; sub?: string; dur: number}> = ({label, sub, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = spring({frame, fps, config: {damping: 9, stiffness: 170}});
  const box = spring({frame: frame - 6, fps, config: {damping: 14, stiffness: 160}});
  const out = interpolate(frame, [dur - 10, dur], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const pulse = (frame % 36) / 36;
  return (
    <AbsoluteFill style={{alignItems: "center", paddingTop: 230, opacity: out}}>
      <div style={{display: "flex", alignItems: "center", gap: 18}}>
        <div style={{position: "relative", width: 90, height: 120, transform: `translateY(${interpolate(drop, [0, 1], [-160, 0])}px)`}}>
          <div
            style={{
              position: "absolute",
              left: 45 - 30 - pulse * 30,
              top: 104 - 10 - pulse * 10,
              width: 60 + pulse * 60,
              height: 20 + pulse * 20,
              borderRadius: "50%",
              border: "4px solid #E8443A",
              opacity: (1 - pulse) * drop,
            }}
          />
          <svg width={90} height={120} viewBox="0 0 90 120">
            <path d="M45 115 C 25 85 8 66 8 44 a 37 37 0 1 1 74 0 c 0 22 -17 41 -37 71 z" fill="#E8443A" stroke="white" strokeWidth={6} />
            <circle cx={45} cy={44} r={14} fill="white" />
          </svg>
        </div>
        <div
          style={{
            transform: `scaleX(${box})`,
            transformOrigin: "left center",
            background: "#0D2440",
            border: "3px solid white",
            borderRadius: 18,
            padding: "14px 28px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 46, color: "white", whiteSpace: "nowrap"}}>{label}</div>
          {sub ? (
            <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 34, color: ACCENT, whiteSpace: "nowrap"}}>{sub}</div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Flashback title: "¿Cómo llegamos aquí?" with a quick rewind-style wipe. */
const Rewind: React.FC<{label: string; dur: number}> = ({label, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 12, stiffness: 200}});
  const out = interpolate(frame, [dur - 8, dur], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const lines = interpolate(frame, [0, 10], [1, 0], {extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{opacity: out}}>
      {/* VHS-like scan lines on entry */}
      <AbsoluteFill
        style={{
          background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0 3px, transparent 3px 9px)",
          opacity: lines,
        }}
      />
      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <div
          style={{
            transform: `scale(${interpolate(p, [0, 1], [1.4, 1])})`,
            opacity: p,
            background: ACCENT,
            color: "#111",
            fontFamily: ANTON,
            fontSize: 96,
            textTransform: "uppercase",
            padding: "18px 40px",
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          <span style={{fontSize: 80}}>◀◀</span>
          {label}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const credit = spring({frame: frame - 14, fps, config: {damping: 14, stiffness: 150}});
  const bounce = 1 + Math.sin(frame / 5) * 0.03;
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
      <AbsoluteFill style={{background: "rgba(0,0,0,0.45)", opacity: p}} />
      <div
        style={{
          transform: `scale(${interpolate(p, [0, 1], [0.7, 1]) * bounce})`,
          opacity: p,
          textAlign: "center",
          padding: "0 70px",
        }}
      >
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 110,
            lineHeight: 1,
            textTransform: "uppercase",
            color: "white",
            textShadow: "0 8px 30px rgba(0,0,0,0.8)",
          }}
        >
          ¿Te gustan
          <br />
          <span style={{color: ACCENT}}>estos vlogs?</span>
        </div>
        <div
          style={{
            marginTop: 40,
            display: "inline-block",
            background: ACCENT,
            color: "black",
            borderRadius: 24,
            padding: "22px 44px",
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 48,
            textTransform: "uppercase",
          }}
        >
          Coméntalo y sigo contando
        </div>
      </div>
      {/* tour credit */}
      <div
        style={{
          position: "absolute",
          bottom: 330,
          display: "flex",
          alignItems: "center",
          gap: 20,
          background: BRUJULA_NAVY,
          border: `4px solid ${BRUJULA_GREEN}`,
          borderRadius: 999,
          padding: "12px 34px 12px 12px",
          opacity: credit,
          transform: `translateY(${interpolate(credit, [0, 1], [80, 0])}px)`,
        }}
      >
        <Img src={staticFile("assets/volcan/brujula/logo.png")} style={{width: 86, height: 86, borderRadius: "50%"}} />
        <div style={{fontFamily: MONT, color: "white", lineHeight: 1.1}}>
          <div style={{fontSize: 30, fontWeight: 700, opacity: 0.8}}>Tour con</div>
          <div style={{fontSize: 42, fontWeight: 900}}>
            <span style={{color: BRUJULA_GREEN}}>@</span>brujula_expeditions
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Black layer for soft fade-in / fade-out at segment edges. */
const FadeBlack: React.FC<{fadeIn?: number; fadeOut?: number; dur: number}> = ({fadeIn = 0, fadeOut = 0, dur}) => {
  const frame = useCurrentFrame();
  const a = fadeIn ? interpolate(frame, [0, fadeIn], [1, 0], {extrapolateRight: "clamp"}) : 0;
  const b = fadeOut ? interpolate(frame, [dur - fadeOut, dur - 1], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) : 0;
  return <AbsoluteFill style={{backgroundColor: "black", opacity: Math.max(a, b)}} />;
};

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill style={{justifyContent: "flex-start"}}>
      <div style={{height: 8, width: `${(frame / durationInFrames) * 100}%`, background: ACCENT}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
export const VlogVolcanFuego: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: "black"}}>
      {SEGMENTS.map((seg, i) => {
        const start = segStarts[i];
        const dur = segFrames[i];
        const voiceFrames = f(seg.voiceOut - seg.voiceIn);
        const rel = (t: number) => Math.max(0, f(t - seg.voiceIn));
        return (
          <Sequence key={i} from={start} durationInFrames={dur} name={seg.name}>
            {seg.visuals.map((v, j) => {
              const vAt = rel(v.t);
              const next = seg.visuals[j + 1];
              const vEnd = next ? rel(next.t) : dur;
              return (
                <Sequence key={j} from={vAt} durationInFrames={vEnd - vAt} layout="none">
                  {v.anim === "route" ? (
                    <RouteAnimation />
                  ) : (
                    <Clip
                      src={v.src!}
                      from={v.aroll ? v.t : (v.from ?? 0)}
                      zoom={v.zoom}
                      dur={vEnd - vAt}
                      rate={v.rate}
                      flash={!(v.aroll && j === 0)}
                    />
                  )}
                </Sequence>
              );
            })}

            <Voice src={seg.voice} from={seg.voiceIn} frames={voiceFrames} />

            {(seg.overlays ?? []).map((o, j) => {
              const d = f(o.dur);
              return (
                <Sequence key={`o${j}`} from={rel(o.t)} durationInFrames={d} layout="none">
                  {o.kind === "pin" ? <LocationPin label={o.label!} sub={o.sub} dur={d} /> : null}
                  {o.kind === "brujula" ? <BrujulaCard /> : null}
                  {o.kind === "rewind" ? <Rewind label={o.label!} dur={d} /> : null}
                  {o.kind === "chip" ? <Chip text={o.label!} dur={d} /> : null}
                </Sequence>
              );
            })}

            {seg.caps.map((c, j) => {
              const cs = rel(c.t);
              const next = seg.caps[j + 1];
              const ce = next ? rel(next.t) : Math.min(dur, voiceFrames + 6);
              return (
                <Sequence key={`c${j}`} from={cs} durationInFrames={Math.max(1, ce - cs)} layout="none">
                  <Caption text={c.text} hl={c.hl} />
                </Sequence>
              );
            })}

            {seg.fadeIn || seg.fadeOut ? <FadeBlack fadeIn={seg.fadeIn} fadeOut={seg.fadeOut} dur={dur} /> : null}
          </Sequence>
        );
      })}

      <Sequence from={VOICE_FRAMES} durationInFrames={f(CTA_SECONDS)} name="CTA">
        <Clip src="b3164.mp4" from={29.0} zoom={0.06} dur={f(CTA_SECONDS)} />
        <Audio
          src={A("reaccion.wav")}
          trimBefore={f(29.0)}
          volume={(fr) =>
            interpolate(fr, [0, 8, f(CTA_SECONDS) - 15, f(CTA_SECONDS)], [0, 0.55, 0.55, 0], {extrapolateRight: "clamp"})
          }
        />
        <CTA />
      </Sequence>

      <Progress />
    </AbsoluteFill>
  );
};
