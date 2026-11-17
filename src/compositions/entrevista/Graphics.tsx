import React from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {C, Gfx} from "./timeline";

// Fast start, soft stop – never bounce (Estilo 1)
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const ANTON = "'Anton', sans-serif";
export const DMSANS = "'DM Sans', sans-serif";

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

export const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {frame, fps, t: frame / fps};
};

/** 0→1 over `dur` seconds starting at `start` seconds (local), eased. */
const prog = (t: number, start: number, dur = 0.45) => interpolate(t, [start, start + dur], [0, 1], {...clamp, easing: EASE});

/** Global in/out envelope for a cue lasting `total` seconds. */
const envelope = (t: number, total: number) =>
  Math.min(prog(t, 0, 0.3), 1 - interpolate(t, [total - 0.28, total], [0, 1], clamp));

// ---------- primitives ----------

export const GlassCard: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div
    style={{
      background: "rgba(14,42,59,0.66)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: "1.5px solid rgba(247,244,238,0.18)",
      borderRadius: 30,
      boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Text that rises from behind an invisible line. */
const Reveal: React.FC<{p: number; children: React.ReactNode; style?: React.CSSProperties}> = ({p, children, style}) => (
  <div style={{overflow: "hidden", ...style}}>
    <div style={{transform: `translateY(${(1 - p) * 105}%)`}}>{children}</div>
  </div>
);

const Check: React.FC<{p: number; size?: number; color?: string}> = ({p, size = 54, color = C.green}) => (
  <svg width={size} height={size} viewBox="0 0 54 54">
    <circle cx="27" cy="27" r="25" fill={color} opacity={Math.min(1, p * 2)} />
    <path
      d="M15 28 L24 37 L40 19"
      fill="none"
      stroke={C.white}
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={40}
      strokeDashoffset={40 * (1 - p)}
    />
  </svg>
);

const Cross: React.FC<{p: number; size?: number}> = ({p, size = 54}) => (
  <svg width={size} height={size} viewBox="0 0 54 54">
    <circle cx="27" cy="27" r="25" fill="rgba(247,244,238,0.18)" opacity={Math.min(1, p * 2)} />
    <path d="M18 18 L36 36 M36 18 L18 36" stroke={C.white} strokeWidth={6} strokeLinecap="round" strokeDasharray={26} strokeDashoffset={26 * (1 - p)} />
  </svg>
);

// ---------- icons (line icons, brand white) ----------
const ic = {fill: "none", stroke: C.white, strokeWidth: 4, strokeLinecap: "round", strokeLinejoin: "round"} as const;
const Icon: React.FC<{name: string; size?: number; color?: string}> = ({name, size = 84, color}) => {
  const st = {...ic, stroke: color ?? C.white};
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {name === "bag" && (
        <>
          <rect x="10" y="22" width="44" height="32" rx="6" {...st} />
          <path d="M22 22 v-6 a10 10 0 0 1 20 0 v6" {...st} />
          <path d="M10 34 h44" {...st} />
        </>
      )}
      {name === "lingerie" && (
        <>
          <path d="M8 22 q8 22 22 14 q2 -1 4 0 q14 8 22 -14" {...st} />
          <path d="M8 22 h48" {...st} />
          <path d="M16 22 v-8 M48 22 v-8" {...st} />
        </>
      )}
      {name === "yarn" && (
        <>
          <circle cx="30" cy="32" r="20" {...st} />
          <path d="M14 22 q16 6 32 -6 M11 34 q20 4 38 -10 M16 46 q18 0 30 -22" {...st} />
          <path d="M48 46 q8 4 10 12" {...st} />
        </>
      )}
      {name === "school" && (
        <>
          <path d="M8 24 L32 12 L56 24 L32 36 Z" {...st} />
          <path d="M18 30 v12 q14 10 28 0 v-12" {...st} />
          <path d="M56 24 v14" {...st} />
        </>
      )}
      {name === "clock" && (
        <>
          <circle cx="32" cy="32" r="22" {...st} />
          <path d="M32 18 v14 l10 6" {...st} />
        </>
      )}
      {name === "coin" && (
        <>
          <circle cx="32" cy="32" r="22" {...st} />
          <path d="M38 22 q-4 -3 -8 -2 q-7 2 -4 8 q2 3 8 4 q6 2 4 8 q-3 5 -12 2 M32 16 v6 M32 42 v6" {...st} />
        </>
      )}
      {name === "pin" && (
        <>
          <path d="M32 58 q-20 -22 -20 -34 a20 20 0 0 1 40 0 q0 12 -20 34 z" {...st} />
          <circle cx="32" cy="24" r="7" {...st} />
        </>
      )}
      {name === "store" && (
        <>
          <path d="M10 26 l4 -14 h36 l4 14" {...st} />
          <path d="M10 26 q5 6 11 0 q5 6 11 0 q5 6 11 0 q5 6 11 0" {...st} />
          <path d="M14 30 v24 h36 v-24 M26 54 v-14 h12 v14" {...st} />
        </>
      )}
      {name === "team" && (
        <>
          <circle cx="22" cy="22" r="8" {...st} />
          <circle cx="44" cy="24" r="7" {...st} />
          <path d="M8 52 q2 -16 14 -16 q12 0 14 16 M34 50 q2 -12 10 -12 q10 0 12 12" {...st} />
        </>
      )}
      {name === "sun" && (
        <>
          <circle cx="32" cy="32" r="11" {...st} />
          <path d="M32 8 v6 M32 50 v6 M8 32 h6 M50 32 h6 M15 15 l4 4 M45 45 l4 4 M15 49 l4 -4 M45 19 l4 -4" {...st} />
        </>
      )}
      {name === "moon" && <path d="M42 10 a22 22 0 1 0 12 30 a18 18 0 0 1 -12 -30 z" {...st} />}
    </svg>
  );
};

const FlagAR: React.FC<{w?: number}> = ({w = 96}) => (
  <svg width={w} height={(w * 2) / 3} viewBox="0 0 90 60" style={{borderRadius: 6, boxShadow: "0 4px 14px rgba(0,0,0,0.3)"}}>
    <rect width="90" height="60" fill="#74ACDF" />
    <rect y="20" width="90" height="20" fill="#FFFFFF" />
    <circle cx="45" cy="30" r="5.5" fill="#F6B40E" stroke="#85340A" strokeWidth="0.8" />
    {Array.from({length: 16}).map((_, i) => {
      const a = (i * Math.PI) / 8;
      return (
        <line key={i} x1={45 + Math.cos(a) * 6.5} y1={30 + Math.sin(a) * 6.5} x2={45 + Math.cos(a) * 9} y2={30 + Math.sin(a) * 9} stroke="#F6B40E" strokeWidth="1.3" />
      );
    })}
  </svg>
);

// ---------- cue components ----------

/** Kinetic typography: lines rise one by one, green bar grows under them. */
const Kinetic: React.FC<{lines: {t: string; gold?: boolean}[]; size: number; total: number}> = ({lines, size, total}) => {
  const {t} = useT();
  const env = envelope(t, total);
  const bar = prog(t, 0.1 + lines.length * 0.12, 0.5);
  return (
    <div style={{opacity: env, display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
      {lines.map((l, i) => (
        <Reveal key={i} p={prog(t, 0.05 + i * 0.12, 0.5)}>
          <div
            style={{
              fontFamily: ANTON,
              fontSize: size,
              lineHeight: 1.08,
              color: l.gold ? C.gold : C.white,
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
              background: "rgba(14,42,59,0.78)",
              padding: "0 20px 4px",
              borderRadius: 12,
              marginBottom: 6,
            }}
          >
            {l.t}
          </div>
        </Reveal>
      ))}
      <div style={{height: 10, width: 260 * bar, background: C.green, borderRadius: 6, marginTop: 8}} />
    </div>
  );
};

const Tag: React.FC<{text: string; total: number}> = ({text, total}) => {
  const {t} = useT();
  const p = prog(t, 0, 0.4);
  const env = envelope(t, total);
  return (
    <div
      style={{
        opacity: env,
        transform: `translateY(${(1 - p) * 20}px) scale(${0.92 + 0.08 * p})`,
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 28px",
        borderRadius: 999,
        background: "rgba(14,42,59,0.78)",
        border: `2px solid ${C.green}`,
        fontFamily: DMSANS,
        fontWeight: 700,
        fontSize: 44,
        color: C.white,
        letterSpacing: 2,
      }}
    >
      <div style={{width: 14, height: 14, borderRadius: 7, background: C.green}} />
      {text}
    </div>
  );
};

const LowerThird: React.FC<{name: string; role: string; total: number}> = ({name, role, total}) => {
  const {t} = useT();
  const env = envelope(t, total);
  const bar = prog(t, 0, 0.35);
  return (
    <div style={{opacity: env, display: "flex", alignItems: "stretch", gap: 22, marginTop: 160}}>
      <div style={{width: 10, borderRadius: 5, background: C.green, transform: `scaleY(${bar})`, transformOrigin: "top"}} />
      <div style={{background: "rgba(14,42,59,0.72)", padding: "16px 28px 18px", borderRadius: 18}}>
        <Reveal p={prog(t, 0.15, 0.45)}>
          <div style={{fontFamily: DMSANS, fontWeight: 800, fontSize: 52, color: C.white, letterSpacing: 1}}>{name}</div>
        </Reveal>
        <Reveal p={prog(t, 0.28, 0.45)}>
          <div style={{fontFamily: DMSANS, fontWeight: 500, fontSize: 34, color: "rgba(247,244,238,0.85)"}}>{role}</div>
        </Reveal>
      </div>
    </div>
  );
};

const Location: React.FC<{total: number}> = ({total}) => {
  const {t} = useT();
  const env = envelope(t, total);
  const p = prog(t, 0, 0.5);
  const pin = prog(t, 0.15, 0.5);
  const flag = prog(t, 1.35, 0.4);
  return (
    <GlassCard style={{opacity: env, transform: `translateY(${(1 - p) * 30}px)`, padding: "30px 36px", display: "flex", alignItems: "center", gap: 26, width: 720}}>
      <div style={{transform: `translateY(${(1 - pin) * -40}px)`, opacity: pin}}>
        <Icon name="pin" size={96} color={C.green} />
      </div>
      <div style={{flex: 1}}>
        <Reveal p={prog(t, 0.2, 0.45)}>
          <div style={{fontFamily: ANTON, fontSize: 54, color: C.white, lineHeight: 1.1, whiteSpace: "nowrap"}}>SANTIAGO DEL ESTERO</div>
        </Reveal>
        <Reveal p={prog(t, 1.25, 0.45)}>
          <div style={{fontFamily: DMSANS, fontWeight: 700, fontSize: 40, color: "rgba(247,244,238,0.9)", letterSpacing: 4}}>ARGENTINA</div>
        </Reveal>
      </div>
      <div style={{opacity: flag, transform: `scale(${0.7 + 0.3 * flag})`}}>
        <FlagAR />
      </div>
    </GlassCard>
  );
};

/** 1969 → 2026 timeline + counter 0→57 (cifra en dorado). */
const Years: React.FC<{total: number}> = ({total}) => {
  const {t} = useT();
  const env = envelope(t, total);
  const p = prog(t, 0, 0.5);
  const line = interpolate(t, [0.4, 2.6], [0, 1], {...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1)});
  const n = Math.round(57 * line);
  return (
    <GlassCard style={{opacity: env, transform: `translateY(${(1 - p) * 30}px)`, padding: "28px 40px 34px", width: 760}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
        <Reveal p={prog(t, 0.1, 0.45)}>
          <div style={{fontFamily: DMSANS, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: C.white}}>BERMARYS</div>
        </Reveal>
        <Reveal p={prog(t, 0.2, 0.45)}>
          <div style={{fontFamily: DMSANS, fontWeight: 500, fontSize: 32, color: "rgba(247,244,238,0.8)"}}>negocio familiar</div>
        </Reveal>
      </div>
      <div style={{display: "flex", alignItems: "baseline", gap: 18, marginTop: 4}}>
        <div style={{fontFamily: ANTON, fontSize: 150, color: C.gold, lineHeight: 1, fontVariantNumeric: "tabular-nums", minWidth: 170}}>{n}</div>
        <div style={{fontFamily: ANTON, fontSize: 72, color: C.white}}>AÑOS</div>
      </div>
      <div style={{position: "relative", height: 70, marginTop: 10}}>
        <div style={{position: "absolute", top: 18, left: 0, right: 0, height: 6, borderRadius: 3, background: "rgba(247,244,238,0.18)"}} />
        <div style={{position: "absolute", top: 18, left: 0, width: `${line * 100}%`, height: 6, borderRadius: 3, background: C.green}} />
        <div style={{position: "absolute", top: 8, left: `calc(${line * 100}% - 13px)`, width: 26, height: 26, borderRadius: 13, background: C.white, border: `5px solid ${C.green}`}} />
        <div style={{position: "absolute", top: 40, left: 0, fontFamily: DMSANS, fontWeight: 700, fontSize: 32, color: "rgba(247,244,238,0.75)"}}>1969</div>
        <div style={{position: "absolute", top: 40, right: 0, fontFamily: DMSANS, fontWeight: 700, fontSize: 32, color: line > 0.98 ? C.white : "rgba(247,244,238,0.4)"}}>2026</div>
      </div>
    </GlassCard>
  );
};

const ICON_ITEMS = [
  {icon: "bag", label: "Marroquinería"},
  {icon: "lingerie", label: "Lencería"},
  {icon: "yarn", label: "Hilados"},
  {icon: "school", label: "Colegial"},
];
const Icons: React.FC<{total: number; at: number[]}> = ({total, at}) => {
  const {t} = useT();
  const env = envelope(t, total);
  const p = prog(t, 0, 0.5);
  return (
    <GlassCard style={{opacity: env, transform: `translateY(${(1 - p) * 30}px)`, padding: "26px 26px 30px", width: 780}}>
      <Reveal p={prog(t, 0.05, 0.45)}>
        <div style={{fontFamily: ANTON, fontSize: 56, color: C.white, marginBottom: 18, marginLeft: 10}}>VARIOS RUBROS</div>
      </Reveal>
      <div style={{display: "flex", justifyContent: "space-between"}}>
        {ICON_ITEMS.map((it, i) => {
          const q = prog(t, at[i], 0.4);
          return (
            <div key={it.icon} style={{width: 172, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: q, transform: `translateY(${(1 - q) * 24}px)`}}>
              <div style={{width: 128, height: 128, borderRadius: 30, border: `3px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(29,158,117,0.12)"}}>
                <Icon name={it.icon} size={82} />
              </div>
              <div style={{fontFamily: DMSANS, fontWeight: 700, fontSize: 30, color: C.white}}>{it.label}</div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

const Definition: React.FC<{total: number}> = ({total}) => {
  const {t} = useT();
  const env = envelope(t, total);
  const p = prog(t, 0, 0.5);
  const chip = (start: number, icon: string, top: string, bottom: string) => {
    const q = prog(t, start, 0.45);
    return (
      <div style={{flex: 1, opacity: q, transform: `translateY(${(1 - q) * 24}px)`, display: "flex", alignItems: "center", gap: 18, padding: "18px 20px", borderRadius: 22, background: "rgba(29,158,117,0.16)", border: `2px solid ${C.green}`}}>
        <Icon name={icon} size={76} />
        <div>
          <div style={{fontFamily: DMSANS, fontWeight: 500, fontSize: 30, color: "rgba(247,244,238,0.85)"}}>{top}</div>
          <div style={{fontFamily: ANTON, fontSize: 56, color: C.white, lineHeight: 1.05}}>{bottom}</div>
        </div>
      </div>
    );
  };
  return (
    <GlassCard style={{opacity: env, transform: `translateY(${(1 - p) * 30}px)`, padding: "28px 30px 30px", width: 780}}>
      <Reveal p={prog(t, 0.05, 0.45)}>
        <div style={{fontFamily: DMSANS, fontWeight: 700, fontSize: 34, color: C.green, letterSpacing: 3}}>ALTA RENTABILIDAD =</div>
      </Reveal>
      <Reveal p={prog(t, 2.6, 0.45)}>
        <div style={{fontFamily: ANTON, fontSize: 64, color: C.white, margin: "6px 0 20px"}}>
          TE PERMITE <span style={{color: C.gold}}>GANAR</span> O AHORRAR
        </div>
      </Reveal>
      <div style={{display: "flex", gap: 18}}>
        {chip(4.1, "clock", "ahorrar", "TIEMPO")}
        {chip(4.6, "coin", "o ganar", "DINERO")}
      </div>
    </GlassCard>
  );
};

const Split: React.FC<{total: number; bajaAt: number; delegarAt: number}> = ({total, bajaAt, delegarAt}) => {
  const {t} = useT();
  const env = envelope(t, total);
  const col = (start: number, head: string, foot: string, good: boolean, lit: number) => {
    const q = prog(t, start, 0.5);
    return (
      <GlassCard style={{flex: 1, opacity: q, transform: `translateY(${(1 - q) * 30}px)`, padding: "24px 24px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, borderColor: good ? C.green : "rgba(247,244,238,0.18)"}}>
        <div style={{fontFamily: DMSANS, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: "rgba(247,244,238,0.8)"}}>RENTABILIDAD</div>
        <div style={{fontFamily: ANTON, fontSize: 84, lineHeight: 1, color: C.white}}>{head}</div>
        <div style={{width: "70%", height: 2, background: "rgba(247,244,238,0.25)", margin: "6px 0"}} />
        <div style={{display: "flex", alignItems: "center", gap: 12, opacity: 0.35 + 0.65 * lit}}>
          {good ? <Check p={lit} size={48} /> : <Icon name="team" size={52} color={lit > 0.5 ? C.green : C.white} />}
          <div style={{fontFamily: ANTON, fontSize: 52, color: C.white}}>{foot}</div>
        </div>
      </GlassCard>
    );
  };
  return (
    <div style={{opacity: env, display: "flex", gap: 22, width: 780}}>
      {col(0, "ALTA", "HAZLA TÚ", true, prog(t, 0.5, 0.5))}
      {col(bajaAt, "BAJA", "DELÉGALA", false, prog(t, delegarAt, 0.45))}
    </div>
  );
};

const Example: React.FC<{total: number}> = ({total}) => {
  const {t} = useT();
  const env = envelope(t, total);
  const p = prog(t, 0, 0.5);
  const arrow = prog(t, 4.6, 0.6);
  return (
    <GlassCard style={{opacity: env, transform: `translateY(${(1 - p) * 30}px)`, padding: "26px 32px 30px", width: 760}}>
      <div style={{display: "inline-block", padding: "6px 16px", borderRadius: 10, background: C.green, fontFamily: DMSANS, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: C.white}}>EJEMPLO</div>
      <div style={{display: "flex", alignItems: "center", gap: 20, marginTop: 18}}>
        <Icon name="store" size={96} />
        <Reveal p={prog(t, 0.6, 0.45)}>
          <div style={{fontFamily: ANTON, fontSize: 76, color: C.white, lineHeight: 1}}>VENTA DIRECTA</div>
        </Reveal>
      </div>
      <div style={{display: "flex", alignItems: "center", gap: 18, marginTop: 20}}>
        <div style={{fontFamily: DMSANS, fontWeight: 500, fontSize: 34, color: "rgba(247,244,238,0.85)", opacity: prog(t, 2.2, 0.4)}}>baja rentabilidad</div>
        <svg width={120} height={30} viewBox="0 0 120 30">
          <path d="M4 15 H104 M90 4 L108 15 L90 26" fill="none" stroke={C.green} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={150} strokeDashoffset={150 * (1 - arrow)} />
        </svg>
        <div style={{fontFamily: ANTON, fontSize: 52, color: C.white, opacity: arrow}}>SE DELEGA</div>
      </div>
    </GlassCard>
  );
};

/** Phone mockup with Sunday calendar and a 2 H planning block. */
const Phone: React.FC<{total: number}> = ({total}) => {
  const {t} = useT();
  const env = envelope(t, total);
  const p = prog(t, 0, 0.55);
  const block = prog(t, 4.0, 0.7);
  const hours = ["9:00", "10:00", "11:00", "12:00"];
  return (
    <div style={{opacity: env, display: "flex", alignItems: "center", gap: 34, transform: `translateY(${(1 - p) * 40}px)`}}>
      <div style={{width: 300, height: 380, borderRadius: 44, background: "#0b1f2c", border: "8px solid #22313b", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", padding: "26px 18px", position: "relative", overflow: "hidden"}}>
        <div style={{position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 90, height: 18, borderRadius: 10, background: "#22313b"}} />
        <div style={{fontFamily: DMSANS, fontWeight: 800, fontSize: 30, color: C.white, marginTop: 12}}>Domingo</div>
        <div style={{fontFamily: DMSANS, fontWeight: 500, fontSize: 20, color: "rgba(247,244,238,0.6)", marginBottom: 10}}>Calendario</div>
        {hours.map((h, i) => (
          <div key={h} style={{display: "flex", alignItems: "center", gap: 10, height: 64, borderTop: "1px solid rgba(247,244,238,0.12)"}}>
            <div style={{fontFamily: DMSANS, fontSize: 18, color: "rgba(247,244,238,0.55)", width: 56}}>{h}</div>
            {i === 0 && (
              <div style={{position: "absolute", left: 84, right: 18, top: 120, height: 128 * block, borderRadius: 14, background: C.green, padding: "10px 12px", overflow: "hidden"}}>
                <div style={{fontFamily: DMSANS, fontWeight: 800, fontSize: 22, color: C.white}}>PLANIFICAR</div>
                <div style={{fontFamily: DMSANS, fontWeight: 500, fontSize: 18, color: C.white}}>la semana</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <GlassCard style={{padding: "22px 30px 26px"}}>
        <Reveal p={prog(t, 3.6, 0.45)}>
          <div style={{fontFamily: ANTON, fontSize: 150, lineHeight: 1, color: C.gold}}>2 H</div>
        </Reveal>
        <Reveal p={prog(t, 3.9, 0.45)}>
          <div style={{fontFamily: ANTON, fontSize: 56, lineHeight: 1.1, color: C.white}}>EL DOMINGO</div>
        </Reveal>
        <Reveal p={prog(t, 4.2, 0.45)}>
          <div style={{fontFamily: DMSANS, fontWeight: 600, fontSize: 32, color: "rgba(247,244,238,0.85)"}}>para planificar</div>
        </Reveal>
      </GlassCard>
    </div>
  );
};

const GenericSpecific: React.FC<{total: number; specificAt: number}> = ({total, specificAt}) => {
  const {t} = useT();
  const env = envelope(t, total);
  const p = prog(t, 0, 0.5);
  const a = prog(t, 0.6, 0.5);
  const b = prog(t, specificAt, 0.5);
  const row = (q: number, good: boolean, label: string, text: string) => (
    <div style={{display: "flex", alignItems: "center", gap: 20, opacity: q, transform: `translateY(${(1 - q) * 20}px)`}}>
      {good ? <Check p={q} size={60} /> : <Cross p={q} size={60} />}
      <div>
        <div style={{fontFamily: DMSANS, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: good ? C.green : "rgba(247,244,238,0.6)"}}>{label}</div>
        <div style={{fontFamily: ANTON, fontSize: 58, lineHeight: 1.08, color: good ? C.white : "rgba(247,244,238,0.55)", textDecoration: good ? "none" : "line-through", textDecorationThickness: 4}}>{text}</div>
      </div>
    </div>
  );
  return (
    <GlassCard style={{opacity: env, transform: `translateY(${(1 - p) * 30}px)`, padding: "28px 34px", width: 760, display: "flex", flexDirection: "column", gap: 22}}>
      {row(a, false, "GENÉRICA", "“VENDER MÁS”")}
      <div style={{height: 2, background: "rgba(247,244,238,0.18)"}} />
      {row(b, true, "ESPECÍFICA · 10:00 AM", "LLAMAR A 5 CLIENTES")}
    </GlassCard>
  );
};

const Checklist: React.FC<{total: number; at: number[]}> = ({total, at}) => {
  const {t} = useT();
  const env = envelope(t, total);
  const p = prog(t, 0, 0.5);
  const items = [
    {icon: "sun", head: "5 MIN EN LA MAÑANA", sub: "revisa lo planificado"},
    {icon: "moon", head: "5 MIN EN LA NOCHE", sub: "revisa lo pendiente"},
  ];
  // card grows with each item
  const shown = items.map((_, i) => prog(t, at[i], 0.5));
  return (
    <GlassCard style={{opacity: env, transform: `translateY(${(1 - p) * 30}px)`, padding: "26px 32px", width: 760}}>
      <Reveal p={prog(t, 0.1, 0.45)}>
        <div style={{fontFamily: ANTON, fontSize: 60, color: C.white}}>TODOS LOS DÍAS</div>
      </Reveal>
      {items.map((it, i) => (
        <div key={it.head} style={{height: 112 * shown[i], overflow: "hidden"}}>
          <div style={{display: "flex", alignItems: "center", gap: 20, paddingTop: 18, opacity: shown[i]}}>
            <Check p={prog(t, at[i] + 0.25, 0.5)} size={58} />
            <Icon name={it.icon} size={60} color={C.gold} />
            <div>
              <div style={{fontFamily: ANTON, fontSize: 50, color: C.white, lineHeight: 1.05}}>{it.head}</div>
              <div style={{fontFamily: DMSANS, fontWeight: 500, fontSize: 30, color: "rgba(247,244,238,0.85)"}}>{it.sub}</div>
            </div>
          </div>
        </div>
      ))}
    </GlassCard>
  );
};

// ---------- dispatcher ----------
export const GraphicCue: React.FC<{g: Gfx; total: number; zone: "top" | "low"}> = ({g, total, zone}) => {
  // Safe zones: nothing above 240px, keep right 200px clear, never over faces.
  const box: React.CSSProperties =
    zone === "top"
      ? {position: "absolute", top: 268, left: 80, width: 800, display: "flex", justifyContent: "flex-start"}
      : {position: "absolute", top: 830, left: 80, width: 800, height: 405, display: "flex", alignItems: "flex-end"};
  let el: React.ReactNode = null;
  switch (g.kind) {
    case "tag":
      el = <Tag text={g.text} total={total} />;
      break;
    case "kinetic":
      el = <Kinetic lines={g.lines} size={g.size ?? 112} total={total} />;
      break;
    case "lowerThird":
      el = <LowerThird name={g.name} role={g.role} total={total} />;
      break;
    case "location":
      el = <Location total={total} />;
      break;
    case "years":
      el = <Years total={total} />;
      break;
    case "icons":
      el = <Icons total={total} at={g.at} />;
      break;
    case "definition":
      el = <Definition total={total} />;
      break;
    case "split":
      el = <Split total={total} bajaAt={g.bajaAt} delegarAt={g.delegarAt} />;
      break;
    case "example":
      el = <Example total={total} />;
      break;
    case "phone":
      el = <Phone total={total} />;
      break;
    case "genericSpecific":
      el = <GenericSpecific total={total} specificAt={g.specificAt} />;
      break;
    case "checklist":
      el = <Checklist total={total} at={g.at} />;
      break;
  }
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <div style={box}>{el}</div>
    </AbsoluteFill>
  );
};
