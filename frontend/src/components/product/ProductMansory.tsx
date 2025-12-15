// src/components/product/ProductMasonry.tsx
import Masonry from "react-masonry-css"
import type { Product } from "../../Types/Types"
// import ProductCard from "./ProductCard"
import ProductCardHover from "./ProductCardHover"
// import ProductCardDots from "./ProductCardDots"

const breakpointColumnsObj = {
  default: 4,
  1536: 4,
  1280: 3,
  768: 2,
  640: 1,
}

type Props = {
  products: Product[]
  renderItem?: (product: Product) => React.ReactNode
}

export default function ProductMasonry({ products, renderItem }: Props) {
  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex gap-4"
      columnClassName="flex flex-col gap-4"
    >
      {products.filter( product => product.inStock).map((product) => (

        renderItem ? (
          renderItem(product)
        ) : (
        <>
        {/* <ProductCard key={product.id} product={product} /> */}
        <ProductCardHover key={product.id} product={product} />
        {/* <ProductCardDots key={product.id} product={product} /> */}
        </>
        )
      ))}
    </Masonry>
  )
}
