import React from "react";
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from "remotion";

// ── Estilo 1 de Jorge: paleta, tipografía y curvas ──────────────────────────
export const C = {
  green: "#1D9E75",
  navy: "#0E2A3B",
  gold: "#F2C14E",
  white: "#F7F4EE",
};
export const ANTON = "'Anton', 'Impact', sans-serif";
export const DMSANS = "'DM Sans', 'Inter', sans-serif";
export const FPS = 30;

/** Arranque rápido, frenado suave (sin rebote). */
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

export const prog = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    easing: EASE,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Opacidad de entrada/salida de un gráfico entre start y end (frames locales). */
export const inOut = (frame: number, start: number, end: number, fade = 6) =>
  interpolate(frame, [start, start + fade, end - fade, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Banda segura para rótulos: entre 250 y 640 px, nunca en la franja derecha.
export const BAND = {left: 80, width: 800, top: 250};

/** Texto que sale de detrás de una línea invisible. */
export const Reveal: React.FC<{
  at: number;
  children: React.ReactNode;
  dur?: number;
  style?: React.CSSProperties;
  out?: number;
}> = ({at, children, dur = 10, style, out}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, dur);
  const o = out === undefined ? 0 : prog(frame, out, 8);
  return (
    <div style={{overflow: "hidden", ...style}}>
      <div style={{transform: `translateY(${(1 - p) * 110 - o * 110}%)`}}>
        {children}
      </div>
    </div>
  );
};

/** Palabra clave que se enciende en dorado cuando se dice. */
export const GoldWord: React.FC<{at: number; children: React.ReactNode}> = ({
  at,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span style={{color: p > 0.5 ? C.gold : C.white, transition: "none"}}>
      {children}
    </span>
  );
};

/** Barra verde bajo los títulos. */
export const GreenBar: React.FC<{at: number; width?: number}> = ({
  at,
  width = 140,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 10);
  return (
    <div
      style={{
        height: 8,
        width: width * p,
        background: C.green,
        borderRadius: 4,
        marginTop: 14,
      }}
    />
  );
};

/** Tarjeta de vidrio esmerilado. */
export const Glass: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({children, style}) => (
  <div
    style={{
      background: "rgba(14,42,59,0.66)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1.5px solid rgba(247,244,238,0.22)",
      borderRadius: 30,
      boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
      padding: "30px 40px",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Contenedor de gráfico en la banda segura con aparición y salida. */
export const InBand: React.FC<{
  start: number;
  end: number;
  children: React.ReactNode;
  top?: number;
  align?: "left" | "center";
}> = ({start, end, children, top = BAND.top, align = "center"}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > end) return null;
  const p = prog(frame, start, 10);
  const o = inOut(frame, start, end, 6);
  return (
    <div
      style={{
        position: "absolute",
        left: BAND.left,
        width: BAND.width,
        top,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        opacity: o,
        transform: `translateY(${(1 - p) * 26}px) scale(${0.96 + p * 0.04})`,
        transformOrigin: "50% 0%",
      }}
    >
      {children}
    </div>
  );
};

/** Círculo verde con palomita que se dibuja sola. */
export const Check: React.FC<{at: number; size?: number}> = ({
  at,
  size = 52,
}) => {
  const frame = useCurrentFrame();
  const ring = prog(frame, at, 8);
  const tick = prog(frame, at + 4, 8);
  const r = size / 2 - 3;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill={ring > 0.95 ? C.green : "none"}
        stroke={C.green}
        strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - ring)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <path
        d={`M ${size * 0.28} ${size * 0.52} L ${size * 0.44} ${size * 0.67} L ${size * 0.73} ${size * 0.36}`}
        fill="none"
        stroke={C.white}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - tick}
      />
    </svg>
  );
};

