# Recuperación del catálogo de Treino

Treino usa Shopify en `https://treino.cl`. La integración anterior de Jumpseller
conservaba imágenes que devuelven texto `Image Not Found!`, incluso con HTTP 200.

Desde `backend`, la migración usa `MONGODB_URI` y `MONGODB_DBNAME` de producción:

```powershell
node -r ts-node/register src/scrapers/scripts/migrateTreino.ts
```

Por defecto sólo lee ambos catálogos, comprueba una imagen del CDN y guarda un
plan en `backend/uploads/treino-migration/`. Revisar sus coincidencias antes de aplicar:

```powershell
node -r ts-node/register src/scrapers/scripts/migrateTreino.ts --apply
```

La ejecución guarda un respaldo BSON Extended JSON de la marca y sus productos,
junto con los IDs previstos para nuevas inserciones. Aplica todo en una transacción:

- Conserva los IDs y métricas al actualizar coincidencias únicas de URL,
  título normalizado o identificador de la antigua página.
- Inserta los productos nuevos con los valores predeterminados del modelo.
- Conserva los registros sin equivalencia como no disponibles, sin imágenes rotas
  y sin stock en sus variantes. Los favoritos siguen apuntando a los mismos IDs.
- Actualiza el sitio de la marca. Aborta si los datos cambiaron desde el respaldo.

La repetición compara primero URLs y no vuelve a insertar los productos migrados.
Los respaldos están excluidos de Git. Conservarlos hasta verificar la recuperación.
Para una restauración, deserializar el respaldo con `mongoose.mongo.BSON.EJSON`,
restaurar sus productos y marca por `_id`, y eliminar únicamente sus `insertedIds`,
en otra transacción. Revisar primero cualquier cambio posterior a la migración.

El backend ahora aborta ante un catálogo vacío, HTML o errores de paginación.
El frontend usa una imagen alternativa local y termina el estado de carga si falla
una fotografía. Los productos inactivos quedan fuera de los listados públicos,
pero siguen disponibles por ID y en las listas de favoritos.

Los cambios de código deben desplegarse en el hosting para mantener la integración
y mostrar la imagen alternativa allí. La migración actualiza directamente MongoDB.
