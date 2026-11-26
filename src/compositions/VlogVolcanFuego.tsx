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
// Edit decision list.
// Voice comes from the studio-processed tracks (voz*.wav: AI denoise, EQ,
// de-esser, compression, -14 LUFS). Each segment plays one slice of a voice
// track (voiceIn → voiceOut, seconds of the source clip), optionally followed
// by `tail` seconds with no voice.
// Visual `t` and caption `t` are SOURCE times of that voice clip, so A-roll
// stays lip-synced and captions follow the real speech.
// ---------------------------------------------------------------------------
type Visual = {
  src: string;
  t: number; // source time (of the voice clip) where this shot starts
  from?: number; // in-point inside the shot's own file (ignored for A-roll)
  aroll?: boolean; // the talking clip itself, synced to the voice
  zoom?: number; // slow push-in
};
type Cap = {t: number; text: string; hl?: string[]};
type Segment = {
  name: string;
  voice: string;
  voiceIn: number;
  voiceOut: number;
  tail?: number;
  visuals: Visual[];
  caps: Cap[];
  chip?: string;
};

const SEGMENTS: Segment[] = [
  // 1. HOOK — noche → amanecer. "Nunca he subido un volcán empezando a esta hora"
  {
    name: "Hook",
    voice: "voz3109.wav",
    voiceIn: 10.5,
    voiceOut: 13.33,
    tail: 1.6,
    visuals: [
      {src: "b3120.mp4", t: 10.5, from: 4.0, zoom: 0.05},
      {src: "b3130.mp4", t: 11.9, from: 0.3, zoom: 0.05},
      {src: "b3165.mp4", t: 13.33, from: 0.6, zoom: 0.1},
    ],
    caps: [
      {t: 10.5, text: "nunca he subido un volcán", hl: ["volcán"]},
      {t: 12.1, text: "empezando a esta hora", hl: ["hora"]},
    ],
  },
  // 2. Aeropuerto
  {
    name: "Aeropuerto",
    voice: "voz3014.wav",
    voiceIn: 0.18,
    voiceOut: 10.5,
    chip: "MÉXICO → GUATEMALA",
    visuals: [{src: "a3014.mp4", t: 0.18, aroll: true}],
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
  // 3. 10 PM, arranque (A-roll)
  {
    name: "10PM",
    voice: "voz3109.wav",
    voiceIn: 1.45,
    voiceOut: 5.5,
    chip: "10:00 PM · INICIO",
    visuals: [{src: "a3109.mp4", t: 1.45, aroll: true}],
    caps: [
      {t: 1.5, text: "son las 10 de la noche", hl: ["10"]},
      {t: 3.0, text: "vamos a empezar a subir"},
      {t: 4.1, text: "el volcán ahorita", hl: ["volcán"]},
    ],
  },
  // 4. (se quitó el tropiezo "Entonces va a ser una…") — "va a ser una aventura espectacular"
  {
    name: "Aventura",
    voice: "voz3109.wav",
    voiceIn: 8.5,
    voiceOut: 10.5,
    visuals: [{src: "b3120.mp4", t: 8.5, from: 0.3, zoom: 0.05}],
    caps: [
      {t: 8.52, text: "va a ser una aventura", hl: ["aventura"]},
      {t: 9.62, text: "espectacular", hl: ["espectacular"]},
    ],
  },
  // 5. "a ver qué tal, para ver si vemos la lava ahí"
  {
    name: "Lava",
    voice: "voz3109.wav",
    voiceIn: 14.42,
    voiceOut: 16.48,
    visuals: [{src: "b3130.mp4", t: 14.42, from: 4.5, zoom: 0.05}],
    caps: [
      {t: 14.46, text: "a ver qué tal"},
      {t: 15.0, text: "si vemos la lava", hl: ["lava"]},
    ],
  },
  // 6. Cumbre (se quitó "ok… la cumbre, la cumbre")
  {
    name: "Cumbre",
    voice: "voz3187.wav",
    voiceIn: 10.82,
    voiceOut: 13.88,
    chip: "6:00 AM · CUMBRE ACATENANGO",
    visuals: [{src: "a3187.mp4", t: 10.82, aroll: true}],
    caps: [
      {t: 10.86, text: "ya estamos en la"},
      {t: 11.88, text: "cumbre del volcán", hl: ["cumbre"]},
      {t: 12.78, text: "Acatenango", hl: ["Acatenango"]},
    ],
  },
  // 7. Erupciones, guías, fogata y reflexión
  {
    name: "Historia",
    voice: "voz3187.wav",
    voiceIn: 13.94,
    voiceOut: 44.1,
    visuals: [
      {src: "b3164.mp4", t: 13.94, from: 24.0, zoom: 0.08},
      {src: "b3153.mp4", t: 18.3, from: 0.0, zoom: 0.05},
      {src: "b3153.mp4", t: 23.7, from: 10.5, zoom: 0.04},
      {src: "a3187.mp4", t: 26.3, aroll: true},
      {src: "b3130.mp4", t: 33.9, from: 7.0, zoom: 0.05},
      {src: "b3164.mp4", t: 36.4, from: 2.0, zoom: 0.05},
      {src: "a3187.mp4", t: 39.4, aroll: true},
    ],
    caps: [
      {t: 13.98, text: "vimos el volcán de fuego", hl: ["fuego"]},
      {t: 15.6, text: "vimos varias erupciones", hl: ["erupciones"]},
      {t: 17.3, text: "y gracias"},
      {t: 18.34, text: "a Brújula Expeditions", hl: ["Brújula", "Expeditions"]},
      {t: 20.0, text: "que nos ayudaron en todo"},
      {t: 21.6, text: "tuvimos un break"},
      {t: 22.6, text: "nos hicieron una fogata", hl: ["fogata"]},
      {t: 23.6, text: "un chocolatito caliente", hl: ["chocolatito"]},
      {t: 24.76, text: "porque hacía bastante frío", hl: ["frío"]},
      {t: 26.35, text: "es una experiencia", hl: ["experiencia"]},
      {t: 28.68, text: "que va a quedar marcada", hl: ["marcada"]},
      {t: 29.82, text: "para toda la vida", hl: ["vida"]},
      {t: 30.75, text: "ha sido increíble", hl: ["increíble"]},
      {t: 32.3, text: "lo que hemos vivido"},
      {t: 33.94, text: "son ya como siete horas", hl: ["siete", "horas"]},
      {t: 36.44, text: "de camino desde la noche", hl: ["noche"]},
      {t: 38.6, text: "y ahorita"},
      {t: 39.4, text: "6 de la mañana", hl: ["6", "mañana"]},
      {t: 40.56, text: "una aventura increíble", hl: ["increíble"]},
      {t: 42.34, text: "para todos"},
      {t: 43.04, text: "este tipo de cosas"},
    ],
  },
  // 8. Cierre
  {
    name: "Priceless",
    voice: "voz3187.wav",
    voiceIn: 44.58,
    voiceOut: 46.36,
    tail: 0.5,
    visuals: [{src: "b3185.mp4", t: 44.58, from: 0.0, zoom: 0.06}],
    caps: [
      {t: 44.62, text: "realmente no tienen valor", hl: ["valor"]},
      {t: 45.6, text: "son priceless", hl: ["priceless"]},
    ],
  },
];

const CTA_SECONDS = 3.6;

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
const Clip: React.FC<{src: string; from: number; zoom?: number; dur: number; flash?: boolean}> = ({
  src,
  from,
  zoom = 0,
  dur,
  flash = true,
}) => {
  const frame = useCurrentFrame();
  const scale = 1 + zoom * (frame / Math.max(1, dur));
  const flashOpacity = flash
    ? interpolate(frame, [0, 4], [0.3, 0], {extrapolateRight: "clamp"})
    : 0;
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
      <AbsoluteFill style={{backgroundColor: "white", opacity: flashOpacity}} />
    </AbsoluteFill>
  );
};

