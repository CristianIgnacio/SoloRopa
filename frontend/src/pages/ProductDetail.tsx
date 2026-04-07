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
          <div className="group relative aspect-[3/4] w-full overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0_0_#000] cursor-zoom-in">
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
                  className={`min-h-[50px] overflow-hidden border-2 transition-all ${
                    activeImage === index
                      ? "border-black shadow-[4px_4px_0_0_#000]"
                      : "border-transparent hover:border-black"
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
          <div className="mb-4 flex items-center justify-between">
            <span className="border-2 border-black bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000]">
              {product.brand.name}
            </span>
            <FavoriteButton productId={product.id} />
          </div>

          <h1 className="mb-4 mt-2 text-4xl font-black uppercase tracking-tighter text-black sm:text-5xl border-b-4 border-black pb-4">
            {product.title}
          </h1>

          <div className="mb-8 mt-4 flex items-end gap-3">
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

          <div className="mb-8 border-2 border-black bg-green-400 p-4 shadow-[4px_4px_0_0_#000]">
            <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-black">
              <FontAwesomeIcon icon={faArrowTrendDown} />
              Buen precio detectado
            </h4>
            <p className="mt-2 text-sm font-bold text-slate-900 text-balance">
              Este producto tiene un precio competitivo en el mercado actual.
            </p>
          </div>

          <button
            onClick={() => {
              trackClick()
              window.open(product.url, "_blank", "noopener,noreferrer")
            }}
            className="flex w-full items-center justify-center gap-2 border-4 border-black bg-black px-8 py-4 text-lg font-black uppercase tracking-widest text-white shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-1 hover:bg-yellow-400 hover:text-black hover:shadow-[8px_8px_0_0_#000] active:translate-y-0 active:shadow-none"
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

