"""Carrusel #10 Don Tazón · 'Así se ve una mañana con personalidad'.
Foto IA a sangre completa + titular, número de escena y logo con el sistema de marca. Uso: python gen10.py <carpeta_salida>"""
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = r"C:/Users/Andres/.claude/remotion-template/node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe"
OUT = sys.argv[1]
NARANJA, AZUL, MARINO = "#F57E24", "#41AACE", "#1D3461"

CSS = f"""
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito+Sans:wght@800;900&display=block');
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1350px;overflow:hidden}}
body{{position:relative;font-family:'Nunito Sans',sans-serif}}
.foto{{position:absolute;inset:0;width:1080px;height:1350px;object-fit:cover}}
.velo{{position:absolute;left:0;top:0;width:1080px;height:520px;background:linear-gradient(180deg,rgba(255,250,242,.55) 0%,rgba(255,250,242,0) 100%)}}
.t{{position:absolute;left:0;width:100%;text-align:center;font-family:'Fredoka',sans-serif;font-weight:700;color:{MARINO};
  -webkit-text-stroke:16px #fff;paint-order:stroke fill;filter:drop-shadow(0 6px 14px rgba(29,52,97,.25));letter-spacing:-.5px}}
.o{{color:{NARANJA}}}
.escena{{position:absolute;left:44px;bottom:48px;display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.94);
  padding:12px 30px 12px 12px;border-radius:60px;box-shadow:0 8px 22px rgba(29,52,97,.22);font-weight:900;font-size:38px;color:{MARINO}}}
.num{{width:74px;height:74px;border-radius:50%;background:{NARANJA};color:#fff;font-family:'Fredoka';font-weight:700;font-size:50px;
  display:flex;align-items:center;justify-content:center}}
.logo{{position:absolute;right:44px;bottom:40px;width:118px;height:118px;border-radius:50%;background:#fff;
  box-shadow:0 8px 22px rgba(29,52,97,.22);display:flex;align-items:center;justify-content:center}}
.logo img{{width:108px;height:108px}}
.cta{{position:absolute;left:0;width:100%;text-align:center}}
.cta span{{display:inline-block;background:{NARANJA};color:#fff;font-weight:900;font-size:40px;padding:20px 44px;border-radius:70px;
  box-shadow:0 7px 0 #C85F12}}
"""

def page(foto, titular, num, escena, extra=""):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<img class="foto" src="{foto}"><div class="velo"></div>{titular}{extra}
<div class="escena"><span class="num">{num}</span>{escena}</div>
<div class="logo"><img src="logo.png"></div></body></html>"""

SLIDES = [
    page("L1.png", '<div class="t" style="top:70px;font-size:80px;line-height:1.08">Una taza normal no<br>provoca <span class="o">estas ganas</span><br><span class="o">de desayunar</span>. ☕</div>', 1, "Desayuno"),
    page("L2.png", '<div class="t" style="top:70px;font-size:80px;line-height:1.08">Hasta el lunes<br>se ve <span class="o">mejor</span>. 💻</div>', 2, "Home office"),
    page("L3.png", '<div class="t" style="top:70px;font-size:80px;line-height:1.08">Tu <span class="o">ratito favorito</span><br>del día. 📖</div>', 3, "Lectura",
         '<div class="cta" style="top:290px"><span>¿En cuál la usarías tú? 1, 2 o 3 👇</span></div>'),
]

os.makedirs(OUT, exist_ok=True)
for i, html in enumerate(SLIDES, 1):
    p = os.path.join(HERE, f"s{i}.html")
    open(p, "w", encoding="utf-8").write(html)
    png = os.path.join(OUT, f"{i:02d}.png")
    subprocess.run([CHROME, "--headless", "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1080,1350",
                    "--virtual-time-budget=8000", f"--screenshot={png}", "file:///" + p.replace("\\", "/")], check=True, capture_output=True)
    print("ok", png)
