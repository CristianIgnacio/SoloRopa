import { Link } from "react-router-dom"
import type { Wishlist } from "../../Types/Types"

type Props = {
  wishlist: Wishlist
}

export default function WishlistCard({ wishlist }: Props) {

  return (
    <Link
      to={`/favorites/${wishlist.id}`}
      className="group rounded-lg border bg-white p-4 transition hover:shadow"
    >
      <div className="mb-3 h-32 rounded-md bg-slate-100 flex items-center justify-center">
        <span className="text-3xl">
          {wishlist.isDefault ? "⭐" : "📁"}
        </span>
      </div>

      <h3 className="font-medium">{wishlist.name}</h3>
      <p className="text-sm text-slate-500">
        {wishlist.items.length} productos
      </p>
    </Link>
  )
}
