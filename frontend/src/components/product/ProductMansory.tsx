// src/components/product/ProductMasonry.tsx
import Masonry from "react-masonry-css"
import type { Product } from "../../Types/Types"
import ProductCardHover from "./ProductCardHover"
import ProductCardSkeleton from "./ProductCardSkeleton"

// ── Breakpoints compartidos ──────────────────────────────────────────────────
const breakpointColumnsObj = {
  default: 4,
  1536: 4,
  1280: 3,
  768: 2,
  500: 1,
}

const MASONRY_CLASS = "flex gap-3 md:gap-4"
const MASONRY_COLUMN_CLASS = "flex flex-col gap-3 md:gap-4"

const resolveBreakpoints = (breakpointCols?: Record<string | number, number>, mobileColumns = 1) => ({
  ...breakpointColumnsObj,
  ...breakpointCols,
  500: mobileColumns,
})

// ── Props ─────────────────────────────────────────────────────────────────────
type Props = {
  products: Product[]
  /** "natural" → alto libre según la imagen real  |  "fixed" → aspect-ratio 4/5 (default) */
  imageMode?: "natural" | "fixed"
  mobileColumns?: 1 | 2
  renderItem?: (product: Product, imageMode: "natural" | "fixed") => React.ReactNode
  /** Breakpoints propios (max-width → columnas). Se mezclan con los por defecto. */
  breakpointCols?: Record<string | number, number>
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function ProductMasonry({ products, imageMode = "natural", mobileColumns = 1, renderItem, breakpointCols }: Props) {
  return (
    <Masonry
      breakpointCols={resolveBreakpoints(breakpointCols, mobileColumns)}
      className={MASONRY_CLASS}
      columnClassName={MASONRY_COLUMN_CLASS}
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

// ── Skeleton ──────────────────────────────────────────────────────────────────
// Usa el mismo Masonry y los mismos breakpoints que el grid real, así las
// columnas del placeholder coinciden con las que aparecen al cargar.
// Alturas variadas para imitar el modo "natural".
const SKELETON_RATIOS = ["4/5", "3/4", "1/1", "4/5", "2/3", "5/6"]

type SkeletonProps = {
  count?: number
  mobileColumns?: 1 | 2
  breakpointCols?: Record<string | number, number>
  variant?: "default" | "clean"
}

export function ProductMasonrySkeleton({ count = 18, mobileColumns = 1, breakpointCols, variant = "default" }: SkeletonProps) {
  return (
    <Masonry
      breakpointCols={resolveBreakpoints(breakpointCols, mobileColumns)}
      className={MASONRY_CLASS}
      columnClassName={MASONRY_COLUMN_CLASS}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} variant={variant} aspectRatio={SKELETON_RATIOS[i % SKELETON_RATIOS.length]} />
      ))}
    </Masonry>
  )
}
