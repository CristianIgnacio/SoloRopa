// src/components/ui/LowestPriceBadge.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowTrendDown } from "@fortawesome/free-solid-svg-icons"

type Props = {
  /** "card" → chip compacto sobre la imagen. "detail" → con borde y sombra, junto al precio. */
  variant?: "card" | "detail"
  className?: string
}

export default function LowestPriceBadge({ variant = "card", className = "" }: Props) {
  const styles =
    variant === "detail"
      ? "border-2 border-black px-2 py-1 text-[10px] tracking-widest shadow-[2px_2px_0_0_#000] sm:text-xs"
      : "px-1.5 py-0.5 text-[10px] tracking-wide"

  return (
    <span
      title="El precio actual es el más bajo de los últimos 30 días"
      className={`inline-flex items-center gap-1 whitespace-nowrap bg-green-400 font-black uppercase text-black ${styles} ${className}`}
    >
      <FontAwesomeIcon icon={faArrowTrendDown} aria-hidden />
      Mínimo en 30 días
    </span>
  )
}
