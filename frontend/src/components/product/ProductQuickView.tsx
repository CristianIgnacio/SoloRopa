// src/components/product/ProductQuickView.tsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Modal from "../ui/Modal"
import FavoriteButton from "../ui/FavoriteButton"
import HoverImageZoom from "../ui/HoverImageZoom"
import { useProductVariants } from "../../Hooks/useProductVariants"
import VariantSelector from "./VariantSelector"
import type { Product } from "../../Types/Types"
import { useProductEvents } from "../../Hooks/useProductEvents"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark, faArrowTrendDown, faArrowUpRightFromSquare, faTag } from "@fortawesome/free-solid-svg-icons"

type Props = {
  product: Product | null
  open: boolean
  onClose: () => void
}


/** Combina todos los tags canónicos en una lista plana */
const allCanonicalTags = (product: Product): string[] => {
  if (!product.canonicalTags) return []
  return Object.values(product.canonicalTags)
    .filter(Boolean)
    .flat() as string[]
}

export default function ProductQuickView({ product, open, onClose }: Props) {
    const [activeImage, setActiveImage] = useState(0)
    const navigate = useNavigate()

    const { trackView, trackClick } = useProductEvents(product?.id)

    const variantsState = useProductVariants(product, open)
    const { selectedVariant, resetVariants } = variantsState

    useEffect(() => {
        if (product?.id && open) {
            trackView()
        }
    }, [product?.id, open])

    const resetState = () => {
        setActiveImage(0)
        resetVariants()
    }

    const handleClose = () => {
        resetState()
        onClose()
    }

    if (!product) return null

    const images = product.images
    const canonicalList = allCanonicalTags(product)
    // Combina tags nativos del scraper + canónicos, sin duplicados
    const displayTags = [...new Set([...(product.tags ?? []), ...canonicalList])].slice(0, 12)

    return (
        <Modal open={open} onClose={handleClose}>
        {/* Botón cerrar */}
        <button
            onClick={handleClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border-2 border-black bg-white text-black transition-colors hover:bg-black hover:text-white"
        >
            <FontAwesomeIcon icon={faXmark} />
        </button>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* GALERÍA */}
            <div>
            {/* Imagen principal */}
            <div className="aspect-3/4 overflow-hidden border-2 border-black bg-white cursor-zoom-in group relative">
                <HoverImageZoom
                    src={images[activeImage].src}
                    alt={images[activeImage].alt || product.title}
                    className="h-full w-full"
                    zoomScale={1.8}
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                {images.slice(0, 5).map((img, index) => (
                    <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`min-h-[50px] overflow-hidden border-2 transition-all ${
                        activeImage === index
                        ? "border-black shadow-[2px_2px_0_0_#000]"
                        : "border-transparent hover:border-black"
                    }`}
                    >
                    <img
                        src={img.src}
                        alt={img.alt}
                        className="aspect-square w-full object-cover"
                    />
                    </button>
                ))}
                </div>
            )}
            </div>

            {/* INFO */}
            <div className="flex flex-col gap-3">
                <p className="w-fit border border-black bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000]">
                    {product.brand.name}
                </p>

                <h2 className="mt-1 text-2xl font-black uppercase tracking-tighter text-black">
                    {product.title}
                </h2>

                {/* Categoría + Género */}
                {(product.category || product.gender) && (
                    <div className="flex flex-wrap gap-2">
                        {product.category && (
                            <span className="border border-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
                                {product.category}
                            </span>
                        )}
                        {product.gender && (
                            <span className="border border-yellow-400 bg-yellow-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
                                {product.gender}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    {/* <p className="text-xl font-bold">
                    ${product.price?.toLocaleString("es-CL")}
                    </p> */}

                    <p className="text-xl font-bold">
                        ${(selectedVariant?.price ?? product.price)?.toLocaleString("es-CL")}
                    </p>

                    {selectedVariant?.comparePrice && (
                        <p className="text-sm text-slate-500 line-through">
                            ${selectedVariant.comparePrice.toLocaleString("es-CL")}
                        </p>
                    )}

                    <FavoriteButton productId={product.id} />
                </div>

                {/* Opciones Dinámicas */}
                <div className="mt-2">
                    {product.variants?.length > 0 && (
                        <VariantSelector product={product} variantsState={variantsState} />
                    )}
                </div>

                {/* Tags */}
                {displayTags.length > 0 && (
                    <div className="mt-1">
                        <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <FontAwesomeIcon icon={faTag} className="mr-1" />
                            Tags
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {displayTags.map(tag => (
                                <span
                                    key={tag}
                                    className="border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

            {/* Placeholder comparador */}
            <p className="text-sm text-green-600 mb-2">
                <FontAwesomeIcon icon={faArrowTrendDown} className="mr-1" />
                Buen precio detectado
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <button
                    onClick={() => {
                        handleClose()
                        navigate(`/producto/${product.id}`)
                    }}
                    className="flex-1 border-2 border-black bg-white px-4 py-2.5 text-sm font-bold uppercase tracking-widest text-black shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-1 hover:bg-black hover:text-white hover:shadow-[4px_4px_0_0_#000] active:translate-y-0 active:shadow-none"
                >
                    Ver en detalle
                </button>

                <button
                    onClick={() => {
                        trackClick()
                        handleClose()
                        window.open(product.url, "_blank", "noopener,noreferrer")
                    }}
                    className="flex-1 border-2 border-black bg-black px-4 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-1 hover:bg-yellow-400 hover:text-black hover:shadow-[4px_4px_0_0_#000] active:translate-y-0 active:shadow-none"
                >
                    Comprar en tienda
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ml-1.5 text-xs opacity-70" />
                </button>
            </div>
            </div>
        </div>
        </Modal>
    )
}
