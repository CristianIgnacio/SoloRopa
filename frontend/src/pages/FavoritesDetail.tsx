// src/pages/FavoritesDetail.tsx
import { useParams } from "react-router-dom"
import ProductMasonry from "../components/product/ProductMansory"
// import type { Wishlist } from "../Types/Types"

const mockWishlist = {
  id: "default",
  name: "Favoritos",
  isDefault: true,
  items: [], // aquí van Product[]
}

export default function FavoritesDetail() {
  const { id } = useParams()

  // luego: fetchWishlistById(id)
  const wishlist = mockWishlist

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">{wishlist.name}</h1>
        <p className="text-sm text-slate-500">
          {wishlist.items.length} productos guardados
        </p>
      </div>

      {wishlist.items.length === 0 ? (
        <p className="text-slate-500">No hay productos aún.</p>
      ) : (
        <ProductMasonry products={wishlist.items} />
      )}
    </section>
  )
}
