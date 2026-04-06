import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { Product } from "../Types/Types"
import productService from "../services/products"
import { useProductEvents } from "../Hooks/useProductEvents"
import FavoriteButton from "../components/ui/FavoriteButton"
import HoverImageZoom from "../components/ui/HoverImageZoom"
import { useProductVariants } from "../Hooks/useProductVariants"
import VariantSelector from "../components/product/VariantSelector"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowTrendDown, faArrowUpRightFromSquare, faArrowLeft } from "@fortawesome/free-solid-svg-icons"

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  const { trackView, trackClick } = useProductEvents(product?.id)

  const variantsState = useProductVariants(product)
  const { selectedVariant } = variantsState

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await productService.getProductById(id)
        setProduct(data)
      } catch (err: any) {
        setError(err.response?.data?.message || "Error al cargar el producto")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  useEffect(() => {
    if (product?.id) {
      trackView()
    }
  }, [product?.id])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-xl font-medium text-slate-700">{error || "Producto no encontrado"}</p>
        <button
          onClick={() => navigate(-1)}
          className="rounded-full bg-slate-900 px-6 py-2 text-white hover:bg-slate-800"
        >
          Volver
        </button>
      </div>
    )
  }

  const images = product.images

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Volver
      </button>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* GALERÍA */}
        <div className="flex flex-col gap-4">
          <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm cursor-zoom-in">
            {images && images.length > 0 ? (
              <HoverImageZoom
                src={images[activeImage].src}
                alt={images[activeImage].alt || product.title}
                className="h-full w-full"
                zoomScale={1.8}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                Sin imagen
              </div>
            )}
          </div>

          {images && images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {images.slice(0, 5).map((img: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden rounded-lg border-2 transition-all ${
                    activeImage === index
                      ? "border-slate-900 shadow-sm"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt || `Thumbnail ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="flex flex-col pt-4 lg:pt-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">
              {product.brand.name}
            </span>
            <FavoriteButton productId={product.id} />
          </div>

          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {product.title}
          </h1>

          <div className="mb-8 flex items-end gap-3">
            <p className="text-3xl font-bold text-slate-900">
              ${(selectedVariant?.price ?? product.price)?.toLocaleString("es-CL")}
            </p>
            {selectedVariant?.comparePrice && (
              <p className="mb-1 text-lg text-slate-500 line-through">
                ${selectedVariant.comparePrice.toLocaleString("es-CL")}
              </p>
            )}
          </div>

          {/* Seleccionador de Opciones Dinámico via Componente */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-8">
              <VariantSelector product={product} variantsState={variantsState} />
            </div>
          )}

          <div className="mb-8 rounded-xl bg-green-50 p-4 border border-green-100">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-green-800">
              <FontAwesomeIcon icon={faArrowTrendDown} />
              Buen precio detectado
            </h4>
            <p className="mt-1 text-sm text-green-700 text-balance">
              Este producto tiene un precio competitivo en el mercado actual.
            </p>
          </div>

          <button
            onClick={() => {
              trackClick()
              window.open(product.url, "_blank", "noopener,noreferrer")
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-slate-800 hover:shadow-xl active:scale-[0.98]"
          >
            Comprar en {product.brand.name}
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-sm" />
          </button>
          
          <p className="mt-4 text-center text-xs text-slate-500">
            Serás redirigido a la tienda oficial de la marca para completar tu compra de forma segura.
          </p>
        </div>
      </div>
    </main>
  )
}

