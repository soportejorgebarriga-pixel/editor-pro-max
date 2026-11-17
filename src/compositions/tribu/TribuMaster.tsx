import React from "react";
import {AbsoluteFill, interpolate, Sequence} from "remotion";
import {BRAND, msToFrames} from "./brand";
import {BehindPanel, BrollCard, EndCard, LayeredClip, LogoInPanel, PanelText} from "./parts";
import {ReelCaptions} from "./ReelCaptions";
import {useBrandFonts} from "./useBrandFonts";
import {useWords, type Word} from "./useWords";

/**
 * Reel "¿Qué es Tribu Finanzas en Acción?" — parrilla #7.
 * Order: IMG_2320 (hook) → IMG_2321 (what it is) → IMG_2322 (relaunch price) → IMG_2325 (CTA) → end card.
 * Titles/logos sit BEHIND Jorge (person cut-out layer on top); captions sit on his chest.
 */

const SEG = {
  hook: {clip: "IMG_2320", trimMs: 300, endMs: 9150},
  body: {clip: "IMG_2321", trimMs: 700, endMs: 24800},
  price: {clip: "IMG_2322", trimMs: 550, endMs: 5450},
  cta: {clip: "IMG_2325", trimMs: 1300, endMs: 12850},
} as const;

const dur = (s: {trimMs: number; endMs: number}) => msToFrames(s.endMs - s.trimMs);
const D_HOOK = dur(SEG.hook);
const D_BODY = dur(SEG.body);
const D_PRICE = dur(SEG.price);
const D_CTA = dur(SEG.cta);
const D_END = 60;

const AT_BODY = D_HOOK;
const AT_PRICE = AT_BODY + D_BODY;
const AT_CTA = AT_PRICE + D_PRICE;
const AT_END = AT_CTA + D_CTA;
export const TRIBU_MASTER_DURATION = AT_END + D_END;

/** clip time (ms) → frame inside that segment */
const at = (s: {trimMs: number}, clipMs: number) => msToFrames(clipMs - s.trimMs);

const EMPHASIS = [
  "rumbo", "finanzas", "metas", "2027", "cómo", "tribu", "acción", "vivo", "15", "reto", "mensual",
  "resultados", "50", "80", "contenidos", "relanzamiento", "sencillísima", "siete", "días", "gratuitos", "objetivos",
];

const findMs = (ws: Word[], t: string, fallback: number) =>
  ws.find((w) => w.text.toLowerCase().includes(t))?.startMs ?? fallback;

const Captions: React.FC<{words: Word[]; trimMs: number}> = ({words, trimMs}) => (
  <ReelCaptions words={words} clipOffsetMs={trimMs} emphasis={EMPHASIS} />
);

