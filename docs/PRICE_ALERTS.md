# Avisos de bajada de precio por correo

Cuando baja el precio de un producto que alguien guardó en favoritos, le llega un correo.
Se envía como máximo un correo al día por persona, con todo lo que bajó.

## Cómo funciona

1. **El scrape detecta la bajada** (`saveOrUpdateProduct` en `backend/src/scrapers/index.ts`) y
   `queuePriceDropAlerts` (`backend/src/services/priceAlerts.ts`) deja una fila `pending` en la
   colección `pricealerts` por cada usuario que tiene el producto en favoritos.
2. **El cron diario** (`.github/workflows/scrape.yml` → `npm run scrape:all`) termina con
   `sendPendingPriceAlerts`, que junta las pendientes de cada usuario y manda un correo.
3. El correo trae un link para **dejar de recibir avisos** sin iniciar sesión
   (`/desuscribir?token=…`). También se apagan desde el perfil, en "Notificaciones".

## Reglas

| Regla | Valor |
|---|---|
| A quién | Quien tiene el producto en favoritos (listas propias o la lista por defecto) y no apagó los avisos |
| Qué cuenta como bajada | El precio "desde" baja un **5% o más** respecto al anterior |
| Producto | Activo y con stock |
| Protección contra errores de scraping | Se ignora si el precio nuevo es menor a $1.000 o si cae más de un 90% |
| No repetir | Solo se avisa si el precio nuevo es menor al último que ya le avisamos a esa persona |
| Frecuencia | Un correo al día como máximo, hasta 10 productos (el resto se resume) |
| Antes de enviar | Si el precio volvió a subir o el producto ya no está disponible, se descarta |
| Vencimiento | Las pendientes de más de 7 días se descartan |
| Reintentos | Si el envío falla, se reintenta en la corrida siguiente, hasta 3 veces |

Los valores están en `backend/src/utils/priceAlerts.ts`.

## Proveedor: Brevo

Render gratis bloquea SMTP (puertos 25, 465 y 587), así que los correos salen por la API HTTPS
de Brevo (`backend/src/utils/mailer.ts`). El plan gratis permite 300 correos al día.

Paso a paso (cuenta, remitente, API key, IPs autorizadas, variables y pruebas):
**[BREVO_SETUP.md](./BREVO_SETUP.md)**.

Sin `BREVO_API_KEY`, el mailer usa [Ethereal](https://ethereal.email): los correos no llegan a
nadie y la consola muestra un link para verlos. Con la base de producción, los avisos no se envían
por Ethereal (quedan pendientes), para no marcarlos como enviados sin que lleguen.

## Variables de entorno

| Variable | Render (backend) | GitHub Actions | Para qué |
|---|---|---|---|
| `BREVO_API_KEY` | ✅ secret | ✅ secret | Enviar correos |
| `MAIL_FROM` | ✅ | ✅ secret | Remitente verificado, ej. `SoloRopa <alertas@tudominio.cl>` |
| `EMAIL_TOKEN_SECRET` | ✅ secret | ✅ secret | Firma los links para desuscribirse. **El mismo valor en los dos** |
| `FRONTEND_URL` | ✅ (ya existe) | variable, opcional | Links a los productos. Por defecto `https://soloropa.vercel.app` |
| `PUBLIC_API_URL` | — | variable, opcional | Botón "Anular suscripción" de Gmail. Por defecto `https://soloropa.onrender.com` |

Para generar `EMAIL_TOKEN_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

La recuperación de contraseña usa el mismo mailer, así que con `BREVO_API_KEY` y `MAIL_FROM` en
Render también empieza a enviar correos reales.

## Probar en local

Con una base local (no la de producción):

```bash
MONGODB_TARGET=local MONGODB_URI_LOCAL=mongodb://127.0.0.1:27017 npm --prefix backend run scrape:all
```

Al final se imprime un link "Vista previa" por cada correo enviado con Ethereal.
