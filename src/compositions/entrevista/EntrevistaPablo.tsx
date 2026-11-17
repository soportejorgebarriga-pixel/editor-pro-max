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
import {ANTON, DMSANS, EASE, GraphicCue} from "./Graphics";
import {SUBS} from "./subs";
import {
  C,
  CTA_QUESTION,
  FLASHES,
  FPS,
  FRAMINGS,
  GFX,
  Gfx,
  PLACED,
  PlacedSegment,
  ROOM_TONE_SRC,
  SHOTS,
  Shot,
  W,
  H,
  frameToSrc,
  seg,
  srcToFrame,
} from "./timeline";

const VIDEO = staticFile("assets/entrevista_hd.mp4");
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

// ---------- fonts ----------
const useBrandFonts = () => {
  const [handle] = useState(() => delayRender("brand fonts"));
  useEffect(() => {
    const fonts = [
      new FontFace("Anton", `url(${staticFile("fonts/Anton_400Regular.ttf")})`, {weight: "400"}),
      new FontFace("DM Sans", `url(${staticFile("fonts/DMSans_400Regular.ttf")})`, {weight: "400"}),
      new FontFace("DM Sans", `url(${staticFile("fonts/DMSans_500Medium.ttf")})`, {weight: "500 600"}),
      new FontFace("DM Sans", `url(${staticFile("fonts/DMSans_700Bold.ttf")})`, {weight: "700"}),
      new FontFace("DM Sans", `url(${staticFile("fonts/DMSans_800ExtraBold.ttf")})`, {weight: "800 900"}),
    ];
    Promise.all(fonts.map((f) => f.load().then((ff) => document.fonts.add(ff))))
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

// ---------- camera ----------
const shotsFor = (id: PlacedSegment["id"]) => SHOTS.filter((s) => s.seg === id).sort((a, b) => a.src - b.src);

const shotAt = (id: PlacedSegment["id"], src: number): {shot: Shot; start: number; end: number} | null => {
  const list = shotsFor(id);
  for (let i = list.length - 1; i >= 0; i--) {
    if (src >= list[i].src) {
      const end = i + 1 < list.length ? list[i + 1].src : seg(id).srcEnd;
      return {shot: list[i], start: list[i].src, end};
    }
  }
  return list[0] ? {shot: list[0], start: list[0].src, end: list[1]?.src ?? seg(id).srcEnd} : null;
};

/** CSS transform that keeps the frame fully covered. */
const cameraTransform = (frame: number) => {
  const {seg: s, src} = frameToSrc(frame);
  const info = shotAt(s.id, src);
  if (!info) return {transform: "none", blur: 0, bw: false};
  const fr = FRAMINGS[info.shot.f];
  const local = src - info.start;
  const len = Math.max(0.5, info.end - info.start);
  // slow push (Ken Burns) +4% across the shot
  let scale = fr.s * (1 + 0.04 * Math.min(1, local / len));
  let blur = 0;
  if (info.shot.punch) {
    // punch-in +22% in ~0.14 s with motion blur
    const p = interpolate(local, [0, 0.14], [0, 1], {...clamp, easing: EASE});
    scale *= 1 + 0.22 * p;
    blur = p > 0 && p < 1 ? 6 * Math.sin(Math.PI * p) : 0;
  }
  let tx = fr.tx - fr.fx * scale;
  let ty = fr.ty - fr.fy * scale;
  tx = Math.min(0, Math.max(W - W * scale, tx));
  ty = Math.min(0, Math.max(H - H * scale, ty));
  return {transform: `translate(${tx}px, ${ty}px) scale(${scale})`, blur, bw: !!info.shot.bw};
};

const Picture: React.FC<{s: PlacedSegment}> = ({s}) => {
  const frame = useCurrentFrame(); // local to Sequence
  const cam = cameraTransform(s.from + frame);
  const muted = s.audio !== "source";
  // short audio fades at every cut (no clicks, softer transitions)
  const fadeF = 6;
  return (
    <AbsoluteFill style={{overflow: "hidden", background: "#000"}}>
      <div
        style={{
          position: "absolute",
          width: W,
          height: H,
          transformOrigin: "0 0",
          transform: cam.transform,
          filter: `${cam.bw ? "grayscale(1) contrast(1.08)" : ""} ${cam.blur ? `blur(${cam.blur}px)` : ""}`.trim() || undefined,
        }}
      >
        <OffthreadVideo
          src={VIDEO}
          trimBefore={Math.round(s.srcStart * FPS)}
          muted={muted}
          volume={(f) => interpolate(f, [0, fadeF, s.dur - fadeF, s.dur], [0, 1, 1, 0], clamp)}
          style={{width: W, height: H}}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------- captions ----------
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {seg: s, src} = frameToSrc(frame);
  if (s.id === "cta") return null;
  const sub = SUBS.find((x) => src >= x.s && src < x.e + 0.05 && x.s >= s.srcStart - 0.05 && x.s < s.srcEnd);
  if (!sub) return null;
  const local = src - sub.s;
  const p = interpolate(local, [0, 0.16], [0, 1], {...clamp, easing: EASE});
  const words = sub.t.split(" ");
  const kwIdx = sub.kw ? words.findIndex((w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "") === sub.kw!.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")) : -1;
  const lit = sub.kwt !== undefined && src >= sub.kwt;
  const litP = sub.kwt !== undefined ? interpolate(src, [sub.kwt, sub.kwt + 0.12], [0, 1], clamp) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 480,
        top: 1262,
        transform: `translate(-50%, ${(1 - p) * 16}px) scale(${0.94 + 0.06 * p})`,
        opacity: p,
        background: "rgba(14,42,59,0.82)",
        borderRadius: 16,
        padding: "8px 24px 12px",
        whiteSpace: "nowrap",
        fontFamily: DMSANS,
        fontWeight: 500,
        fontSize: 68,
        lineHeight: 1.15,
        color: C.white,
        display: "flex",
        alignItems: "baseline",
        gap: 16,
      }}
    >
      {words.map((w, i) =>
        i === kwIdx ? (
          <span
            key={i}
            style={{
              fontFamily: ANTON,
              fontSize: 88,
              lineHeight: 1,
              textTransform: "uppercase",
              color: lit ? (litP >= 1 ? C.gold : mix(C.white, C.gold, litP)) : C.white,
            }}
          >
            {w}
          </span>
        ) : (
          <span key={i}>{w}</span>
        ),
      )}
    </div>
  );
};

const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
};

// ---------- flash ----------
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 3, 10], [0, 0.9, 0], clamp);
  return <AbsoluteFill style={{background: "#fff", opacity: o}} />;
};