export const TribuMaster: React.FC = () => {
  useBrandFonts();
  const wHook = useWords("captions-IMG_2320.json");
  const wBody = useWords("captions-IMG_2321.json");
  const wPrice = useWords("captions-IMG_2322.json");
  const wCta = useWords("captions-IMG_2325.json");

  // ---- body (IMG_2321) beats, in segment frames
  const B = SEG.body;
  const logoIn = at(B, findMs(wBody, "tribu", 2380));
  const liveIn = at(B, 5000);
  const retoIn = at(B, 9150);
  const excelIn = at(B, 12400);
  const alumnosIn = at(B, 15800);
  const bibliotecaIn = at(B, 18900);
  const envivoIn = at(B, 22600);

  // ---- CTA (IMG_2325) beats
  const C = SEG.cta;
  const tribuIn = at(C, 1500);
  const giftIn = at(C, 5400);

  return (
    <AbsoluteFill style={{backgroundColor: BRAND.navy}}>
      {/* 1 · Gancho */}
      <Sequence durationInFrames={D_HOOK} name="1 Gancho (IMG_2320)">
        <LayeredClip
          clip={SEG.hook.clip}
          trimFrames={msToFrames(SEG.hook.trimMs)}
          duration={D_HOOK}
          punches={[at(SEG.hook, findMs(wHook, "2027", 7100)), at(SEG.hook, findMs(wHook, "cómo", 8860))]}
          behind={
            <BehindPanel from={0} to={D_HOOK}>
              <PanelText kicker="¿TUS FINANZAS VAN" title="SIN RUMBO?" titleSize={126} />
            </BehindPanel>
          }
          front={<Captions words={wHook} trimMs={SEG.hook.trimMs} />}
        />
      </Sequence>

      {/* 2 · Qué es Tribu */}
      <Sequence from={AT_BODY} durationInFrames={D_BODY} name="2 Qué es Tribu (IMG_2321)">
        <LayeredClip
          clip={B.clip}
          trimFrames={msToFrames(B.trimMs)}
          duration={D_BODY}
          base={[1.04, 1.1]}
          entryPunch
          cutoutUntil={excelIn}
          behind={
            <>
              <BehindPanel from={logoIn} to={liveIn} shine>
                <LogoInPanel />
              </BehindPanel>
              <BehindPanel from={liveIn} to={retoIn}>
                <PanelText kicker="NOS VEMOS EN VIVO" title="CADA 15 DÍAS" sub="Martes · resolvemos tus dudas" live titleSize={104} />
              </BehindPanel>
              <BehindPanel from={retoIn} to={excelIn}>
                <PanelText kicker="CADA MES" title="UN RETO" sub="para lograr tus resultados" titleSize={124} />
              </BehindPanel>
            </>
          }
        />
        <Sequence from={excelIn} durationInFrames={alumnosIn - excelIn} name="B-roll Excel">
          <BrollCard src="assets/broll/broll-excel.mp4" duration={alumnosIn - excelIn} title="RETOS PRÁCTICOS" sub="Aplicados a tu negocio" />
        </Sequence>
        <Sequence from={alumnosIn} durationInFrames={bibliotecaIn - alumnosIn} name="B-roll alumnos">
          <BrollCard src="assets/broll/broll-alumnos.mp4" duration={bibliotecaIn - alumnosIn} title="+50 MIEMBROS" sub="Comunidad de emprendedores" />
        </Sequence>
        <Sequence from={bibliotecaIn} durationInFrames={envivoIn - bibliotecaIn} name="B-roll biblioteca">
          <BrollCard src="assets/broll/broll-biblioteca.mp4" duration={envivoIn - bibliotecaIn} title="+80 CONTENIDOS" sub="Míralos cuando quieras" />
        </Sequence>
        <Sequence from={envivoIn} durationInFrames={D_BODY - envivoIn} name="B-roll en vivo">
          <BrollCard src="assets/broll/broll-envivo.mp4" duration={D_BODY - envivoIn + 5} title="EN VIVO" sub="Sesiones con Jorge" live />
        </Sequence>
        <Captions words={wBody} trimMs={B.trimMs} />
      </Sequence>

      {/* 3 · Precio de relanzamiento */}
      <Sequence from={AT_PRICE} durationInFrames={D_PRICE} name="3 Relanzamiento (IMG_2322)">
        <LayeredClip
          clip={SEG.price.clip}
          trimFrames={msToFrames(SEG.price.trimMs)}
          duration={D_PRICE}
          base={[1.06, 1.12]}
          entryPunch
          punches={[at(SEG.price, findMs(wPrice, "relanzamiento", 2420))]}
          behind={
            <BehindPanel from={at(SEG.price, 1700)} to={D_PRICE}>
              <PanelText kicker="AHORA MISMO" title={"PRECIO DE\nRELANZAMIENTO"} titleSize={86} />
            </BehindPanel>
          }
          front={<Captions words={wPrice} trimMs={SEG.price.trimMs} />}
        />
      </Sequence>

      {/* 4 · CTA */}
      <Sequence from={AT_CTA} durationInFrames={D_CTA} name="4 CTA (IMG_2325)">
        <LayeredClip
          clip={C.clip}
          trimFrames={msToFrames(C.trimMs)}
          duration={D_CTA}
          base={[1.04, 1.1]}
          entryPunch
          punches={[at(C, findMs(wCta, "tribu", 2500)), at(C, findMs(wCta, "siete", 5520))]}
          volume={(f) => interpolate(f, [D_CTA - 6, D_CTA], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}
          behind={
            <>
              <BehindPanel from={tribuIn} to={giftIn}>
                <PanelText kicker="ESCRIBE LA PALABRA" title={BRAND.cta} sub="y te damos acceso" titleSize={150} />
              </BehindPanel>
              <BehindPanel from={giftIn} to={D_CTA}>
                <PanelText kicker="TE REGALAMOS" title="7 DÍAS GRATIS" sub={`Escribe “${BRAND.cta}”`} titleSize={100} />
              </BehindPanel>
            </>
          }
          front={<Captions words={wCta} trimMs={C.trimMs} />}
        />
      </Sequence>

      {/* 5 · Cierre */}
      <Sequence from={AT_END} durationInFrames={D_END} name="5 Cierre">
        <EndCard cta={BRAND.cta} />
      </Sequence>
    </AbsoluteFill>
  );
};
