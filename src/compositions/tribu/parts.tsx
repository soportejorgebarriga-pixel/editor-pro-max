import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {BRAND} from "./brand";

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

/** Montserrat 900 caps ≈ 0.74em per glyph: shrink the size so the longest line fits `width`. */
const fitSize = (text: string, max: number, width: number) => {
  const longest = Math.max(...text.split("\n").map((l) => l.length));
  return Math.min(max, Math.floor(width / (0.74 * longest)));
};

/** Subtle continuous push-in plus spring "punches" on key words. */
export const PunchZoom: React.FC<{
  duration: number;
  punches?: number[];
  base?: [number, number];
  entryPunch?: boolean;
  children: React.ReactNode;
}> = ({duration, punches = [], base = [1.03, 1.09], entryPunch, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  let scale = interpolate(frame, [0, duration], base, clamp);
  for (const p of punches) {
    if (frame >= p) scale += 0.05 * spring({frame: frame - p, fps, config: {damping: 14, stiffness: 180}});
  }
  if (entryPunch) {
    scale += interpolate(spring({frame, fps, config: {damping: 18, stiffness: 200}}), [0, 1], [0.1, 0]);
  }
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: "50% 38%"}}>{children}</AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(180deg, rgba(11,29,58,0.55) 0%, rgba(11,29,58,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)",
    }}
  />
);

/**
 * Two-layer talking-head clip: the full video at the back, `behind` graphics in the middle,
 * then a transparent cut-out of Jorge (same zoom) on top — titles never cover his face.
 * The cut-out layer is only mounted for frames [0, cutoutUntil).
 */
export const LayeredClip: React.FC<{
  clip: string;
  trimFrames: number;
  duration: number;
  punches?: number[];
  base?: [number, number];
  entryPunch?: boolean;
  volume?: (f: number) => number;
  cutoutUntil?: number;
  /** Person cut-out on top of `behind`. Off by default: the dark wall map behind Jorge's dark
   * hair makes segmentation leak map pieces over the titles, so titles sit ABOVE his head instead. */
  useCutout?: boolean;
  behind?: React.ReactNode;
  front?: React.ReactNode;
}> = ({clip, trimFrames, duration, punches, base, entryPunch, volume, cutoutUntil, useCutout = false, behind, front}) => {
  const zoom = {duration, punches, base, entryPunch};
  return (
    <AbsoluteFill>
      <PunchZoom {...zoom}>
        <OffthreadVideo src={staticFile(`assets/enhanced/${clip}.mp4`)} trimBefore={trimFrames} volume={volume} />
      </PunchZoom>
      <Vignette />
      {behind}
      {useCutout ? (
        <Sequence durationInFrames={cutoutUntil ?? duration} name="Jorge recortado (capa frontal)">
          <PunchZoom {...zoom}>
            <OffthreadVideo src={staticFile(`assets/cutout/${clip}.webm`)} trimBefore={trimFrames} transparent muted />
          </PunchZoom>
        </Sequence>
      ) : null}
      {front}
    </AbsoluteFill>
  );
};

/**
 * Navy panel at the top of the frame. It is tall on purpose: its lower part sits behind Jorge's
 * head, so the head "pops out" of it. All text lives in the upper area, above the head.
 */
export const BehindPanel: React.FC<{
  from: number;
  to: number;
  children: React.ReactNode;
  shine?: boolean;
}> = ({from, to, children, shine}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = frame - from;
  if (f < 0 || frame >= to) return null;
  const enter = spring({frame: f, fps, config: {damping: 15, stiffness: 160}});
  const exit = interpolate(frame, [to - 7, to], [1, 0], clamp);
  const shineX = interpolate(f, [8, 30], [-120, 220], clamp);
  return (
    <AbsoluteFill style={{alignItems: "center", pointerEvents: "none"}}>
      <div
        style={{
          marginTop: 130,
          width: 900,
          padding: "30px 50px 28px",
          boxSizing: "border-box",
          borderRadius: 34,
          background: BRAND.navyGlass,
          border: "2px solid rgba(230,191,138,0.45)",
          borderBottom: `6px solid ${BRAND.gold}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          overflow: "hidden",
          position: "relative",
          textAlign: "center",
          opacity: enter * exit,
          transform: `translateY(${interpolate(enter, [0, 1], [-60, 0])}px) scale(${interpolate(enter, [0, 1], [0.88, 1])})`,
        }}
      >
        {children}
        {shine ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${shineX}%`,
              width: "35%",
              background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.18), transparent)",
            }}
          />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const goldText: React.CSSProperties = {
  background: `linear-gradient(180deg, ${BRAND.goldLight}, ${BRAND.goldDeep})`,
  WebkitBackgroundClip: "text",
  color: "transparent",
};

