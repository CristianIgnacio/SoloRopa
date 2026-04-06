import type { Product } from "../../Types/Types"

interface Props {
  product: Product
  variantsState: {
    selectedVariant: Product["variants"][number] | null
    setSelectedVariant: (v: Product["variants"][number]) => void
    selectedColor: string | null
    setSelectedColor: (c: string) => void
    selectedSize: string | null
    setSelectedSize: (s: string) => void
    colors: string[]
    sizes: string[]
  }
}

export default function VariantSelector({ product, variantsState }: Props) {
  const {
    selectedVariant,
    setSelectedVariant,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    colors,
    sizes
  } = variantsState

  if (!product.variants || product.variants.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {colors.length > 0 || sizes.length > 0 ? (
        <>
          {colors.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-900">Color</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      selectedColor === color
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-900">Talla</h3>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-4">
                {sizes.map(size => {
                  const variantMatch = product.variants.find(v => 
                    v.size === size && (colors.length === 0 || v.color === selectedColor)
                  )
                  const isSelected = selectedSize === size
                  const outOfStock = !variantMatch || variantMatch.inStock === false

                  return (
                    <button
                      key={size}
                      disabled={outOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        relative flex items-center justify-center rounded-lg border py-2 text-sm font-medium transition-all
                        ${
                          outOfStock
                            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 line-through"
                            : isSelected
                            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50"
                        }
                      `}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Fallback Clásico Monolítico */
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-900">Opciones</h3>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-4">
            {product.variants.map((variant) => {
              const isSelected = selectedVariant?.title === variant.title
              const outOfStock = variant.inStock === false

              return (
                <button
                  key={variant.title}
                  disabled={outOfStock}
                  onClick={() => setSelectedVariant(variant)}
                  className={`
                    relative flex items-center justify-center rounded-lg border py-2 text-sm font-medium transition-all text-center
                    ${
                      outOfStock
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 line-through"
                        : isSelected
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50"
                    }
                  `}
                >
                  <span className="line-clamp-2 px-1 leading-tight">{variant.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Mensaje sin stock */}
      {(!selectedVariant || selectedVariant.inStock === false) && (
        <p className="mt-1 text-xs font-medium text-red-500">
          La combinación seleccionada no tiene stock disponible.
        </p>
      )}
    </div>
  )
}
