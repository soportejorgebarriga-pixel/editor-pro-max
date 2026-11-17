import {useEffect, useState} from "react";
import {continueRender, delayRender, staticFile} from "remotion";

const WEIGHTS = ["600", "700", "800", "900"];
let loaded: Promise<void> | null = null;

const loadFonts = () => {
  if (!loaded) {
    loaded = Promise.all(
      WEIGHTS.map(async (w) => {
        const face = new FontFace(
          "Montserrat",
          `url(${staticFile(`fonts/montserrat-latin-${w}-normal.woff2`)}) format('woff2')`,
          {weight: w},
        );
        await face.load();
        (document.fonts as unknown as {add: (f: FontFace) => void}).add(face);
      }),
    ).then(() => undefined);
  }
  return loaded;
};

export const useBrandFonts = () => {
  const [handle] = useState(() => delayRender("Loading Montserrat"));
  useEffect(() => {
    loadFonts().then(() => continueRender(handle));
  }, [handle]);
};
