# Configurar Brevo para los correos de SoloRopa

Esta guía deja funcionando los correos reales: los avisos de bajada de precio
([PRICE_ALERTS.md](./PRICE_ALERTS.md)) y la recuperación de contraseña.

Se usa la **API** de Brevo (no SMTP) porque Render gratis bloquea los puertos de SMTP.
Los nombres de los menús de Brevo pueden cambiar un poco; si no encuentras algo, búscalo en
la barra de búsqueda de su panel.

## Resumen

| Paso | Dónde | Resultado |
|---|---|---|
| 1. Crear la cuenta | brevo.com | Plan gratis (300 correos/día) |
| 2. Remitente | Brevo → Senders, Domains & Dedicated IPs | `MAIL_FROM` |
| 3. API key | Brevo → Settings → SMTP & API → API Keys & MCP | `BREVO_API_KEY` |
| 4. IPs autorizadas | Brevo → Security → Authorized IPs | Que GitHub y Render no queden bloqueados |
| 5. Secreto de los links | Tu terminal | `EMAIL_TOKEN_SECRET` |
| 6. Variables en Render | Render → Environment | Recuperación de contraseña |
| 7. Secrets en GitHub | GitHub → Settings → Secrets | Avisos de precio |
| 8. Probar | Local, el sitio y Actions | Confirmar que llegan |

## 1. Crear la cuenta

