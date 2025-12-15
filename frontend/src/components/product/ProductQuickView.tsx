// src/components/product/ProductQuickView.tsx
import { useState } from "react"
import Modal from "../ui/Modal"
import FavoriteButton from "../ui/FavoriteButton"
import type { Product } from "../../Types/Types"
import { useNavigate} from "react-router-dom"

type Props = {
  product: Product | null
  open: boolean
  onClose: () => void
}

export default function ProductQuickView({ product, open, onClose }: Props) {
    const navigate = useNavigate()
    const [activeImage, setActiveImage] = useState(0)
    const [selectedVariant, setSelectedVariant] = useState<Product["variants"][number] | null>(null)

    if (!product) return null

    const images = product.images

    const resetState = () => {
        setActiveImage(0)
        setSelectedVariant(null)
    }

    const handleClose = () => {
        resetState()
        onClose()
    }

    return (
        <Modal open={open} onClose={handleClose}>
        {/* Botón cerrar */}
        <button
            onClick={handleClose}
            className="absolute right-3 top-3 rounded-full p-1 text-slate-500 hover:bg-slate-100"
        >
            ✕
        </button>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* GALERÍA */}
            <div>
            {/* Imagen principal */}
            <div className="aspect-3/4 overflow-hidden rounded bg-slate-100">
                <img
                src={images[activeImage].src}
                alt={images[activeImage].alt}
                className="h-full w-full object-cover"
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                {images.slice(0, 5).map((img, index) => (
                    <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`overflow-hidden rounded border ${
                        activeImage === index
                        ? "border-slate-900"
                        : "border-transparent hover:border-slate-300"
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
                <p className="text-sm text-slate-500">
                    {product.brand.name}
                </p>

                <h2 className="text-lg font-semibold">
                    {product.title}
                </h2>

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

                {/* Tallas */}
                {product.variants?.length > 0 && (
                <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">Tallas</p>

                    <div className="grid grid-cols-4 gap-2">
                    {product.variants.map((variant) => {
                        const isSelected = selectedVariant?.title === variant.title
                        const outOfStock = variant.inStock === false

                        if (selectedVariant === null && variant.inStock) {setSelectedVariant(variant)}  

                        return (
                        <button
                            key={variant.title}
                            disabled={outOfStock}
                            onClick={() => setSelectedVariant(variant)}
                            className={`
                            relative rounded border px-2 py-1 text-sm transition
                            ${
                                outOfStock
                                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through"
                                : isSelected
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-300 hover:border-slate-900"
                            }
                            `}
                        >
                            {variant.title}
                        </button>
                        )
                    })}
                    </div>

                    {/* Mensaje sin stock */}
                    {!selectedVariant && (
                    <p className="mt-2 text-xs text-red-500">
                        No hay stock disponible
                    </p>
                    )}
                </div>
                )}

            {/* Placeholder comparador */}
            <p className="text-sm text-green-600">
                ▼ Bajó 8% en los últimos 30 días
            </p>

            <button
                onClick={() => {
                handleClose
                navigate(`/producto/${product.id}`)
            }}
                className="mt-4 rounded bg-slate-900 px-4 py-2 text-sm text-white"
            >
                <a href={product.url}>
                    Ver detalle completo
                </a>
            </button>
            </div>
        </div>
        </Modal>
    )
}
