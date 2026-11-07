import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {TransitionSeries, linearTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";

// ---------- Marca Arbat ----------
const GUINDA = "#55222D";
const CREAM = "#F7F2EC";
const SERIF = "'Schola', 'Century Schoolbook', serif";
const SANS = "'Questrial', 'Century Gothic', sans-serif";
const FPS = 30;
const XF = 6; // fundido corto entre tomas
const XF_END = 10;

// ---------- Fuentes ----------
let fontsPromise: Promise<void> | null = null;
const loadFonts = () => {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      [
        new FontFace("Schola", `url(${staticFile("fonts/texgyreschola-regular.otf")})`),
        new FontFace("Schola", `url(${staticFile("fonts/texgyreschola-italic.otf")})`, {style: "italic"}),
        new FontFace("Questrial", `url(${staticFile("fonts/Questrial-Regular.ttf")})`),
      ].map((f) => f.load().then((ff) => void document.fonts.add(ff))),
    ).then(() => undefined);
  }
  return fontsPromise;
};
const useFonts = () => {
  const [handle] = React.useState(() => delayRender("Fuentes Arbat", {timeoutInMilliseconds: 120000}));
  React.useEffect(() => {
    loadFonts()
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const easeOut = Easing.out(Easing.cubic);

// ---------- Tomas (clip, segundo de entrada, duración en cuadros) ----------
type Shot = {clip: string; from: number; frames: number};
const SHOTS: Shot[] = [
  {clip: "2113", from: 0.8, frames: 90}, // gancho: manos formando en azúcar
  {clip: "2944", from: 2.0, frames: 75}, // amasado desde arriba
  {clip: "2945", from: 1.0, frames: 60}, // manos en la masa
  {clip: "2112", from: 4.0, frames: 75}, // formando junto a la charola
  {clip: "2114", from: 9.5, frames: 66}, // primer plano en azúcar
  {clip: "2110", from: 1.0, frames: 75}, // charolas llenas (en lugar del horno)
  {clip: "2088", from: 11.8, frames: 84}, // equipo: pesa
  {clip: "2946", from: 2.0, frames: 90}, // equipo: amasa
  {clip: "2109", from: 6.5, frames: 90}, // equipo: forma
  {clip: "2114", from: 13.0, frames: 70}, // cierre: manos
];
const END_FRAMES = 96;

// inicio global de cada toma (descontando los fundidos)
const STARTS: number[] = [];
{
  let t = 0;
  SHOTS.forEach((s, i) => {
    STARTS.push(t);
    t += s.frames - (i < SHOTS.length - 1 ? XF : XF_END);
  });
  STARTS.push(t); // inicio de la tarjeta final
}
export const ARBAT_TOTAL = STARTS[SHOTS.length] + END_FRAMES;

// ---------- Toma con empuje lento ----------
const ShotView: React.FC<{shot: Shot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, shot.frames], [1.0, 1.045], clamp);
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`}}>
      <OffthreadVideo
        src={staticFile(`assets/arbat/sdr/IMG_${shot.clip}.mp4`)}
        trimBefore={Math.round(shot.from * FPS)}
        style={{width: 1080, height: 1920}}
      />
    </AbsoluteFill>
  );
};

// ---------- Gancho ----------
const HOOK = ["Esta parte de Arbat", "no siempre sale", "en las fotos."];
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const out = interpolate(frame, [SHOTS[0].frames - XF - 12, SHOTS[0].frames - XF], [1, 0], clamp);
  if (out <= 0) return null;
  const card = interpolate(t, [0, 0.25], [0, 1], {...clamp, easing: easeOut});
  return (
    <div
      style={{
        position: "absolute",
        top: 300,
        left: 540,
        transform: `translateX(-50%) translateY(${(1 - card) * 20}px)`,
        opacity: card * out,
        background: "rgba(85,34,45,0.88)",
        borderRadius: 6,
        padding: "40px 64px 34px",
        textAlign: "center",
        whiteSpace: "nowrap",
      }}
    >
      {HOOK.map((l, i) => {
        const p = interpolate(t, [0.1 + i * 0.12, 0.45 + i * 0.12], [0, 1], {...clamp, easing: easeOut});
        return (
          <div
            key={i}
            style={{
              fontFamily: SERIF,
              fontStyle: i === 2 ? "italic" : "normal",
              fontSize: 76,
              lineHeight: 1.18,
              letterSpacing: 1,
              color: CREAM,
              opacity: p,
              transform: `translateY(${(1 - p) * 16}px)`,
            }}
          >
            {l}
          </div>
        );
      })}
      <div
        style={{
          margin: "22px auto 0",
          width: interpolate(t, [0.5, 1.0], [0, 220], {...clamp, easing: easeOut}),
          height: 3,
          background: CREAM,
          borderRadius: 2,
        }}
      />
    </div>
  );
};

// ---------- Textos inferiores ----------
type Caption = {from: number; to: number; text: string; kicker?: string};
const s = (i: number) => STARTS[i];
const CAPTIONS: Caption[] = [
  {from: s(1) + 4, to: s(3) - 2, text: "Manos que madrugan,"},
  {from: s(3) + 4, to: s(5) - 2, text: "que forman, una por una,"},
  {from: s(5) + 4, to: s(6) - 2, text: "y llenan cada charola."},
  {from: s(6) + 6, to: s(7) - 2, text: "Pesa cada ingrediente.", kicker: "NUESTRO EQUIPO"},
  {from: s(7) + 6, to: s(8) - 2, text: "Amasa desde temprano.", kicker: "NUESTRO EQUIPO"},
  {from: s(8) + 6, to: s(9) - 2, text: "Forma cada campechana.", kicker: "NUESTRO EQUIPO"},
  {from: s(9) + 6, to: s(10) - 4, text: "Hoy les toca salir en la foto."},
];

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const c = CAPTIONS.find((x) => frame >= x.from && frame < x.to);
  if (!c) return null;
  const pin = interpolate(frame, [c.from, c.from + 9], [0, 1], {...clamp, easing: easeOut});
  const pout = interpolate(frame, [c.to - 7, c.to], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 480,
        bottom: 1920 - 1335,
        transform: `translateX(-50%) translateY(${(1 - pin) * 14}px)`,
        opacity: pin * pout,
        background: "rgba(85,34,45,0.85)",
        borderRadius: 6,
        padding: c.kicker ? "20px 44px 26px" : "22px 44px 26px",
        textAlign: "center",
        whiteSpace: "nowrap",
      }}
    >
      {c.kicker ? (
        <div style={{fontFamily: SANS, fontSize: 28, letterSpacing: 8, color: CREAM, opacity: 0.85, marginBottom: 8}}>
          {c.kicker}
        </div>
      ) : null}
      <div style={{fontFamily: SERIF, fontStyle: "italic", fontSize: 62, lineHeight: 1.15, color: CREAM}}>
        {c.text}
      </div>
    </div>
  );
};

// ---------- Tarjeta final ----------
const Heart: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: "inline-block", verticalAlign: "-0.08em"}}>
    <path
      d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.8 6.6 4.8c2.1 0 3.6 1.2 4.4 2.6.8-1.4 2.3-2.6 4.4-2.6 3.6 0 5.7 3.6 4.2 7-2.1 4.6-9.6 9.2-9.6 9.2z"
      fill="#E9B7A6"
    />
  </svg>
);

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const enter = (start: number, dist = 18) => {
    const p = interpolate(t, [start, start + 0.5], [0, 1], {...clamp, easing: easeOut});
    return {opacity: p, transform: `translateY(${(1 - p) * dist}px)`};
  };
  return (
    <AbsoluteFill style={{background: GUINDA}}>
      {/* sombreado de marca */}
      <svg width={1080} height={1920} style={{position: "absolute", opacity: 0.07}}>
        {Array.from({length: 26}).map((_, i) => {
          const w = 160 + ((i * 97) % 260);
          return <rect key={i} x={0} y={180 + i * 58} width={w} height={8} rx={4} fill={CREAM} />;
        })}
      </svg>
      <Img
        src={staticFile("assets/arbat/brand/logo_white.png")}
        style={{position: "absolute", width: 600, left: 240, top: 470, ...enter(0.1, 12)}}
      />
      <div style={{position: "absolute", top: 1105, left: 0, width: 1080, textAlign: "center"}}>
        <div style={{fontFamily: SERIF, fontStyle: "italic", fontSize: 64, lineHeight: 1.2, color: CREAM, ...enter(0.6)}}>
          Déjale un mensaje
        </div>
        <div style={{fontFamily: SERIF, fontStyle: "italic", fontSize: 64, lineHeight: 1.2, color: CREAM, ...enter(0.75)}}>
          a nuestro equipo <Heart size={56} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Video ----------
export const ArbatDetrasDelHorno: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: GUINDA}}>
      <TransitionSeries>
        {SHOTS.flatMap((shot, i) => {
          const seq = (
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={shot.frames}>
              <ShotView shot={shot} />
            </TransitionSeries.Sequence>
          );
          const tr = (
            <TransitionSeries.Transition
              key={`t${i}`}
              presentation={fade()}
              timing={linearTiming({durationInFrames: i < SHOTS.length - 1 ? XF : XF_END})}
            />
          );
          return [seq, tr];
        })}
        <TransitionSeries.Sequence durationInFrames={END_FRAMES}>
          <EndCard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Hook />
      <Captions />
    </AbsoluteFill>
  );
};
