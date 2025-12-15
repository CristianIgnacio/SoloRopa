// src/store/useWishlistStore.ts
import { create } from "zustand"
import wishlistServices from "../services/wishlist"
import type { Wishlist } from "../Types/Types"

type WishlistState = {
  favoriteIds: Set<string>
  wishlist : Wishlist[]
  loadFavorites: () => Promise<void>
  toggleFavorite: (productId: string) => Promise<void>
  isFavorite: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    favoriteIds: new Set(),
    wishlist : [],
    loadFavorites: async () => {
        const wishlists = await wishlistServices.getUserWishlists()
        const findList = wishlists.data.find((w: any) => w.isDefault)
        const defaultList = findList?.items.map( (item : any) => item.productId)

        set({
            favoriteIds: new Set(defaultList || []),
            wishlist : wishlists.data,
        })

    },

    toggleFavorite: async (productId) => {
        // optimistic update
        const prev = new Set(get().favoriteIds)
        const next = new Set(prev)

        next.has(productId) ? next.delete(productId) : next.add(productId)
        set({ favoriteIds: next })

        try {
        await wishlistServices.toggleFavorite(productId)
        await get().loadFavorites()
        } catch (e) {
        // rollback si falla
        set({ favoriteIds: prev })
        }
    },

    isFavorite: (productId) => {
        return get().favoriteIds.has(productId)
    },
}))