/** Lista con palomitas: la tarjeta crece con cada punto. */
export const CheckList: React.FC<{
  start: number;
  end: number;
  title: string;
  items: {text: string; at: number}[];
  fontSize?: number;
  rowH?: number;
}> = ({start, end, title, items, fontSize = 58, rowH = 74}) => {
  const frame = useCurrentFrame();
  const shown = items.filter((it) => frame >= it.at);
  const grow = items.reduce(
    (acc, it) => acc + prog(frame, it.at, 9) * rowH,
    0,
  );
  return (
    <InBand start={start} end={end}>
      <Glass style={{width: 640, paddingTop: 26, paddingBottom: 22}}>
        <div
          style={{
            fontFamily: DMSANS,
            fontWeight: 700,
            fontSize: 38,
            letterSpacing: 3,
            color: C.white,
            opacity: 0.85,
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        <div style={{height: grow, overflow: "hidden", marginTop: 6}}>
          {shown.map((it) => {
            const p = prog(frame, it.at, 9);
            return (
              <div
                key={it.text}
                style={{
                  height: rowH,
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  opacity: p,
                  transform: `translateX(${(1 - p) * -24}px)`,
                }}
              >
                <Check at={it.at} />
                <span
                  style={{
                    fontFamily: ANTON,
                    fontSize,
                    color: C.white,
                    textTransform: "uppercase",
                    lineHeight: 1,
                  }}
                >
                  {it.text}
                </span>
              </div>
            );
          })}
        </div>
      </Glass>
    </InBand>
  );
};

/** Título grande en Anton, línea por línea, con barra verde. */
export const KineticTitle: React.FC<{
  start: number;
  end: number;
  lines: {text: React.ReactNode; at: number}[];
  fontSize?: number;
  barAt?: number;
}> = ({start, end, lines, fontSize = 118, barAt}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > end) return null;
  const o = inOut(frame, start, end, 5);
  return (
    <div
      style={{
        position: "absolute",
        left: BAND.left,
        width: BAND.width,
        top: BAND.top + 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: o,
      }}
    >
      {lines.map((l, i) => (
        <Reveal key={i} at={l.at} style={{marginTop: i === 0 ? 0 : -6}}>
          <div
            style={{
              fontFamily: ANTON,
              fontSize,
              lineHeight: 1.08,
              color: C.white,
              textTransform: "uppercase",
              textAlign: "center",
              whiteSpace: "nowrap",
              textShadow: "0 6px 24px rgba(0,0,0,0.45)",
            }}
          >
            {l.text}
          </div>
        </Reveal>
      ))}
      <GreenBar at={barAt ?? lines[lines.length - 1].at + 6} />
    </div>
  );
};

/** Pantalla negra con una sola frase (corte total). */
export const BlackScreen: React.FC<{
  start: number;
  end: number;
  lines: {text: React.ReactNode; at: number}[];
  fontSize?: number;
}> = ({start, end, lines, fontSize = 104}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame >= end) return null;
  return (
    <AbsoluteFill
      style={{
        background: "#050607",
        justifyContent: "center",
        alignItems: "center",
        paddingRight: 120,
      }}
    >
      <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
        {lines.map((l, i) => (
          <Reveal key={i} at={l.at} dur={8}>
            <div
              style={{
                fontFamily: ANTON,
                fontSize,
                lineHeight: 1.12,
                color: C.white,
                textTransform: "uppercase",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {l.text}
            </div>
          </Reveal>
        ))}
        <GreenBar at={lines[lines.length - 1].at + 5} width={120} />
      </div>
    </AbsoluteFill>
  );
};

/** Crédito de persona: barra verde vertical + nombre y cargo. */
export const Credit: React.FC<{
  start: number;
  end: number;
  name: string;
  role: string;
}> = ({start, end, name, role}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > end) return null;
  const bar = prog(frame, start, 9);
  const o = inOut(frame, start, end, 6);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 1090,
        display: "flex",
        gap: 20,
        opacity: o,
      }}
    >
      <div
        style={{
          width: 8,
          height: 104 * bar,
          background: C.green,
          borderRadius: 4,
          alignSelf: "flex-start",
        }}
      />
      <div
        style={{
          background: "rgba(14,42,59,0.72)",
          backdropFilter: "blur(10px)",
          borderRadius: 14,
          padding: "12px 22px",
        }}
      >
        <Reveal at={start + 4}>
          <div style={{fontFamily: DMSANS, fontWeight: 700, fontSize: 48, color: C.white}}>
            {name}
          </div>
        </Reveal>
        <Reveal at={start + 8}>
          <div
            style={{
              fontFamily: DMSANS,
              fontWeight: 500,
              fontSize: 32,
              color: C.white,
              opacity: 0.86,
            }}
          >
            {role}
          </div>
        </Reveal>
      </div>
    </div>
  );
};

