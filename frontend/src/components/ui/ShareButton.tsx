import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShareNodes, faCheck } from "@fortawesome/free-solid-svg-icons"

type Props = {
  productId: string
}

export default function ShareButton({ productId }: Props) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    const shareUrl = `${window.location.origin}/producto/${productId}`
    
    try {
      if (navigator.share) {
        // Usa la API de compartir nativa en móviles si está disponible
        await navigator.share({
          title: 'Mira este producto',
          url: shareUrl
        })
      } else {
        // Fallback: copia al portapapeles
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur transition hover:scale-110"
      aria-label="Compartir enlace"
      title="Compartir enlace"
    >
      {copied ? (
        <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-green-500" />
      ) : (
        <FontAwesomeIcon icon={faShareNodes} className="h-4 w-4 text-slate-700" />
      )}
    </button>
  )
}
