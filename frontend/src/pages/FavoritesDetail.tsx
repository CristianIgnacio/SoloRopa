// src/pages/FavoritesDetail.tsx
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
// import ProductMasonry from "../components/product/ProductMansory"
// import type { Wishlist } from "../Types/Types"
import wishlistServices from "../services/wishlist"
import type { Wishlist, WishlistItem } from "../Types/Types"
import FavoriteItemCard from "../components/wishlist/FavoriteItemCard"


export default function FavoritesDetail() {
  const { id } = useParams()

  // luego: fetchWishlistById(id)
  // const wishlist = mockWishlist
  const [wishlist, setWishlist] = useState<Wishlist>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const init = async () => {
      const wishlistDetailData = await wishlistServices.getWishlistById(id ?? '')
      setWishlist(wishlistDetailData.data)
      setLoading(false)
    }

    init()
  }, [id])

  const onRemoved = (productId : string) => {
    setWishlist((prev: any) => ({
      ...prev,
      items: prev.items.filter(
        (i: any) => i.productId.id !== productId
      ),
    }))
  }

  if (loading) {
    return <p className="p-6 text-slate-500">Cargando colección...</p>
  }
    

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-8 border-b-4 border-black pb-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-black">{wishlist?.name}</h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-widest text-slate-600">
          {wishlist?.items.length} productos guardados
        </p>
      </div>

      {(!wishlist || wishlist.items.length === 0) ? (
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">No hay productos aún.</p>
      ) : (
        // <ProductMasonry products={products} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {wishlist.items.map((item: WishlistItem) => (
            <FavoriteItemCard
              key={item.productId.id}
              item={item.productId}
              wishlistId={wishlist.id}
              onRemoved={(productId) => onRemoved(productId)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
