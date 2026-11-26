import React from "react";
import {
  AbsoluteFill,
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

// Fonts embedded as data URLs so they never wait behind video downloads.
const ANTON = "VlogAnton";
const MONT = "VlogMontserrat";
loadFont({family: ANTON, url: ANTON_WOFF2, format: "woff2"});
loadFont({
  family: MONT,
  url: MONTSERRAT_WOFF2,
  format: "woff2",
  weight: "100 900",
});

const FPS = 30;
const ACCENT = "#FF7A1A"; // lava orange
const f = (s: number) => Math.round(s * FPS);
const A = (name: string) => staticFile(`assets/volcan/${name}`);

// ---------------------------------------------------------------------------
// Edit decision list. Each segment plays a slice of one voice track
// (voiceIn → voiceOut, in seconds of the source clip). Visual layers are
// placed relative to the segment start.
// ---------------------------------------------------------------------------
type Visual = {
  src: string; // clip file
  at: number; // seconds into the segment
  from: number; // seconds into the clip
  dur?: number; // seconds (defaults to rest of the segment)
  syncToVoice?: boolean; // A-roll: use same in-point as the voice
  zoom?: number; // slow push-in amount
};
type Cap = {t: number; text: string; hl?: string[]}; // t = seconds of the SOURCE clip
type Segment = {
  voice: string;
  voiceIn: number;
  voiceOut: number;
  visuals: Visual[];
  caps: Cap[];
  chip?: string;
};

const SEGMENTS: Segment[] = [
  // 1. HOOK — erupción + la frase más fuerte
  {
    voice: "v3187.m4a",
    voiceIn: 26.82,
    voiceOut: 31.0,
    visuals: [{src: "b3165.mp4", at: 0, from: 0.5, zoom: 0.12}],
    caps: [
      {t: 26.82, text: "una experiencia"},
      {t: 28.1, text: "que va a quedar marcada", hl: ["marcada"]},
      {t: 29.84, text: "para toda la vida", hl: ["vida"]},
    ],
  },
  // 2. Aeropuerto
  {
    voice: "v3014.m4a",
    voiceIn: 0.2,
    voiceOut: 10.4,
    chip: "MÉXICO → GUATEMALA",
    visuals: [{src: "a3014.mp4", at: 0, from: 0, syncToVoice: true}],
    caps: [
      {t: 0.2, text: "estamos listos"},
      {t: 0.8, text: "ya vamos desde México", hl: ["México"]},
      {t: 2.0, text: "¿a dónde?"},
      {t: 2.56, text: "Guatemala", hl: ["Guatemala"]},
      {t: 3.5, text: "vamos a subir un volcán", hl: ["volcán"]},
      {t: 4.79, text: "el volcán de fuego", hl: ["fuego"]},
      {t: 5.75, text: "estamos muy emocionados", hl: ["emocionados"]},
      {t: 6.87, text: "lo que queríamos hacer"},
      {t: 8.04, text: "hace mucho tiempo"},
      {t: 8.64, text: "y nos animamos", hl: ["animamos"]},
      {t: 9.27, text: "¡vamos para allá!"},
    ],
  },
  // 3. Inicio de la caminata 10 PM
  {
    voice: "v3109.m4a",
    voiceIn: 0,
    voiceOut: 17.3,
    chip: "10:00 PM · INICIO",
    visuals: [
      {src: "a3109.mp4", at: 0, from: 0, syncToVoice: true},
      {src: "b3120.mp4", at: 6.05, from: 0.5, dur: 6.0, zoom: 0.06},
      {src: "b3130.mp4", at: 12.05, from: 0, zoom: 0.06},
    ],
    caps: [
      {t: 0, text: "son las 10 de la noche", hl: ["10"]},
      {t: 2.02, text: "y vamos a empezar"},
      {t: 3.36, text: "a subir el volcán", hl: ["volcán"]},
      {t: 6.05, text: "va a ser una aventura", hl: ["aventura"]},
      {t: 9.34, text: "espectacular", hl: ["espectacular"]},
      {t: 10.29, text: "nunca he subido un volcán"},
      {t: 11.66, text: "empezando a esta hora", hl: ["hora"]},
      {t: 12.96, text: "nos tocaba de madrugada"},
      {t: 14.1, text: "a ver si vemos"},
      {t: 15.31, text: "la lava", hl: ["lava"]},
      {t: 16.16, text: "ahí les contamos"},
    ],
  },
  // 4. Cumbre
  {
    voice: "v3187.m4a",
    voiceIn: 9.05,
    voiceOut: 13.45,
    chip: "6:00 AM · CUMBRE ACATENANGO",
    visuals: [{src: "a3187.mp4", at: 0, from: 0, syncToVoice: true}],
    caps: [
      {t: 9.05, text: "ya estamos en la cumbre", hl: ["cumbre"]},
      {t: 11.88, text: "del volcán Acatenango", hl: ["Acatenango"]},
    ],
  },
  // 5. Erupciones
  {
    voice: "v3187.m4a",
    voiceIn: 13.45,
    voiceOut: 17.2,
    visuals: [{src: "b3164.mp4", at: 0, from: 24.0, zoom: 0.08}],
    caps: [
      {t: 13.5, text: "vimos el volcán de fuego", hl: ["fuego"]},
      {t: 15.17, text: "vimos varias erupciones", hl: ["erupciones"]},
    ],
  },
  // 6. Fogata / guías
  {
    voice: "v3187.m4a",
    voiceIn: 17.2,
    voiceOut: 26.82,
    visuals: [{src: "b3153.mp4", at: 0, from: 0, zoom: 0.05}],
    caps: [
      {t: 17.2, text: "gracias a Brújula Expeditions", hl: ["Brújula", "Expeditions"]},
      {t: 19.84, text: "que nos ayudaron en todo"},
      {t: 21.07, text: "tuvimos un break"},
      {t: 23.0, text: "nos hicieron una fogata", hl: ["fogata"]},
      {t: 23.84, text: "un chocolatito caliente", hl: ["chocolatito"]},
      {t: 25.35, text: "porque hacía bastante frío", hl: ["frío"]},
    ],
  },
  // 7. Reflexión en la cima
  {
    voice: "v3187.m4a",
    voiceIn: 31.05,
    voiceOut: 42.3,
    visuals: [
      {src: "a3187.mp4", at: 0, from: 0, syncToVoice: true},
      {src: "b3164.mp4", at: 7.0, from: 5.5, zoom: 0.05},
    ],
    caps: [
      {t: 31.05, text: "ha sido increíble", hl: ["increíble"]},
      {t: 32.36, text: "lo que hemos vivido"},
      {t: 34.03, text: "como siete horas de camino", hl: ["siete", "horas"]},
      {t: 37.04, text: "desde la noche"},
      {t: 38.81, text: "y ahorita: 6 de la mañana", hl: ["6"]},
      {t: 40.22, text: "una aventura increíble", hl: ["increíble"]},
    ],
  },
  // 8. Cierre
  {
    voice: "v3187.m4a",
    voiceIn: 42.3,
    voiceOut: 48.3,
    visuals: [{src: "b3185.mp4", at: 0, from: 0, zoom: 0.06}],
    caps: [
      {t: 42.37, text: "este tipo de cosas"},
      {t: 44.67, text: "realmente no tienen valor", hl: ["valor"]},
      {t: 46.83, text: "son priceless", hl: ["priceless"]},
    ],
  },
];

const CTA_SECONDS = 3.6;

const segFrames = SEGMENTS.map((s) => f(s.voiceOut - s.voiceIn));
const segStarts = segFrames.reduce<number[]>((acc, _d, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + segFrames[i - 1]);
  return acc;
}, []);
const VOICE_FRAMES = segFrames.reduce((a, b) => a + b, 0);
export const VLOG_VOLCAN_DURATION = VOICE_FRAMES + f(CTA_SECONDS);

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------
const Clip: React.FC<{src: string; from: number; zoom?: number; dur: number}> = ({
  src,
  from,
  zoom = 0,
  dur,
}) => {
  const frame = useCurrentFrame();
  const scale = 1 + zoom * (frame / Math.max(1, dur));
  // quick flash-in on every cut
  const flash = interpolate(frame, [0, 4], [0.35, 0], {extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: "black"}}>
      <AbsoluteFill style={{transform: `scale(${scale})`}}>
        <Video
          src={A(src)}
          trimBefore={f(from)}
          muted
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: "white", opacity: flash}} />
    </AbsoluteFill>
  );
};

