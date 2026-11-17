#!/usr/bin/env npx tsx
/**
 * Render preview stills of a composition in one bundle.
 * Usage: npx tsx scripts/render-stills.ts <CompositionId> <outDir> <frame> [frame...]
 * Set REMOTION_BROWSER to a local Chrome/headless-shell binary if Remotion can't download one.
 */
import path from "path";
import {mkdirSync} from "fs";
import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";

async function main() {
  const [id, out, ...rest] = process.argv.slice(2);
  const frames = rest.map(Number);
  mkdirSync(out, {recursive: true});
  const browserExecutable = process.env.REMOTION_BROWSER || null;
  const serveUrl = await bundle({entryPoint: path.resolve("src/index.ts")});
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  for (const f of frames) {
    await renderStill({
      serveUrl, composition, frame: f, browserExecutable,
      output: path.join(out, `s_${String(f).padStart(5, "0")}.jpg`),
      imageFormat: "jpeg", jpegQuality: 75, scale: 0.4,
    });
    console.log("still", f);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
