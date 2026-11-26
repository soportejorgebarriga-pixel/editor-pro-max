import React from "react";
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {Video} from "@remotion/media";

export const BRUJULA_GREEN = "#14F06E";
export const BRUJULA_NAVY = "#1B1A44";

/** Floating card showing @brujula_expeditions' Instagram profile (screen recording) + logo + handle. */
export const BrujulaCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const inP = spring({frame, fps, config: {damping: 15, stiffness: 140}});
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoP = spring({frame: frame - 6, fps, config: {damping: 9, stiffness: 180}});
  const pillP = spring({frame: frame - 12, fps, config: {damping: 13, stiffness: 160}});
  const ring = (frame % 30) / 30;

  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{background: "rgba(0,0,0,0.35)", opacity: inP}} />
      <AbsoluteFill style={{alignItems: "center", paddingTop: 300}}>
        {/* logo */}
        <div style={{position: "relative", width: 190, height: 190, transform: `scale(${logoP})`, zIndex: 2}}>
          <div
            style={{
              position: "absolute",
              inset: -20 - ring * 40,
              borderRadius: "50%",
              border: `6px solid ${BRUJULA_GREEN}`,
              opacity: 1 - ring,
            }}
          />
          <Img
            src={staticFile("assets/volcan/brujula/logo.png")}
            style={{width: 190, height: 190, borderRadius: "50%", boxShadow: "0 10px 40px rgba(0,0,0,0.6)"}}
          />
        </div>
        {/* profile recording card */}
        <div
          style={{
            marginTop: -40,
            width: 960,
            height: 546,
            borderRadius: 36,
            overflow: "hidden",
            border: `6px solid ${BRUJULA_GREEN}`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            background: "white",
            transform: `translateY(${interpolate(inP, [0, 1], [500, 0])}px) rotate(${interpolate(inP, [0, 1], [6, 0])}deg)`,
          }}
        >
          <Video
            src={staticFile("assets/volcan/brujula/perfil.mp4")}
            muted
            playbackRate={1.6}
            style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "top"}}
          />
        </div>
        {/* handle pill */}
        <div
          style={{
            marginTop: 34,
            transform: `scale(${pillP})`,
            background: BRUJULA_NAVY,
            border: `4px solid ${BRUJULA_GREEN}`,
            borderRadius: 999,
            padding: "18px 44px",
            color: "white",
            fontFamily: "VlogMontserrat",
            fontWeight: 900,
            fontSize: 48,
            letterSpacing: 1,
          }}
        >
          <span style={{color: BRUJULA_GREEN}}>@</span>brujula_expeditions
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
