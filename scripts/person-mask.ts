#!/usr/bin/env npx tsx
/**
 * Per-frame person mask for a talking-head clip (for "text behind subject" layering).
 * Usage: npx tsx scripts/person-mask.ts <video> <outDir> [startFrame] [endFrame]
 * Writes <outDir>/NNNNN.png (alpha mask as grayscale, 540x960). Skips frames already done.
 */
import {execFileSync} from "child_process";
import {existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from "fs";
import path from "path";

const [video, outDir, startArg, endArg] = process.argv.slice(2);
if (!video || !outDir) {
  console.error("Usage: npx tsx scripts/person-mask.ts <video> <outDir> [startFrame] [endFrame]");
  process.exit(1);
}
const start = Number(startArg ?? 0);
const end = endArg ? Number(endArg) : Infinity;

async function main() {
  const {removeBackground} = await import("@imgly/background-removal-node");
  mkdirSync(outDir, {recursive: true});
  const tmp = path.join(outDir, "_frames");
  mkdirSync(tmp, {recursive: true});
  const sel = Number.isFinite(end) ? `between(n\\,${start}\\,${end})` : `gte(n\\,${start})`;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", video, "-vf", `select='${sel}',scale=540:960`, "-vsync", "0", "-start_number", String(start), path.join(tmp, "%05d.png")]);
  const frames = readdirSync(tmp).filter((f) => /^\d+\.png$/.test(f)).sort();
  let i = 0;
  for (const f of frames) {
    const out = path.join(outDir, f);
    i++;
    if (existsSync(out)) continue;
    const res = await removeBackground(new Blob([readFileSync(path.join(tmp, f))], {type: "image/png"}), {
      model: "small",
      output: {format: "image/png"},
    });
    const fg = path.join(tmp, `fg_${f}`);
    writeFileSync(fg, Buffer.from(await res.arrayBuffer()));
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", fg, "-vf", "format=rgba,alphaextract", out]);
    if (i % 25 === 0) console.log(`${path.basename(video)} ${i}/${frames.length}`);
  }
  rmSync(tmp, {recursive: true, force: true});
  console.log(`done ${path.basename(video)} ${frames.length} frames`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
