# Entrega: guion .md + Google Doc

## Carpeta
`E:/Archivos/Jorge Barriga/_AGENCIA/DON TAZON/<REELS|CARRUSELES>/<NN>_<Nombre-con-guiones>/`
- La pieza: `NN_DonTazon_<slug>.mp4` o `01…0N_DonTazon_<slug>.png`.
- `NN_<Nombre>.md`: el guion.
- `editable/`: script generador + insumos (recortes, escenas sin texto, logo) para cambios rápidos.
- Opcional: `epocas/` u otros recursos reutilizables.

## Plantilla del guion (el cliente lo ve: sin jerga sin explicar)
```markdown
# <Reel|Carrusel> #N · <Pilar> — "<Título>"
**Don Tazón** · <formato> · <duración o nº de láminas> · <fecha de parrilla>

## Resumen ejecutivo
Qué es · **Objetivo primario: …** y por qué esta estructura lo sirve · Métrica real

## <Producto(s) o escenas> y por qué
## Edición toma por toma / Lámina por lámina   (tabla: tiempo | qué se ve | texto)
## Cómo se hizo   (solo lo que el cliente necesita saber: mejora de calidad, IA, fidelidad)
## Música         (si aplica: se agrega en Instagram, segundo del golpe)
## Caption        (de la parrilla, en bloque de código; nota de palabras prohibidas revisadas)
## Archivos
## Pendientes
```
- Marca como *(propuesta)* todo texto que no venga de la parrilla.
- Marca como hipótesis o pendiente cualquier dato no confirmado (años, nombres de producto).
- No inventes métricas ni benchmarks.

## Google Doc (cuando el usuario lo pida)
1. `python scripts/md2html.py guion.md salida.html`. Convierte tablas y listas y pasa los emojis de 4 bytes a entidades `&#NNNNN;`, porque Drive los corrompe si van crudos. Antes de las listas markdown debe haber una línea en blanco; si no, salen como texto.
2. Post-proceso recomendado: cambia `<pre><code>` (el caption) por un párrafo con `<br>` y fondo `#E4EDF6`, y quita los `<code>`.
3. Copia el HTML al scratchpad **actual** y súbelo con `create_file` del conector de Drive: `contentMimeType:"text/html"` y `base64Content:"sha256:<hash>:<ruta absoluta con />"`. Las referencias a archivos fuera del scratchpad actual se rechazan.
4. Comprueba con `download_file_content` (`exportMimeType:"text/plain"`) que los emojis salen bien. `read_file_content` los muestra corruptos aunque estén bien.
5. El conector no edita el contenido de un Doc existente (`update_file` solo cambia metadatos). Para una versión nueva, crea otro Doc, manda el viejo a la papelera (`trash_file`) y avisa que el link cambió.
6. El Doc queda privado en el Drive conectado; compartirlo es decisión del usuario.

## Antes de decir "listo"
- Revisa frames o PNG del **archivo final** en la carpeta del cliente.
- Si un archivo no se pudo sobrescribir porque estaba abierto, reintenta y verifica fecha y tamaño. Si mostraste una versión vieja, dilo y reenvía la correcta.
- Manda la pieza con `SendUserFile` (`display: render`).
