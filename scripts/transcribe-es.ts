#!/usr/bin/env npx tsx
/**
 * Spanish (multilingual) transcription with word-level timestamps.
 * Usage: npx tsx scripts/transcribe-es.ts <audio.wav> <out.json> [model]
 */
import path from "path";
import {writeFileSync} from "fs";

const [inputPath, outputPath, model = "medium"] = process.argv.slice(2);

async function main() {
  const {installWhisperCpp, downloadWhisperModel, transcribe, toCaptions} =
    await import("@remotion/install-whisper-cpp");
  const whisperPath = path.join(process.cwd(), "whisper.cpp");
  await installWhisperCpp({to: whisperPath, version: "1.5.5"});
  await downloadWhisperModel({model: model as "medium", folder: whisperPath});
  const out = await transcribe({
    model: model as "medium",
    whisperPath,
    whisperCppVersion: "1.5.5",
    inputPath,
    tokenLevelTimestamps: true,
    language: "es",
  });
  const {captions} = toCaptions({whisperCppOutput: out});
  writeFileSync(outputPath, JSON.stringify(captions, null, 2));
  console.log(captions.map((c) => c.text).join(""));
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
