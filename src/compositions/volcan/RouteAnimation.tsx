import React from "react";
import {AbsoluteFill, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from "remotion";

/**
 * Animated night-to-sunrise climb, styled like the México → Guatemala map
 * animation (blue backdrop, orange land, white label boxes with red pins).
 * The sky goes from night to dawn while the clock runs 10:00 PM → 6:00 AM
 * and a hiker dot climbs a zig-zag trail to the Acatenango summit.
 */

const ORANGE = "#F39A3D";
const ORANGE_DARK = "#D9772A";
const PIN_RED = "#E8443A";

// Zig-zag trail up Acatenango (SVG coords, 1080x1920 canvas)
const TRAIL: [number, number][] = [
  [170, 1500],
  [360, 1405],
  [250, 1300],
  [420, 1190],
  [320, 1080],
  [455, 965],
  [380, 860],
  [470, 760],
  [430, 660],
];

const segLens = TRAIL.slice(1).map(([x, y], i) => Math.hypot(x - TRAIL[i][0], y - TRAIL[i][1]));
const TOTAL = segLens.reduce((a, b) => a + b, 0);

const pointAt = (p: number): [number, number] => {
  let d = Math.max(0, Math.min(1, p)) * TOTAL;
  for (let i = 0; i < segLens.length; i++) {
    if (d <= segLens[i]) {
      const t = d / segLens[i];
      return [
        TRAIL[i][0] + (TRAIL[i + 1][0] - TRAIL[i][0]) * t,
        TRAIL[i][1] + (TRAIL[i + 1][1] - TRAIL[i][1]) * t,
      ];
    }
    d -= segLens[i];
  }
  return TRAIL[TRAIL.length - 1];
};

const Pin: React.FC<{x: number; y: number; label: string; sub?: string; show: number; align?: "left" | "right"}> = ({
  x,
  y,
  label,
  sub,
  show,
  align = "right",
}) => {
  const s = Math.max(0, show);
  const boxW = Math.max(label.length, (sub ?? "").length) * 25 + 50;
  const bx = align === "right" ? x + 34 : x - 34 - boxW;
  return (
    <g opacity={Math.min(1, s * 1.5)} transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      <path
        d={`M ${x} ${y} c -22 -30 -34 -46 -34 -64 a 34 34 0 1 1 68 0 c 0 18 -12 34 -34 64 z`}
        fill={PIN_RED}
        stroke="white"
        strokeWidth={5}
      />
      <circle cx={x} cy={y - 64} r={12} fill="white" />
      <rect x={bx} y={y - 118} width={boxW} height={sub ? 112 : 70} rx={16} fill="#0D2440" stroke="white" strokeWidth={3} />
      <text x={bx + 25} y={y - 72} fill="white" fontSize={40} fontWeight={800} fontFamily="VlogMontserrat">
        {label}
      </text>
      {sub ? (
        <text x={bx + 25} y={y - 26} fill={ORANGE} fontSize={36} fontWeight={800} fontFamily="VlogMontserrat">
          {sub}
        </text>
      ) : null}
    </g>
  );
};

export const RouteAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const climbEnd = durationInFrames - 30;
  const p = interpolate(frame, [12, climbEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 1.6),
  });

  // 10 PM → 6 AM (8 h on the clock; he says "como siete horas" of walking)
  const minutes = Math.round(p * 8 * 60);
  const h24 = (22 * 60 + minutes) % (24 * 60);
  const hh = Math.floor(h24 / 60);
  const mm = Math.floor((h24 % 60) / 15) * 15;
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  const clock = `${h12}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`;

  const skyTop = interpolateColors(p, [0, 0.7, 1], ["#050B1F", "#0B2A55", "#2C6FB3"]);
  const skyBottom = interpolateColors(p, [0, 0.6, 1], ["#0B1A3A", "#5B4B7A", "#F7A04B"]);
  const stars = interpolate(p, [0, 0.6], [1, 0], {extrapolateRight: "clamp"});
  const sun = interpolate(p, [0.7, 1], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  const [hx, hy] = pointAt(p);
  const drawn = p * TOTAL;
  const enter = spring({frame, fps, config: {damping: 16, stiffness: 120}});
  const summitPin = spring({frame: frame - climbEnd + 6, fps, config: {damping: 10, stiffness: 160}});
  const fuegoPin = spring({frame: frame - 20, fps, config: {damping: 12, stiffness: 140}});
  const headerIn = spring({frame: frame - 4, fps, config: {damping: 14, stiffness: 160}});

  // Fuego puffs
  const puffs = [0, 1, 2, 3].map((i) => {
    const t = ((frame + i * 14) % 56) / 56;
    return {r: 18 + t * 46, y: 905 - t * 170, x: 860 + Math.sin((frame + i * 20) / 12) * 10, o: (1 - t) * 0.85};
  });

  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${skyTop} 0%, ${skyBottom} 100%)`}}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        {/* stars */}
        {Array.from({length: 40}).map((_, i) => (
          <circle
            key={i}
            cx={(i * 263) % 1080}
            cy={(i * 137) % 760 + 60}
            r={(i % 3) + 1.5}
            fill="white"
            opacity={stars * (0.4 + 0.6 * Math.abs(Math.sin(frame / 9 + i)))}
          />
        ))}
        {/* rising sun glow */}
        <circle cx={980} cy={1180} r={260} fill="#FFD27A" opacity={sun * 0.35} />
        <circle cx={980} cy={1180} r={120} fill="#FFE3A3" opacity={sun * 0.8} />

        <g transform={`translate(165 ${45 + interpolate(enter, [0, 1], [220, 0])}) scale(0.7)`}>
          {/* Volcán de Fuego (behind, right) */}
          {puffs.map((pf, i) => (
            <circle key={i} cx={pf.x} cy={pf.y} r={pf.r} fill="#8A8A8A" opacity={pf.o * interpolate(p, [0, 0.3], [0.4, 1], {extrapolateRight: "clamp"})} />
          ))}
          <polygon points="560,1620 860,905 1180,1620" fill={ORANGE_DARK} stroke="#0D2440" strokeWidth={6} />
          <circle cx={860} cy={908} r={10} fill="#FF4A1C" opacity={0.6 + 0.4 * Math.sin(frame / 4)} />

          {/* Acatenango (front, left) */}
          <polygon points="-40,1640 430,650 520,640 900,1640" fill={ORANGE} stroke="#0D2440" strokeWidth={6} />
          <rect x={-400} y={1600} width={1900} height={1200} fill="#0D2440" />

          {/* trail: full dashed guide + drawn progress */}
          <polyline
            points={TRAIL.map((t) => t.join(",")).join(" ")}
            fill="none"
            stroke="white"
            strokeOpacity={0.35}
            strokeWidth={8}
            strokeDasharray="4 18"
            strokeLinecap="round"
          />
          <polyline
            points={TRAIL.map((t) => t.join(",")).join(" ")}
            fill="none"
            stroke="white"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${drawn} ${TOTAL}`}
          />
          {/* hiker with head-torch glow */}
          <circle cx={hx} cy={hy} r={44} fill="#FFF4C2" opacity={0.25 * (1 - sun)} />
          <circle cx={hx} cy={hy} r={18} fill="white" stroke={PIN_RED} strokeWidth={7} />

          <Pin x={860} y={900} label="Volcán de Fuego" sub="3,763 m" show={fuegoPin} align="left" />
          <Pin x={470} y={650} label="Cumbre Acatenango" sub="3,976 m" show={summitPin} align="right" />
        </g>

        {/* header: clock + hours */}
        <g opacity={headerIn} transform={`translate(0 ${interpolate(headerIn, [0, 1], [-60, 0])})`}>
          <text x={540} y={235} textAnchor="middle" fill="white" fontSize={150} fontFamily="VlogAnton" letterSpacing={3}>
            {clock}
          </text>
          <rect x={210} y={268} width={660} height={84} rx={42} fill={ORANGE} />
          <text x={540} y={326} textAnchor="middle" fill="#0D2440" fontSize={44} fontWeight={900} fontFamily="VlogMontserrat">
            {`${Math.min(7, Math.floor(minutes / 60))} ${Math.min(7, Math.floor(minutes / 60)) === 1 ? "HORA" : "HORAS"} DE CAMINO`}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
