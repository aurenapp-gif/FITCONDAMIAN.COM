# Meta Pixel — Fit con Damián (GHL)

Pixel ID: `2434269600397617`

## 1) Código base del pixel
Va en el **HEAD de TODO el embudo** (GHL: Configuración del embudo → Código de
seguimiento → Encabezado/Head). Dispara `PageView` en todas las páginas **menos
en la de gracias (llamada agendada)**, que va sin pixel.

```html
<!-- Meta Pixel Code (no se carga en la página de gracias) -->
<script>
(function () {
  // Páginas SIN pixel: cualquier dirección que contenga alguna de estas palabras.
  // Si la página de gracias de GoHighLevel tiene otra dirección, añádela aquí.
  var SIN_PIXEL = ['gracias', 'llamada-agendada'];
  var ruta = location.pathname.toLowerCase();
  for (var i = 0; i < SIN_PIXEL.length; i++) { if (ruta.indexOf(SIN_PIXEL[i]) !== -1) return; }
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
})();
</script>
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

### PÁGINA 4 · Después de agendar (llamada agendada) — SIN PIXEL
Esta página no lleva ningún código de Meta. Si en su código de seguimiento
estaba el snippet de `Schedule`, bórralo.

## 3) Mapa de conversiones del embudo
| Página | Evento Meta | Qué significa |
|---|---|---|
| Todas | PageView | Visita |
| Optin (recursos) | ClicAccederRecursos (custom) | Intención / clic |
| Confirmar correo | **Lead** | Dejó el email (conversión principal) |
| Después de agendar | — (sin pixel) | No se mide con el pixel |

## 4) Qué optimizar en la campaña
- Objetivo **Clientes potenciales (Leads)** → optimizar por evento **Lead**.
- Necesitas ~50 conversiones/semana por conjunto de anuncios para salir de la
  fase de aprendizaje.

## 5) API de Conversiones (CAPI) — dónde va el token
El token NO se pega en el código. Se conecta en GHL con la integración nativa:
GHL → Configuración → Integraciones → Facebook/Meta → conectar cuenta (OAuth).
Así GHL envía los eventos server-side y no se pierden por bloqueadores.
El Pixel ID debe coincidir: `2434269600397617`.
