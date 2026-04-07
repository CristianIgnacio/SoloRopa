import type { Product } from "../../Types/Types"
import { useProductEvents } from "../../Hooks/useProductEvents"
import FavoriteButton from "../ui/FavoriteButton"

type Props = {
  product: Product
  onClick?: () => void
}

export default function ProductShowcaseCard({ product, onClick }: Props) {
  const { trackClick } = useProductEvents(product.id)

  const handleInternalClick = () => {
    trackClick()
    onClick?.()
  }

  // Estilo streetwear/boutique para esta vitrina específica
  // Combinamos el clásico fondo claro con alto contraste y sin difuminaciones para un estilo crudo/directo
  return (
    <div
      onClick={handleInternalClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-slate-100 border-2 border-transparent transition-all hover:border-black active:scale-[0.98]"
    >
      {/* Botón de favoritos siempre visible arriba a la derecha en la vitrina */}
      <div className="absolute top-2 right-2 z-20">
        <FavoriteButton productId={product.id} />
      </div>

      {/* Imagen completa, estilo polaroid sin marco inferior */}
      <div className="aspect-[4/5] w-full overflow-hidden bg-white">
        <img
          src={product.images[0]?.src || "https://dummyimage.com/600x800/f3f4f6/a3a3a3.png&text=No+Image"}
          alt={product.images[0]?.alt || product.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Cápsula flotante inferior (Streetwear label) */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between transition-transform duration-300 group-hover:-translate-y-1">
        <div className="flex flex-col">
          {/* Tag de Marca oscuro/crudo */}
          <span className="self-start bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            {product.brand.name}
          </span>
          
          {/* Título y Precio en una plaqueta solida de alto contraste */}
          <div className="mt-1 bg-white px-3 py-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] border border-black">
            <h3 className="line-clamp-1 max-w-[120px] text-xs font-bold leading-tight text-black sm:text-sm">
              {product.title}
            </h3>
            <p className="mt-0.5 text-xs font-extrabold tracking-tight text-slate-800">
              ${product.price?.toLocaleString("es-CL")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
