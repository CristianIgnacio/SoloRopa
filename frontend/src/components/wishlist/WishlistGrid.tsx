// src/components/wishlist/WishlistGrid.tsx
import WishlistCard from "./WishlistCard"
import type { Wishlist } from "../../Types/Types"

type Props = {
  wishlists: Wishlist[]
}

export default function WishlistGrid({ wishlists }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {wishlists.map((w) => (
        <WishlistCard key={w.id} wishlist={w} />
      ))}
    </div>
  )
}
