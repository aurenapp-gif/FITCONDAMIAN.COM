# Panel privado de Fit con Damián

El panel vive en **https://fitcondamian.com/panel-fcd** (con contraseña, sin enlaces desde la web y con
`noindex`). Se rellena solo: un cron de Vercel (`vercel.json`, cada hora) llama a `/api/panel/cron`, que lee
Ninjo, Meta, Hotmart y Stripe y guarda cada tipo de dato como un JSON en un Blob store privado (`panel/`).
Lo único manual es marcar en el panel si cada persona vino a la llamada y las ventas por transferencia.

## Variables en Vercel (proyecto fitcondamian-com, entorno Production)

| Variable | Para qué |
|---|---|
| `PANEL_PASSWORD` | contraseña del panel |
| `BLOB_READ_WRITE_TOKEN` | la crea Vercel al conectar el Blob store |
| `CRON_SECRET` | autoriza el cron (también vale la cabecera `x-cron-secret`) |
| `NINJO_USERNAME` / `NINJO_PASSWORD` | acceso al cortex-gateway de Ninjo |
| `HOTMART_CLIENT_ID`, `HOTMART_CLIENT_SECRET`, `HOTMART_BASIC` | ventas de Hotmart |
| `STRIPE_SECRET_KEY` | cobros de Stripe |
| `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` (opcional `META_IG_ID`) | Meta Ads e Instagram |

Los nombres sin guiones bajos (`HOTMARTCLIENTID`, `METAACCESSTOKEN`…) también se aceptan. Tras añadir o cambiar una
variable hay que volver a desplegar.

El token de Meta es de un usuario del sistema del portfolio "Damián" con la app "Analisis Contenido" y los permisos
`ads_read`, `business_management`, `instagram_basic`, `instagram_manage_insights`, `pages_show_list` y
`pages_read_engagement`.

## Código

- `app/_panel/sincronizar.ts`: `syncRapida` (agendas, perfil, publicaciones, orígenes, mensajes manuales),
  `syncEmbudo` (conversaciones y CRM de Ninjo por día de entrada), `syncMeta`, `syncVentas` y `ejecutar`.
- `app/_panel/{ninjo,meta,ventas,store,auth}.ts`: clientes de cada fuente, almacén y sesión.
- `app/api/panel/*`: login, cron, actualizar, ventas-manuales, sync y diag (solo nombres de variables y recuentos).
- `app/panel-fcd/*`: la página del panel.

## Comprobar a mano

`curl -H "x-cron-secret: $CRON_SECRET" "https://fitcondamian.com/api/panel/cron?solo=rapida"` ejecuta una
actualización y devuelve un resumen por fuente. `/api/panel/diag?_entorno=1` lista qué variables de conexión
ve el despliegue (solo nombres y longitud).

Los scripts `embudo_diario.py`, `preparar_sync.py` y `extraer_resultados.py` son de la versión anterior, en la que
Claude enviaba los datos a `/api/panel/sync`; siguen funcionando pero ya no hacen falta.
