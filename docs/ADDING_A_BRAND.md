# 🏷️ Guía: Cómo Agregar una Nueva Marca (Brand)

Esta guía detalla los pasos exactos para integrar una nueva marca a la plataforma de SoloRopa.

## 1. 🗄️ Base de Datos (Script Seed)
Primero, la marca debe existir en la base de datos para que el scraper pueda vincular los productos a ella.
- **Ruta:** `backend/src/scrapers/scripts/seedBrands.ts`
- **Acción:** Agrega el objeto de la marca con su información (nombre, slug, website, logo) y añádelo al arreglo `brands`.
- **Ejemplo:**
  ```typescript
  const nuevamarca = {
    name: "NuevaMarca",
    slug: "nuevamarca",
    description: "Ropa urbana",
    website: "https://www.nuevamarca.cl/",
    logo: {
      src: "https://www.nuevamarca.cl/logo.png",
      alt: "Logo NuevaMarca",
      backgroundColor: "#FFFFFF"
    },
    isActive: true
  };
  // Agregarlo al array
  const brands = [..., nuevamarca];
  ```
> **Importante:** Recuerda ejecutar el script para que se inserte en la BD.

## 2. ⚙️ Backend (Scraper)
### A. Crear el archivo del scraper
- **Ruta:** `backend/src/scrapers/brands/[nombre_marca].ts`
- **Acción:** Crea el archivo exportando la configuración del scraper (usualmente importando el adaptador de la plataforma, como Shopify).
- **Ejemplo:**
  ```typescript
  import scrapeShopifyBase from "../platforms/shopify";

  export const NombreMarca = {
    name: "NombreDeLaMarca", // DEBE coincidir exactamente con el nombre en la BD
    baseUrl: "https://www.sitioweb.cl/collections/all",
    async scrape() {
      return await scrapeShopifyBase(this.baseUrl);
    }
  };
  ```

### B. Registrar el scraper
- **Ruta:** `backend/src/scrapers/core/brands.ts`
- **Acción:** Importa el módulo que acabas de crear y agrégalo al objeto `stores`.
- **Ejemplo:**
  ```typescript
  import { NombreMarca } from "../brands/nombre_marca";

  const stores: { [key: string]: any } = {
    // ... marcas existentes
    nombremarca: NombreMarca // la key se usará en el frontend
  };
  ```

### C. Registrar el Controller
- **Ruta:** `backend/src/controllers/scrapeController.ts`
- **Acción:** Crea una nueva instancia base del scraper y expórtala.
- **Ejemplo:**
  ```typescript
  const scrapeNuevaMarca = scrapeBase("nuevamarca");
  
  export {
    // ... otros
    scrapeNuevaMarca
  };
  ```

### D. Registrar la Ruta de la API
- **Ruta:** `backend/src/routes/scrapeRoutes.ts`
- **Acción:** Importa el controller creado y define la ruta GET.
- **Ejemplo:**
  ```typescript
  import { scrapeNuevaMarca } from "../controllers/scrapeController";

  router.get("/nuevamarca", ...adminOnly, scrapeNuevaMarca);
  ```

## 3. 🖥️ Frontend (Panel Admin)
Para poder ejecutar el scraper desde la interfaz de administración:
- **Ruta:** `frontend/src/pages/Admin.tsx`
- **Acción:** Agrega la marca al arreglo `BRANDS`.
- **Ejemplo:**
  ```typescript
  const BRANDS = [
    // ... marcas existentes
    { key: "nombremarca", label: "NombreDeLaMarca", url: "sitioweb.cl" }
  ];
  ```
> **Importante:** La propiedad `key` debe coincidir exactamente con la llave que usaste en el objeto `stores` dentro de `core/brands.ts` en el backend.

## ✅ Resumen de Verificación (Checklist)
- [ ] Agregada a `backend/src/scrapers/scripts/seedBrands.ts` y script ejecutado.
- [ ] Archivo creado en `backend/src/scrapers/brands/`.
- [ ] Scraper registrado en `backend/src/scrapers/core/brands.ts`.
- [ ] Controller exportado en `backend/src/controllers/scrapeController.ts`.
- [ ] Ruta agregada en `backend/src/routes/scrapeRoutes.ts`.
- [ ] Marca agregada a `BRANDS` en `frontend/src/pages/Admin.tsx`.
- [ ] Prueba en el Panel Admin ejecutando el scraper de la marca (debe devolver éxito y guardar los productos).
