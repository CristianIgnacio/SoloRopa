// src/components/profile/PriceDropNotificationsToggle.tsx
// Preferencia "avisarme por correo cuando bajen mis favoritos". Se guarda al cambiarla.
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBell } from "@fortawesome/free-solid-svg-icons"
import { useUserStore } from "../../Hooks/useStore"
import userService from "../../services/users"

export default function PriceDropNotificationsToggle() {
  const { user, login } = useUserStore()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null
  // Los usuarios antiguos no tienen el campo: cuenta como activado (igual que en el backend).
  const enabled = user.notifications?.priceDrops !== false

  const onChange = async (next: boolean) => {
    setSaving(true)
    setError(null)
    try {
      const notifications = await userService.updatePriceDropNotifications(next)
      login({ ...user, notifications })
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-10 border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
      <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-black">
        <FontAwesomeIcon icon={faBell} />
        Notificaciones
      </h2>

      <label className="mt-4 flex cursor-pointer items-start justify-between gap-4">
        <span>
          <span className="block text-sm font-bold text-black">Avisarme cuando bajen mis favoritos</span>
          <span className="mt-1 block text-xs text-slate-500">
            Te enviamos un correo al día como máximo, solo si un producto que guardaste baja de precio.
          </span>
        </span>

        {/* Interruptor: checkbox real (accesible con teclado) con apariencia de switch */}
        <span className="relative mt-0.5 inline-flex shrink-0">
          <input
            type="checkbox"
            role="switch"
            className="peer sr-only"
            checked={enabled}
            disabled={saving}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="h-7 w-12 border-2 border-black bg-slate-200 transition-colors peer-checked:bg-green-400 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black peer-disabled:opacity-60" />
          <span className="absolute left-1 top-1 h-5 w-5 border-2 border-black bg-white transition-transform peer-checked:translate-x-5" />
        </span>
      </label>

      {error && <p className="mt-3 text-xs font-bold text-red-600">{error}</p>}
    </section>
  )
}
