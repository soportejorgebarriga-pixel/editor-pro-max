// Uso: node render.mjs stills  |  node render.mjs video <salida.mp4>
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';

const root = path.dirname(fileURLToPath(import.meta.url));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const browserExecutable = 'C:/Users/Andres/.claude/remotion-template/node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe';
const composition = await selectComposition({serveUrl, id: 'reel5', browserExecutable});

if (process.argv[2] === 'stills') {
  for (const f of [30, 60, 110, 200, 250, 560, 740, 1300, 1700]) {
    await renderStill({serveUrl, composition, browserExecutable, frame: f, output: path.join(root, `still_${f}.png`)});
    console.log('still', f);
  }
} else {
  await renderMedia({
    serveUrl,
    browserExecutable,
    composition,
    codec: 'h264',
    crf: 16,
    outputLocation: process.argv[3] ?? path.join(root, 'reel5.mp4'),
    onProgress: ({progress}) => {
      if (Math.round(progress * 100) % 20 === 0) process.stdout.write(`${Math.round(progress * 100)}% `);
    },
  });
  console.log('\nok');
}
