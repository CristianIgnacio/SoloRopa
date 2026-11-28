# 👕 SoloRopa

SoloRopa es una plataforma web orientada a la **exploración, descubrimiento y guardado de productos de streetwear** provenientes de distintas tiendas y marcas independientes. El proyecto busca centralizar la experiencia de búsqueda, permitir a los usuarios crear listas de favoritos (wishlists) y, a futuro, facilitar el seguimiento de precios y tendencias.

El enfoque principal de SoloRopa es **producto‑céntrico**: facilitar que una persona descubra ropa que le guste, la guarde, la compare y vuelva a ella más tarde, sin depender de una sola tienda.

---

## ✨ Características principales

* 🏠 **Portada editorial** con hero, colecciones, marca de la semana y novedades
* 🧭 **Feed de productos** a todo el ancho, en masonry y en orden aleatorio en cada visita
* 🔍 **Búsqueda con filtros** por marca, categoría, talla, precio y productos en oferta
* ❤️ **Favoritos y wishlists** (por defecto y personalizadas), con opción de compartir
* 👕 **Outfit Builder** para combinar prendas de distintas marcas
* 👤 **Perfiles de usuario** con avatar y listas públicas o privadas
* 🔐 **Autenticación** con email/contraseña o Google, sesión de 7 días y recuperación de contraseña
* 🛍️ **Scrapers por marca** que importan el catálogo de cada tienda
* 🧑‍💼 **Panel de administración** (solo admins)
* 📱 **UI responsive** pensada para desktop y mobile

---

## 📸 Capturas de pantalla

### Portada
![Portada editorial con hero y secciones](./screenshot/Portada.png)

### Explorar
![Feed de productos en masonry a todo el ancho](./screenshot/Explorar.png)

### Búsqueda con filtros
![Explorador avanzado con filtros de precio, oferta y categoría](./screenshot/Buscar.png)

### Detalle de producto
![Detalle de producto con galería, tallas y precio](./screenshot/Producto.png)

---

## 🗺️ Páginas

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Portada editorial (`pages/Explore.tsx`) | Pública |
| `/explore` | Feed con todos los productos (`pages/Home.tsx`) | Pública |
| `/search` | Búsqueda con filtros | Pública |
| `/producto/:id` | Detalle de producto y relacionados | Pública |
| `/profile/:username` | Perfil público | Pública |
| `/favorites`, `/favorites/:id` | Favoritos y wishlists | Usuario |
| `/profile/edit` | Editar perfil | Usuario |
| `/outfit-builder` | Armar outfits | Usuario |
| `/admin` | Panel de administración | Admin |
| `/cards` | Catálogo de componentes de cards | Admin, **solo en desarrollo** |

> Los nombres de archivo `Home.tsx` y `Explore.tsx` quedaron intercambiados respecto a su ruta: la portada vive en `/` y el feed en `/explore`.

`/cards` es una herramienta de desarrollo: solo existe con `npm run dev`, aparece como **Cards (dev)** en el menú de admin y queda fuera del build de producción.

---

## 🛠️ Stack tecnológico

### Frontend

* **React + Vite**
* **TypeScript**
* **Tailwind CSS**
* React Router
* Zustand (stores de usuario y wishlist)
* `react-masonry-css` para los grids de productos
* Despliegue en Vercel

### Backend

* **Node.js + Express**
* **TypeScript**
* **MongoDB + Mongoose** (local con Docker o MongoDB Atlas)
* Autenticación con **JWT en cookie** y Google OAuth

### Infraestructura / Dev

* Docker Compose (MongoDB local)
* Variables de entorno con `.env`

---

## 🔌 API de productos

Base: `http://localhost:3001/api/products`

| Endpoint | Descripción |
|---|---|
| `GET /` | Listado paginado con filtros |
| `GET /trending` | Productos con mayor `trendingScore` |
| `GET /newest` | Productos más recientes |
| `GET /:id` | Detalle de un producto |
| `GET /:id/related` | Relacionados (misma categoría, primero la misma marca) |

Parámetros de `GET /`:

| Parámetro | Ejemplo | Descripción |
|---|---|---|
| `page`, `limit` | `page=2&limit=20` | Paginación (máx. 100 por página) |
| `sort`, `order` | `sort=price&order=asc` | `createdAt`, `price`, `trendingScore`, `favoritesCount`, `title` o `random` |
| `seed` | `sort=random&seed=42` | Semilla del orden aleatorio: la misma semilla da el mismo orden, así las páginas no se repiten |
| `brand`, `category`, `gender` | `brand=id1,id2` | Uno o varios valores separados por coma |
| `q` | `q=polerón` | Texto en título, tags o categoría |
| `minPrice`, `maxPrice` | `minPrice=10000` | Rango de precio |
| `size` | `size=M,XL` | Tallas con stock (reconoce alias como `XXL`/`2XL`) |
| `onSale` | `onSale=true` | Solo productos con descuento |
| `fit`, `style`, `color` | `color=negro` | Filtros sobre `canonicalTags` |
| `inStock` | `inStock=true` | Solo productos con stock |

Los listados solo devuelven productos **activos y con al menos una imagen**. Los productos retirados o sin imagen siguen accesibles por ID y desde favoritos.

Otras rutas: `/api/auth`, `/api/users`, `/api/brands`, `/api/wishlist`, `/api/product-events` y `/api/scrape` (scrapers por marca).

---

## 🗂️ Estructura general del proyecto

```text
SoloRopa/
│
├── frontend/              # React + Vite + Tailwind
│   └── src/
│       ├── components/    # layout, product, explore, ui, wishlist…
│       ├── pages/
│       ├── router/        # AppRouter, PrivateRoute, ScrollToTop
│       ├── services/      # llamadas a la API
│       ├── Hooks/         # stores (Zustand) y hooks
│       └── Types/
│
├── backend/               # Node + Express + MongoDB
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── scrapers/      # adaptadores por plataforma y marca
│   │   └── utils/         # config, logger
│   └── test/
│
├── docs/                  # guías (marcas, logos, MongoDB, Google Auth…)
├── docker-compose.yml     # MongoDB local
└── start.ps1              # abre backend y frontend en Windows Terminal
```

---

## 🚀 Instalación y uso (desarrollo)

### Requisitos

* Node.js >= 18
* Docker (para MongoDB local) o una base en MongoDB Atlas

### Clonar repositorio

```bash
git clone git@github.com:CristianIgnacio/SoloRopa.git
cd SoloRopa
npm install --prefix backend
npm install --prefix frontend
```

### Variables de entorno

`backend/.env`:

```env
PORT=3001
JWT_SECRET=un-secreto-largo

# Base local (por defecto en desarrollo)
MONGODB_URI_LOCAL=mongodb://localhost:27017/SoloRopa
# Base de producción (Atlas); se usa con NODE_ENV=production o MONGODB_TARGET=production
MONGODB_URI=mongodb+srv://usuario:password@cluster/...
MONGODB_DBNAME=SoloRopa
# MONGODB_TARGET=production
# MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8   # útil si falla la resolución SRV de Atlas

GOOGLE_CLIENT_ID=...
# COOKIE_SAME_SITE=lax                  # lax | strict | none
```

`frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=...
# VITE_API_URL=https://api.ejemplo.com  # solo en producción; en dev Vite hace proxy de /api a localhost:3001
```

> ⚠️ Si `MONGODB_TARGET=production`, el backend local trabaja sobre la base de producción.

Más detalle en [`docs/MONGODB_DEVELOPMENT.md`](./docs/MONGODB_DEVELOPMENT.md) y [`docs/GOOGLE_AUTH_PRODUCTION.md`](./docs/GOOGLE_AUTH_PRODUCTION.md).

### Levantar entorno

```bash
npm run dev:mongo    # MongoDB local con Docker
npm run dev:back     # backend en http://localhost:3001
npm run dev:front    # frontend en http://localhost:5173
```

En Windows, `./start.ps1` abre el backend y el frontend en pestañas de Windows Terminal.

Frontend: `http://localhost:5173`

Backend API: `http://localhost:3001/api`

### Otros comandos

```bash
npm run lint --prefix frontend     # ESLint
npm run build --prefix frontend    # build de producción
npm run brands --prefix backend    # seed de marcas
```

---

## 🔐 Autenticación

* Login con email/contraseña o con Google
* JWT guardado en cookie, con sesión de 7 días
* Recuperación de contraseña por email (por ahora con una cuenta de prueba de nodemailer/Ethereal, no envía correos reales)
* Rutas protegidas en frontend (`PrivateRoute`, con rol admin) y backend

---

## 🧩 Roadmap

* 📊 Seguimiento de precios y notificaciones
* ⭐ Recomendaciones personalizadas
* 🔁 Scraping programado y detección de imágenes rotas al importar

---

## 📚 Documentación adicional

* [Agregar una marca](./docs/ADDING_A_BRAND.md)
* [Logos de marcas locales](./docs/LOCAL_BRAND_LOGOS.md)
* [MongoDB en desarrollo](./docs/MONGODB_DEVELOPMENT.md)
* [Google Auth en producción](./docs/GOOGLE_AUTH_PRODUCTION.md)
* [Migración Treino](./docs/TREINO_MIGRATION.md)

---

## 🧠 Motivación del proyecto

SoloRopa nace como un proyecto personal y experimental con foco en:

* Resolver un problema real de **descubrimiento de ropa independiente**
* Practicar arquitectura full‑stack moderna
* Explorar scraping, agregación de datos y UX orientada a productos
* Construir una base sólida para escalar a un producto real

---

## 📌 Estado del proyecto

🚧 **En desarrollo activo**

El proyecto se encuentra en constante iteración. Varias funcionalidades están en proceso de diseño e implementación.

---

## 🤝 Contribuciones

Las contribuciones, ideas y sugerencias son bienvenidas.

1. Fork del repositorio
2. Crear una rama (`feature/nueva-funcionalidad`)
3. Commit de cambios
4. Pull request

---

## 📄 Licencia

Este proyecto es de uso académico y personal. Licencia a definir.

---

## 👨‍💻 Autor

**Cristian Fuentes**
Ingeniería Civil en Computación
Proyecto personal – SoloRopa