// ---------- closing card ----------
const CtaCard: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const p = (s: number, d = 0.45) => interpolate(t, [s, s + d], [0, 1], {...clamp, easing: EASE});
  const arrow = p(0.9, 0.5);
  const nudge = Math.sin(Math.max(0, t - 1.4) * 6) * 8 * (t > 1.4 ? 1 : 0);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: "blur(22px) brightness(0.8)", transform: "scale(1.12)"}}>
        <OffthreadVideo src={VIDEO} trimBefore={Math.round(143.4 * FPS)} muted style={{width: W, height: H}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: "rgba(14,42,59,0.72)"}} />
      <div style={{position: "absolute", top: 560, left: 80, width: 800}}>
        <div style={{height: 10, width: 200 * p(0.1), background: C.green, borderRadius: 5, marginBottom: 26}} />
        {CTA_QUESTION.map((l, i) => (
          <div key={l} style={{overflow: "hidden"}}>
            <div
              style={{
                transform: `translateY(${(1 - p(0.1 + i * 0.12, 0.5)) * 105}%)`,
                fontFamily: ANTON,
                fontSize: 84,
                lineHeight: 1.12,
                color: i === 2 ? C.gold : C.white,
                whiteSpace: "nowrap",
              }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: 1150,
          left: 300,
          display: "flex",
          alignItems: "center",
          gap: 22,
          opacity: p(0.7),
          transform: `translateX(${nudge}px) scale(${0.9 + 0.1 * p(0.7)})`,
        }}
      >
        <div style={{padding: "20px 36px", borderRadius: 999, background: C.green, fontFamily: DMSANS, fontWeight: 800, fontSize: 48, color: C.white}}>Coméntalo aquí</div>
        <svg width={170} height={120} viewBox="0 0 170 120">
          <path
            d="M6 20 Q 90 10 140 92 M112 84 L142 98 L150 64"
            fill="none"
            stroke={C.white}
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={260}
            strokeDashoffset={260 * (1 - arrow)}
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------- sound design ----------
type Sfx = {at: number; file: string; vol: number};
const buildSfx = (): Sfx[] => {
  const list: Sfx[] = [];
  FLASHES.forEach((f) => {
    list.push({at: f - 4, file: "whoosh", vol: 0.32});
    list.push({at: f, file: "flash", vol: 0.12});
  });
  // B&W entry: camera click
  list.push({at: srcToFrame("main", 110.0), file: "click", vol: 0.25});
  GFX.forEach((c) => {
    const at = srcToFrame(c.seg, c.src);
    const isTitle = c.g.kind === "kinetic";
    list.push({at, file: isTitle ? "thump" : "pop", vol: isTitle ? 0.3 : 0.2});
    if (c.g.kind === "years") {
      for (let i = 0; i < 14; i++) list.push({at: at + 12 + i * 5, file: "tick", vol: 0.1});
    }
  });
  SHOTS.filter((s) => s.punch).forEach((s) => list.push({at: srcToFrame(s.seg, s.src), file: "thump", vol: 0.28}));
  const cta = seg("cta").from;
  list.push({at: cta, file: "whoosh", vol: 0.3}, {at: cta + 21, file: "pop", vol: 0.22});
  return list.filter((x) => x.at >= 0);
};
const SFX = buildSfx();

/** Convert cue-relative timings (given as src seconds) to cue-local seconds. */
const localize = (g: Gfx, src: number): Gfx => {
  switch (g.kind) {
    case "icons":
      return {...g, at: g.at.map((x) => x - src)};
    case "split":
      return {...g, bajaAt: g.bajaAt - src, delegarAt: g.delegarAt - src};
    case "genericSpecific":
      return {...g, specificAt: g.specificAt - src};
    case "checklist":
      return {...g, at: g.at.map((x) => x - src)};
    default:
      return g;
  }
};

export const EntrevistaPablo: React.FC = () => {
  useBrandFonts();
  return (
    <AbsoluteFill style={{background: "#000"}}>
      {/* Picture + dialogue */}
      {PLACED.filter((s) => s.id !== "cta").map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={`video:${s.id}`}>
          <Picture s={s} />
        </Sequence>
      ))}

      {/* Room tone under the muted breath */}
      {PLACED.filter((s) => s.audio === "room").map((s) => (
        <Sequence key={`room-${s.id}`} from={s.from} durationInFrames={s.dur} name="room tone">
          <Audio src={VIDEO} trimBefore={Math.round(ROOM_TONE_SRC * FPS)} volume={(f) => interpolate(f, [0, 8, s.dur - 8, s.dur], [0, 1, 1, 0], clamp)} />
        </Sequence>
      ))}

      {/* Motion graphics */}
      {GFX.map((c, i) => {
        const from = srcToFrame(c.seg, c.src);
        const dur = Math.round(c.dur * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={`gfx:${c.g.kind}`}>
            <GraphicCue g={localize(c.g, c.src)} total={c.dur} zone={c.zone} />
          </Sequence>
        );
      })}

      {/* Subtitles */}
      <Captions />

      {/* Flash transitions */}
      {FLASHES.map((f) => (
        <Sequence key={`flash-${f}`} from={Math.max(0, f - 3)} durationInFrames={12} name="flash">
          <Flash />
        </Sequence>
      ))}

      {/* Closing card */}
      <Sequence from={seg("cta").from} durationInFrames={seg("cta").dur} name="cta">
        <CtaCard dur={seg("cta").dur} />
      </Sequence>

      {/* SFX (always under the voice) */}
      {SFX.map((x, i) => (
        <Sequence key={`sfx-${i}`} from={x.at} durationInFrames={30} name={`sfx:${x.file}`}>
          <Audio src={staticFile(`sfx/${x.file}.wav`)} volume={x.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
