---
name: don-tazon
description: Produce contenido para Don Tazón (boutique de regalos originales en Morelia, cliente de la agencia de Andrés Díaz dentro de la carpeta de Jorge Barriga) con su estilo aprobado. Cubre reels de producto, carruseles, escenas lifestyle con IA, reels de tendencia/meme con IA, copys y entregables en Google Doc. Úsala SIEMPRE que se mencione Don Tazón, "la tienda de tazas", la parrilla de Don Tazón, una fila de parrilla con columnas como "Producto WOW", "Ideas para regalar" o "Marca y tienda", carpetas de Drive de marketing.arbat18, o cuando pidan "desarrolla/replica esta idea" con material de esa marca, aunque no digan "skill".
---

# Don Tazón — producción de contenido

Esta skill condensa lo que se aprendió produciendo para Don Tazón: qué estilo aprobó el cliente, qué correcciones hizo Andrés y qué flujos técnicos funcionaron. La idea es que cualquier pieza nueva salga a la primera con el nivel de las ya aprobadas, sin repetir los errores que ya se corrigieron.

## Antes de producir

1. **Lee la ficha del cliente:** `E:/Archivos/Jorge Barriga/_AGENCIA/DON TAZON/CLAUDE.md`. Es la fuente de verdad viva (puede tener datos más nuevos que esta skill). El resumen de marca está en `references/marca.md`.
2. **Identifica el formato** de la fila de parrilla y abre la guía correspondiente:

| Formato en la parrilla | Guía |
|---|---|
| Reel con tomas de producto ("Producto WOW", "no es lo que parece", recorridos) | `references/reel-producto.md` |
| Carrusel de diseño con productos recortados | `references/carrusel.md` |
| Escenas lifestyle con IA ("EDICIÓN CON IA", producto en su hábitat) | `references/ia-canva.md` |
| Replicar un reel de tendencia/meme (p. ej. viaje en el tiempo con IA) | `references/reel-tendencia-ia.md` |
| Cualquier formato: estilo visual aprobado | `references/estilos-aprobados.md` |
| Encontrar y bajar material de Drive | `references/drive-material.md` |
| Entregar guion + Google Doc | `references/entrega.md` |

3. **Declara el objetivo** de la pieza (alcance, venta, comunidad o autoridad), como pide el CLAUDE.md global de la agencia. La columna "Objetivo" de la parrilla suele darlo.

## Reglas que salen de correcciones reales (no las rompas)

Cada una costó una ronda de corrección. Por eso están aquí, con su razón:

- **El material de la carpeta de la idea es TODO el material, y TODO va en esa pieza.** Si la parrilla enlaza una carpeta de Drive (columna "material de referencia", carpeta con el número de la idea), esas son las únicas tomas y los únicos productos. No propongas productos del inventario ni regrabar. Si trae 9 productos, van los 9 en esa pieza: no elijas "el mejor" ni repartas el resto en otros reels. *Por qué:* Andrés lo corrigió dos veces en el reel #5.
- **En montajes de varios productos, cada uno cuenta su historia completa:** se ve en el estante (lo que parece), la mano lo toma y se revela qué es mientras gira. Son unos 6 s por producto, y el video se alarga lo necesario (9 productos ≈ 59 s). *Por qué:* tres cortes rechazados por "muy rápido": sin el momento de "parece otra cosa" la idea no se entiende y solo se ve el producto.
- **El producto tiene que estar en cuadro desde el primer frame de cada plano.** Si en la toma original quedó lejos o cortado, elige otro tramo o recorta y acerca. *Por qué:* en la combi "la mano se queda muy atrás y no se ve nada".
- **Nombra cada producto por lo que es de verdad.** Si no estás seguro, márcalo como pendiente de confirmar en tienda. *Por qué:* el "vaso" era un **caballito para shot**, y "parece escusado", no mingitorio.
- **Solo hay sucursal en Morelia.** El reel #7 decía "Morelia · Uruapan" por error. No lo repitas.
- **Mejora la calidad en edición.** Las tomas suelen llegar comprimidas por WhatsApp (464×848, ~1,6 Mbps). Aplica la cadena de mejora de `references/reel-producto.md` y avisa del límite: no se recupera el detalle que la compresión borró.
- **Los recortes de producto se revisan sobre magenta antes de diseñar.** Andrés detectó recortes sucios (sombra pegada, restos de fondo) en el cerdito de peluche y en la taza de Spider-Man. Usa `scripts/recorte_producto.py` en modo guiado.
- **Verifica en el archivo final, no en el borrador.** Extrae frames del MP4 o PNG exportado. Si Windows bloquea un archivo al sobrescribir ("Permission denied" porque está abierto), no lo des por reemplazado: reintenta y confirma antes de decir que está listo.

