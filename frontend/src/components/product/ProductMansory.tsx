// src/components/product/ProductMasonry.tsx
import Masonry from "react-masonry-css"
import type { Product } from "../../Types/Types"
import ProductCardHover from "./ProductCardHover"

// ── Breakpoints compartidos ──────────────────────────────────────────────────
const breakpointColumnsObj = {
  default: 4,
  1536: 4,
  1280: 3,
  768: 2,
  500: 1,
}

// ── Props ─────────────────────────────────────────────────────────────────────
type Props = {
  products: Product[]
  /** "natural" → alto libre según la imagen real  |  "fixed" → aspect-ratio 4/5 (default) */
  imageMode?: "natural" | "fixed"
  renderItem?: (product: Product, imageMode: "natural" | "fixed") => React.ReactNode
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function ProductMasonry({ products, imageMode = "natural", renderItem }: Props) {
  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex gap-3 md:gap-4"
      columnClassName="flex flex-col gap-3 md:gap-4"
    >
      {products.filter((product) => product.inStock).map((product) =>
        renderItem ? (
          renderItem(product, imageMode)
        ) : (
          <ProductCardHover
            key={product.id}
            product={product}
            imageMode={imageMode}
          />
        )
      )}
    </Masonry>
  )
}
