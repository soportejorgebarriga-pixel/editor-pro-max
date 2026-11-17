import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { ANTON, C, DMSANS, FPS } from "./brand";
import { Camera, useBrandFonts } from "./TribuFinanciera";

// Portada 1080x1920: cuadro real con ambos rostros + título del gancho.
// Todo lo importante dentro del recorte 4:5 del feed (285–1635 px).
const SRC = 76.0; // Vero justo después de "también comemos"

export const TribuPortada: React.FC = () => {
  useBrandFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera shots={[{ at: 0, mode: "COVER" }]} srcStart={SRC} offset={0}>
        <OffthreadVideo
          src={staticFile("tribu/video_hd.mp4")}
          muted
          trimBefore={Math.round(SRC * FPS)}
        />
      </Camera>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(14,42,59,0.55) 0%, rgba(14,42,59,0) 45%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 320,
          left: 60,
          width: 960,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: DMSANS,
            fontWeight: 700,
            fontSize: 40,
            letterSpacing: 5,
            color: C.white,
            opacity: 0.9,
          }}
        >
          TRIBU FINANCIERA
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 150,
            lineHeight: 1.04,
            color: C.white,
            textAlign: "center",
            textShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          LOS MÉDICOS
          <br />
          TAMBIÉN <span style={{ color: C.gold }}>COMEN</span>
        </div>
        <div
          style={{
            height: 10,
            width: 160,
            background: C.green,
            borderRadius: 5,
            marginTop: 18,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
