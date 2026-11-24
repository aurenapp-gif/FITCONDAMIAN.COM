# Panel privado de Fit con Damián: cómo se rellena

El panel vive en **https://fitcondamian.com/panel-fcd** (con contraseña, sin enlaces desde la web y con
`noindex`). Sus datos están en un Blob store privado de Vercel y llegan por `POST /api/panel/sync`.
Claude los lee de Ninjo y los envía; lo único manual es marcar en el panel si cada persona vino y compró.

## Variables en Vercel (proyecto fitcondamian-com)

- `PANEL_PASSWORD`: contraseña del panel. También autoriza los envíos de datos (cabecera `Authorization: Bearer`).
- `BLOB_READ_WRITE_TOKEN`: la crea Vercel al conectar un Blob store (privado) al proyecto.
- `PANEL_SYNC_TOKEN` (opcional): clave aparte solo para los envíos.

En la sesión de Claude que hace los envíos, la contraseña está guardada como secreto de red para
`fitcondamian.com`: el proxy añade la cabecera sola, así que los `curl` no llevan la clave.

## Qué se envía (`{ "tipo": ..., "datos": ... }`)

| tipo            | datos                                   | de dónde                                   |
|-----------------|-----------------------------------------|--------------------------------------------|
| `agendas`       | lista de llamadas                       | `list_schedules` (Europe/Madrid, limit 100) |
| `perfil`        | seguidores y publicaciones              | `get_instagram_profile`                    |
| `seguidores`    | `{ HOY: {...} }` foto diaria            | `get_instagram_profile`                    |
| `publicaciones` | últimas 30                              | `get_instagram_posts`                      |
| `origenes`      | `{ "7": [...], "14": ..., "30": ..., "90": ... }` | `get_agent_insights` sections `["sources"]` |
| `embudo`        | `{ día: {...} }` por día de entrada      | `embudo_diario.py`                          |
| `contenido`     | `{ reel_día: {...} }`                   | `embudo_diario.py`                          |
| `resultados`    | `{ schedule_id: {asistio, vendido, importe} }` | solo si Damián dicta resultados en el chat |

## Actualización rápida (mediodía)

1. `list_schedules` (timezone Europe/Madrid, limit 100, sort datetime_desc; si `total_pages` > 1, todas),
   `get_instagram_profile`, `get_instagram_posts` (limit 30) y `get_agent_insights` con
   `agent_id 01a0c9dc-7bd0-703c-892f-392b73fbdd0e`, `sections ["sources"]` y `days` 7, 14, 30 y 90.
2. Pasa las respuestas a ficheros con `tools/portal/extraer_resultados.py --herramienta <nombre mcp> --salida <dir> --ultimas N`
   (sirve tanto si la respuesta vino en línea como si se guardó en un fichero).
3. `python3 tools/portal/preparar_sync.py --salida <out> --agendas ... --perfil ... --seguidores <HOY> --publicaciones ... --origenes 7=... 14=... 30=... 90=...`
4. Envía cada fichero: `curl -sS -X POST https://fitcondamian.com/api/panel/sync -H "Content-Type: application/json" --data @<out>/<tipo>.json`.

## Actualización completa (noche)

Lo mismo que la rápida y, además, el embudo. Todo en hora de Madrid; la ventana es de `HOY-21` a `HOY-1`.

1. `search_conversations` con `has_agent "any"`, `channel "INSTAGRAM"`, `first_message_after <HOY-21>T00:00:00+01:00`,
   `first_message_before <HOY-1>T23:59:59+01:00`, `sort_by "first_message_at"`. Primero `limit 1` para leer `total_count`;
   luego todas las páginas con un `limit` entre 60 y 100 (usa `+02:00` en horario de verano).
2. `list_crm_contacts` con `pageSize 100` y `createdAt [<HOY-60>, <HOY+1>]`, una vez con `booking_data_requested = "true"`
   (final) y otra con `email_shared = "@"` (datos). Si `totalCount` > 100, pide también la página 2.
3. Extrae todo a ficheros con `extraer_resultados.py` y ejecuta
   `python3 tools/portal/embudo_diario.py --conv <conversaciones> --final <final> --datos <datos> --dias <cada día> > writes.json`
4. `python3 tools/portal/preparar_sync.py --salida <out> --embudo writes.json` y envía `embudo.json` y `contenido.json`.
5. Resumen: una línea por día (entran, conversan, llegan al final, dan datos). Si algo falla (Ninjo, la web devuelve
   401/503), dilo claramente y no inventes números.

Nunca cambies nada en Ninjo ni mandes mensajes. `resultados` solo se envía cuando Damián dicta en el chat quién vino o compró.
