import { useState } from "react"
import type { Brand } from "../../Types/Types"
import { localBrandLogos } from "../../data/brandLogos"

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "")

export default function BrandLogo({ brand, className = "" }: { brand: Brand; className?: string }) {
  const src = localBrandLogos[normalize(brand.slug || "")] || localBrandLogos[normalize(brand.name)]
  const [failedSrc, setFailedSrc] = useState<string>()

  if (!src || failedSrc === src) {
    return (
      <span role="img" aria-label={`Logo de ${brand.name}`} className={`flex items-center justify-center text-lg font-black ${className}`}>
        {brand.name.slice(0, 2).toUpperCase()}
      </span>
    )
  }

  return <img src={src} alt={brand.logo?.alt || brand.name} className={className} loading="lazy" onError={() => setFailedSrc(src)} />
}
