// Uso: node render.mjs stills | node render.mjs video <salida.mp4>
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';

const root = path.dirname(fileURLToPath(import.meta.url));
const browserExecutable = 'C:/Users/Andres/.claude/remotion-template/node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe';
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const composition = await selectComposition({serveUrl, id: 'tiempo', browserExecutable});

if (process.argv[2] === 'stills') {
  for (const f of [45, 100, 140, 210, 300, 360, 400, 470]) {
    await renderStill({serveUrl, composition, browserExecutable, frame: f, output: path.join(root, `still_${f}.png`)});
  }
  console.log('stills ok');
} else {
  await renderMedia({serveUrl, composition, browserExecutable, codec: 'h264', crf: 16, outputLocation: process.argv[3]});
  console.log('video ok');
}
