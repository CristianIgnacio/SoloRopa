// src/components/product/ProductCardSkeleton.tsx

/**
 * Skeleton placeholder para ProductCardHover.
 * Mantiene el mismo aspect-ratio (4/5) que la imagen real,
 * así la grilla no "salta" cuando cargan los productos.
 */
type Props = {
  /** "clean" → sin borde (igual que ProductCardHover variant="clean") */
  variant?: "default" | "clean"
  /** Relación de aspecto de la imagen, p. ej. "4/5". Por defecto 4/5. */
  aspectRatio?: string
}

export default function ProductCardSkeleton({ variant = "default", aspectRatio = "4/5" }: Props) {
  const isClean = variant === "clean"

  return (
    <div className={isClean ? "relative overflow-hidden bg-white" : "relative overflow-hidden rounded-sm border-2 border-black bg-white"}>
      {/* Reserva el mismo espacio que la imagen real */}
      <div className="w-full" style={{ aspectRatio }}>
        <div className="skeleton-shimmer h-full w-full" />
      </div>

      {/* Footer info — imita las líneas de texto del overlay (la card clean no las muestra en reposo) */}
      {!isClean && (
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
          <div className="skeleton-shimmer h-2 w-16 rounded" />
          <div className="skeleton-shimmer h-3 w-3/4 rounded" />
          <div className="skeleton-shimmer h-3 w-1/3 rounded" />
        </div>
      )}
    </div>
  )
}
