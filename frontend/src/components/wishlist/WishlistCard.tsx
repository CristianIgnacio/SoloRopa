import { Link } from "react-router-dom"
import type { Wishlist } from "../../Types/Types"

type Props = {
  wishlist: Wishlist
}

export default function WishlistCard({ wishlist }: Props) {

  const collageImages = wishlist.items
    ?.slice(0, 4)
    .map(item => item.productId?.images?.[0]?.src)
    .filter(Boolean) || [];

  const renderCover = () => {
    if (collageImages.length === 0) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#F4F4F0] transition-colors group-hover:bg-yellow-400">
          <span className="text-5xl text-black">
            {wishlist.isDefault ? "⭐" : "📁"}
          </span>
        </div>
      );
    }

    if (collageImages.length === 1) {
      return (
        <img src={collageImages[0]} className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0" alt="Cover" />
      );
    }

    if (collageImages.length === 2) {
      return (
        <div className="grid h-full w-full grid-cols-2 gap-0.5 bg-black">
          {collageImages.map((src, i) => (
            <img key={i} src={src} className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0" alt="Cover" />
          ))}
        </div>
      );
    }

    if (collageImages.length === 3) {
      return (
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5 bg-black">
          <img src={collageImages[0]} className="col-span-1 row-span-2 h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0" alt="Cover" />
          <img src={collageImages[1]} className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0" alt="Cover" />
          <img src={collageImages[2]} className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0" alt="Cover" />
        </div>
      );
    }

    // 4 imágenes
    return (
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5 bg-black">
        {collageImages.slice(0, 4).map((src, i) => (
          <img key={i} src={src} className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0" alt="Cover" />
        ))}
      </div>
    );
  };

  return (
    <Link
      to={`/favorites/${wishlist.id}`}
      className="group relative flex flex-col rounded-none border-2 border-black bg-white p-3 pb-12 shadow-[4px_4px_0_0_#000] transition-all hover:z-10 hover:-translate-y-2 hover:shadow-[10px_10px_0_0_#000]"
    >
      <div className="absolute right-1 top-1 z-10 border-2 border-black bg-yellow-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-black shadow-[2px_2px_0_0_#000]">
        {wishlist.items.length} ITM
      </div>

      <div className="h-55 w-full overflow-hidden border-2 border-black bg-slate-100">
        {renderCover()}
      </div>

      <div className="absolute bottom-3 left-0 w-full px-4 text-center">
        <h3 className="truncate text-lg font-black uppercase tracking-tighter text-black">
          {wishlist.name}
        </h3>
      </div>
    </Link>
  )
}