/** Bandera pequeña justo encima del subtítulo. */
export const Flag: React.FC<{start: number; end: number; src: string; label: string}> = ({
  start,
  end,
  src,
  label,
}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > end) return null;
  const p = prog(frame, start, 8);
  const o = inOut(frame, start, end, 5);
  return (
    <div
      style={{
        position: "absolute",
        left: 480 - 130,
        width: 260,
        top: 1130,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        opacity: o,
        transform: `scale(${0.8 + 0.2 * p})`,
      }}
    >
      <img
        src={src}
        style={{
          width: 84,
          height: 63,
          borderRadius: 10,
          objectFit: "cover",
          boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
          border: "2px solid rgba(247,244,238,0.8)",
        }}
      />
      <span
        style={{
          fontFamily: DMSANS,
          fontWeight: 700,
          fontSize: 40,
          color: C.white,
          textShadow: "0 3px 12px rgba(0,0,0,0.6)",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ── Explainers hechos con código ───────────────────────────────────────────

/** Pantalla dividida CIENCIA ✓ / NEGOCIO ✗. */
export const SplitCompare: React.FC<{
  start: number;
  end: number;
  leftAt: number;
  rightAt: number;
}> = ({start, end, leftAt, rightAt}) => {
  const frame = useCurrentFrame();
  const line = prog(frame, start + 2, 12);
  const xP = prog(frame, rightAt + 3, 8);
  const col = (at: number, label: string, sub: string, good: boolean) => {
    const p = prog(frame, at, 10);
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          opacity: p,
          transform: `translateY(${(1 - p) * 20}px)`,
        }}
      >
        {good ? (
          <Check at={at + 2} size={74} />
        ) : (
          <svg width={74} height={74} viewBox="0 0 74 74">
            <circle cx={37} cy={37} r={33} fill="none" stroke="rgba(247,244,238,0.55)" strokeWidth={5} />
            <path
              d="M 25 25 L 49 49 M 49 25 L 25 49"
              stroke={C.white}
              strokeWidth={6}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - xP}
            />
          </svg>
        )}
        <div style={{fontFamily: ANTON, fontSize: 70, color: C.white, lineHeight: 1}}>{label}</div>
        <div
          style={{
            fontFamily: DMSANS,
            fontWeight: 500,
            fontSize: 32,
            color: C.white,
            opacity: good ? 0.85 : 0.6,
          }}
        >
          {sub}
        </div>
      </div>
    );
  };
  return (
    <InBand start={start} end={end}>
      <Glass style={{width: 720, display: "flex", alignItems: "stretch", padding: "34px 20px"}}>
        {col(leftAt, "CIENCIA", "Lo que sí estudiamos", true)}
        <div
          style={{
            width: 4,
            background: C.green,
            borderRadius: 2,
            transform: `scaleY(${line})`,
            boxShadow: `0 0 14px ${C.green}`,
          }}
        />
        {col(rightAt, "NEGOCIO", "Lo que descuidamos", false)}
      </Glass>
    </InBand>
  );
};

/** Balanza que se inclina: la ciencia pesa, el negocio queda arriba. */
export const Balance: React.FC<{start: number; end: number; tiltAt: number}> = ({
  start,
  end,
  tiltAt,
}) => {
  const frame = useCurrentFrame();
  const tilt = prog(frame, tiltAt, 18) * 13; // izquierda (CIENCIA) baja
  const rad = (tilt * Math.PI) / 180;
  const arm = 230;
  const lx = 360 - arm * Math.cos(rad);
  const ly = 110 - arm * Math.sin(rad) * -1;
  const rx = 360 + arm * Math.cos(rad);
  const ry = 110 + arm * Math.sin(rad) * -1;
  const pan = (x: number, y: number, label: string, bright: boolean) => (
    <g>
      <line x1={x} y1={y} x2={x - 70} y2={y + 110} stroke={C.white} strokeWidth={3} opacity={0.7} />
      <line x1={x} y1={y} x2={x + 70} y2={y + 110} stroke={C.white} strokeWidth={3} opacity={0.7} />
      <path d={`M ${x - 88} ${y + 110} Q ${x} ${y + 160} ${x + 88} ${y + 110} Z`} fill={bright ? C.green : "rgba(247,244,238,0.25)"} />
      <text
        x={x}
        y={y + 100}
        textAnchor="middle"
        fontFamily="Anton"
        fontSize={46}
        fill={C.white}
      >
        {label}
      </text>
    </g>
  );
  return (
    <InBand start={start} end={end}>
      <Glass style={{width: 760, padding: "18px 10px 6px"}}>
        <svg width={740} height={330} viewBox="0 0 720 330">
          <path d="M 360 110 L 320 300 L 400 300 Z" fill="rgba(247,244,238,0.85)" />
          <rect x={290} y={298} width={140} height={12} rx={6} fill={C.white} />
          <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={C.white} strokeWidth={9} strokeLinecap="round" />
          <circle cx={360} cy={110} r={14} fill={C.green} />
          {pan(lx, ly, "CIENCIA", true)}
          {pan(rx, ry, "NEGOCIO", false)}
        </svg>
      </Glass>
    </InBand>
  );
};

