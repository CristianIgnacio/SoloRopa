import { Link } from "react-router-dom"
import type { Wishlist } from "../../Types/Types"

type Props = {
  wishlist: Wishlist
}

export default function WishlistCard({ wishlist }: Props) {

  return (
    <Link
      to={`/favorites/${wishlist.id}`}
      className="group relative flex flex-col rounded-none border-2 border-black bg-white p-3 pb-12 shadow-[4px_4px_0_0_#000] transition-all hover:z-10 hover:-translate-y-2 hover:shadow-[10px_10px_0_0_#000]"
    >
      <div className="absolute right-1 top-1 z-10 border-2 border-black bg-yellow-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-black shadow-[2px_2px_0_0_#000]">
        {wishlist.items.length} ITM
      </div>

      <div className="h-48 w-full overflow-hidden border-2 border-black bg-slate-100">
        {wishlist.coverImage ? (
          <img 
            src={wishlist.coverImage} 
            className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0" 
            alt="Cover" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#F4F4F0] transition-colors group-hover:bg-yellow-400">
            <span className="text-5xl text-black">
              {wishlist.isDefault ? "⭐" : "📁"}
            </span>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-0 w-full px-4 text-center">
        <h3 className="truncate text-lg font-black uppercase tracking-tighter text-black">
          {wishlist.name}
        </h3>
      </div>
    </Link>
  )
}
