# Drive: encontrar y bajar material

## Estructura (dueño: marketing.arbat18@gmail.com, compartido con link)
Carpeta raíz "Don Tazon": `17bWBk3lq-A3zCcdZ_b4FJQpEhnnZiS8q`

| Carpeta | ID | Qué tiene |
|---|---|---|
| Identidad grafica | `16iZ6xI6Av5eDSMF-WVWzBogiUlmIbdU6` | Manual 2026 (PDF), logo nuevo, banner web |
| Contenido listo para publicar | `1IFMIANrMfFJPxGwvmQoGEunDc0dcAhnt` | `Reels/` (#6, #7, #8, 16) y `Carruseles/` (#2, #4, #9, 16): piezas aprobadas |
| Imágenes de productos | `1G_HVAcvdk957CZkuIeMl4eNychxVDQmh` | Más de 200 fotos de producto sobre fondo blanco/gris (JPG + HEIC) y la subcarpeta "Día de las madres" |
| sin editar | `1hErD9_0U8rd5j9E7fRk8pyDw_o5sVnf_` | Una carpeta por idea de la parrilla (p. ej. `5/` con las tomas del reel 5) |
| borrador | `1y3SkvaOj23tIEjaog2fnD9NkQvp0w-qe` | Cortes en bruto |
| Parrillas de contenido | `1Gucio3-wHgJnnuBu6m55791PIj7afrPA` | Parrillas |

## Cómo listar
- **Conector de Drive** (`search_files` con `parentId = '<id>'`): funciona en "Imágenes de productos" (pagina de a 200; el resultado puede ser enorme, así que guárdalo y procésalo con Python). En otras carpetas compartidas **devuelve vacío** aunque tengan archivos.
- **Navegador integrado** (funciona sin sesión, porque son carpetas por link): abre `https://drive.google.com/drive/folders/<id>` y en `javascript_tool` ejecuta:
  ```js
  const ls=async id=>{const h=await fetch('/drive/folders/'+id).then(r=>r.text());
    return [...new Set([...h.matchAll(/\\x22(1[\w-]{20,40})\\x22,\\x5b\\x22([\w-]+)\\x22\\x5d,\\x22([^\\]+?)\\x22/g)]
      .filter(m=>m[2]===id).map(m=>m[1]+'|'+m[3]))]};
  await ls('<id>')
  ```
  Devuelve `id|nombre` de los hijos directos. Esta vista corta en ~50 elementos.

Si una carpeta "aparece vacía", confírmalo en el navegador antes de concluir que no hay material.

## Cómo bajar
```bash
curl -sL -o archivo "https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t"
```
Baja en paralelo en grupos de 16. Los HEIC se descargan con extensión equivocada: detéctalos con `file` y conviértelos con `magick "<ruta win>\p.heic" -auto-orient -quality 92 "<ruta win>\p.jpg"`. Pillow no lee HEIC.

## Archivos locales del cliente
- Carpeta de la agencia: `E:/Archivos/Jorge Barriga/_AGENCIA/DON TAZON/` (ficha `CLAUDE.md`, `REELS/`, `CARRUSELES/`).
- Hay cortes antiguos en `E:/Archivos/Jorge Barriga/Capcut/` (p. ej. "don tazon ,cortes.mp4", la entrevista de la dueña que dio origen al reel #7).
- Las carpetas históricas del cliente no se reorganizan ni se renombran.
