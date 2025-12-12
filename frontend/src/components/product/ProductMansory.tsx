// src/components/product/ProductMasonry.tsx
import Masonry from "react-masonry-css"
import ProductCard from "./ProductCard"
import type { Product } from "../../Types/Types"

const breakpointColumnsObj = {
  default: 5,
  1536: 4,
  1280: 3,
  768: 2,
  640: 1,
}

export default function ProductMasonry({products}: {products : Product[]}) {
  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex gap-4"
      columnClassName="flex flex-col gap-4"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Masonry>
  )
}
