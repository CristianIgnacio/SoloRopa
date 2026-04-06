import { useState, useEffect } from "react"
import type { Product } from "../Types/Types"

export function useProductVariants(product: Product | null | undefined, active: boolean = true) {
  const [selectedVariant, setSelectedVariant] = useState<Product["variants"][number] | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const colors = Array.from(new Set(product?.variants?.map((v: any) => v.color).filter(Boolean) as string[])) || []
  const sizes = Array.from(new Set(product?.variants?.map((v: any) => v.size).filter(Boolean) as string[])) || []

  // Auto-select defaults
  useEffect(() => {
    if (active && product?.variants?.length) {
      if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0])
      if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0])

      if (!selectedVariant) {
        setSelectedVariant(product.variants.find((v: any) => v.inStock) || product.variants[0])
      }
    }
  }, [product, colors.length, sizes.length, selectedColor, selectedSize, selectedVariant, active])

  // When color or size changes, update the exact variant matched
  useEffect(() => {
    if (active && (colors.length > 0 || sizes.length > 0)) {
      let match = product?.variants?.find((v: any) => 
        (colors.length === 0 || v.color === selectedColor) &&
        (sizes.length === 0 || v.size === selectedSize)
      )

      if (!match && colors.length > 0) {
         match = product?.variants?.find((v: any) => v.color === selectedColor && v.inStock);
         if (match && match.size) setSelectedSize(match.size);
      }

      if (match) {
         setSelectedVariant(match)
      } else {
         const fallback = product?.variants?.find((v: any) => v.color === selectedColor);
         if (fallback) setSelectedVariant(fallback);
      }
    }
  }, [selectedColor, selectedSize, colors.length, sizes.length, product?.variants, active])

  const resetVariants = () => {
    setSelectedVariant(null)
    setSelectedColor(null)
    setSelectedSize(null)
  }

  return {
    selectedVariant,
    setSelectedVariant,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    colors,
    sizes,
    resetVariants
  }
}
