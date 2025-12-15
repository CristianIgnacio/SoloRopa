// src/router/PrivateRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useUserStore } from "../Hooks/useStore"

type PrivateRouteProps = {
  requireAdmin?: boolean
}

export default function PrivateRoute({ requireAdmin = false }: PrivateRouteProps) {
  const { user } = useUserStore()
  const location = useLocation()

  // No logueado → login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Logueado pero no admin
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
