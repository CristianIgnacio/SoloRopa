// src/components/product/ProductCardSkeleton.tsx

/**
 * Skeleton placeholder para ProductCardHover.
 * Mantiene el mismo aspect-ratio (4/5) que la imagen real,
 * así la grilla no "salta" cuando cargan los productos.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-sm border-2 border-black bg-white">
      {/* Reserva el mismo espacio que la imagen real */}
      <div className="aspect-[4/5] w-full">
        <div className="skeleton-shimmer h-full w-full" />
      </div>

      {/* Footer info — imita las líneas de texto del overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
        <div className="skeleton-shimmer h-2 w-16 rounded" />
        <div className="skeleton-shimmer h-3 w-3/4 rounded" />
        <div className="skeleton-shimmer h-3 w-1/3 rounded" />
      </div>
    </div>
  )
}
