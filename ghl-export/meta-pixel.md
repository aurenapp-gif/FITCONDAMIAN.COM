# Meta Pixel — Fit con Damián (GHL)

Pixel ID: `2434269600397617`

## 1) Código base del pixel
Va en el **HEAD de TODO el embudo** (GHL: Configuración del embudo → Código de
seguimiento → Encabezado/Head). Dispara `PageView` en todas las páginas.

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2434269600397617');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=2434269600397617&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
```

## 2) Eventos por página
Cada snippet va en el **código de seguimiento de ESA página** (o al final de su
bloque de código). El base ya debe estar cargado (paso 1).

### PÁGINA 1 · Recursos (Optin) — clic en "Acceder a los recursos"
```html
<script>
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-open-modal]');
    if (t && typeof fbq === 'function') { fbq('trackCustom', 'ClicAccederRecursos'); }
  });
</script>
```

### PÁGINA 2 · Confirmar correo — conversión LEAD
```html
<script>
  if (typeof fbq === 'function') { fbq('track', 'Lead'); }
</script>
```

### PÁGINA 4 · Después de agendar (llamada agendada) — SCHEDULE
```html
<script>
  if (typeof fbq === 'function') { fbq('track', 'Schedule'); }
</script>
```

## 3) Mapa de conversiones del embudo
| Página | Evento Meta | Qué significa |
|---|---|---|
| Todas | PageView | Visita |
| Optin (recursos) | ClicAccederRecursos (custom) | Intención / clic |
| Confirmar correo | **Lead** | Dejó el email (conversión principal) |
| Después de agendar | **Schedule** | Reservó llamada (conversión de calidad) |

## 4) Qué optimizar en la campaña
- Objetivo **Clientes potenciales (Leads)** → optimizar por evento **Lead**.
- Para escalar a llamadas: campaña optimizada por **Schedule**.
- Necesitas ~50 conversiones/semana por conjunto de anuncios para salir de la
  fase de aprendizaje. Si aún hay poco volumen, optimiza por **Lead** (más
  frecuente) hasta tener datos y luego pasa a **Schedule**.

## 5) API de Conversiones (CAPI) — dónde va el token
El token NO se pega en el código. Se conecta en GHL con la integración nativa:
GHL → Configuración → Integraciones → Facebook/Meta → conectar cuenta (OAuth).
Así GHL envía los eventos server-side y no se pierden por bloqueadores.
El Pixel ID debe coincidir: `2434269600397617`.