1. Regístrate en [brevo.com](https://www.brevo.com) con el plan **Free**.
2. Completa los datos que pide del perfil (nombre, empresa o proyecto, dirección). Brevo los exige
   antes de dejarte enviar; si te pide validar la cuenta, hazlo antes de seguir.

## 2. Elegir el remitente (`MAIL_FROM`)

Es la dirección que aparece en "De:". Hay dos caminos:

### Opción A: sin dominio propio (para empezar)

1. Ve a **Senders, Domains & Dedicated IPs → Senders → Add a sender**.
2. Nombre: `SoloRopa`. Correo: el tuyo (por ejemplo, un Gmail).
3. Brevo te manda un correo o un código para verificarlo.

Ojo: Brevo **no puede autenticar** direcciones de Gmail, Yahoo u otros correos gratuitos, así que
las reescribe. Tu `algo@gmail.com` saldrá como algo parecido a `algo@5000001.t-sender-sib.com`.
Funciona, pero se ve raro y es más probable que caiga en spam.

```
MAIL_FROM=SoloRopa <tu-correo@gmail.com>
```

### Opción B: con dominio propio (recomendada)

Si compras un dominio (por ejemplo `soloropa.cl`):

1. Ve a **Senders, Domains & Dedicated IPs → Domains → Add a domain** y escribe tu dominio.
2. Brevo te muestra registros DNS: un **código de Brevo** (TXT), **DKIM** y **DMARC**.
3. Agrégalos en donde administras el DNS del dominio (NIC Chile, Cloudflare, Vercel, etc.).
   Debe haber **un solo** registro DMARC; si ya tienes uno, Brevo te pregunta si reemplazarlo.
4. Vuelve a Brevo y pulsa **Authenticate this domain**. Los cambios de DNS pueden tardar desde
   minutos hasta un par de horas. Cuando funcione, DKIM y DMARC aparecen con un ✔ verde.
5. Crea el remitente con una dirección de ese mismo dominio, por ejemplo `alertas@soloropa.cl`
   (no hace falta que exista un buzón real para enviar).

```
MAIL_FROM=SoloRopa <alertas@soloropa.cl>
```

## 3. Crear la API key (`BREVO_API_KEY`)

1. Abajo a la izquierda: **Settings → SMTP & API → API Keys & MCP** → **Generate API key**.
2. Ingresa el código de verificación que te llega.
3. **Key name:** `soloropa-produccion`.
4. **Expiry:** sin vencimiento (*no expiration*). Si eliges una fecha, tendrás que crear otra key
   y actualizarla en Render y GitHub cuando venza.
5. **Access:** **Restricted**, y en **Permissions** deja todo en **None** salvo:

   | Recurso | Permiso |
   |---|---|
   | **Transactional email** | **All** |

   Es lo único que usa SoloRopa: enviar correos con `POST /v3/smtp/email`. Para ese recurso Brevo
   solo ofrece None, Read y All, y **Read no permite enviar**. Con All la key también puede ver y
   borrar registros y plantillas de correos transaccionales, pero no tocar contactos, campañas
   ni la cuenta.
6. Deja **apagado** "Create MCP server API key".
7. **Cópiala en ese momento**: Brevo la muestra una sola vez. Si la pierdes, crea otra.
   Después pulsa **I've saved my key**.

Ojo:
- **Brevo desactiva la key si pasa 90 días sin una llamada exitosa**, aunque no tenga vencimiento.
  Avisa por correo 7 días antes. Si en 90 días no se envía ningún aviso ni recuperación de
  contraseña (pocos usuarios al principio), hay que reactivarla en **API Keys & MCP**.
- Si falta el permiso, Brevo responde `Access denied for resource`.
- Si te equivocas de pestaña y creas una **SMTP key** (`xsmtpsib-`), no sirve para la API:
  Brevo responde `401 Key not found`.

Nunca la pegues en el código ni en un archivo que se suba a GitHub: solo en las variables de
entorno de Render, los secrets de GitHub y tu `.env` local (que está en `.gitignore`).

## 4. IPs autorizadas: desactivar el bloqueo

Brevo anota las IPs que usan tus API keys. Después de un tiempo sin IPs nuevas, **empieza a
bloquear las desconocidas**. Los servidores de GitHub Actions y de Render cambian de IP en cada
corrida, así que tarde o temprano los correos fallarían con un error de IP no autorizada.

1. Ve a **Settings → Security → Authorized IPs**.
2. Si el estado dice **Activated**, pulsa **Deactivate blocking** y confirma.

Es menos seguro que tener una lista fija de IPs, pero con IPs que cambian no hay otra opción.
Por lo mismo, cuida la API key como una contraseña y rótala si sospechas que se filtró.

## 5. Generar `EMAIL_TOKEN_SECRET`

Firma los links de "Dejar de recibir estos avisos". Genera un valor al azar:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Debe ser **el mismo** en Render y en GitHub: los links los firma el cron (GitHub) y los
verifica el backend (Render). Si cambia, los links de correos anteriores dejan de funcionar.

## 6. Variables en Render (backend)

En [Render](https://dashboard.render.com) → tu servicio del backend → **Environment** →
**Add Environment Variable**:

| Variable | Valor |
|---|---|
| `BREVO_API_KEY` | La key del paso 3 |
| `MAIL_FROM` | El remitente del paso 2, ej. `SoloRopa <alertas@soloropa.cl>` |
| `EMAIL_TOKEN_SECRET` | El valor del paso 5 |
| `FRONTEND_URL` | Ya existe: `https://soloropa.vercel.app` |

Guarda. Render vuelve a desplegar solo. El backend desplegado tiene que incluir el código de los
avisos (rama `price-history` mergeada).

## 7. Secrets en GitHub (cron diario)

En GitHub → el repositorio → **Settings → Secrets and variables → Actions**:

**Pestaña Secrets → New repository secret**, uno por cada uno:

| Secret | Valor |
|---|---|
| `BREVO_API_KEY` | La misma key |
| `MAIL_FROM` | El mismo remitente |
| `EMAIL_TOKEN_SECRET` | El mismo valor que en Render |

`MONGODB_URI` ya debería estar desde la fase del scraping diario.

**Pestaña Variables** (opcional): `FRONTEND_URL` y `PUBLIC_API_URL`. Si no las creas, el
workflow usa `https://soloropa.vercel.app` y `https://soloropa.onrender.com`.

## 8. Probar

### a) Desde tu computador, sin tocar la base

Manda un correo de prueba directo con el mailer. En una terminal nueva:

```powershell
cd backend
$env:BREVO_API_KEY = "xkeysib-..."
$env:MAIL_FROM = "SoloRopa <alertas@soloropa.cl>"
npx ts-node -T -e "require('./src/utils/mailer').sendEmail({ to: 'tu-correo@gmail.com', subject: 'Prueba SoloRopa', html: '<p>Funciona</p>', text: 'Funciona' }).then(r => console.log('Enviado', r.messageId))"
```

Debería imprimir `Enviado <...>` y el correo llegar en un minuto (revisa también spam). Cierra esa
terminal al terminar para no dejar la key en el entorno.

### b) Recuperación de contraseña

Con el backend desplegado, entra a `/forgot-password` en el sitio y pide el enlace para tu propio
correo. En Brevo, el envío aparece en los registros de correos transaccionales (**Transactional →
Logs**).

### c) El cron de avisos

Con todo mergeado a `main`: GitHub → **Actions → Scraping diario → Run workflow**. Al terminar,
el resumen de la corrida muestra una línea como:

```
Avisos de precio (brevo): 3 correos a 3 usuarios · 4 avisos enviados · ...
```

Si dice `sin enviar (falta BREVO_API_KEY ...)` o `(falta EMAIL_TOKEN_SECRET ...)`, revisa el
paso 7. El primer día probablemente no haya avisos: hace falta que algo baje de precio.

## Problemas comunes

| Síntoma | Causa probable |
|---|---|
| `Brevo rechazó el envío (HTTP 401): Key not found` | Key mal copiada, borrada, desactivada por 90 días sin uso, o es una SMTP key (`xsmtpsib-`) |
| `Access denied for resource` | A la key le falta **Transactional email: All** (paso 3) |
| `HTTP 401` con un mensaje de IP no autorizada | Falta el paso 4 |
| `HTTP 400` sobre el remitente (`sender`) | `MAIL_FROM` no coincide exactamente con un remitente verificado en Brevo |
| Falta `MAIL_FROM` | La variable no está definida donde corre el código (Render o GitHub) |
| Los correos llegan a spam | Sin dominio propio (opción A). Autentica un dominio (opción B) |
| Los avisos del cron dicen "sin enviar" | Faltan `BREVO_API_KEY` o `EMAIL_TOKEN_SECRET` en GitHub |
| Los links "Dejar de recibir avisos" dicen "no es válido" | `EMAIL_TOKEN_SECRET` distinto entre Render y GitHub |
| Algunos correos no salen a fin de día | Límite del plan gratis: 300 correos al día |

## Referencias

- [Crear y administrar API keys (Brevo)](https://help.brevo.com/hc/en-us/articles/209467485)
- [Permisos de las API keys (Brevo)](https://help.brevo.com/hc/en-us/articles/40158277171474)
- [Autorizar y bloquear IPs para la API (Brevo)](https://help.brevo.com/hc/en-us/articles/5740111683858)
- [Autenticar tu dominio: código de Brevo, DKIM y DMARC](https://help.brevo.com/hc/en-us/articles/12163873383186)
- [Por qué Brevo reemplaza remitentes de correos gratuitos](https://help.brevo.com/hc/en-us/articles/16045394674066)
- [Requisitos de Gmail, Yahoo y Microsoft para remitentes](https://help.brevo.com/hc/es/articles/14925263522578-Cumplir-los-requisitos-de-Gmail-Yahoo-y-Microsoft-para-remitentes-de-email)
- [Límites del plan gratis](https://help.brevo.com/hc/en-us/articles/208580669)
