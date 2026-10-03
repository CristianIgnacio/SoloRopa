# Diagnóstico de Google en producción

Revisión del 29 de septiembre de 2026.

## Hallazgo confirmado

El frontend publicado en `https://soloropa.vercel.app` llama a
`https://soloropa.onrender.com/api/auth/google`.

Una petición POST con una credencial deliberadamente inválida devolvió:

```text
HTTP 404
{"error":"unknown endpoint"}
```

La ruta existe en `backend/src/routes/authRoutes.ts` y está montada bajo
`/api/auth` en `backend/src/routes/index.ts`. Se incorporó en el commit
`27e2b3b`. El servicio desplegado no está exponiendo esa ruta: revisar si Render
usa una versión anterior, otra rama o archivos compilados antiguos. No se pudo
determinar el commit desplegado sin acceso al panel de Render.

El preflight OPTIONS devuelve 204 y permite el origen de Vercel, credenciales
y Content-Type. GET `/api/auth/login/me` devuelve 401 `missing token`, esperado
sin iniciar sesión. Por lo tanto, la API es accesible y el CORS examinado está
correcto. OPTIONS no demuestra que exista un endpoint: lo atiende el middleware.

El JavaScript publicado contiene el mismo ID público de cliente Google que los
archivos de entorno locales. Esto no permite comprobar la variable de Render
ni los orígenes autorizados en Google Cloud.

Además, GET `https://soloropa.vercel.app/login` devuelve 404 de Vercel.
Se agregó `frontend/vercel.json` con el rewrite para React Router, siguiendo
[la documentación de Vercel para Vite](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas).

## Pasos para corregir el despliegue

1. En Render, comprobar el repositorio, la rama y el commit publicados. La rama
   debe contener `27e2b3b` y los cambios posteriores que se quieran publicar.
2. Para un servicio con Root Directory `backend`, usar Build Command
   `npm ci && npm run build` y Start Command `npm start`. El inicio ejecuta
   `out/index.js`, de modo que omitir la compilación puede ejecutar código viejo.
   Si Root Directory es la raíz del repositorio, ajustar los comandos para
   ejecutarlos dentro de `backend`.
3. Verificar en Render:

   ```env
   NODE_ENV=production
   FRONTEND_URL=https://soloropa.vercel.app
   GOOGLE_CLIENT_ID=<mismo valor que VITE_GOOGLE_CLIENT_ID en Vercel>
   COOKIE_SAME_SITE=none
   ```

   Mantener las variables existentes de MongoDB y JWT. `COOKIE_SAME_SITE=none`
   es necesario para la arquitectura actual de frontend y API en sitios distintos;
   el código añade `Secure` y `HttpOnly`. El bloqueo de cookies de terceros del
   navegador puede impedir la sesión incluso con `SameSite=None`. Si eso ocurre,
   usar un proxy del mismo origen o dominios que compartan sitio.
   No se ha comprobado el valor actual de esta variable en Render.
4. Desplegar el backend y confirmar que POST `/api/auth/google` deja de responder
   404. No usar un token real en registros ni capturas. El controlador actual
   deriva los errores de verificación de Google al manejador global, por lo que
   una credencial inválida puede responder 500; eso tampoco demuestra un login
   exitoso.
5. En Google Cloud, comprobar que el cliente web tenga
   `https://soloropa.vercel.app` como origen JavaScript autorizado. El flujo
   actual usa callback de JavaScript, no un endpoint OAuth de redirección.
   [Configuración oficial de Google](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).
6. En Vercel, verificar Root Directory `frontend` y volver a desplegar para
   publicar el rewrite y los mensajes de error. Mantener
   `VITE_API_URL=https://soloropa.onrender.com` y el ID Google existente.
   Las variables `VITE_*` se incorporan durante la compilación:
   [documentación de Vite](https://vite.dev/guide/env-and-mode).
7. Con una cuenta de prueba, iniciar sesión y comprobar que POST
   `/api/auth/google` y GET `/api/auth/login/me` devuelven 200; recargar la página
   y confirmar que se mantiene la sesión.

## Pruebas locales

Desde `backend`, en PowerShell:

```powershell
$env:TS_NODE_FILES='true'
node --require ts-node/register test/google-auth.test.cjs
```

Las cinco pruebas usan el router y el controlador reales, con Google y el modelo
de usuario simulados. Cubren rechazo sin sesión, validación del audience, usuario
nuevo, vinculación de cuenta existente y recuperación de sesión con cookie/CSRF.
No conectan a MongoDB ni usan cuentas de Google. La prueba HTTP comprueba los
atributos de cookie; no simula las políticas de cookies de un navegador.

No se completó una autenticación real ni se publicó ningún cambio durante esta
revisión. El 404 de producción requiere corregir el despliegue de Render antes
de validar el flujo completo.
