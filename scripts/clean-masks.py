#!/usr/bin/env python3
"""Clean per-frame person masks in the zone where graphics sit behind Jorge.

Segmentation sometimes grabs a piece of the wall map (and drops hair) for a few frames.
Only the top zone matters (graphics live there; elsewhere the cut-out sits on identical
pixels), so for frames whose head-top jumps far above the running median, the top zone is
copied from the nearest good frame. Usage: clean-masks.py <masks_dir> <out_dir>
"""
import glob, os, sys
import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
ZONE = 310          # mask rows (540x960) that can overlap the panels (≈620px in 1080x1920)
COLS = slice(100, 440)
os.makedirs(out, exist_ok=True)
files = sorted(glob.glob(os.path.join(src, "[0-9]*.png")))
masks = [np.array(Image.open(f).convert("L")) for f in files]

def top(m):
    rows = np.where((m[:, COLS] > 128).sum(1) > 8)[0]
    return rows[0] if len(rows) else 960

tops = np.array([top(m) for m in masks])
med = np.array([np.median(tops[max(0, i - 15): i + 16]) for i in range(len(tops))])
bad = tops < med - 22
good_idx = np.where(~bad)[0]
for i, (f, m) in enumerate(zip(files, masks)):
    m = m.copy()
    if bad[i] and len(good_idx):
        j = good_idx[np.argmin(np.abs(good_idx - i))]
        m[:ZONE] = masks[j][:ZONE]
    # anything far above the (local) head top is never Jorge: clear it
    ceiling = int(max(0, med[i] - 45))
    m[:ceiling] = 0
    # inside the zone keep only the head: columns within the head's width (measured at
    # forehead level) and pixels connected straight down to the rest of the body.
    t = top(m)
    ref = min(959, max(t + 60, ZONE + 10))
    row = m[ref] > 150
    xs = np.where(row)[0]
    if len(xs):
        c = 270 if row[270] else xs[np.argmin(np.abs(xs - 270))]
        x0 = c
        while x0 > 0 and row[x0 - 1]:
            x0 -= 1
        x1 = c
        while x1 < 539 and row[x1 + 1]:
            x1 += 1
        zone_end = min(ref, 960)
        z = m[:zone_end].astype(np.float32)
        z[:, : max(0, x0 - 6)] = 0
        z[:, x1 + 7 :] = 0
        solid = z > 150
        connected = np.cumprod(solid[::-1], axis=0)[::-1].astype(bool)
        m[:zone_end] = np.where(connected, 255, 0).astype(np.uint8)
    Image.fromarray(m).save(os.path.join(out, os.path.basename(f)))
print(f"{os.path.basename(src)}: {len(files)} masks, {int(bad.sum())} repaired")
