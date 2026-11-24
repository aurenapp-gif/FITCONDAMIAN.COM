# Portal Fit con Damián: actualización nocturna

El portal (https://claude.ai/artifact/TTgb6ZG4JPL8cDCSshmMzJ) lee en directo de Ninjo las agendas,
los seguidores, las publicaciones y el origen de las conversaciones. Lo que no se puede leer en
directo lo calcula Claude cada noche y lo guarda en la base de datos del portal:

| Colección                    | Documento          | Qué guarda                                                   |
|------------------------------|--------------------|--------------------------------------------------------------|
| `data/metricas/embudo`       | `YYYY-MM-DD`       | Por día de entrada y origen: entran, conversan, final, datos e ids de quien conversa |
| `data/metricas/contenido`    | `<reel>_<día>`     | Lo mismo para quien entra comentando cada reel o post        |
| `data/metricas/seguidores`   | `YYYY-MM-DD`       | Foto diaria del número de seguidores                          |
| `data/llamadas/resultados`   | `<schedule_id>`    | Lo que marca Damián: si vino, si compró e importe (no lo toca la tarea) |

## Pasos de cada noche

Todo en hora de Madrid. `HOY` = hoy; la ventana es de `HOY-21` a `HOY-1` (días completos).
Las respuestas grandes del conector se guardan solas en ficheros; esos ficheros son la entrada del script.

1. **Seguidores.** `get_instagram_profile` → escribe `data/metricas/seguidores/<HOY>` con
   `{fecha, seguidores, publicaciones, calculado_en}`.
2. **Conversaciones.** Primero `search_conversations` con `has_agent: "any"`, `channel: "INSTAGRAM"`,
   `first_message_after: <HOY-21>T00:00:00+01:00`, `first_message_before: <HOY-1>T23:59:59+01:00`,
   `sort_by: "first_message_at"`, `limit: 1` para leer `total_count`.
   Elige un `limit` L entre 60 y 100 tal que `total_count % L` sea 0 o al menos 40 (así ninguna página
   es tan pequeña que vuelva en línea) y pide todas las páginas con ese L. Usa `+02:00` en horario de verano.
3. **Contactos.** `list_crm_contacts` con `pageSize: 100` y `createdAt: [<HOY-60>, <HOY+1>]`, dos veces:
   filtro `booking_data_requested = "true"` (fichero *final*) y `email_shared = "@"` (fichero *datos*).
   Si `totalCount` > 100, pide también la página 2.
4. **Calcular.** Copia los ficheros a una carpeta de trabajo y ejecuta
   `python3 tools/portal/embudo_diario.py --conv <ficheros de conversaciones> --final <final> --datos <datos> --dias <cada día de la ventana>`.
   Saca un JSON con las escrituras (`set`) para `ArtifactData`.
5. **Guardar.** Lista `data/metricas/embudo` y `data/metricas/contenido` (con `out_dir`) para saber la
   `version` de los documentos que ya existen y pon `if_version` en esas escrituras (los nuevos van sin él).
   Escribe con `ArtifactData` `batch`, como mucho 50 entradas por lote, usando `file_path` para cada documento.
6. **Resumen.** Una línea por día: entran, conversan, llegan al final, dan datos. Si algo falla, dilo y no
   escribas números inventados.

Nunca cambies nada en Ninjo, no mandes mensajes y no toques `data/llamadas/resultados`.
