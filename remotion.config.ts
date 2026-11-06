import {Config} from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Entorno cloud: usar el Chromium preinstalado si existe (remotion.media no es accesible)
import {existsSync} from "node:fs";
const localShell =
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (existsSync(localShell)) {
  Config.setBrowserExecutable(localShell);
}
