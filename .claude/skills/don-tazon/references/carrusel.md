# Carrusel de diseño con productos reales

Caso de origen: carrusel #20 "Regalos que dicen lo que tú no te atreves" (7 láminas, humor de indirectas).

## Flujo
1. **Elige productos** de Drive → "Imágenes de productos" (`1G_HVAcvdk957CZkuIeMl4eNychxVDQmh`, más de 200 fotos; ver `drive-material.md`). Arma hojas de miniaturas numeradas con PIL para elegir. Criterio: que el producto **haga el chiste visualmente** (taza extintor = "café de emergencia", alcancía con gatito asomado, cerdito rockero como "compañía"). Prefiere fondos blancos limpios, porque recortan mejor; un producto con oficina detrás sale sucio.
2. **Recorta** cada producto con `scripts/recorte_producto.py`, en modo guiado (ver abajo). Revisa la lámina `_control.jpg` sobre magenta: no deben quedar sombras pegadas, restos de fondo ni pelusas.
3. **Edita los datos** en `scripts/carrusel_gen.py`: la lista `CASOS` (número, para quién, línea 1, línea 2 con `<span class="o">` para resaltar, archivo del recorte, etiqueta, alto) y las láminas `PORTADA` y `CIERRE` con la posición de cada producto. Pon el script, los recortes `c_*.png` y `logo.png` en la misma carpeta. Corre `python carrusel_gen.py <carpeta_png>`; renderiza con el Chrome headless de Remotion.
4. **Revisa** una tira con las láminas y, en grande, la portada y el cierre: que las rayitas o destellos no se monten sobre las letras, que ningún producto se corte en el borde y que el texto quepa (con 66 px caben ~30 caracteres por línea).
5. **Exporta** `0X_DonTazon_<slug>.png` + guion + `editable/`.

## Recorte guiado (el que funcionó)
1. `create-upload-url` de Canva → `curl -X POST -H "Content-Type: application/octet-stream" --data-binary @foto.jpg <url>` → devuelve `mediaId`.
2. `remove-background` con ese `mediaId`. La herramienta devuelve una miniatura de 150×200 que el harness guarda en `tool-results/…png`. Esa ruta es la **guía**.
3. `python recorte_producto.py foto.jpg c_N.png --guia <ruta_miniatura>`.
   - Mugs **con asa**: no uses `--sin-huecos`.
   - Si queda una pelusa fina: `--abrir 11`.

Sin guía (modo simple) funciona en objetos de color fuerte sobre blanco. Falló en el peluche claro (restos de fondo junto a la oreja y bajo los brazos) y en la taza de Spider-Man (sombra pegada).

## Estructura de humor que funcionó (#20)
- **Portada:** número grande en naranja ("5 REGALOS") + promesa + todos los productos juntos + "Desliza y etiqueta a alguien 👉".
- **Una lámina por caso:** píldora "① Para quien siempre tiene sueño", chiste en dos líneas con remate en naranja, producto grande, etiqueta con el nombre del producto.
- **Cierre:** pregunta ("¿A quién le regalarías una indirecta? 👀") + productos + CTA "Etiqueta a alguien sin darle explicaciones 😏" + logo.
