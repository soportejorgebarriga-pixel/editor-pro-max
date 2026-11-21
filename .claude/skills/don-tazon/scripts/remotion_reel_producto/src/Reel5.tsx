import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont as loadOswald} from '@remotion/google-fonts/Oswald';
import {loadFont as loadPoppins} from '@remotion/google-fonts/Poppins';
import cues from './cues.json';

const {fontFamily: OSWALD} = loadOswald('normal', {weights: ['700'], subsets: ['latin']});
const {fontFamily: POPPINS} = loadPoppins('normal', {weights: ['600', '700'], subsets: ['latin']});

// Paleta medida en los reels aprobados #6/#7 + manual 2026
const CORAL = '#E8503A';
const AZUL = '#2F9BD5';
const CREMA = '#F7F2EA';
const CAJA = 'rgba(32,28,32,0.84)';
const AMARILLO = '#F7D44C';

// Tramos del video base (frames @30fps), generados por edl.py
type Seg = {from: number; frames: number; rol: string; producto: number};
const SEGS = (cues as {segs: Seg[]}).segs;
const END = (cues as {total: number}).total;
const segOf = (rol: string, producto: number) => SEGS.find((s) => s.rol === rol && s.producto === producto)!;

// Lo que parece en el estante (pregunta) y lo que es al revelarlo (respuesta)
const PARECE: Record<number, Part[][]> = {
  1: [[{t: '¿Un labial? 💄'}]],
  2: [[{t: '¿Un vaso'}], [{t: 'desechable? 🥤'}]],
  3: [[{t: '¿Un rollo de'}], [{t: 'película? 🎞️'}]],
  4: [[{t: '¿Una combi'}], [{t: 'de juguete? 🚐'}]],
  5: [[{t: '¿Una simple'}], [{t: 'caja? 📦'}]],
  6: [[{t: '¿Una cabeza de'}], [{t: 'Mario Bros? 🍄'}]],
  7: [[{t: '¿Un escusado? 🚽'}]],
  8: [[{t: '¿Una pila'}], [{t: 'de llantas? 👀'}]],
  9: [[{t: '¿Una pelota'}], [{t: 'de tenis? 🎾'}]],
};
const ES: Record<number, Part[][]> = {
  1: [[{t: 'No… ¡es una'}], [{t: 'pluma', hi: true}, {t: '! ✍️'}]],
  2: [[{t: 'No… ¡es de'}], [{t: 'cerámica', hi: true}, {t: '! ☕'}]],
  3: [[{t: 'No… ¡es un'}], [{t: 'servilletero', hi: true}, {t: '! 🧻'}]],
  4: [[{t: 'No… ¡es un'}], [{t: 'salero', hi: true}, {t: '! 🧂'}]],
  5: [[{t: 'No… ¡es una'}], [{t: 'alcancía', hi: true}, {t: '! 🐷'}]],
  6: [[{t: 'No… ¡es una'}], [{t: 'taza', hi: true}, {t: ' con tapa! ☕'}]],
  7: [[{t: 'No… ¡es un'}], [{t: 'caballito', hi: true}], [{t: 'para shot! 🥃'}]],
  8: [[{t: 'No… ¡es un'}], [{t: 'termo', hi: true}, {t: '! 🚗'}]],
  9: [[{t: 'No… ¡es una'}], [{t: 'botella', hi: true}, {t: '! 💧'}]],
};

type Part = {t: string; hi?: boolean};

