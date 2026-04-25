import { useState, useRef } from "react"

type Props = {
  src: string
  alt?: string
  className?: string
  zoomScale?: number
}

export default function HoverImageZoom({ src, alt = "", className = "", zoomScale = 2 }: Props) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return

    const { left, top, width, height } = imageRef.current.getBoundingClientRect()
    
    // Calcular porcentaje de posición del mouse (0 a 100)
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setPosition({ x, y })
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        className="h-full w-full object-cover transition-transform duration-200"
        style={{
          transformOrigin: `${position.x}% ${position.y}%`,
          transform: isHovered ? `scale(${zoomScale})` : "scale(1)",
        }}
      />
    </div>
  )
}
