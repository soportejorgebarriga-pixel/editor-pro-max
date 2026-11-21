import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadOswald} from '@remotion/google-fonts/Oswald';
import {loadFont as loadPoppins} from '@remotion/google-fonts/Poppins';

const {fontFamily: OSWALD} = loadOswald('normal', {weights: ['700'], subsets: ['latin']});
const {fontFamily: POPPINS} = loadPoppins('normal', {weights: ['700'], subsets: ['latin']});

// Paleta de los reels aprobados
const CORAL = '#E8503A';
const AZUL = '#2F9BD5';
const CREMA = '#F7F2EA';
const CAJA = 'rgba(32,28,32,0.84)';

export const FPS = 30;
const INTRO = 90; // 3 s con la pregunta
const POR_EPOCA = 36; // 1,2 s por año
const EPOCAS: {img: string; anio: string}[] = [
  {img: 'y2026.jpg', anio: '2026'},
  {img: 'y2000.png', anio: '2000'},
  {img: 'y1990.png', anio: '1990'},
  {img: 'y1980.png', anio: '1980'},
  {img: 'y1970.png', anio: '1970'},
  {img: 'y1960.png', anio: '1960'},
  {img: 'y1900.png', anio: '1900'},
  {img: 'y100ac.png', anio: '100 a.C.'},
];
const VIAJE = INTRO + EPOCAS.length * POR_EPOCA;
const REGRESO = 12; // destello de regreso al presente
const FINAL = 120; // 4 s de remate
export const TOTAL = VIAJE + REGRESO + FINAL;

type Part = {t: string; hi?: boolean};

const Toldo: React.FC<{width: number}> = ({width}) => {
  const n = Math.round(width / 52);
  const d = width / n;
  return (
    <div style={{display: 'flex', position: 'absolute', top: -d / 2 + 2, left: 0, width, height: d / 2, overflow: 'hidden'}}>
      {Array.from({length: n}).map((_, i) => (
        <div key={i} style={{width: d, height: d, borderRadius: '50%', background: i % 2 === 0 ? CORAL : AZUL, flexShrink: 0}} />
      ))}
    </div>
  );
};

// Caja de título con toldo (estilo aprobado de los reels #6/#7)
const Titulo: React.FC<{lineas: Part[][]; top: number; size?: number}> = ({lineas, top, size = 86}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 14, stiffness: 180}, durationInFrames: 12});
  const w = 900;
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top, width: w, transform: `scale(${interpolate(s, [0, 1], [0.82, 1])})`, opacity: interpolate(f, [0, 4], [0, 1], {extrapolateRight: 'clamp'})}}>
        <div style={{position: 'relative', background: CAJA, borderRadius: 30, padding: '46px 36px 32px', textAlign: 'center'}}>
          <Toldo width={w} />
          <div style={{fontFamily: OSWALD, fontWeight: 700, fontSize: size, lineHeight: 1.1, textTransform: 'uppercase', color: CREMA}}>
            {lineas.map((l, i) => (
              <div key={i}>
                {l.map((p, j) => (
                  <span key={j} style={{color: p.hi ? CORAL : CREMA}}>{p.t}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Foto a pantalla completa (las fotos son 3:4; se recorta a 9:16 dejando a la dueña y el letrero en cuadro)
const Foto: React.FC<{src: string; zoom: [number, number]; dur: number; viejo?: number}> = ({src, zoom, dur, viejo = 0}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur], zoom, {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '42% 50%', transform: `scale(${z})`, transformOrigin: '42% 55%'}} />
      {/* viñeta de época: más fuerte mientras más viejo */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${0.15 + viejo * 0.45}) 100%)`}} />
    </AbsoluteFill>
  );
};

const Destello: React.FC<{dur?: number}> = ({dur = 6}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{backgroundColor: '#fff', opacity: interpolate(f, [0, 1, dur], [0.9, 0.75, 0], {extrapolateRight: 'clamp'})}} />;
};

const Anio: React.FC<{texto: string}> = ({texto}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 5], [1.35, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{marginTop: 260, fontFamily: OSWALD, fontWeight: 700, fontSize: 150, color: '#fff', letterSpacing: 4, transform: `scale(${s})`,
        textShadow: '0 6px 0 rgba(0,0,0,.35), 0 0 30px rgba(0,0,0,.55)'}}>{texto}</div>
    </AbsoluteFill>
  );
};

const Remate: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - 14, fps, config: {damping: 13, stiffness: 170}});
  return (
    <AbsoluteFill>
      <Titulo top={230} size={80} lineas={[[{t: 'No somos nuevos…'}], [{t: 'solo cada vez tenemos'}], [{t: 'más regalos '}, {t: 'WOW', hi: true}, {t: ' 🎁'}]]} />
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 1330, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, opacity: s, transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`}}>
          <div style={{background: CORAL, color: '#fff', fontFamily: POPPINS, fontWeight: 700, fontSize: 50, padding: '18px 46px', borderRadius: 60, boxShadow: '0 8px 24px rgba(0,0,0,.3)'}}>
            ¿Desde cuándo nos conoces? 👇
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <div style={{width: 170, height: 170, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(0,0,0,.3)'}}>
              <Img src={staticFile('logo.png')} style={{width: 156, height: 156}} />
            </div>
            <div style={{background: 'rgba(32,28,32,0.8)', borderRadius: 20, padding: '12px 26px', fontFamily: POPPINS, fontWeight: 700, fontSize: 36, color: '#fff', letterSpacing: 2}}>
              DON TAZÓN · MORELIA
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Tiempo: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {/* Intro: la pregunta sobre la foto real */}
    <Sequence from={0} durationInFrames={INTRO}>
      <Foto src="y2026.jpg" zoom={[1.0, 1.08]} dur={INTRO} />
      <Titulo top={230} lineas={[[{t: 'Cuando nos preguntan'}], [{t: 'si Don Tazón'}], [{t: 'es '}, {t: 'nuevo', hi: true}, {t: '… 👀'}]]} />
    </Sequence>

    {/* El viaje: un año cada 1,2 s, cada vez más atrás */}
    {EPOCAS.map((e, i) => (
      <Sequence key={e.anio} from={INTRO + i * POR_EPOCA} durationInFrames={POR_EPOCA}>
        <Foto src={e.img} zoom={[1.04, 1.12]} dur={POR_EPOCA} viejo={i / (EPOCAS.length - 1)} />
        {i > 0 ? <Destello /> : null}
        <Anio texto={e.anio} />
        <Audio src={staticFile('pop.wav')} volume={0.7} />
      </Sequence>
    ))}

    {/* Regreso al presente */}
    <Sequence from={VIAJE} durationInFrames={REGRESO + FINAL}>
      <Foto src="y2026.jpg" zoom={[1.12, 1.0]} dur={REGRESO + FINAL} />
      <Destello dur={REGRESO} />
    </Sequence>
    <Sequence from={VIAJE + REGRESO} durationInFrames={FINAL}>
      <Remate />
      <Audio src={staticFile('pop.wav')} volume={0.8} />
    </Sequence>
  </AbsoluteFill>
);
