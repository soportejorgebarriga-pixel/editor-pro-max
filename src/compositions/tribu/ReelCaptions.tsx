import React, {useMemo} from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {BRAND} from "./brand";
import type {Word} from "./useWords";

type Page = {words: Word[]; startMs: number; endMs: number};

const normalize = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

const buildPages = (words: Word[], maxWords: number): Page[] => {
  const pages: Page[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) pages.push({words: cur, startMs: cur[0].startMs, endMs: cur[cur.length - 1].endMs});
    cur = [];
  };
  words.forEach((w, i) => {
    const prev = words[i - 1];
    if (cur.length && prev && w.startMs - prev.endMs > 450) flush();
    cur.push(w);
    const t = w.text.trim();
    const endsSentence = /[.,?!:;]$/.test(t);
    // never end a page on a short connector ("en", "de", "a", "y"...) — keep it with the next word
    const isConnector = normalize(t).length <= 3 && !endsSentence && i < words.length - 1;
    if (endsSentence || (cur.length >= maxWords && !isConnector) || cur.length >= maxWords + 1) flush();
  });
  flush();
  // each page stays until the next one starts (no flicker in short gaps)
  pages.forEach((p, i) => {
    const next = pages[i + 1];
    p.endMs = next ? Math.min(next.startMs, p.endMs + 600) : p.endMs + 400;
  });
  return pages;
};

export const ReelCaptions: React.FC<{
  words: Word[];
  /** ms of the source clip that corresponds to this sequence's frame 0 */
  clipOffsetMs: number;
  emphasis?: string[];
  maxWords?: number;
  top?: number;
}> = ({words, clipOffsetMs, emphasis = [], maxWords = 4, top = 1390}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nowMs = clipOffsetMs + (frame / fps) * 1000;
  const pages = useMemo(() => buildPages(words, maxWords), [words, maxWords]);
  const emph = useMemo(() => new Set(emphasis.map(normalize)), [emphasis]);

  const page = pages.find((p) => nowMs >= p.startMs && nowMs < p.endMs);
  if (!page) return null;

  const pageFrame = frame - ((page.startMs - clipOffsetMs) / 1000) * fps;
  const pageIn = spring({frame: pageFrame, fps, config: {damping: 16, stiffness: 220}});

  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <div
        style={{
          position: "absolute",
          top,
          left: 70,
          right: 70,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "4px 36px",
          transform: `translateY(${interpolate(pageIn, [0, 1], [24, 0])}px) scale(${interpolate(pageIn, [0, 1], [0.92, 1])})`,
          opacity: pageIn,
        }}
      >
        {page.words.map((w, i) => {
          const active = nowMs >= w.startMs && nowMs < w.endMs;
          const isEmph = emph.has(normalize(w.text));
          const wordFrame = frame - ((w.startMs - clipOffsetMs) / 1000) * fps;
          const pop = active ? spring({frame: wordFrame, fps, config: {damping: 12, stiffness: 260}}) : 0;
          return (
            <span
              key={i}
              style={{
                fontFamily: BRAND.font,
                fontWeight: 900,
                fontSize: isEmph ? 92 : 80,
                lineHeight: 1.12,
                letterSpacing: -1,
                textTransform: "uppercase",
                color: active || isEmph ? BRAND.gold : BRAND.white,
                WebkitTextStroke: "12px rgba(0,0,0,0.92)",
                paintOrder: "stroke fill",
                textShadow: "0 8px 24px rgba(0,0,0,0.55)",
                display: "inline-block",
                transform: `scale(${1 + pop * 0.05})`,
              }}
            >
              {w.text.trim()}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
