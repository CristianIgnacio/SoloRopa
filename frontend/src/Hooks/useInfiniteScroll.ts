// src/hooks/useInfiniteScroll.ts
import { useEffect } from "react"

export function useInfiniteScroll(callback: () => void) {
  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300

      if (bottom) callback()
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [callback])
}
