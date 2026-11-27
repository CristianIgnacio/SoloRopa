import { useEffect } from "react"
import { useLocation, useNavigationType } from "react-router-dom"

// BrowserRouter no reinicia el scroll al navegar: lo hacemos a mano.
// En "POP" (atrás/adelante del navegador) no tocamos nada para que el
// navegador restaure la posición anterior.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === "POP") return
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [pathname, navigationType])

  return null
}
