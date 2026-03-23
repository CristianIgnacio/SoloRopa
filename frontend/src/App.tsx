import AppRouter from "./router/AppRouter"
import { useEffect } from "react"
import loginServices from "./services/login"
import { useUserStore } from "./Hooks/useStore"

function App() {
  const { logout, user } = useUserStore()

  useEffect(() => {
    // Si tenemos un estado de usuario guardado localmente,
    // comprobamos con el backend si su cookie (token) sigue vigente.
    if (user) {
      loginServices.restoreLogin().then((serverUser) => {
        if (!serverUser) {
          console.warn("La sesión expiró o es inválida en el servidor. Limpiando store.")
          logout()
        }
      })
    }
  }, []) // Solo se ejecuta una vez al montar la app

  return <AppRouter />
}

export default App
