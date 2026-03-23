import { RawProduct, NormalizedProduct } from "../domain/Product"
import { extractSignals } from "./extractor"
import { normalizeTokens } from "./normalizer"
import { inferTags } from "./rules"

export function processProduct(product: RawProduct): NormalizedProduct {
  const rawTokens = extractSignals(product)
  const normalizedTokens = normalizeTokens(rawTokens)
  const tags = inferTags(normalizedTokens)

  return {
    title: product.title,
    brand: product.brand,
    price: product.price,
    tags
  }
}