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

// All coordinates are in the source image space (1536x1024).
const IMG_W = 1536;
const IMG_H = 1024;

// Route: quadratic bezier that follows the dashed line on the map.
const P0 = {x: 385, y: 203}; // México pin
const C = {x: 470, y: 148}; // control point (arc apex)
const P2 = {x: 578, y: 282}; // Guatemala pin

const MEXICO_PIN = {x: 383, y: 208};
const GUATE_PIN = {x: 580, y: 290};

// Plane sprite (extracted from the original artwork)
const PLANE_W = 262;
const PLANE_H = 140;
const PLANE_BASE_HEADING = -8; // degrees: the drawing's nose points slightly up-right

// Timeline (frames @30fps)
const APPEAR = 15;
const TAKEOFF = 30;
const LAND = 135;
const ARRIVE = LAND + 8;

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
        const r = interpolate(cycle, [0, 42], [6, 46]);
        const o = interpolate(cycle, [0, 42], [0.55, 0]);
        return (
          <circle
            key={delay}
            cx={x}
            cy={y}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={3}
            opacity={o}
          />
        );
      })}
    </>
  );
};

export const VueloMexicoGuatemala: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  // Flight progress along the route
  const t = interpolate(frame, [TAKEOFF, LAND], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const pos = bezier(t);
  const heading = tangentDeg(Math.min(Math.max(t, 0.02), 0.98));

  // Altitude illusion: plane grows while climbing, shrinks when landing
  const altitude = Math.sin(t * Math.PI); // 0 → 1 → 0
  const appear = spring({frame: frame - APPEAR, fps, config: {damping: 12, stiffness: 140}});
  const landed = interpolate(frame, [LAND, ARRIVE + 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const planeScale = (0.26 + 0.24 * altitude) * appear * (0.6 + 0.4 * landed);
  const planeOpacity = Math.min(appear, landed);

  // Shadow drifts further away the higher the plane flies
  const shadowOffset = 6 + 26 * altitude;

  // Trail drawn behind the plane
  const trailDash = ROUTE_LEN * (1 - t);

  // Guatemala pin "bounce" on arrival
  const arrivePop = spring({frame: frame - ARRIVE, fps, config: {damping: 8, stiffness: 180}});
  const guateScale = frame < ARRIVE ? 1 : 1 + 0.18 * Math.sin(arrivePop * Math.PI);

  // Camera: start on the full map, then push in on the route
  const fitScale = Math.min(width / IMG_W, height / IMG_H);
  const push = interpolate(frame, [0, TAKEOFF + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const drift = interpolate(frame, [TAKEOFF + 5, 210], [0, 1], {extrapolateRight: "clamp"});
  const camScale = interpolate(push, [0, 1], [fitScale, 2.4]) + 0.2 * drift;
  const camX = interpolate(push, [0, 1], [IMG_W / 2, 520]);
  const camY = interpolate(push, [0, 1], [IMG_H / 2, 235]);

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
        opacity: shadow ? planeOpacity * 0.12 * (0.4 + 0.6 * (1 - altitude * 0.5)) : planeOpacity,
        filter: shadow ? "brightness(0) blur(3px)" : "drop-shadow(0 2px 2px rgba(0,0,0,0.15))",
      }}
    >
      <Img src={staticFile("assets/avion.png")} style={{width: PLANE_W, height: PLANE_H}} />
    </div>
  );

  return (
    <AbsoluteFill style={{backgroundColor: "#ffffff"}}>
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
        <Img src={staticFile("assets/mapa-sin-avion.png")} style={{width: IMG_W, height: IMG_H}} />

        <svg
          width={IMG_W}
          height={IMG_H}
          style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}
        >
          <PulseRings x={MEXICO_PIN.x} y={MEXICO_PIN.y} start={0} color="#e23b3b" />
          {frame >= ARRIVE && (
            <PulseRings x={GUATE_PIN.x} y={GUATE_PIN.y} start={ARRIVE} color="#e23b3b" />
          )}
          {/* Flown route lights up behind the plane */}
          <path
            d={ROUTE_D}
            fill="none"
            stroke="#ffffff"
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={ROUTE_LEN}
            strokeDashoffset={trailDash}
            opacity={0.9}
          />
          <path
            d={ROUTE_D}
            fill="none"
            stroke="#e23b3b"
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeDasharray={ROUTE_LEN}
            strokeDashoffset={trailDash}
          />
        </svg>

        {/* Guatemala pin pop: re-draw a pin-sized highlight on arrival */}
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
              backgroundImage: `url(${staticFile("assets/mapa-sin-avion.png")})`,
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
