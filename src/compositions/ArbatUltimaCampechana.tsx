import React from "react";
import {
  AbsoluteFill,
  Freeze,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {Audio, Video} from "@remotion/media";

// Arbat — "La última campechana" (Reel 9:16, comunidad / humor)
// Marca: guinda #7C2529, negro #222223, gris #373A36, blanco.
// Fuentes: Century Schoolbook (títulos) + Century Gothic (subtítulos).

const GUINDA = "#7C2529";
const NEGRO = "#222223";
const SCHOOLBOOK = "ArbatSchoolbook";
const GOTHIC = "ArbatGothic";

const fontHandle = delayRender("Cargando fuentes Arbat");
Promise.all([
  new FontFace(SCHOOLBOOK, `url(${staticFile("assets/arbat/SCHLBKB.TTF")})`).load(),
  new FontFace(GOTHIC, `url(${staticFile("assets/arbat/GOTHICB.TTF")})`).load(),
])
  .then((faces) => {
    faces.forEach((f) => document.fonts.add(f));
    continueRender(fontHandle);
  })
  .catch(() => continueRender(fontHandle));

const GRADE: React.CSSProperties = {
  filter: "contrast(1.06) saturate(1.1) sepia(0.06) brightness(1.02)",
};

type ClipProps = {
  src: string;
  fromSec: number;
  durationInFrames: number;
  zoom?: [number, number];
  origin?: string;
  volume?: number;
};

const Clip: React.FC<ClipProps> = ({
  src,
  fromSec,
  durationInFrames,
  zoom = [1, 1],
  origin = "50% 50%",
  volume = 0.35,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], zoom, {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: NEGRO}}>
      <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: origin}}>
        <Video
          src={staticFile(src)}
          trimBefore={Math.round(fromSec * fps)}
          volume={volume}
          style={{width: "100%", height: "100%", objectFit: "cover", ...GRADE}}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Rótulo principal (zona segura 240–640 px). Una palabra de acento en guinda.
const Rotulo: React.FC<{lines: {text: string; accent?: boolean}[]; size?: number; top?: number}> = ({
  lines,
  size = 74,
  top = 300,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{alignItems: "center", paddingTop: top, paddingLeft: 90, paddingRight: 200}}>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 790}}>
        {lines.map((l, i) => {
          const p = spring({frame: frame - i * 6, fps, config: {damping: 16, stiffness: 170}});
          return (
            <div
              key={i}
              style={{
                fontFamily: SCHOOLBOOK,
                fontSize: size,
                lineHeight: 1.08,
                whiteSpace: "nowrap",
                color: "#fff",
                textAlign: "center",
                opacity: p,
                transform: `translateY(${(1 - p) * 40}px)`,
                padding: l.accent ? "6px 26px 12px" : 0,
                backgroundColor: l.accent ? GUINDA : "transparent",
                borderRadius: l.accent ? 10 : 0,
                textShadow: l.accent ? "none" : "0 3px 18px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.7)",
              }}
            >
              {l.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Subtítulo: una línea, Century Gothic, blanco con contorno oscuro.
const Subtitulo: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 4], [0, 1], {extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{justifyContent: "flex-start", alignItems: "center", paddingTop: 1250, paddingRight: 120, paddingLeft: 80}}>
      <div
        style={{
          fontFamily: GOTHIC,
          fontSize: 54,
          color: "#fff",
          opacity: o,
          WebkitTextStroke: `8px ${NEGRO}`,
          paintOrder: "stroke fill",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const FlashBlanco: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 5], [0.85, 0], {extrapolateRight: "clamp"});
  return <AbsoluteFill style={{backgroundColor: "#fff", opacity: o}} />;
};

const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 200}, durationInFrames: 20});
  const t = spring({frame: frame - 14, fps, config: {damping: 200}, durationInFrames: 18});
  return (
    <AbsoluteFill style={{backgroundColor: GUINDA, alignItems: "center", justifyContent: "center"}}>
      <Img
        src={staticFile("assets/arbat/logo-blanco.png")}
        style={{width: 520, opacity: p, transform: `scale(${0.94 + p * 0.06})`, marginTop: -120}}
      />
      <div
        style={{
          fontFamily: GOTHIC,
          color: "#fff",
          fontSize: 46,
          textAlign: "center",
          marginTop: 70,
          width: 760,
          lineHeight: 1.25,
          opacity: t,
          transform: `translateY(${(1 - t) * 20}px)`,
        }}
      >
        Etiqueta al que siempre
        <br />
        se queda con la última 👀
      </div>
    </AbsoluteFill>
  );
};

