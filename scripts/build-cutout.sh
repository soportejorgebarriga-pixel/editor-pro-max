#!/usr/bin/env bash
# Build a transparent "person only" WebM from an enhanced clip + per-frame masks.
# Usage: scripts/build-cutout.sh IMG_2320
set -euo pipefail
n="$1"
src="public/assets/enhanced/$n.mp4"
masks="public/assets/masks/$n"
out="public/assets/cutout/$n.webm"
mkdir -p public/assets/cutout
count=$(ls "$masks"/*.png | wc -l)
ffmpeg -v error -y -i "$src" -framerate 30 -start_number 0 -i "$masks/%05d.png" -filter_complex \
  "[1:v]format=gray,scale=1080:1920:flags=bicubic,lut=y='clip((val-70)*255/130\,0\,255)',gblur=sigma=1.2[m];[0:v][m]alphamerge,format=yuva420p[v]" \
  -map "[v]" -frames:v "$count" -an -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 22 -row-mt 1 -deadline good -cpu-used 4 "$out"
echo "built $out ($count frames)"
