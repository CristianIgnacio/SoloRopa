import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShareNodes, faCheck } from "@fortawesome/free-solid-svg-icons"

type Props = {
  productId?: string
  url?: string
}

export default function ShareButton({ productId, url }: Props) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    const shareUrl = url 
      ? url 
      : productId 
        ? `${window.location.origin}/producto/${productId}` 
        : window.location.href
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Echa un vistazo a esto',
          url: shareUrl
        })
      } else {
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