/** Voice slice with 2-frame micro fades so edits never click. */
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

/** Hook: big clock time. "10:00 PM" during the night shots, slams to "6:00 AM" on the eruption. */
const HookClock: React.FC<{switchAt: number}> = ({switchAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const isDay = frame >= switchAt;
  const local = isDay ? frame - switchAt : frame;
  const pop = spring({frame: local, fps, config: {damping: 9, stiffness: 200, mass: 0.7}});
  const scale = interpolate(pop, [0, 1], [isDay ? 1.6 : 0.6, 1]);
  const shake = isDay && local < 12 ? Math.sin(local * 2.4) * (12 - local) * 1.1 : 0;
  return (
    <AbsoluteFill style={{alignItems: "center", paddingTop: 260}}>
      <div
        style={{
          transform: `translateX(${shake}px) scale(${scale})`,
          textAlign: "center",
          fontFamily: ANTON,
          textTransform: "uppercase",
          lineHeight: 0.95,
          textShadow: "0 8px 30px rgba(0,0,0,0.85)",
        }}
      >
        <div style={{fontSize: 170, color: isDay ? ACCENT : "white", letterSpacing: 2}}>
          {isDay ? "6:00 AM" : "10:00 PM"}
        </div>
        <div style={{fontSize: 52, color: "white", fontFamily: MONT, fontWeight: 800, letterSpacing: 4}}>
          {isDay ? "Volcán de Fuego" : "empieza la subida"}
        </div>
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
        const voiceFrames = f(seg.voiceOut - seg.voiceIn);
        const rel = (t: number) => Math.max(0, f(t - seg.voiceIn));
        return (
          <Sequence key={i} from={start} durationInFrames={dur} name={seg.name}>
            {seg.visuals.map((v, j) => {
              const vAt = rel(v.t);
              const next = seg.visuals[j + 1];
              const vEnd = next ? rel(next.t) : dur;
              const clipFrom = v.aroll ? v.t : (v.from ?? 0);
              return (
                <Sequence key={j} from={vAt} durationInFrames={vEnd - vAt} layout="none">
                  <Clip src={v.src} from={clipFrom} zoom={v.zoom} dur={vEnd - vAt} flash={!v.aroll || j > 0} />
                </Sequence>
              );
            })}

            <Voice src={seg.voice} from={seg.voiceIn} frames={voiceFrames} />

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

            {seg.chip ? (
              <Sequence durationInFrames={f(3)} layout="none">
                <Chip text={seg.chip} />
              </Sequence>
            ) : null}

            {i === 0 ? (
              <>
                <HookClock switchAt={voiceFrames} />
                {/* real eruption rumble under the reveal */}
                <Sequence from={voiceFrames - 4} layout="none">
                  <Audio
                    src={A("erupcion.wav")}
                    trimBefore={f(0.6)}
                    volume={(fr) => interpolate(fr, [0, 4, 40, 52], [0, 0.9, 0.9, 0], {extrapolateRight: "clamp"})}
                  />
                </Sequence>
              </>
            ) : null}
          </Sequence>
        );
      })}

      <Sequence from={VOICE_FRAMES} durationInFrames={f(CTA_SECONDS)} name="CTA">
        <Clip src="b3165.mp4" from={2.5} zoom={0.06} dur={f(CTA_SECONDS)} />
        <Audio
          src={A("erupcion.wav")}
          trimBefore={f(2.5)}
          volume={(fr) => interpolate(fr, [0, 8, f(CTA_SECONDS) - 15, f(CTA_SECONDS)], [0, 0.55, 0.55, 0], {extrapolateRight: "clamp"})}
        />
        <CTA />
      </Sequence>

      <Progress />
    </AbsoluteFill>
  );
};
