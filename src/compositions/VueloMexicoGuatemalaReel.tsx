import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Vertical (9:16) version for Stories / Reels, with a sea background.
// Coordinates below are in the source map image space (1536x1024).
const IMG_W = 1536;
const IMG_H = 1024;

const P0 = {x: 385, y: 203}; // México pin
const C = {x: 470, y: 148}; // arc control point
const P2 = {x: 578, y: 282}; // Guatemala pin
const MEXICO_PIN = {x: 383, y: 208};
const GUATE_PIN = {x: 580, y: 290};

const PLANE_W = 262;
const PLANE_H = 140;
const PLANE_BASE_HEADING = -8;

// Timeline (30fps, 8s)
const APPEAR = 30;
const TAKEOFF = 42;
const LAND = 160;
const ARRIVE = LAND + 8;
export const VUELO_REEL_DURATION = 240;

const SEA_TOP = "#0a3a66";
const SEA_MID = "#0d6aa3";
const SEA_BOTTOM = "#1593b8";
const ACCENT = "#ff4d4d";

const bezier = (t: number) => {
  const u = 1 - t;
  return {
    x: u * u * P0.x + 2 * u * t * C.x + t * t * P2.x,
    y: u * u * P0.y + 2 * u * t * C.y + t * t * P2.y,
  };
};

