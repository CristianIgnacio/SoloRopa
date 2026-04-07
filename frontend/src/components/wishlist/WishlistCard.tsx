import { Link } from "react-router-dom"
import type { Wishlist } from "../../Types/Types"

type Props = {
  wishlist: Wishlist
}

export default function WishlistCard({ wishlist }: Props) {

  return (
    <Link
      to={`/favorites/${wishlist.id}`}
      className="group rounded-none border-2 border-black bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]"
    >
      <div className="mb-4 flex h-32 items-center justify-center border-2 border-black bg-[#F4F4F0] transition-colors group-hover:bg-yellow-400">
        <span className="text-3xl">
          {wishlist.isDefault ? "⭐" : "📁"}
        </span>
      </div>

      <h3 className="font-black uppercase tracking-tighter text-black">{wishlist.name}</h3>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-800">
        {wishlist.items.length} productos
      </p>
    </Link>
  )
}
