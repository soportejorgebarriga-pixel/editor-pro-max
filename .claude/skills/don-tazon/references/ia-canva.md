# Imágenes con IA vía Canva (escenas lifestyle y épocas)

Casos de origen:
- **Carrusel #10** "Así se ve una mañana con personalidad": la taza de jirafa en 3 escenas.
- **Reel #3** "Viaje en el tiempo": la dueña en 8 épocas.

**Gemini/Nanobanana no sirve:** la cuenta no tiene facturación. Usa la IA de imagen de Canva (`generate-image` del conector `381ca74f…`).

## 1. Generar con la foto real como referencia
1. Sube la foto: `create-upload-url` + `curl POST` (bytes crudos) → `mediaId`.
2. `generate-image` con `imageReferences:[{type:"MEDIA", id:<mediaId>}]` y `aspectRatio` (`PORTRAIT_4_5` para carrusel; `PORTRAIT_3_4` para conservar el encuadre de una foto 3:4).
3. Consulta `get-generate-image-job` hasta `SUCCESS`, que da el `media id` de la imagen.

**Prompt de producto** (de la parrilla; cambia solo la escena):
> "A partir de la fotografía del producto adjunto, crea una fotografía publicitaria lifestyle hiperrealista de esta taza sobre [ESCENA], con café, luz natural de mañana y un ambiente cálido. Mantén exactamente el diseño, dimensiones relativas, colores, textura y estampado del producto original. No agregues características nuevas. Fotografía comercial de alta calidad, formato 4:5, sin texto."

**Prompt de época/variación de una foto con persona:**
> "Edita esta fotografía como si hubiera sido tomada en el año [AÑO]. Mantén exactamente el mismo encuadre, la misma composición, la misma mujer en la misma posición y pose (…), y la misma tienda en el mismo lugar con su letrero arriba que dice "DON TAZON". Cambia solo la época: [ropa], [tienda], [tipo de foto/película]. Fotografía realista, sin texto adicional."

**Haz siempre una prueba antes de generar la serie completa:** confirma que conserva el producto o la persona y el encuadre. Después lanza el resto en paralelo.

## 2. Bajar a resolución completa (truco necesario)
`generate-image`, `remove-background` y `get-assets` solo entregan miniaturas (~150–200 px). La URL de la miniatura está firmada: cambiarle el tamaño da 403. Para obtener la imagen completa:
1. Llama a `create-design` con `references:["<media id>"]`, el brief "Diseño vertical que contiene ÚNICAMENTE la imagen de referencia ocupando toda la página a sangre completa, sin texto, sin logos, sin marcos ni elementos adicionales" y el formato "Instagram Post (Portrait)".
2. Consulta `get-create-design-async-job`: espera lo que diga `polling_policy.wait_seconds`, porque consultar antes no sirve. El resultado es un `design.id` (D…).
3. `export-design` con `{type:"png", height:1920, export_quality:"pro"}`. El diseño adopta la proporción de la imagen: sale 1440×1920 si es 3:4, o 1013×1350 si pides 1350 de alto.
4. `curl` a la URL de exportación (vence en horas). Encuadra con `scripts/encuadre.py` si hace falta.

Estos diseños quedan en la cuenta de Canva del usuario. Avisa que se pueden borrar.

## 3. Controlar la fidelidad (no te la saltes)
Compara de cerca el producto generado contra la foto real, recortando ambos a la misma escala. En la taza de jirafa coincidían el parche, los puntos, el corazón y las plantas; la taza salió apenas más alta y algunos cuadritos cambiaron. Reporta esas diferencias en el entregable y pide visto bueno.

## 4. Lo que NO funcionó: integrar a mano
Generar la escena vacía y pegar la foto real del producto (con sombras y ajuste de color) se veía pegado. La mesa estaba fotografiada desde arriba y el producto a la altura de los ojos, así que la perspectiva no coincide. Solo tiene sentido si la escena se genera con el mismo ángulo de cámara que la foto del producto.

## 5. Textos sobre la foto IA
Usa `scripts/escenas_ia_textos.py`: titular Fredoka azul marino y naranja con contorno blanco arriba (estilo de la taza gamer #4), etiqueta de escena con número para el CTA "1, 2 o 3", logo en insignia. Pon las fotos como `L1.png…L3.png` y el `logo.png` junto al script. Si la parrilla solo trae copy para la lámina 1, propón el de las demás y márcalo como propuesta.

## 6. Ética y transparencia
- Las recreaciones humorísticas (épocas absurdas como el 100 a.C.) están bien. No generes "fotos históricas" verosímiles presentadas como reales, por ejemplo una falsa apertura de la tienda: si hacen falta, pide fotos reales.
- Recomienda activar la etiqueta "Información de IA" en Instagram.
- Pide el visto bueno de las personas reales recreadas.
