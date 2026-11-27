import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"

import Home from "../pages/Home"
import Admin from "../pages/Admin"
import Profile from "../pages/Profile"
import Login from "../pages/Login"
import Register from "../pages/Register"
import Favorites from "../pages/Favorites"
import PrivateRoute from "./PrivateRoute"
import FavoritesDetail from "../pages/FavoritesDetail"
import ProfileEdit from "../pages/ProfileEdit"
import Explore from "../pages/Explore"
import Search from "../pages/Search"
import ProductDetail from "../pages/ProductDetail"
import ForgotPassword from "../pages/ForgotPassword"
import ResetPassword from "../pages/ResetPassword"
import OutfitBuilder from "../pages/OutfitBuilder"

// Catálogo de cards: herramienta de desarrollo. Solo existe con `npm run dev`;
// en el build de producción import.meta.env.DEV es false y Vite la deja fuera del bundle.
const CardsShowcase = import.meta.env.DEV ? lazy(() => import("../pages/CardsShowcase")) : null

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas con layout */}
      <Route element={<MainLayout />}>
        {/* "/" es la portada editorial; "/explore" es el feed con todos los productos */}
        <Route path="/" element={<Explore />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/explore" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/producto/:id" element={<ProductDetail />} />

        {/* 🔒 Rutas privadas (user) */}
        <Route element={<PrivateRoute />}>
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/favorites/:id" element={<FavoritesDetail />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/outfit-builder" element={<OutfitBuilder />} />
        </Route>

        {/* 🔐 Rutas privadas (admin) */}
        <Route element={<PrivateRoute requireAdmin />}>
          {CardsShowcase && (
            <Route path="/cards" element={<Suspense fallback={null}><CardsShowcase /></Suspense>} />
          )}
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>

      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  )
}
