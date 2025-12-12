// src/pages/Favorites.tsx
import WishlistGrid from "../components/wishlist/WishlistGrid"
import type { Wishlist } from "../Types/Types"

// mock temporal
const mockWishlists: Wishlist[] = [
  {
    id: "1",
    userId : "1",
    visibility : "private",
    name: "Favoritos",
    isDefault: true,
    items: [],
    createdAt: new Date,
  },
  {
    id: "2",
    userId : "1",
    visibility : "private",
    name: "Polerones Invierno",
    isDefault: false,
    items: [],
    createdAt: new Date,
  },
]

export default function Favorites() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tus colecciones</h1>
        <button className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
          + Nueva colección
        </button>
      </div>

      <WishlistGrid wishlists={mockWishlists} />
    </section>
  )
}
