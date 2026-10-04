# Desarrollo local con MongoDB de producción

En `backend/.env`, conserva las credenciales existentes y configura:

```env
NODE_ENV=development
MONGODB_TARGET=production
MONGODB_DBNAME=SoloRopa
MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8
FRONTEND_URL=http://localhost:5173
```

`MONGODB_TARGET=production` selecciona `MONGODB_URI` también en desarrollo.
`NODE_ENV=test` siempre selecciona `TEST_MONGODB_URI`. En producción se sigue
usando `MONGODB_URI` sin necesitar la nueva variable.

`MONGODB_DNS_SERVERS` es opcional. Corrige el error local
`querySrv ECONNREFUSED` observado cuando Node usa `127.0.0.1` como DNS.
Se aplica al resolvedor DNS del proceso Node; no cambia la red de Windows.
No hace falta configurarlo en Render si allí funciona la resolución DNS.

Desde la raíz del proyecto, en dos terminales:

```powershell
npm run dev:back
```

```powershell
npm run dev:front
```

El frontend debe tener `VITE_API_URL=http://localhost:3001`. No es necesario
iniciar Docker para esta conexión. Reinicia el backend si modificas su `.env`.

Las operaciones realizadas desde la aplicación local se guardan en la base
real de producción. Para volver a la base local, elimina `MONGODB_TARGET` y
configura `MONGODB_URI_LOCAL` con la URI de tu MongoDB local.
