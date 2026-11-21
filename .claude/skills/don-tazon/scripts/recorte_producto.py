"""Recorta un producto de su foto (fondo de estudio claro) y devuelve PNG transparente a resolución completa.

Uso:
  python recorte_producto.py foto.jpg salida.png                    # modo simple (color + GrabCut)
  python recorte_producto.py foto.jpg salida.png --guia canva.png   # modo guiado (RECOMENDADO)

Modo guiado: --guia es el PNG que devuelve la herramienta `remove-background` de Canva.
Canva reconoce muy bien la silueta, pero solo entrega una miniatura de ~150×200 px.
Aquí esa miniatura se usa como mapa de "seguro producto / seguro fondo / dudoso", y GrabCut
afina el borde sobre la foto original a tamaño completo. Así salen bien los productos del mismo
tono que el fondo (peluches claros, tazas blancas) y no se pegan sombras.

Opciones:
  --sin-huecos   rellena huecos interiores (útil en el modo simple para ojos blancos, placas, etc.).
                 NO usar en tazas con asa: rellenaría el hueco del asa.
  --abrir N      quita pelusas finas (apertura morfológica de N px, p. ej. 11).
"""
import argparse
import cv2
import numpy as np
from PIL import Image, ImageOps

ap = argparse.ArgumentParser()
ap.add_argument("foto"); ap.add_argument("salida")
ap.add_argument("--guia"); ap.add_argument("--sin-huecos", action="store_true")
ap.add_argument("--abrir", type=int, default=0)
a = ap.parse_args()

im = np.array(ImageOps.exif_transpose(Image.open(a.foto)).convert("RGB"))
h, w = im.shape[:2]
s = 1200 / max(h, w)
sm = cv2.resize(im, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA)
H, W = sm.shape[:2]

if a.guia:
    g = np.array(Image.open(a.guia).convert("RGBA"))[..., 3]
    G = cv2.resize(g, (W, H), interpolation=cv2.INTER_CUBIC)
    k = int(0.012 * max(H, W)) * 2 + 1  # banda dudosa ≈ el error de ampliar la miniatura
    mask = np.where(G >= 128, cv2.GC_PR_FGD, cv2.GC_PR_BGD).astype(np.uint8)
    mask[cv2.erode((G > 200).astype(np.uint8), np.ones((k, k))) == 1] = cv2.GC_FGD
    mask[cv2.erode((G < 30).astype(np.uint8), np.ones((k, k))) == 1] = cv2.GC_BGD
else:
    mask = np.full((H, W), cv2.GC_PR_FGD, np.uint8)
    b = int(0.03 * min(H, W))
    mask[:b, :] = mask[-b:, :] = cv2.GC_BGD
    mask[:, :b] = mask[:, -b:] = cv2.GC_BGD
    hsv = cv2.cvtColor(sm, cv2.COLOR_RGB2HSV)
    claro = (hsv[..., 2] > 185) & (hsv[..., 1] < 30)
    mask[claro & (mask == cv2.GC_PR_FGD)] = cv2.GC_PR_BGD

bgd = np.zeros((1, 65)); fgd = np.zeros((1, 65))
cv2.grabCut(cv2.cvtColor(sm, cv2.COLOR_RGB2BGR), mask, None, bgd, fgd, 8, cv2.GC_INIT_WITH_MASK)
fg = ((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)).astype(np.uint8) * 255

n, lab, st, _ = cv2.connectedComponentsWithStats(fg)  # quedarse con el objeto más grande
if n > 1:
    fg = np.where(lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
if a.sin_huecos:
    ff = fg.copy(); m2 = np.zeros((H + 2, W + 2), np.uint8); cv2.floodFill(ff, m2, (0, 0), 255)
    fg = fg | cv2.bitwise_not(ff)
fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((max(a.abrir, 3),) * 2, np.uint8))

alfa = cv2.GaussianBlur(cv2.resize(fg, (w, h), interpolation=cv2.INTER_LINEAR), (5, 5), 0)
ys, xs = np.where(alfa > 20); p = 10
out = Image.fromarray(np.dstack([im, alfa])[max(ys.min() - p, 0):ys.max() + p, max(xs.min() - p, 0):xs.max() + p])
out.thumbnail((1400, 1400)); out.save(a.salida)

# lámina de control sobre magenta: cualquier resto de fondo o sombra salta a la vista
chk = Image.new("RGB", (out.width + 40, out.height + 40), (255, 0, 200)); chk.paste(out, (20, 20), out)
chk.thumbnail((700, 700)); chk.save(a.salida.rsplit(".", 1)[0] + "_control.jpg", quality=88)
print("ok", a.salida, out.size)
