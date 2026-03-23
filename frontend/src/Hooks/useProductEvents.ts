// src/hooks/useProductEvents.ts
import { useRef } from "react"
import createProductEvent from "../services/productEvents"

// type ProductEventType = "view" | "favorite" | "click"

export function useProductEvents(productId?: string) {
  const hasViewedRef = useRef(false)

  const trackView = () => {
    if (!productId) return
    if (hasViewedRef.current) return

    hasViewedRef.current = true
    createProductEvent({productId, type :"view" }).catch(() => {})
  }

  const trackFavorite = () => {
    if (!productId) return
    createProductEvent({productId, type : "favorite"}).catch(() => {})
  }

  const trackUnfavorite = () => {
    if (!productId) return
    createProductEvent({productId, type : "unfavorite"}).catch(() => {})
  }

  const trackClick = () => {
    if (!productId) return
    createProductEvent({productId, type : "click"}).catch(() => {})
  }

  return {
    trackView,
    trackFavorite,
    trackUnfavorite,
    trackClick,
  }
}