/** Celular con notificación de cobro. */
export const PhoneNotif: React.FC<{start: number; end: number; notifAt: number; okAt: number}> = ({
  start,
  end,
  notifAt,
  okAt,
}) => {
  const frame = useCurrentFrame();
  const n = prog(frame, notifAt, 10);
  const ok = prog(frame, okAt, 8);
  return (
    <InBand start={start} end={end} top={240}>
      <div
        style={{
          width: 400,
          height: 390,
          borderRadius: "54px 54px 0 0",
          background: "#0b0f14",
          padding: "14px 14px 0",
          boxSizing: "border-box",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          border: "2px solid rgba(247,244,238,0.25)",
          borderBottom: "none",
          WebkitMaskImage: "linear-gradient(to bottom, black 78%, transparent 100%)",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: "42px 42px 0 0",
            background: `linear-gradient(160deg, #15405a, ${C.navy} 60%)`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{position: "absolute", top: 14, left: 150, width: 100, height: 28, borderRadius: 16, background: "#000"}} />
          <div style={{position: "absolute", top: 60, width: "100%", textAlign: "center", fontFamily: DMSANS, fontWeight: 500, fontSize: 64, color: C.white}}>
            9:41
          </div>
          <div
            style={{
              position: "absolute",
              top: 160,
              left: 16,
              right: 16,
              borderRadius: 22,
              background: "rgba(247,244,238,0.94)",
              padding: "16px 18px",
              display: "flex",
              gap: 14,
              alignItems: "center",
              opacity: n,
              transform: `translateY(${(1 - n) * -40}px)`,
            }}
          >
            <div style={{width: 54, height: 54, borderRadius: 14, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 34, color: C.white}}>
              $
            </div>
            <div style={{flex: 1}}>
              <div style={{fontFamily: DMSANS, fontWeight: 700, fontSize: 26, color: C.navy}}>Pago recibido</div>
              <div style={{fontFamily: DMSANS, fontWeight: 500, fontSize: 22, color: C.navy, opacity: 0.75}}>Consulta médica</div>
            </div>
            <div style={{opacity: ok, transform: `scale(${0.6 + ok * 0.4})`}}>
              <Check at={okAt} size={44} />
            </div>
          </div>
        </div>
      </div>
    </InBand>
  );
};

/** Doctores, médicos, odontólogos… y los números que no cuadran. */
export const NumbersCard: React.FC<{
  start: number;
  end: number;
  chips: {text: string; at: number}[];
  numbersAt: number;
  strikeAt: number;
}> = ({start, end, chips, numbersAt, strikeAt}) => {
  const frame = useCurrentFrame();
  const np = prog(frame, numbersAt, 8);
  const strike = prog(frame, strikeAt, 8);
  const digits = Array.from({length: 6}, (_, i) =>
    frame < strikeAt
      ? Math.floor(random(`d${i}-${Math.floor(frame / 2)}`) * 10)
      : [1, 2, 3, 4, 5, 6][i],
  );
  return (
    <InBand start={start} end={end}>
      <Glass style={{width: 720, display: "flex", flexDirection: "column", alignItems: "center", gap: 22}}>
        <div style={{display: "flex", gap: 14}}>
          {chips.map((c) => {
            const p = prog(frame, c.at, 8);
            return (
              <div
                key={c.text}
                style={{
                  fontFamily: DMSANS,
                  fontWeight: 700,
                  fontSize: 28,
                  color: C.white,
                  border: `2px solid ${C.green}`,
                  borderRadius: 40,
                  padding: "8px 18px",
                  opacity: p,
                  transform: `scale(${0.85 + 0.15 * p})`,
                }}
              >
                {c.text}
              </div>
            );
          })}
        </div>
        <div style={{position: "relative", opacity: np}}>
          <div style={{fontFamily: ANTON, fontSize: 120, color: C.white, letterSpacing: 10, lineHeight: 1, opacity: 1 - strike * 0.45}}>
            {digits.join("")}
          </div>
          <div
            style={{
              position: "absolute",
              left: -10,
              top: "52%",
              height: 10,
              width: `${strike * 105}%`,
              background: C.green,
              borderRadius: 5,
              transform: "rotate(-6deg)",
              boxShadow: `0 0 16px ${C.green}`,
            }}
          />
        </div>
      </Glass>
    </InBand>
  );
};

const Icon: React.FC<{kind: "cross" | "clinic" | "money"}> = ({kind}) => {
  if (kind === "cross")
    return <path d="M -12 -34 h 24 v 22 h 22 v 24 h -22 v 22 h -24 v -22 h -22 v -24 h 22 Z" fill={C.white} />;
  if (kind === "clinic")
    return (
      <g fill="none" stroke={C.white} strokeWidth={5} strokeLinejoin="round">
        <path d="M -34 32 V -10 L 0 -34 L 34 -10 V 32 Z" />
        <path d="M -10 32 V 10 H 10 V 32" />
        <path d="M -6 -14 h 12 M 0 -20 v 12" />
      </g>
    );
  return (
    <text x={0} y={22} textAnchor="middle" fontFamily="Anton" fontSize={64} fill={C.white}>
      $
    </text>
  );
};

/** Unir los puntos: servicio → consultorio → negocio. */
export const ConnectDots: React.FC<{
  start: number;
  end: number;
  nodes: {label: string; at: number; icon: "cross" | "clinic" | "money"}[];
}> = ({start, end, nodes}) => {
  const frame = useCurrentFrame();
  const xs = [130, 400, 670];
  const y = 150;
  const r = 78;
  return (
    <InBand start={start} end={end}>
      <svg width={800} height={330} viewBox="0 0 800 330" style={{overflow: "visible"}}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {nodes.slice(1).map((n, i) => {
          const p = prog(frame, n.at - 6, 14);
          const x1 = xs[i] + r;
          const x2 = xs[i + 1] - r;
          return (
            <path
              key={`l${i}`}
              d={`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y - 70} ${x2} ${y}`}
              fill="none"
              stroke={C.green}
              strokeWidth={6}
              strokeLinecap="round"
              filter="url(#glow)"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - p}
            />
          );
        })}
        {nodes.map((n, i) => {
          const p = prog(frame, n.at, 10);
          const ring = prog(frame, n.at, 14);
          const circ = 2 * Math.PI * r;
          return (
            <g key={n.label} transform={`translate(${xs[i]} ${y})`} opacity={p}>
              <circle r={r} fill="rgba(14,42,59,0.82)" />
              <circle
                r={r}
                fill="none"
                stroke={C.green}
                strokeWidth={7}
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - ring)}
                transform="rotate(-90)"
              />
              <g transform={`scale(${0.7 + 0.3 * p})`}>
                <Icon kind={n.icon} />
              </g>
              <text
                y={r + 62}
                textAnchor="middle"
                fontFamily="Anton"
                fontSize={46}
                fill={C.white}
                style={{paintOrder: "stroke", stroke: "rgba(14,42,59,0.85)", strokeWidth: 10}}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </InBand>
  );
};

/** Gráfico de barras simple: antes vs. hoy (sin cifras inventadas). */
export const Bars: React.FC<{start: number; end: number; growAt: number; arrowAt: number}> = ({
  start,
  end,
  growAt,
  arrowAt,
}) => {
  const frame = useCurrentFrame();
  const a = prog(frame, start + 4, 12);
  const b = prog(frame, growAt, 20);
  const arr = prog(frame, arrowAt, 12);
  const bar = (h: number, color: string, label: string) => (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 10, height: 250}}>
      <div style={{width: 130, height: h, background: color, borderRadius: "14px 14px 4px 4px"}} />
      <div style={{fontFamily: DMSANS, fontWeight: 700, fontSize: 32, color: C.white}}>{label}</div>
    </div>
  );
  return (
    <InBand start={start} end={end}>
      <Glass style={{width: 640, paddingTop: 24}}>
        <div style={{fontFamily: DMSANS, fontWeight: 700, fontSize: 38, letterSpacing: 3, color: C.white, opacity: 0.85}}>
          PACIENTES AL DÍA
        </div>
        <div style={{display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 70, position: "relative", marginTop: 10}}>
          {bar(60 * a, "rgba(247,244,238,0.35)", "Antes")}
          {bar(60 * a + 140 * b, C.green, "Con estructura")}
          <svg
            width={170}
            height={150}
            viewBox="0 0 170 150"
            style={{position: "absolute", left: 120, top: -30, opacity: arr}}
          >
            <path
              d="M 10 130 Q 60 110 140 30"
              fill="none"
              stroke={C.white}
              strokeWidth={7}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - arr}
            />
            <path d="M 112 26 L 146 22 L 140 56" fill="none" stroke={C.white} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={arr > 0.9 ? 1 : 0} />
          </svg>
        </div>
      </Glass>
    </InBand>
  );
};
