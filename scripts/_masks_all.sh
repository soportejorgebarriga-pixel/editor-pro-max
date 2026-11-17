set -e
M=public/assets/masks
npx tsx scripts/person-mask.ts public/assets/enhanced/IMG_2320.mp4 $M/IMG_2320
npx tsx scripts/person-mask.ts public/assets/enhanced/IMG_2321.mp4 $M/IMG_2321 0 135
npx tsx scripts/person-mask.ts public/assets/enhanced/IMG_2321.mp4 $M/IMG_2321 136
npx tsx scripts/person-mask.ts public/assets/enhanced/IMG_2322.mp4 $M/IMG_2322
npx tsx scripts/person-mask.ts public/assets/enhanced/IMG_2325.mp4 $M/IMG_2325
echo ALL_DONE
