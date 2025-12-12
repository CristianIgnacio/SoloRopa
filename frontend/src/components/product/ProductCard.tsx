// src/components/product/ProductCard.tsx
import type {Product} from "../../Types/Types"

const ProductCard = ({product}: {product : Product}) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md">
      <img
        src={product.images[0].src || ""}
        alt={product.title}
        className="w-full object-cover"
        loading="lazy"
      />

      <div className="p-3">
        <p className="text-xs text-slate-500">{product.brand?.name }</p>
        <p className="text-sm font-medium">{product.title}</p>
        <p className="mt-1 text-sm font-semibold">
          ${product.price?.toLocaleString("es-CL")}
        </p>
      </div>
    </div>
  )
}

export default ProductCard
