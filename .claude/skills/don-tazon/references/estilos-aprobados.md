# Estilos aprobados por el cliente

Las piezas aprobadas están en Drive → "Don Tazon" → "Contenido listo para publicar" (`1IFMIANrMfFJPxGwvmQoGEunDc0dcAhnt`), carpetas `Reels/` y `Carruseles/`. Las láminas de muestra están en `assets/ref_*.jpg`: míralas antes de diseñar.

## Reels (#6 y #7)

| Elemento | Especificación |
|---|---|
| Caja de título | Rectángulo redondeado (radio 30) con fondo `rgba(32,28,32,.84)`. Borde superior en forma de **toldo**: semicírculos coral `#E8503A` y azul `#2F9BD5` alternados, de ~52 px de diámetro. Texto en Oswald 700, mayúsculas, crema `#F7F2EA`, con la palabra clave en coral. Va arriba, en y≈230–260 de 1920. |
| Subtítulos / etiquetas | Píldora oscura semitransparente, Poppins 600 en blanco y palabra clave en Oswald coral mayúscula. |
| Transición destacada | Listón-moño animado (bandas coral y amarilla `#F7D44C` que barren + moño amarillo que aparece). |
| Cierre | Título en caja de toldo + píldora coral ("Comenta el número →", "¿Desde cuándo nos conoces? 👇") + logo en insignia blanca + "DON TAZÓN · MORELIA" en píldora oscura. |
| Ritmo | Sin música integrada (se pone en Instagram); un *pop* en cada revelación. |
| Zona segura | Nada de texto en el 20 % inferior ni pegado al borde derecho. |

Referencia: `assets/ref_reel7_portada.jpg` (caja de toldo sobre la dueña).

## Reel POV (#6)
Caja naranja sólida `#FE7E00` con texto blanco arriba ("Cuando entras a la tienda 'Solo a ver'"), cámara en mano recorriendo la tienda. Funciona para piezas de humor situacional.

## Carruseles de diseño (Buen Fin #9) — el sistema principal

Referencias: `assets/ref_carrusel_buenfin.jpg` y `assets/ref_carrusel_ABC.jpg`.

- **Lienzo:** 1080×1350, fondo azul claro en degradado radial (`#F4F9FD` → `#E4EDF6` → `#CBE3F3`).
- **Toldo** arriba (96 px): semicírculos naranja `#F57E24` y azul `#41AACE` alternados, con contorno blanco.
- **Logo:** en insignia blanca circular, arriba al centro (150 px).
- **Titulares:** Fredoka 700 en azul marino `#1D3461` con contorno blanco grueso (`-webkit-text-stroke:14px #fff; paint-order:stroke fill`) y sombra suave. Palabras clave en naranja.
- **Decoración:** destellos de cuatro puntas en línea azul o naranja y "rayitas de impacto" azules junto al título. No las pongas encima de las letras.
- **Productos:** recortados reales, con brillo blanco detrás y sombra de piso.
- **Píldoras:** azul `#41AACE` con número en círculo naranja para categorías; botón CTA naranja con sombra inferior `#C85F12`; etiqueta blanca con borde azul para nombrar el producto.

Implementación lista: `scripts/carrusel_gen.py`.

## Carrusel humor de temporada (#2, Día de Muertos)
Escenas ilustradas por IA (productos "tristes" sobre altar). Titular blanco con frase entre comillas en naranja. Solo para temporadas: el sistema por defecto es el de Buen Fin.

## Foto con titular (#4, "Morelia sorprendida por la taza gamer")
Foto a sangre completa y titular Fredoka azul marino y naranja con contorno blanco arriba. Es la base del estilo de los carruseles con escenas IA (`scripts/escenas_ia_textos.py`). Referencia: `assets/ref_foto_con_titular_tazagamer.jpg`.
