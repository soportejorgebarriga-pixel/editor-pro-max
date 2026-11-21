"""Carrusel #20 Don Tazón · 'Regalos que dicen lo que tú no te atreves'.
Genera 7 HTML 1080×1350 con el sistema visual de los carruseles aprobados (Buen Fin #9) y los renderiza a PNG."""
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = r"C:/Users/Andres/.claude/remotion-template/node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe"
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "png")

NARANJA, AZUL, AZUL_CLARO, MARINO = "#F57E24", "#41AACE", "#E4EDF6", "#1D3461"

CSS = f"""
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito+Sans:wght@700;800;900&display=block');
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1350px;overflow:hidden}}
body{{background:radial-gradient(ellipse at 50% 45%,#F4F9FD 0%,{AZUL_CLARO} 55%,#CBE3F3 100%);font-family:'Nunito Sans',sans-serif;position:relative;color:{MARINO}}}
.toldo{{position:absolute;top:0;left:0;width:1080px;height:96px}}
.logo{{position:absolute;top:104px;left:50%;transform:translateX(-50%);width:150px;height:150px;border-radius:50%;background:#fff;
  box-shadow:0 6px 18px rgba(29,52,97,.18);display:flex;align-items:center;justify-content:center}}
.logo img{{width:138px;height:138px}}
.t{{font-family:'Fredoka',sans-serif;font-weight:700;text-align:center;color:{MARINO};
  -webkit-text-stroke:14px #fff;paint-order:stroke fill;filter:drop-shadow(0 6px 10px rgba(29,52,97,.18));letter-spacing:-.5px}}
.o{{color:{NARANJA}}}
.pill{{display:inline-flex;align-items:center;gap:16px;background:{AZUL};color:#fff;font-weight:900;font-size:40px;
  padding:14px 34px 14px 16px;border-radius:60px;box-shadow:0 6px 0 #2B86A8}}
.num{{width:64px;height:64px;border-radius:50%;background:{NARANJA};color:#fff;font-family:'Fredoka';font-weight:700;font-size:44px;
  display:flex;align-items:center;justify-content:center;border:4px solid #fff}}
.cta{{display:inline-block;background:{NARANJA};color:#fff;font-weight:900;font-size:40px;padding:22px 46px;border-radius:70px;
  box-shadow:0 7px 0 #C85F12;text-align:center}}
.tag{{display:inline-block;background:#fff;color:{MARINO};font-weight:800;font-size:30px;padding:12px 30px;border-radius:40px;
  border:3px solid {AZUL};box-shadow:0 4px 12px rgba(29,52,97,.12)}}
.prod{{filter:drop-shadow(0 22px 22px rgba(29,52,97,.28))}}
.glow{{position:absolute;border-radius:50%;background:radial-gradient(circle,#fff 0%,rgba(255,255,255,.85) 45%,rgba(255,255,255,0) 70%)}}
.piso{{position:absolute;border-radius:50%;background:radial-gradient(ellipse,rgba(29,52,97,.22) 0%,rgba(29,52,97,0) 70%)}}
.firma{{position:absolute;bottom:34px;width:100%;text-align:center;font-weight:800;font-size:26px;color:#5B7A99;letter-spacing:2px}}
.c{{position:absolute;left:0;width:100%;text-align:center}}
"""


def toldo():
    n, w = 12, 90
    s = [f'<svg class="toldo" viewBox="0 0 1080 96"><rect width="1080" height="44" fill="{NARANJA}"/>']
    for i in range(n):
        col = NARANJA if i % 2 == 0 else AZUL
        x = i * w
        s.append(f'<rect x="{x}" y="0" width="{w}" height="46" fill="{col}"/>'
                 f'<path d="M{x} 44 a{w/2} {w/2} 0 0 0 {w} 0 Z" fill="{col}" stroke="#fff" stroke-width="5"/>')
    s.append('<rect y="40" width="1080" height="6" fill="#fff" opacity=".9"/></svg>')
    return "".join(s)


def destellos(puntos):
    """Estrellas de 4 puntas y chispas de línea, como en los carruseles aprobados."""
    out = []
    for x, y, sz, col in puntos:
        out.append(f'<svg style="position:absolute;left:{x}px;top:{y}px" width="{sz}" height="{sz}" viewBox="0 0 40 40">'
                   f'<path d="M20 2 C22 14 26 18 38 20 C26 22 22 26 20 38 C18 26 14 22 2 20 C14 18 18 14 20 2Z" fill="none" '
                   f'stroke="{col}" stroke-width="3" stroke-linejoin="round"/></svg>')
    return "".join(out)


def rayitas(x, y, lado):
    """Tres rayitas de 'impacto' junto al título (izquierda o derecha)."""
    rot = [-35, 0, 35] if lado == "izq" else [35, 0, -35]
    s = ""
    for i, r in enumerate(rot):
        s += (f'<div style="position:absolute;left:{x}px;top:{y + i * 26}px;width:38px;height:9px;border-radius:5px;'
              f'background:{AZUL};transform:rotate({r}deg)"></div>')
    return s


def page(body):
    return f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{toldo()}{body}</body></html>'


LOGO = '<div class="logo"><img src="logo.png"></div>'
FIRMA = '<div class="firma">DON TAZÓN · MORELIA</div>'
DEST = destellos([(70, 330, 46, AZUL), (960, 300, 40, NARANJA), (90, 1010, 38, NARANJA), (950, 960, 50, AZUL), (150, 640, 26, AZUL), (900, 650, 28, NARANJA)])