/** Kicker / big gold title / sub-line, sized to stay in the panel's upper 300px. */
export const PanelText: React.FC<{
  kicker?: string;
  title: string;
  sub?: string;
  titleSize?: number;
  live?: boolean;
  delay?: number;
}> = ({kicker, title, sub, titleSize = 112, live, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - delay - 5, fps, config: {damping: 13, stiffness: 170}});
  const blink = live ? 0.55 + 0.45 * Math.abs(Math.sin(frame / 9)) : 0;
  return (
    <>
      {kicker ? (
        <div
          style={{
            fontFamily: BRAND.font,
            fontWeight: 800,
            fontSize: 46,
            letterSpacing: 3,
            color: BRAND.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {live ? (
            <span
              style={{width: 26, height: 26, borderRadius: 13, background: "#FF3B3B", opacity: blink, display: "inline-block"}}
            />
          ) : null}
          {kicker}
        </div>
      ) : null}
      <div
        style={{
          ...goldText,
          fontFamily: BRAND.font,
          fontWeight: 900,
          fontSize: fitSize(title, titleSize, 790),
          lineHeight: 1.02,
          letterSpacing: -2,
          marginTop: 6,
          whiteSpace: "pre",
          transform: `scale(${interpolate(pop, [0, 1], [0.7, 1])})`,
          opacity: pop,
        }}
      >
        {title}
      </div>
      {sub ? (
        <div style={{fontFamily: BRAND.font, fontWeight: 600, fontSize: 40, color: BRAND.white, marginTop: 10, opacity: pop}}>
          {sub}
        </div>
      ) : null}
    </>
  );
};

export const LogoInPanel: React.FC = () => (
  <Img src={staticFile("assets/brand/logo-tribu.png")} style={{width: 560, display: "block", margin: "0 auto"}} />
);

/** Full-screen b-roll moment: blurred backdrop + framed clip + headline. */
export const BrollCard: React.FC<{
  src: string;
  duration: number;
  title: string;
  sub?: string;
  live?: boolean;
  playbackRate?: number;
}> = ({src, duration, title, sub, live, playbackRate = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 16, stiffness: 190}});
  const exit = interpolate(frame, [duration - 5, duration], [1, 0], clamp);
  const zoom = interpolate(frame, [0, duration], [1.0, 1.08], clamp);
  const titlePop = spring({frame: frame - 3, fps, config: {damping: 13, stiffness: 170}});
  const blink = live ? 0.55 + 0.45 * Math.abs(Math.sin(frame / 9)) : 0;
  const video = staticFile(src);
  return (
    <AbsoluteFill style={{opacity: exit}}>
      <AbsoluteFill style={{opacity: enter}}>
        <AbsoluteFill style={{transform: "scale(1.4)", filter: "blur(38px) brightness(0.55)"}}>
          <OffthreadVideo src={video} muted playbackRate={playbackRate} style={{width: "100%", height: "100%", objectFit: "cover"}} />
        </AbsoluteFill>
        <AbsoluteFill style={{background: "rgba(11,29,58,0.62)"}} />
      </AbsoluteFill>

      <AbsoluteFill style={{alignItems: "center"}}>
        <div
          style={{
            marginTop: 250,
            textAlign: "center",
            transform: `translateY(${interpolate(titlePop, [0, 1], [-40, 0])}px) scale(${interpolate(titlePop, [0, 1], [0.8, 1])})`,
            opacity: titlePop,
          }}
        >
          <div style={{...goldText, fontFamily: BRAND.font, fontWeight: 900, fontSize: fitSize(title, 116, 960), lineHeight: 1, letterSpacing: -2, whiteSpace: "pre"}}>
            {title}
          </div>
          {sub ? (
            <div
              style={{
                fontFamily: BRAND.font,
                fontWeight: 700,
                fontSize: 46,
                color: BRAND.white,
                marginTop: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
              }}
            >
              {live ? <span style={{width: 24, height: 24, borderRadius: 12, background: "#FF3B3B", opacity: blink}} /> : null}
              {sub}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
        <div
          style={{
            width: 1000,
            marginTop: 120,
            borderRadius: 28,
            overflow: "hidden",
            border: `4px solid ${BRAND.gold}`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
            transform: `scale(${interpolate(enter, [0, 1], [0.86, 1])})`,
            opacity: enter,
          }}
        >
          <div style={{transform: `scale(${zoom})`}}>
            <OffthreadVideo src={video} muted playbackRate={playbackRate} style={{width: "100%", display: "block"}} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<{cta: string}> = ({cta}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 15, stiffness: 150}});
  const b = spring({frame: frame - 8, fps, config: {damping: 12, stiffness: 170}});
  const pulse = 1 + 0.035 * Math.sin((frame / fps) * Math.PI * 2.2);
  const fadeIn = interpolate(frame, [0, 6], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 40%, #16305C 0%, ${BRAND.navy} 65%)`,
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
      }}
    >
      <Img
        src={staticFile("assets/brand/logo-tribu.png")}
        style={{width: 860, opacity: a, transform: `translateY(${interpolate(a, [0, 1], [40, 0])}px)`}}
      />
      <div
        style={{
          marginTop: 90,
          padding: "30px 70px",
          borderRadius: 999,
          background: `linear-gradient(180deg, ${BRAND.goldLight}, ${BRAND.goldDeep})`,
          fontFamily: BRAND.font,
          fontWeight: 900,
          fontSize: 72,
          color: BRAND.navy,
          letterSpacing: 1,
          opacity: b,
          transform: `scale(${interpolate(b, [0, 1], [0.6, 1]) * pulse})`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        ESCRIBE “{cta}”
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: BRAND.font,
          fontWeight: 700,
          fontSize: 52,
          color: BRAND.white,
          opacity: b,
        }}
      >
        y recibe <span style={{color: BRAND.goldLight}}>7 días gratis</span>
      </div>
    </AbsoluteFill>
  );
};
