# Fit con Damián — fitcondamian.com

Landing pages para captación de leads, integradas con **GoHighLevel (GHL)**.

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/recursos` | Landing de recursos gratuitos con formulario GHL |
| `/confirmar-correo` | Pantalla "revisa tu correo para confirmar" |
| `/acceso-recursos` | Página con todos los recursos (link enviado por email) |
| `/agendar` | Landing para agendar llamada (calendario GHL) |
| `/gracias` | Página de gracias tras agendar la llamada |

## Flujo de recursos gratuitos

1. Usuario llega a `/recursos` y rellena el formulario GHL
2. GHL guarda el lead y redirige a `/confirmar-correo`
3. GHL envía un email de confirmación (double opt-in)
4. El usuario hace clic en el enlace del email → llega a `/acceso-recursos`
5. Descarga todos los recursos

## Flujo de llamada

1. Usuario llega a `/agendar` y reserva en el calendario GHL
2. Tras reservar, GHL redirige a `/gracias`

## Pendiente de configurar (busca los comentarios `👉` en el código)

- **`app/recursos/page.tsx`** → pegar el embed iframe del formulario GHL + URL de redirección a `/confirmar-correo` + video
- **`app/acceso-recursos/page.tsx`** → poner los links reales de cada recurso (PDF/Drive/Notion)
- **`app/agendar/page.tsx`** → calendario ya conectado; configurar en GHL la URL de confirmación a `/gracias`; personalizar bio
- **`app/gracias/page.tsx`** → links reales de redes sociales

## Desarrollo

```bash
npm install
npm run dev
```

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS
