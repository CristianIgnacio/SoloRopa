# 👕 SoloRopa

SoloRopa es una plataforma web orientada a la **exploración, descubrimiento y guardado de productos de streetwear** provenientes de distintas tiendas y marcas independientes. El proyecto busca centralizar la experiencia de búsqueda, permitir a los usuarios crear listas de favoritos (wishlists) y, a futuro, facilitar el seguimiento de precios y tendencias.

El enfoque principal de SoloRopa es **producto‑céntrico**: facilitar que una persona descubra ropa que le guste, la guarde, la compare y vuelva a ella más tarde, sin depender de una sola tienda.

---

## ✨ Características principales

* 🧭 **Explorar productos** desde distintas marcas y tiendas
* ❤️ **Sistema de favoritos / wishlists** (por defecto y personalizadas)
* 👤 **Perfiles de usuario** con avatar, nombre y listas públicas o privadas
* 🔐 **Autenticación con JWT** (login / logout / sesión persistente)
* 🧱 **Arquitectura full‑stack moderna**
* 📱 **UI responsive** pensada para desktop y mobile


## 📸 Capturas de pantalla

### Vista de Home
![Mapa de Home](./screenshots/Home.png)

### Vista de Favoritos
![Vista de Favoritos](./screenshots/Favoritos.png)
---

## 🛠️ Stack tecnológico

### Frontend

* **React + Vite**
* **TypeScript**
* **Tailwind CSS**
* React Router
* State management (store personalizado)

### Backend

* **Node.js + Express**
* **TypeScript**
* **MongoDB + Mongoose**
* Autenticación con **JWT**

### Infraestructura / Dev

* Docker & Docker Compose (entorno de desarrollo)
* Variables de entorno con `.env`

---

## 🧩 Funcionalidades en desarrollo / roadmap

* 🔍 Filtros avanzados (marca, precio, categoría)
* 📊 Seguimiento de precios y notificaciones
* 🌐 Wishlists públicas y compartibles
* 🛍️ Integración automática con tiendas (scraping / APIs)
* ⭐ Recomendaciones personalizadas
* 🧑‍💼 Panel de administración

---

## 🗂️ Estructura general del proyecto

```text
soloropa/
│
├── frontend/        # React + Vite + Tailwind
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── store/
│
├── backend/         # Node + Express + MongoDB
│   ├── src/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── middlewares/
│
└── docker-compose.yml
```

---

## 🚀 Instalación y uso (desarrollo)

### Requisitos

* Node.js >= 18
* Docker & Docker Compose
* MongoDB (o contenedor)

### Clonar repositorio

```bash
git clone https://github.com/tu-usuario/soloropa.git
cd soloropa
```

### Variables de entorno

Crear archivos `.env` en frontend y backend según corresponda:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/soloropa
JWT_SECRET=supersecret
```

### Levantar entorno

```bash
docker-compose up --build
```

Frontend: `http://localhost:5173`

Backend API: `http://localhost:3001/api`

---

## 🔐 Autenticación

* Login basado en JWT
* Manejo de expiración de token
* Cierre automático de sesión al expirar
* Rutas protegidas en frontend y backend

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




