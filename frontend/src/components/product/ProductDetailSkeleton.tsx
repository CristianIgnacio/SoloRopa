// src/components/product/ProductDetailSkeleton.tsx

export default function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Botón Volver */}
      <div className="mb-8 flex items-center gap-2">
        <div className="skeleton-shimmer h-4 w-20 rounded" />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* GALERÍA SKELETON */}
        <div className="flex flex-col gap-4">
          {/* Imagen principal */}
          <div className="aspect-[3/4] w-full border-4 border-black bg-white shadow-[8px_8px_0_0_#000] overflow-hidden">
            <div className="skeleton-shimmer h-full w-full" />
          </div>

          {/* Miniaturas */}
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-square w-full border-2 border-transparent overflow-hidden"
              >
                <div className="skeleton-shimmer h-full w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* INFO SKELETON */}
        <div className="flex flex-col pt-4 lg:pt-8">
          {/* Marca y favorito */}
          <div className="mb-4 flex items-center justify-between">
            <div className="skeleton-shimmer h-6 w-24 rounded border-2 border-black" />
            <div className="skeleton-shimmer h-8 w-8 rounded-full" />
          </div>

          {/* Título */}
          <div className="mb-2 mt-2 border-b-4 border-black pb-4 space-y-2">
            <div className="skeleton-shimmer h-10 w-full rounded" />
            <div className="skeleton-shimmer h-10 w-3/4 rounded" />
          </div>

          {/* Categoría + Género */}
          <div className="mt-3 flex gap-2">
            <div className="skeleton-shimmer h-6 w-20 rounded border-2 border-black" />
            <div className="skeleton-shimmer h-6 w-20 rounded border-2 border-black" />
          </div>

          {/* Precio */}
          <div className="mb-8 mt-6">
            <div className="skeleton-shimmer h-8 w-32 rounded" />
          </div>

          {/* Variantes (Tallas) */}
          <div className="mb-8 space-y-3">
            <div className="skeleton-shimmer h-4 w-24 rounded" />
            <div className="flex gap-2">
              <div className="skeleton-shimmer h-10 w-12 rounded border-2 border-black" />
              <div className="skeleton-shimmer h-10 w-12 rounded border-2 border-black" />
              <div className="skeleton-shimmer h-10 w-12 rounded border-2 border-black" />
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8 space-y-2">
            <div className="skeleton-shimmer h-3 w-24 rounded" />
            <div className="flex flex-wrap gap-2">
              <div className="skeleton-shimmer h-5 w-16 rounded" />
              <div className="skeleton-shimmer h-5 w-20 rounded" />
              <div className="skeleton-shimmer h-5 w-14 rounded" />
            </div>
          </div>

          {/* Alerta de precio */}
          <div className="mb-8 border-2 border-black p-4 shadow-[4px_4px_0_0_#000] space-y-2 overflow-hidden">
            <div className="skeleton-shimmer h-4 w-40 rounded" />
            <div className="skeleton-shimmer h-4 w-full rounded" />
          </div>

          {/* Botón de compra */}
          <div className="border-4 border-black px-8 py-4 shadow-[4px_4px_0_0_#000] overflow-hidden">
            <div className="skeleton-shimmer h-6 w-full rounded" />
          </div>
          
          <div className="mt-4 flex justify-center">
             <div className="skeleton-shimmer h-3 w-3/4 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
