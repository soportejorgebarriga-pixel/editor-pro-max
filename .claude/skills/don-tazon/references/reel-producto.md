# Reel de producto (tomas reales)

Caso de origen: reel #5 "No sabías que existía", 9 productos tipo "no es lo que parece". Versión aprobada en la 4.ª ronda.

## Estructura que aprobó Andrés

Para **cada producto**, tres tiempos seguidos:

| Tiempo | Duración | Qué se ve | Texto (caja de toldo arriba) |
|---|---|---|---|
| Estante | ~1,7 s | El producto en el anaquel con la tienda alrededor, tal como "parece". Empuje lento de cámara (zoom 1,00 → 1,08). | Pregunta: "¿Una pila de llantas? 👀" + número del producto en un círculo coral |
| Toma | ~1,4 s | La mano lo agarra ahí mismo | Sigue la pregunta |
| Revela + giro | ~2,8 s | Se ve qué es y el producto gira en la mano | Respuesta: "No… ¡es un **TERMO**! 🚗" (palabra clave en coral) + *pop* justo al revelarse |

- El primer producto abre con el gancho "ESTO **NO** ES LO QUE PARECE… 👀" y la transición de listón-moño en su revelación.
- Cierre: los primeros productos de vuelta en el anaquel (cierra el círculo) + "¿CUÁL TE QUEDAS Y CUÁL REGALAS?" + "Comenta el número →" + logo.
- Duración: lo que haga falta (~6 s por producto). Si la parrilla pide menos, alarga y avisa. Recortar cualquiera de los tres tiempos fue rechazado.

## Flujo técnico

1. **Baja las tomas** de la carpeta de la idea (ver `drive-material.md`). Renómbralas `t01.mp4…`.
2. **Mira cada clip** con hojas de contacto: un frame por segundo en mosaico (`ffmpeg -vf "fps=1,scale=96:-2,tile=13x3"`). Luego afina con frames cada 0,5 s en las ventanas clave. Para cada producto anota:
   - un tramo de **estante** con el producto bien en cuadro (si quedó bajo o cortado, usa el recorte `k<1` del EDL, anclado abajo al centro);
   - el **momento en que entra la mano**;
   - el **segundo exacto de la revelación** (orificios del salero, cerdito que asoma, interior de acero…).
3. **Edita el EDL** en `scripts/reel_edl.py`. Cada tramo es `(clip, inicio, fin, velocidad, rol, producto, revelación_s, recorte)`, con rol `estante|toma|revela|uso|cierre`. Corre el script y luego el ffmpeg que indica: genera `base9.mp4` ya mejorado y `cues.json`.
4. **Verifica el base** antes de rotular: extrae un frame por tramo (`select='eq(n\,F)+…'` con F tomado de `cues.json`) y confirma que cada tramo muestra lo que debe. Corrige el EDL si una "toma" empieza antes de que entre la mano.
5. **Rotula con Remotion:** copia `scripts/remotion_reel_producto/` a una carpeta de trabajo, crea el junction de `node_modules` y pon `base9.mp4`, `logo.png` y `pop.wav` en `public/`. Edita los textos `PARECE` y `ES` en `src/Reel5.tsx`. Prueba con `node render.mjs stills` y renderiza con `node render.mjs video salida.mp4`.
   ```powershell
   New-Item -ItemType Junction -Path "<proy>\node_modules" -Target "C:\Users\Andres\.claude\remotion-template\node_modules"
   # pop.wav: C:\Users\Andres\.claude\remotion-template\public\sfx\pop.wav
   ```
6. **Sube los *pops*** sin recodificar el video: `ffmpeg -i in.mp4 -c:v copy -af "volume=20dB,alimiter=limit=0.7" -c:a aac -b:a 192k -movflags +faststart out.mp4`.
7. **Verificación final:** frames del MP4 final por tramo (los textos deben verse con espacios y emojis bien), duración y volumen máximo (≈ −6 a −9 dB).

## Cadena de mejora de calidad (tomas comprimidas)

```
nlmeans=s=2.2:p=5:r=9,scale=1080:-2:flags=lanczos,crop=1080:1920,cas=0.55,eq=contrast=1.05:saturation=1.10:gamma=0.98
```

Exporta a CRF 14 para el base. El final queda en ~10–11 Mbps. Avisa siempre del límite y pide los originales de la DJI subidos directo a Drive. Los nombres de archivo de la DJI incluyen el peso original: los 60–240 MB de origen llegaron como ~5 MB.

## Trampas conocidas
- **Remotion en Windows:** pasa `browserExecutable` (ya está en `render.mjs`). Si no, intenta bajar Chrome y falla.
- **Píldoras con flex:** en un contenedor `display:flex` se pierden los espacios entre spans ("Es unaPLUMA"). Usa `white-space:pre`.
- **ffmpeg 9:** ya no tiene `-filter_complex_script`; usa `-/filter_complex archivo.txt`. `-vsync` también cambió a `-fps_mode`.
- **drawtext:** falla sin fontconfig; para láminas con números usa Python/PIL.
- **`magick` desde bash:** no resuelve rutas `/tmp`; usa rutas Windows absolutas (`cygpath -w`).
