import React from "react";
import {AbsoluteFill, OffthreadVideo, staticFile} from "remotion";
import {ANTON} from "./Graphics";
import {C, FPS, H, W} from "./timeline";
import {useBrandFonts} from "./EntrevistaPablo";

// Cover 1080x1920: real frame, faces centered, title (≤7 words) between 300–700 px,
// everything important inside Instagram's 4:5 feed crop (285–1635 px).
export const PortadaPablo: React.FC<{src?: number}> = ({src = 5.0}) => {
  useBrandFonts();
  const s = 1.5;
  const tx = Math.min(0, Math.max(W - W * s, 540 - 575 * s));
  const ty = Math.min(0, Math.max(H - H * s, 900 - 555 * s));
  return (
    <AbsoluteFill style={{background: "#000"}}>
      <div style={{position: "absolute", width: W, height: H, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${s})`}}>
        <OffthreadVideo src={staticFile("assets/entrevista_hd.mp4")} trimBefore={Math.round(src * FPS)} muted style={{width: W, height: H}} />
      </div>
      <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(14,42,59,0.55) 0%, rgba(14,42,59,0) 38%)"}} />
      <div style={{position: "absolute", top: 300, left: 70, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8}}>
        {[{t: "¿TRABAJAS"}, {t: "TODO EL DÍA"}, {t: "Y NO AVANZAS?", gold: true}].map((l) => (
          <div key={l.t} style={{fontFamily: ANTON, fontSize: 116, lineHeight: 1.06, color: l.gold ? C.gold : C.white, background: "rgba(14,42,59,0.8)", padding: "2px 24px 8px", borderRadius: 14, whiteSpace: "nowrap"}}>
            {l.t}
          </div>
        ))}
        <div style={{height: 12, width: 260, background: C.green, borderRadius: 6, marginTop: 6}} />
      </div>
    </AbsoluteFill>
  );
};
