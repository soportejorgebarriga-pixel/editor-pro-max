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
import {BRAND, msToFrames} from "./brand";
import {ReelCaptions} from "./ReelCaptions";
import {useBrandFonts} from "./useBrandFonts";
import {useWords} from "./useWords";

// Segment A: IMG_2320 (the hook question)
const A_TRIM_MS = 300;
const A_END_MS = 9150;
const A_DUR = msToFrames(A_END_MS - A_TRIM_MS);
// Segment B: IMG_2321 opening ("Te voy a invitar... Tribu Finanzas en Acción. Es una membresía")
const B_TRIM_MS = 700;
const B_END_MS = 4350;
const B_DUR = msToFrames(B_END_MS - B_TRIM_MS);

export const HOOK_PREVIEW_DURATION = A_DUR + B_DUR;

const EMPHASIS = ["rumbo", "finanzas", "metas", "2027", "cómo", "Tribu", "Acción"];

/** Subtle continuous push-in plus spring "punches" on key words. */
const PunchZoom: React.FC<{
  punches: number[];
  base?: [number, number];
  entryPunch?: boolean;
  children: React.ReactNode;
}> = ({punches, base = [1.03, 1.09], entryPunch, children}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  let scale = interpolate(frame, [0, durationInFrames], base, {extrapolateRight: "clamp"});
  for (const p of punches) {
    if (frame >= p) {
      const s = spring({frame: frame - p, fps, config: {damping: 14, stiffness: 180}});
      scale += 0.07 * s;
    }
  }
  if (entryPunch) {
    scale += interpolate(spring({frame, fps, config: {damping: 18, stiffness: 200}}), [0, 1], [0.1, 0]);
  }
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: "50% 38%"}}>{children}</AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(180deg, rgba(11,29,58,0.55) 0%, rgba(11,29,58,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)",
    }}
  />
);

const HookHeadline: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 15, stiffness: 160}});
  const exit = interpolate(frame, [duration - 8, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2 = spring({frame: frame - 6, fps, config: {damping: 13, stiffness: 170}});
  return (
    <AbsoluteFill style={{alignItems: "center", pointerEvents: "none"}}>
      <div
        style={{
          marginTop: 235,
          padding: "26px 44px 30px",
          borderRadius: 30,
          background: BRAND.navyGlass,
          borderBottom: `6px solid ${BRAND.gold}`,
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
          textAlign: "center",
          opacity: enter * exit,
          transform: `translateY(${interpolate(enter, [0, 1], [-50, 0])}px) scale(${interpolate(enter, [0, 1], [0.9, 1])})`,
        }}
      >
        <div style={{fontFamily: BRAND.font, fontWeight: 800, fontSize: 58, color: BRAND.white, letterSpacing: -0.5}}>
          ¿TUS FINANZAS VAN
        </div>
        <div
          style={{
            fontFamily: BRAND.font,
            fontWeight: 900,
            fontSize: 96,
            lineHeight: 1.02,
            letterSpacing: -2,
            background: `linear-gradient(180deg, ${BRAND.goldLight}, ${BRAND.goldDeep})`,
            WebkitBackgroundClip: "text",
            color: "transparent",
            transform: `scale(${interpolate(line2, [0, 1], [0.7, 1])})`,
            opacity: line2,
          }}
        >
          SIN RUMBO?
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LogoCard: React.FC<{enterAt: number}> = ({enterAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = frame - enterAt;
  if (f < 0) return null;
  const enter = spring({frame: f, fps, config: {damping: 14, stiffness: 150}});
  const shine = interpolate(f, [8, 30], [-120, 220], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{alignItems: "center", pointerEvents: "none"}}>
      <div
        style={{
          marginTop: 230,
          width: 900,
          padding: "34px 40px",
          borderRadius: 34,
          background: BRAND.navyGlass,
          border: `2px solid rgba(230,191,138,0.55)`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          overflow: "hidden",
          position: "relative",
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [-70, 0])}px) scale(${interpolate(enter, [0, 1], [0.85, 1])})`,
        }}
      >
        <Img src={staticFile("assets/brand/logo-tribu.png")} style={{width: "100%", display: "block"}} />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${shine}%`,
            width: "35%",
            background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.22), transparent)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const TribuHookPreview: React.FC = () => {
  useBrandFonts();
  const wordsA = useWords("captions-IMG_2320.json");
  const wordsB = useWords("captions-IMG_2321.json");

  const local = (ms: number, trim: number) => msToFrames(ms - trim);
  const findMs = (ws: {text: string; startMs: number}[], t: string, fallback: number) =>
    ws.find((w) => w.text.toLowerCase().includes(t))?.startMs ?? fallback;

  const punch2027 = local(findMs(wordsA, "2027", 7100), A_TRIM_MS);
  const punchComo = local(findMs(wordsA, "cómo", 8860), A_TRIM_MS);
  const logoAt = local(findMs(wordsB, "tribu", 2380), B_TRIM_MS);

  return (
    <AbsoluteFill style={{backgroundColor: BRAND.navy}}>
      <Sequence durationInFrames={A_DUR} name="Gancho (IMG_2320)">
        <PunchZoom punches={[punch2027, punchComo]}>
          <OffthreadVideo src={staticFile("assets/enhanced/IMG_2320.mp4")} trimBefore={msToFrames(A_TRIM_MS)} />
        </PunchZoom>
        <Vignette />
        <HookHeadline duration={A_DUR} />
        <ReelCaptions words={wordsA} clipOffsetMs={A_TRIM_MS} emphasis={EMPHASIS} />
      </Sequence>

      <Sequence from={A_DUR} durationInFrames={B_DUR} name="Presentación Tribu (IMG_2321)">
        <PunchZoom punches={[]} base={[1.04, 1.08]} entryPunch>
          <OffthreadVideo
            src={staticFile("assets/enhanced/IMG_2321.mp4")}
            trimBefore={msToFrames(B_TRIM_MS)}
            volume={(f) => interpolate(f, [B_DUR - 8, B_DUR], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}
          />
        </PunchZoom>
        <Vignette />
        <LogoCard enterAt={logoAt} />
        <ReelCaptions words={wordsB} clipOffsetMs={B_TRIM_MS} emphasis={EMPHASIS} />
      </Sequence>
    </AbsoluteFill>
  );
};
