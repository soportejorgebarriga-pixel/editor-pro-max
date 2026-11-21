# Replicar un reel de tendencia (con IA)

Caso de origen: reel #3 "Viaje en el tiempo: ¿Don Tazón es nuevo?", que replica un reel de @lacabanacorona.

## 1. Ver la referencia
Si el usuario pide "usa Chrome", usa Claude-in-Chrome. Instagram entrega el video como `blob:` (no se descarga), pero se puede **muestrear en la página**:
- navega al reel;
- con `javascript_tool`, pausa el `<video>`, recorre 24 tiempos con `currentTime` y dibuja cada frame en un `<canvas>` en mosaico con su marca de tiempo;
- muestra el canvas a pantalla completa y toma un screenshot.

Así obtienes la estructura (escenas, textos, ritmo) sin descargar nada. Lee también `og:description` (cuenta, fecha, caption). Cierra la pestaña al terminar.

## 2. Replicar la estructura, no el contenido
Anota la duración por beat, la posición y estilo de los textos, el tipo de transición y dónde está el chiste. Mantén la estructura (lo pide la parrilla: "Mantener estructura del original") y viste todo con el estilo Don Tazón: caja de toldo, colores coral/azul, cierre con logo y CTA.

## 3. Viaje en el tiempo — receta usada
- **0–3 s:** foto real de la dueña frente a la tienda, con zoom lento + "CUANDO NOS PREGUNTAN SI DON TAZÓN ES **NUEVO**… 👀".
- **3–12,6 s:** 8 años de 1,2 s cada uno: 2026 (real) → 2000 → 1990 → 1980 → 1970 → 1960 → 1900 (sepia, fachada de cantera) → 100 a.C. (puesto de mercado de piedra, jarros de barro, letrero tallado). Cada uno con destello blanco + año grande al centro (Oswald 150 px) + *pop*; la viñeta se oscurece mientras más viejo es el año.
- **12,6–13 s:** destello de regreso.
- **13–17 s:** tienda real + "NO SOMOS NUEVOS… SOLO CADA VEZ TENEMOS MÁS REGALOS **WOW** 🎁" + "¿Desde cuándo nos conoces? 👇" + logo.

Plantilla: `scripts/remotion_viaje_tiempo/`. Las imágenes van en `public/` como `y2026.jpg`, `y2000.png`, …, `y100ac.png`. Las épocas se generan con la receta de `ia-canva.md` (prompt de época) en 3:4, y la composición las recorta a 9:16 con `objectPosition: 42% 50%`, que deja a la persona y el letrero en cuadro. Mejora la foto real (nlmeans + Lanczos a 1440×1920 + cas) para que no desentone con las de IA.

**Música:** recomienda "Usar audio" del reel original en Instagram, si está disponible.

## 4. Datos que siempre faltan
El caption suele traer marcadores como `[X años]`. No los inventes: déjalos marcados y ponlos en pendientes (el año de apertura según el brief es 2016, sin confirmar).