// ---- Línea de tiempo (30 fps) ----
const S = {
  hook: {from: 0, dur: 78}, // c2106: todos parados, "nadie quiere"
  noGracias: {from: 78, dur: 72}, // c2103: le ofrecen y dice que no
  quedaUna: {from: 150, dur: 66}, // c2103: queda una sola
  manos1: {from: 216, dur: 27}, // c2104 cenital: todas las manos
  manos2: {from: 243, dur: 27}, // c2103 lateral: más manos
  freeze: {from: 270, dur: 39}, // congelado "Ahora sí todos quieren"
  manotazo: {from: 309, dur: 66}, // c2104: manotazo y se la gana
  ganadora: {from: 375, dur: 78}, // c2103: se va con su campechana
  cierre: {from: 453, dur: 75},
};
export const ARBAT_ULTIMA_DURATION = S.cierre.from + S.cierre.dur; // 528 f = 17.6 s

export const ArbatUltimaCampechana: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: NEGRO}}>
      {/* 1. HOOK */}
      <Sequence from={S.hook.from} durationInFrames={S.hook.dur}>
        <Clip src="assets/arbat/c2106.mp4" fromSec={0} durationInFrames={S.hook.dur} zoom={[1.18, 1.1]} origin="50% 55%" />
        <Rotulo lines={[{text: "Cuando todos dicen"}, {text: "que no quieren…", accent: true}]} />
      </Sequence>

      {/* 2. "No, gracias" */}
      <Sequence from={S.noGracias.from} durationInFrames={S.noGracias.dur}>
        <Clip src="assets/arbat/c2103.mp4" fromSec={1.7} durationInFrames={S.noGracias.dur} zoom={[1.15, 1.22]} origin="55% 45%" />
        <Subtitulo text="—¿Campechana? —No, gracias." />
      </Sequence>

      {/* 3. Queda una */}
      <Sequence from={S.quedaUna.from} durationInFrames={S.quedaUna.dur}>
        <Clip src="assets/arbat/c2103.mp4" fromSec={5.6} durationInFrames={S.quedaUna.dur} zoom={[1.3, 1.45]} origin="45% 55%" />
        <Rotulo lines={[{text: "…hasta que"}, {text: "queda UNA.", accent: true}]} />
      </Sequence>

      {/* 4–5. Manos al mismo tiempo, cortes rápidos */}
      <Sequence from={S.manos1.from} durationInFrames={S.manos1.dur}>
        <Clip src="assets/arbat/c2104.mp4" fromSec={2.0} durationInFrames={S.manos1.dur} zoom={[1.25, 1.35]} origin="35% 40%" />
        <FlashBlanco />
      </Sequence>
      <Sequence from={S.manos2.from} durationInFrames={S.manos2.dur}>
        <Clip src="assets/arbat/c2103.mp4" fromSec={8.3} durationInFrames={S.manos2.dur} zoom={[1.4, 1.5]} origin="55% 50%" />
        <FlashBlanco />
      </Sequence>

      {/* 6. Congelado */}
      <Sequence from={S.freeze.from} durationInFrames={S.freeze.dur}>
        <Freeze frame={0}>
          <Clip src="assets/arbat/c2104.mp4" fromSec={2.9} durationInFrames={1} zoom={[1.4, 1.4]} origin="35% 40%" volume={0} />
        </Freeze>
        <FlashBlanco />
        <Rotulo lines={[{text: "Ahora sí"}, {text: "TODOS QUIEREN", accent: true}]} size={84} />
      </Sequence>

      {/* 7. Manotazo */}
      <Sequence from={S.manotazo.from} durationInFrames={S.manotazo.dur}>
        <Clip src="assets/arbat/c2104.mp4" fromSec={3.2} durationInFrames={S.manotazo.dur} zoom={[1.2, 1.3]} origin="35% 45%" />
        <Subtitulo text="Nadie toca la última." />
      </Sequence>

      {/* 8. Ganadora */}
      <Sequence from={S.ganadora.from} durationInFrames={S.ganadora.dur}>
        <Clip src="assets/arbat/c2103.mp4" fromSec={10.4} durationInFrames={S.ganadora.dur} zoom={[1.25, 1.45]} origin="40% 55%" />
        <Rotulo lines={[{text: "Y la ganadora es…"}]} size={72} />
      </Sequence>

      {/* 9. Cierre */}
      <Sequence from={S.cierre.from} durationInFrames={S.cierre.dur}>
        <Cierre />
      </Sequence>

      {/* Audio: música cómica + efectos */}
      <Audio src={staticFile("assets/arbat/music.wav")} volume={0.55} />
      <Sequence from={S.manos1.from}>
        <Audio src={staticFile("assets/arbat/pop.wav")} volume={0.5} />
      </Sequence>
      <Sequence from={S.manos2.from}>
        <Audio src={staticFile("assets/arbat/pop.wav")} volume={0.5} />
      </Sequence>
      <Sequence from={S.freeze.from}>
        <Audio src={staticFile("assets/arbat/scratch.wav")} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