const tangentDeg = (t: number) => {
  const dx = 2 * (1 - t) * (C.x - P0.x) + 2 * t * (P2.x - C.x);
  const dy = 2 * (1 - t) * (C.y - P0.y) + 2 * t * (P2.y - C.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

const ROUTE_D = `M ${P0.x} ${P0.y} Q ${C.x} ${C.y} ${P2.x} ${P2.y}`;
const ROUTE_LEN = (() => {
  let len = 0;
  let prev = bezier(0);
  for (let i = 1; i <= 200; i++) {
    const p = bezier(i / 200);
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return len;
})();

// Animated sea: gradient + drifting wave lines + soft light
const Sea: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const rows = 22;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${SEA_TOP} 0%, ${SEA_MID} 55%, ${SEA_BOTTOM} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 30%, rgba(120,220,255,0.25) 0%, rgba(120,220,255,0) 70%)",
        }}
      />
      <svg width={width} height={height} style={{position: "absolute"}}>
        {new Array(rows).fill(0).map((_, i) => {
          const y = (i + 0.5) * (height / rows);
          const amp = 10 + (i % 3) * 4;
          const wl = 260 + (i % 4) * 60;
          const speed = 0.8 + (i % 5) * 0.25;
          const shift = ((frame * speed + i * 97) % wl) - wl;
          let d = `M ${shift} ${y}`;
          for (let x = shift; x <= width + wl; x += wl / 2) {
            const dir = Math.round((x - shift) / (wl / 2)) % 2 === 0 ? -1 : 1;
            d += ` q ${wl / 4} ${dir * amp} ${wl / 2} 0`;
          }
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#ffffff"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={`${40 + (i % 3) * 30} ${120 + (i % 4) * 50}`}
              opacity={0.07 + (i % 3) * 0.03}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const PulseRings: React.FC<{x: number; y: number; start: number; color: string}> = ({
  x,
  y,
  start,
  color,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 14, 28].map((delay) => {
        const f = frame - start - delay;
        if (f < 0) return null;
        const cycle = f % 42;
        return (
          <circle
            key={delay}
            cx={x}
            cy={y}
            r={interpolate(cycle, [0, 42], [6, 48])}
            fill="none"
            stroke={color}
            strokeWidth={3}
            opacity={interpolate(cycle, [0, 42], [0.8, 0])}
          />
        );
      })}
    </>
  );
};

export const VueloMexicoGuatemalaReel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  // Flight
  const t = interpolate(frame, [TAKEOFF, LAND], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const pos = bezier(t);
  const heading = tangentDeg(Math.min(Math.max(t, 0.02), 0.98));
  const altitude = Math.sin(t * Math.PI);
  const appear = spring({frame: frame - APPEAR, fps, config: {damping: 12, stiffness: 140}});
  const landed = interpolate(frame, [LAND, ARRIVE + 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const planeScale = (0.34 + 0.3 * altitude) * appear * (0.6 + 0.4 * landed);
  const planeOpacity = Math.min(appear, landed);
  const shadowOffset = 8 + 34 * altitude;
  const trailDash = ROUTE_LEN * (1 - t);

  const arrivePop = spring({frame: frame - ARRIVE, fps, config: {damping: 8, stiffness: 180}});
  const guateScale = frame < ARRIVE ? 1 : 1 + 0.2 * Math.sin(arrivePop * Math.PI);

  // Camera: whole continent → push in on the route
  const push = interpolate(frame, [0, TAKEOFF], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const drift = interpolate(frame, [TAKEOFF, VUELO_REEL_DURATION], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const camScale = interpolate(push, [0, 1], [1.05, 1.46]) + 0.03 * drift;
  const camX = interpolate(push, [0, 1], [610, 516]);
  const camY = interpolate(push, [0, 1], [372, 245]);

  const PlaneSprite: React.FC<{shadow?: boolean}> = ({shadow}) => (
    <div
      style={{
        position: "absolute",
        left: pos.x - PLANE_W / 2 + (shadow ? shadowOffset * 0.4 : 0),
        top: pos.y - PLANE_H / 2 + (shadow ? shadowOffset : 0),
        width: PLANE_W,
        height: PLANE_H,
        transform: `rotate(${heading - PLANE_BASE_HEADING}deg) scale(${
          shadow ? planeScale * 0.9 : planeScale
        })`,
        opacity: shadow ? planeOpacity * 0.28 : planeOpacity,
        filter: shadow
          ? "brightness(0) blur(4px)"
          : "drop-shadow(0 3px 4px rgba(0,0,0,0.25))",
      }}
    >
      <Img src={staticFile("assets/avion.png")} style={{width: PLANE_W, height: PLANE_H}} />
    </div>
  );

  return (
    <AbsoluteFill>
      <Sea />

      {/* Map + flight, in image space */}
      <div
        style={{
          position: "absolute",
          width: IMG_W,
          height: IMG_H,
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: `translate(${width / 2}px, ${height / 2}px) scale(${camScale}) translate(${-camX}px, ${-camY}px)`,
        }}
      >
        <Img
          src={staticFile("assets/mapa-tierra.png")}
          style={{
            width: IMG_W,
            height: IMG_H,
            filter: "drop-shadow(0 6px 10px rgba(0,20,50,0.45))",
          }}
        />

        <svg
          width={IMG_W}
          height={IMG_H}
          style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}
        >
          <PulseRings x={MEXICO_PIN.x} y={MEXICO_PIN.y} start={0} color={ACCENT} />
          {frame >= ARRIVE && (
            <PulseRings x={GUATE_PIN.x} y={GUATE_PIN.y} start={ARRIVE} color={ACCENT} />
          )}
          <path
            d={ROUTE_D}
            fill="none"
            stroke="#ffffff"
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={ROUTE_LEN}
            strokeDashoffset={trailDash}
          />
          <path
            d={ROUTE_D}
            fill="none"
            stroke={ACCENT}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeDasharray={ROUTE_LEN}
            strokeDashoffset={trailDash}
          />
        </svg>

        {frame >= ARRIVE && (
          <div
            style={{
              position: "absolute",
              left: GUATE_PIN.x - 22,
              top: GUATE_PIN.y - 58,
              width: 44,
              height: 60,
              transformOrigin: "50% 100%",
              transform: `scale(${guateScale})`,
              backgroundImage: `url(${staticFile("assets/mapa-tierra.png")})`,
              backgroundPosition: `-${GUATE_PIN.x - 22}px -${GUATE_PIN.y - 58}px`,
              backgroundSize: `${IMG_W}px ${IMG_H}px`,
            }}
          />
        )}

        <PlaneSprite shadow />
        <PlaneSprite />
      </div>

    </AbsoluteFill>
  );
};