const Awning: React.FC<{width: number}> = ({width}) => {
  const n = Math.max(6, Math.round(width / 52));
  const d = width / n;
  return (
    <div style={{display: 'flex', position: 'absolute', top: -d / 2 + 2, left: 0, width, height: d / 2, overflow: 'hidden'}}>
      {Array.from({length: n}).map((_, i) => (
        <div
          key={i}
          style={{
            width: d,
            height: d,
            borderRadius: '50%',
            background: i % 2 === 0 ? CORAL : AZUL,
            marginTop: 0,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
};

const Lines: React.FC<{lines: Part[][]; color: string; hiColor: string}> = ({lines, color, hiColor}) => (
  <>
    {lines.map((line, i) => (
      <div key={i} style={{whiteSpace: 'nowrap'}}>
        {line.map((p, j) => (
          <span key={j} style={{color: p.hi ? hiColor : color}}>
            {p.t}
          </span>
        ))}
      </div>
    ))}
  </>
);

// Caja de título con toldo (estilo aprobado)
const TitleBox: React.FC<{lines: Part[][]; top: number; width?: number; size?: number; num?: number}> = ({
  lines,
  top,
  width = 820,
  size = 104,
  num,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 14, stiffness: 180}, durationInFrames: 12});
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top,
          width,
          transform: `scale(${interpolate(s, [0, 1], [0.82, 1])})`,
          opacity: interpolate(frame, [0, 4], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        <div style={{position: 'relative', background: CAJA, borderRadius: 30, padding: '46px 40px 34px', textAlign: 'center'}}>
          <Awning width={width} />
          {num ? (
            <div
              style={{
                position: 'absolute',
                top: -58,
                left: -34,
                width: 112,
                height: 112,
                borderRadius: '50%',
                background: CORAL,
                border: `5px solid ${CREMA}`,
                color: CREMA,
                fontFamily: OSWALD,
                fontWeight: 700,
                fontSize: 70,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {num}
            </div>
          ) : null}
          <div style={{fontFamily: OSWALD, fontWeight: 700, fontSize: size, lineHeight: 1.08, textTransform: 'uppercase', letterSpacing: 1}}>
            <Lines lines={lines} color={CREMA} hiColor={CORAL} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Subtítulo en píldora (estilo aprobado)
const SubPill: React.FC<{parts: Part[]; top: number; num?: number}> = ({parts, top, num}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 15, stiffness: 200}, durationInFrames: 10});
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top,
          background: 'rgba(32,28,32,0.74)',
          borderRadius: 26,
          padding: '18px 34px',
          fontFamily: POPPINS,
          fontWeight: 600,
          fontSize: 56,
          color: '#FFFFFF',
          whiteSpace: 'pre',
          transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
          opacity: s,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {num ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 66,
              height: 66,
              borderRadius: '50%',
              background: CORAL,
              fontFamily: OSWALD,
              fontWeight: 700,
              fontSize: 44,
              marginRight: 18,
              marginLeft: -12,
            }}
          >
            {num}
          </span>
        ) : null}
        {parts.map((p, i) =>
          p.hi ? (
            <span key={i} style={{fontFamily: OSWALD, fontWeight: 700, color: CORAL, fontSize: 66, textTransform: 'uppercase'}}>
              {p.t}
            </span>
          ) : (
            <span key={i}>{p.t}</span>
          ),
        )}
      </div>
    </AbsoluteFill>
  );
};

// Transición de envoltura/moño para la revelación
const RibbonWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const x = (offset: number) => interpolate(frame, [offset, offset + 16], [-1500, 1500], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bow = interpolate(frame, [4, 9, 13, 18], [0, 1.15, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const band = (color: string, offset: number, w: number) => (
    <div
      style={{
        position: 'absolute',
        top: -400,
        left: 540 - w / 2,
        width: w,
        height: 2720,
        background: color,
        transform: `translateX(${x(offset)}px) rotate(-14deg)`,
      }}
    />
  );
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {band(CORAL, 0, 1500)}
      {band(AMARILLO, 2, 220)}
      {band(CORAL, 3, 90)}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <svg width="560" height="420" viewBox="0 0 280 210" style={{transform: `scale(${bow})`}}>
          <path d="M140 105 C 90 30, 20 40, 30 95 C 38 140, 100 130, 140 105 Z" fill={AMARILLO} stroke="#C8A62A" strokeWidth="4" />
          <path d="M140 105 C 190 30, 260 40, 250 95 C 242 140, 180 130, 140 105 Z" fill={AMARILLO} stroke="#C8A62A" strokeWidth="4" />
          <path d="M132 112 L 100 200 L 122 188 L 138 205 L 142 115 Z" fill={AMARILLO} stroke="#C8A62A" strokeWidth="4" />
          <path d="M148 112 L 180 200 L 158 188 L 142 205 L 138 115 Z" fill={AMARILLO} stroke="#C8A62A" strokeWidth="4" />
          <circle cx="140" cy="106" r="20" fill={AMARILLO} stroke="#C8A62A" strokeWidth="4" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Zoom por tramo: empuje lento en el hook y en cada engaño, punch-in en la tensión
const zoomAt = (f: number): number => {
  const s = SEGS.find((x) => f >= x.from && f < x.from + x.frames);
  if (!s) return 1.0;
  const t = [s.from, s.from + s.frames];
  if (s.rol === 'estante') return interpolate(f, t, [1.0, 1.08]);
  if (s.rol === 'revela') return interpolate(f, t, [1.0, 1.04]);
  if (s.rol === 'cierre') return interpolate(f, t, [1.0, 1.05]);
  return 1.0;
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pill = spring({frame: frame - 10, fps, config: {damping: 13, stiffness: 170}});
  const logo = spring({frame: frame - 18, fps, config: {damping: 13, stiffness: 170}});
  return (
    <AbsoluteFill>
      <TitleBox top={250} width={860} size={100} lines={[[{t: '¿Cuál te quedas'}], [{t: 'y cuál '}, {t: 'regalas', hi: true}, {t: '?'}]]} />
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 1235, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
          <div
            style={{
              background: CORAL,
              color: '#FFFFFF',
              fontFamily: POPPINS,
              fontWeight: 700,
              fontSize: 50,
              padding: '18px 46px',
              borderRadius: 60,
              transform: `scale(${pill})`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            }}
          >
            Comenta el número →
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: logo, transform: `translateY(${interpolate(logo, [0, 1], [20, 0])}px)`}}>
            <div style={{width: 190, height: 190, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.25)'}}>
              <Img src={staticFile('logo.png')} style={{width: 176, height: 176}} />
            </div>
            <div style={{background: 'rgba(32,28,32,0.74)', borderRadius: 20, padding: '12px 24px', fontFamily: POPPINS, fontWeight: 700, fontSize: 36, color: '#FFFFFF', letterSpacing: 2}}>
              DON TAZÓN · MORELIA
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Reel5: React.FC = () => {
  const frame = useCurrentFrame();
  const cierre = segOf('cierre', 0);
  const hookEnd = Math.round(1.6 * 30);
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${zoomAt(frame)})`}}>
        <OffthreadVideo src={staticFile('base9.mp4')} muted />
      </AbsoluteFill>

      {/* Gancho sobre el primer estante */}
      <Sequence from={0} durationInFrames={hookEnd}>
        <TitleBox top={260} lines={[[{t: 'Esto '}, {t: 'NO', hi: true}, {t: ' es lo'}], [{t: 'que parece… 👀'}]]} />
      </Sequence>

      {/* Cada producto: pregunta en el estante y la toma → respuesta al revelarlo */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
        const est = segOf('estante', n);
        const rev = segOf('revela', n) as Seg & {rev: number};
        const fin = n === 1 ? segOf('uso', 1) : rev;
        const aStart = n === 1 ? hookEnd : est.from + 4;
        const reveal = rev.from + rev.rev;
        return (
          <React.Fragment key={n}>
            <Sequence from={aStart} durationInFrames={reveal - aStart}>
              <TitleBox top={260} width={820} size={92} num={n} lines={PARECE[n]} />
            </Sequence>
            <Sequence from={reveal} durationInFrames={fin.from + fin.frames - reveal}>
              <TitleBox top={260} width={820} size={92} num={n} lines={ES[n]} />
            </Sequence>
            <Sequence from={reveal}>
              <Audio src={staticFile('pop.wav')} volume={0.8} />
            </Sequence>
          </React.Fragment>
        );
      })}

      {/* Envoltura de regalo al destapar el labial */}
      <Sequence from={segOf('revela', 1).from - 9} durationInFrames={20}>
        <RibbonWipe />
      </Sequence>

      {/* CIERRE */}
      <Sequence from={cierre.from} durationInFrames={END - cierre.from}>
        <EndCard />
      </Sequence>
      <Sequence from={cierre.from}>
        <Audio src={staticFile('pop.wav')} volume={0.8} />
      </Sequence>
    </AbsoluteFill>
  );
};
