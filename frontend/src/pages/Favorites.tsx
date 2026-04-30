// src/pages/Favorites.tsx
import WishlistGrid from "../components/wishlist/WishlistGrid"
// import type { Wishlist } from "../Types/Types"
import { useWishlistStore } from "../Hooks/useWishlistStore"

// // mock temporal
// const mockWishlists: Wishlist[] = [
//   {
//     id: "1",
//     userId : "1",
//     visibility : "private",
//     name: "Favoritos",
//     isDefault: true,
//     items: [],
//     createdAt: new Date,
//   },
//   {
//     id: "2",
//     userId : "1",
//     visibility : "private",
//     name: "Polerones Invierno",
//     isDefault: false,
//     items: [],
//     createdAt: new Date,
//   },
// ]

export default function Favorites() {
  const {wishlist} = useWishlistStore()

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-black pb-4 sm:pb-2">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-black">Tus colecciones</h1>
        <button className="border-2 border-black bg-black px-4 py-2 text-sm font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000] transition-all hover:bg-yellow-400 hover:text-black active:translate-y-px active:shadow-none w-full sm:w-auto text-center">
          + Nueva colección
        </button>
      </div>

      <WishlistGrid wishlists={wishlist} />
    </section>
  )
}