## Voz y copy

Tutea; humor cercano e inteligente, sin infantilizar; la emoción va antes que la descripción. Palabras prohibidas: **barato, económico, copias, imitación**. Revisa cada caption contra ellas y dilo en el entregable. Usa los copys de la parrilla tal cual, salvo que el formato final los vuelva incoherentes (p. ej. con 9 productos numerados el CTA pasó a "¿Cuál te quedas y cuál regalas? · Comenta el número"). Señala todo cambio y su razón.

## Motor de diseño

El CLAUDE.md global dice "Canva por defecto, preguntar brand kit". Para Don Tazón, Andrés eligió **diseño a medida (HTML/Remotion renderizado a PNG/MP4)**: en Canva no hay brand kit de Don Tazón, y el diseño a medida replica exacto el estilo aprobado. Canva se usa como herramienta auxiliar: generación de imagen IA, quitar fondo como guía y exportar a resolución completa (ver `references/ia-canva.md`). Entrega siempre la carpeta `editable/` con el script y los insumos, para que los cambios tomen minutos.

## Herramientas incluidas

- `scripts/recorte_producto.py`: recorte de producto (simple o guiado por la silueta de Canva) + lámina de control.
- `scripts/reel_edl.py`: define el corte (estante/toma/revela por producto), genera el filtro de ffmpeg con mejora de calidad y el `cues.json`.
- `scripts/remotion_reel_producto/`: composición del reel con caja de toldo, pregunta → respuesta por producto, número, listón-moño, cierre con logo.
- `scripts/remotion_viaje_tiempo/`: composición del reel "viaje en el tiempo" (intro, saltos de año con destello, regreso y remate).
- `scripts/carrusel_gen.py`: carrusel 1080×1350 con el sistema de los carruseles aprobados (toldo, Fredoka, píldoras, productos recortados).
- `scripts/escenas_ia_textos.py`: titular, número de escena y logo sobre fotos IA a sangre completa.
- `scripts/encuadre.py`: encuadra cualquier imagen a 1080×1350 sin deformar.
- `scripts/md2html.py`: convierte el guion .md a HTML apto para Google Docs (emojis como entidades).
- `assets/`: logo y láminas de referencia de piezas aprobadas. Míralas antes de diseñar.

Las composiciones Remotion necesitan `node_modules`: crea un *junction* hacia `C:\Users\Andres\.claude\remotion-template\node_modules` y usa el navegador ya instalado (la ruta está en cada `render.mjs`). Detalles en `references/reel-producto.md`.

## Dónde guardar

`E:/Archivos/Jorge Barriga/_AGENCIA/DON TAZON/<REELS|CARRUSELES>/<NN>_<Nombre-de-la-idea>/` con:
- la pieza final (`NN_DonTazon_<slug>.mp4` o `0X_DonTazon_<slug>.png`);
- el guion `.md`;
- `editable/`.

Formato del guion y del Google Doc en `references/entrega.md`.

## Pendientes que casi siempre aplican

Inclúyelos al final de cada entregable cuando correspondan:
- **Fecha de parrilla vencida:** reprogramar.
- **Personajes con licencia** (Spider-Man, Mario, Harry Potter, Stitch…): solo orgánico, no pauta.
- **Imágenes IA realistas:** activar "Información de IA" en Instagram.
- **Personas reales recreadas con IA:** visto bueno de la persona.
- **Confirmar existencias** y nombres de producto en tienda.
- **Música:** se agrega en Instagram, porque una cuenta de empresa solo puede usar la biblioteca libre. Indica en qué segundo debe caer el golpe.
- **Diseños auxiliares de Canva** que se pueden borrar.
