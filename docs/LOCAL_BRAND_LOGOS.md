# Logos locales de las marcas

Los logos están en `frontend/public/brands/` y se sirven desde `/brands/` en el
mismo sitio que la página. `frontend/src/data/brandLogos.ts` relaciona cada marca
con su archivo y `BrandLogo` los muestra en el carrusel.

La página no descarga logos de las tiendas. Para una marca sin archivo o una
imagen local fallida, muestra sus iniciales. Se conserva el fondo configurado
para cada marca y los formatos originales, incluyendo SVG y GIF animado.

Para actualizar las copias locales o incorporar nuevas marcas, desde `backend`:

```powershell
node -r ts-node/register src/scrapers/scripts/downloadBrandLogos.ts
```

El script lee las marcas usando `MONGODB_URI` y `MONGODB_DBNAME`, descarga sus
logos y comprueba el formato y dimensiones reales. Sólo reemplaza las copias y
el manifiesto cuando todas las descargas son válidas. No modifica MongoDB.
Las URLs de origen permanecen como metadatos para futuras actualizaciones;
Treino usa el origen actual de Shopify en lugar del antiguo de Jumpseller.

`docs/brand-logo-sources.json` registra los orígenes, dimensiones y hashes de las
copias descargadas. Los archivos de imagen y el manifiesto deben incluirse en
Git y desplegarse junto con el frontend. Vite copia `public/brands/` a `dist/brands/`
durante la compilación.