CASOS = [
    # (num, para quién, línea 1, línea 2 con resaltado, producto, etiqueta, alto img)
    (1, "Para quien siempre tiene sueño", "Para que ya no digas que", '<span class="o">te falta café</span> para funcionar. ☕', "c_152.png", "Taza extintor: café de emergencia 🧯", 600),
    (2, "Para quien nunca ahorra", "A ver si ahora sí", 'te dura <span class="o">la quincena</span>. 💸', "c_37.png", "Alcancía con gatito come-monedas 🐱", 470),
    (3, "Para el fan obsesionado", "Porque sabemos que jamás", 'vas a superar <span class="o">esa saga</span>. 🤓', "c_15.png", "Taza de Spider-Man 🕷️", 590),
    (4, "Para el que siempre cancela", "Para que tengas compañía", 'cuando <span class="o">vuelvas a cancelar</span>. 😂', "c_136.png", "Peluche cerdito rockero 🐷", 610),
    (5, "Para el que siempre llega tarde", "Para que tu café ya no llegue", '<span class="o">frío</span>… como tú a las juntas. ⏰', "c_89.png", "Termo que mantiene la temperatura ☕", 640),
]


def caso(num, quien, l1, l2, img, tag, alto):
    return page(f"""
{LOGO}{DEST}
<div class="c" style="top:282px"><span class="pill"><span class="num">{num}</span>{quien}</span></div>
<div class="c t" style="top:388px;font-size:66px;line-height:1.12">{l1}<br>{l2}</div>
<div class="glow" style="left:190px;top:{1210 - alto - 120}px;width:700px;height:{alto + 180}px"></div>
<div class="piso" style="left:290px;top:1150px;width:500px;height:70px"></div>
<div class="c" style="top:{1185 - alto}px"><img class="prod" src="{img}" style="height:{alto}px"></div>
<div class="c" style="top:1205px"><span class="tag">{tag}</span></div>
""")


PORTADA = page(f"""
{LOGO}
{destellos([(70, 520, 40, NARANJA), (965, 520, 40, AZUL), (60, 760, 34, AZUL), (985, 740, 36, NARANJA)])}
{rayitas(40, 312, "izq")}{rayitas(1002, 312, "der")}
<div class="c t" style="top:278px;font-size:150px;line-height:1"><span class="o">5 REGALOS</span></div>
<div class="c t" style="top:440px;font-size:76px;line-height:1.1">que dicen lo que tú<br><span class="o">NO</span> te atreves. 😂🎁</div>
<div class="glow" style="left:60px;top:640px;width:960px;height:620px"></div>
<div class="piso" style="left:110px;top:1135px;width:860px;height:90px"></div>
<img class="prod" src="c_37.png" style="position:absolute;left:70px;top:905px;height:260px">
<img class="prod" src="c_152.png" style="position:absolute;left:250px;top:720px;height:430px">
<img class="prod" src="c_136.png" style="position:absolute;left:440px;top:690px;height:470px">
<img class="prod" src="c_15.png" style="position:absolute;left:700px;top:820px;height:340px">
<img class="prod" src="c_89.png" style="position:absolute;left:900px;top:760px;height:410px">
<div class="c" style="top:1200px"><span class="cta" style="font-size:34px;padding:16px 40px">Desliza y etiqueta a alguien 👉</span></div>
""")

CIERRE = page(f"""
{destellos([(60, 330, 40, NARANJA), (975, 330, 40, AZUL), (70, 700, 30, AZUL), (990, 690, 34, NARANJA)])}
{rayitas(52, 176, "izq")}{rayitas(990, 176, "der")}
<div class="c t" style="top:150px;font-size:86px;line-height:1.08">¿A quién le regalarías<br>una <span class="o">indirecta</span>? 👀</div>
<div class="glow" style="left:60px;top:390px;width:960px;height:560px"></div>
<div class="piso" style="left:110px;top:840px;width:860px;height:80px"></div>
<img class="prod" src="c_152.png" style="position:absolute;left:60px;top:500px;height:360px">
<img class="prod" src="c_15.png" style="position:absolute;left:270px;top:560px;height:300px">
<img class="prod" src="c_136.png" style="position:absolute;left:440px;top:440px;height:420px">
<img class="prod" src="c_37.png" style="position:absolute;left:665px;top:660px;height:200px">
<img class="prod" src="c_89.png" style="position:absolute;left:845px;top:480px;height:380px">
<div class="c" style="top:930px"><span class="cta">Etiqueta a alguien<br>sin darle explicaciones 😏</span></div>
<div class="logo" style="top:1110px;width:170px;height:170px"><img src="logo.png" style="width:158px;height:158px"></div>
""")


def main():
    os.makedirs(OUT, exist_ok=True)
    slides = [PORTADA] + [caso(*c) for c in CASOS] + [CIERRE]
    for i, html in enumerate(slides, 1):
        p = os.path.join(HERE, f"l{i}.html")
        open(p, "w", encoding="utf-8").write(html)
        png = os.path.join(OUT, f"{i:02d}.png")
        subprocess.run([CHROME, "--headless", "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1080,1350",
                        "--virtual-time-budget=8000", f"--screenshot={png}", "file:///" + p.replace("\\", "/")],
                       check=True, capture_output=True)
        print("ok", png)


main()
