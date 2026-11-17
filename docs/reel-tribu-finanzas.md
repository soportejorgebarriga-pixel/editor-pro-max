# Reel: Qué es Tribu Finanzas en Acción (parrilla #7, 14/11/26)

## Decisiones confirmadas
- CTA: palabra **TRIBU** (Jorge la dice en el audio de IMG_2325).
- B-roll de clases: `public/assets/broll/hotmart.mp4` (grabación de Vimeo, 4:40, sin audio).
  - 0:00–0:35 / 3:15–3:25 biblioteca de clases → cuando diga "más de 100 clases"
  - 0:50–1:20 Jorge en clase / con alumna
  - 1:30–1:55 ejercicio en Excel
  - 2:00–3:00, 4:10–4:30 mosaicos de Zoom con alumnos
  - 3:50–4:05 diapositiva de clase
- Privacidad: desenfocar **nombres** de alumnos; las caras se quedan.

- Marca: logo `public/assets/brand/logo-tribu.png` (transparente, blanco + dorado). Fondo azul marino #0B1D3A, dorado #CEAB83 → #F3D3A6, tipografía Montserrat. Lema: Aprende • Implementa • Crece.

## Clips de Jorge (public/assets/raw)
- IMG_2320 (9.5s), IMG_2321 (25.1s), IMG_2322 (5.8s), IMG_2325 (13.6s); IMG_2319 = pantalla con celular, sin audio.
- Orden propuesto: 2320 → 2321 → 2322 → 2325 (CONFIRMADO).

## Pendientes
- Música: NO lleva; el usuario la agrega al publicar. Entregar solo con voz.
- Calidad: no hay originales. Clips mejorados (denoise + upscale lanczos 1080x1920 + unsharp + contraste) en public/assets/enhanced/. Usar ESOS en la edición.
- Transcripción: HECHA (whisper.cpp medium, es) → public/captions-IMG_23xx.json (ms relativos a cada clip).
  - Jorge dice "más de 80 contenidos" (IMG_2321 ~19.1s), NO "100 clases" como la parrilla. B-roll de biblioteca va ahí.
  - Jorge dice "Escribe la palabra TRIBU" (IMG_2325 ~1.0s) → CTA confirmado por audio.
  - "más de 50 personas" (IMG_2321 ~16.7s), "martes cada 15 días en vivo" (~4.2s), "reto mensual" (~9s), "precio de relanzamiento" (IMG_2322).

## Muestra del gancho (en revisión)
- Composición `TribuHookPreview` (src/compositions/tribu/HookPreview.tsx): IMG_2320 completo + inicio de IMG_2321 hasta "Es una membresía".
- Render: `npx remotion render TribuHookPreview out/muestra-gancho-tribu.mp4 --browser-executable=/opt/pw-browsers/chromium`, luego loudnorm I=-14 con ffmpeg.
- Subtítulos con tiempos DTW (whisper.cpp -dtw medium). Montserrat local en public/fonts.

## MÁSTER ENTREGADO
- `out/Tribu-Finanzas-en-Accion-Reel.mp4` (51.5 s, 1080x1920, 30 fps, -15 LUFS, sin música).
- Composición `TribuMaster`. Render: `npx remotion render TribuMaster out/x.mp4 --browser-executable=/opt/pw-browsers/chromium --crf=17` + loudnorm I=-14.
- Recorte de Jorge (texto detrás) descartado: el mapa oscuro detrás del cabello hace que la segmentación filtre pedazos del mapa sobre los títulos. Los recuadros van compactos ARRIBA de la cabeza (nunca tocan cara/frente). La capa sigue disponible con `useCutout`.
