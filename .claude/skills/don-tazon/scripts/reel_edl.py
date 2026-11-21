"""Genera el filtro de ffmpeg del video base y el cues.json (frames de cada tramo) para la composición Remotion.
Uso: python reel_edl.py <carpeta_de_trabajo> [ruta_cues.json]   (las tomas tXX.mp4 deben estar en la carpeta de trabajo)
Luego: ffmpeg $(cat base_inputs.txt) -/filter_complex base_filter.txt -map "[out]" -an -c:v libx264 -crf 14 -preset slow -r 30 base9.mp4

Estructura por producto: estante (parece otra cosa) → toma (la mano lo agarra) → revela (qué es + giro).
"""
import json, sys, os

FPS = 30
W, H = 464, 848  # resolución de las tomas originales
ENH = "nlmeans=s=2.2:p=5:r=9,scale=1080:-2:flags=lanczos,crop=1080:1920,cas=0.55,eq=contrast=1.05:saturation=1.10:gamma=0.98"

# (clip, inicio, fin, velocidad, rol, producto, revelación en s desde el inicio del tramo, recorte)
# recorte: fracción del cuadro anclada abajo al centro (acerca un producto que quedó bajo en el plano)
EDL = [
    ("t06", 0.2, 2.2, 1, "estante", 1, 0, 1),
    ("t06", 5.0, 6.4, 1, "toma", 1, 0, 1),
    ("t06", 10.6, 13.2, 1, "revela", 1, 0.5, 1),
    ("t06", 15.0, 16.4, 1, "uso", 1, 0, 1),
    ("t04", 1.2, 2.9, 1, "estante", 2, 0, 1),
    ("t04", 4.4, 5.8, 1, "toma", 2, 0, 1),
    ("t04", 13.0, 15.8, 1, "revela", 2, 0.3, 1),
    ("t07", 2.8, 4.5, 1, "estante", 3, 0, 1),
    ("t07", 8.0, 9.4, 1, "toma", 3, 0, 1),
    ("t07", 13.8, 16.6, 1, "revela", 3, 0.4, 1),
    ("t03", 2.8, 4.5, 1, "estante", 4, 0, 0.7),
    ("t03", 4.6, 6.0, 1, "toma", 4, 0, 1),
    ("t03", 22.0, 24.8, 1, "revela", 4, 1.5, 1),
    ("t05", 4.0, 5.7, 1, "estante", 5, 0, 1),
    ("t05", 8.0, 9.6, 1, "toma", 5, 0, 1),
    ("t05", 12.0, 14.8, 1, "revela", 5, 0.6, 1),
    ("t09", 3.2, 4.9, 1, "estante", 6, 0, 1),
    ("t09", 7.2, 8.6, 1, "toma", 6, 0, 1),
    ("t09", 15.6, 18.6, 1, "revela", 6, 1.4, 1),
    ("t02", 0.8, 2.5, 1, "estante", 7, 0, 1),
    ("t02", 4.2, 5.6, 1, "toma", 7, 0, 1),
    ("t02", 12.4, 15.2, 1, "revela", 7, 0.6, 1),
    ("t10", 4.8, 6.5, 1, "estante", 8, 0, 1),
    ("t10", 9.0, 10.4, 1, "toma", 8, 0, 1),
    ("t10", 18.6, 21.8, 1, "revela", 8, 1.4, 1),
    ("t01", 0.3, 2.0, 1, "estante", 9, 0, 1),
    ("t01", 5.4, 6.8, 1, "toma", 9, 0, 1),
    ("t01", 10.8, 15.6, 1.6, "revela", 9, 0.75, 1),
    ("t06", 22.2, 25.0, 1, "cierre", 0, 0, 1),
]
FREEZE = 0.5

clips = []
for c, *_ in EDL:
    if c not in clips:
        clips.append(c)

parts, labels, segs, frame = [], [], [], 0
for i, (c, a, b, sp, rol, prod, rev, k) in enumerate(EDL):
    n = round((b - a) / sp * FPS)
    crop = f",crop=iw*{k}:ih*{k}:(iw-iw*{k})/2:ih-ih*{k},scale={W}:{H}" if k < 1 else ""
    extra = f",tpad=stop_mode=clone:stop_duration={FREEZE}" if rol == "cierre" else ""
    if extra:
        n += round(FREEZE * FPS)
    parts.append(f"[{clips.index(c)}:v]trim={a}:{b},setpts=(PTS-STARTPTS)/{sp},fps={FPS}{crop},setsar=1{extra}[s{i}];")
    labels.append(f"[s{i}]")
    segs.append({"from": frame, "frames": n, "rol": rol, "producto": prod, "clip": c, "src": [a, b], "vel": sp, "rev": round(rev * FPS)})
    frame += n

fc = "".join(parts) + "".join(labels) + f"concat=n={len(EDL)}:v=1:a=0,{ENH},format=yuv420p[out]"
out_dir = sys.argv[1]
open(os.path.join(out_dir, "base_filter.txt"), "w").write(fc)
open(os.path.join(out_dir, "base_inputs.txt"), "w").write(" ".join(f"-i {c}.mp4" for c in clips))
cues_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(out_dir, "src", "cues.json")
json.dump({"fps": FPS, "total": frame, "segs": segs}, open(cues_path, "w"), indent=1)
print("frames", frame, "seg", frame / FPS)
