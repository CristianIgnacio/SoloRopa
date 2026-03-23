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
import ProductDetail from "../pages/ProductDetail"

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas con layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/producto/:id" element={<ProductDetail />} />

        {/* 🔒 Rutas privadas (user) */}
        <Route element={<PrivateRoute />}>
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/favorites/:id" element={<FavoritesDetail />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
        </Route>

        {/* 🔐 Rutas privadas (admin) */}
        <Route element={<PrivateRoute requireAdmin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>

      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}
