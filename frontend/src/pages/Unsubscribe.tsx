// src/pages/Unsubscribe.tsx
// Destino del link "Dejar de recibir estos avisos" de los correos. No requiere sesión.
// No se desuscribe al abrir la página (los antivirus de correo abren los links): pide confirmar.
import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBellSlash, faCheck } from "@fortawesome/free-solid-svg-icons"
import userService from "../services/users"

type Status = "idle" | "saving" | "done" | "error"

export default function Unsubscribe() {
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""
  const [status, setStatus] = useState<Status>("idle")

  const onConfirm = async () => {
    setStatus("saving")
    try {
      await userService.unsubscribePriceDrops(token)
      setStatus("done")
    } catch {
      setStatus("error")
    }
  }

  const invalid = !token || status === "error"

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
        <h1 className="flex items-center gap-2 border-b-4 border-black pb-2 text-2xl font-black uppercase tracking-tighter text-black">
          <FontAwesomeIcon icon={status === "done" ? faCheck : faBellSlash} />
          {status === "done" ? "Listo" : "Avisos de precio"}
        </h1>

        {status === "done" ? (
          <p className="mt-4 text-sm font-bold text-slate-800">
            No te enviaremos más correos cuando bajen tus favoritos. Puedes volver a activarlos cuando quieras
            desde tu perfil.
          </p>
        ) : invalid ? (
          <p className="mt-4 text-sm font-bold text-slate-800">
            Este link no es válido. Puedes apagar los avisos desde tu perfil, en "Notificaciones".
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm font-bold text-slate-800">
              ¿Quieres dejar de recibir correos cuando bajan de precio los productos que guardaste en favoritos?
            </p>
            <button
              type="button"
              onClick={onConfirm}
              disabled={status === "saving"}
              className="mt-6 w-full border-2 border-black bg-black px-4 py-3 text-sm font-black uppercase tracking-widest text-white shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-0.5 hover:bg-yellow-400 hover:text-black disabled:opacity-60"
            >
              {status === "saving" ? "Guardando..." : "Dejar de recibir avisos"}
            </button>
          </>
        )}

        <Link to="/" className="mt-6 block text-center text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-black">
          Ir a SoloRopa
        </Link>
      </div>
    </div>
  )
}