const Caption: React.FC<{text: string; hl?: string[]; durFrames: number}> = ({text, hl = []}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 12, stiffness: 220, mass: 0.6}});
  const scale = interpolate(pop, [0, 1], [0.8, 1]);
  const words = text.split(" ");
  return (
    <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", paddingBottom: 560}}>
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

const Chip: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 14, stiffness: 140}});
  const out = interpolate(frame, [f(2.6), f(3.0)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
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

const HookTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const l1 = spring({frame, fps, config: {damping: 10, stiffness: 180}});
  const l2 = spring({frame: frame - 6, fps, config: {damping: 10, stiffness: 180}});
  const shake = frame < 20 ? Math.sin(frame * 2.3) * (20 - frame) * 0.4 : 0;
  return (
    <AbsoluteFill style={{alignItems: "center", paddingTop: 230}}>
      <div
        style={{
          fontFamily: ANTON,
          textAlign: "center",
          textTransform: "uppercase",
          color: "white",
          lineHeight: 0.98,
          textShadow: "0 8px 30px rgba(0,0,0,0.8)",
          transform: `translateX(${shake}px)`,
        }}
      >
        <div style={{fontSize: 92, transform: `scale(${l1})`}}>7 horas de noche</div>
        <div style={{fontSize: 130, color: ACCENT, transform: `scale(${l2})`}}>para ver esto</div>
      </div>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 13, stiffness: 150}});
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
    </AbsoluteFill>
  );
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
        return (
          <Sequence key={i} from={start} durationInFrames={dur} name={`Seg ${i + 1}`}>
            {/* visuals */}
            {seg.visuals.map((v, j) => {
              const vAt = f(v.at);
              const vDur = v.dur !== undefined ? f(v.dur) : dur - vAt;
              const clipFrom = v.syncToVoice ? seg.voiceIn + v.at : v.from;
              return (
                <Sequence key={j} from={vAt} durationInFrames={vDur} layout="none">
                  <Clip src={v.src} from={clipFrom} zoom={v.zoom} dur={vDur} />
                </Sequence>
              );
            })}
            {/* voice */}
            <Audio src={A(seg.voice)} trimBefore={f(seg.voiceIn)} />
            {/* captions */}
            {seg.caps.map((c, j) => {
              const cs = Math.max(0, f(c.t - seg.voiceIn));
              const next = seg.caps[j + 1];
              const ce = next ? f(next.t - seg.voiceIn) : dur;
              return (
                <Sequence key={`c${j}`} from={cs} durationInFrames={Math.max(1, ce - cs)} layout="none">
                  <Caption text={c.text} hl={c.hl} durFrames={ce - cs} />
                </Sequence>
              );
            })}
            {seg.chip ? (
              <Sequence durationInFrames={f(3)} layout="none">
                <Chip text={seg.chip} />
              </Sequence>
            ) : null}
            {i === 0 ? (
              <>
                <Audio src={A("b3165.mp4")} trimBefore={f(0.5)} volume={0.35} />
                <HookTitle />
              </>
            ) : null}
          </Sequence>
        );
      })}

      {/* CTA: el amanecer sigue de fondo */}
      <Sequence from={VOICE_FRAMES} durationInFrames={f(CTA_SECONDS)} name="CTA">
        <Clip src="b3165.mp4" from={2.5} zoom={0.06} dur={f(CTA_SECONDS)} />
        <Audio src={A("b3165.mp4")} trimBefore={f(2.5)} volume={0.6} />
        <CTA />
      </Sequence>

      <Progress />
    </AbsoluteFill>
  );
};
