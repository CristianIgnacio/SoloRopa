import { RawProduct } from "../domain/Product"

export function extractSignals(product: RawProduct): string[] {
  return [
    product.title,
    product.description,
    ...(product.collections || []),
    ...(product.tags || []),
    ...Object.values(product.attributes || {})
  ]
    .join(" ")
    .toLowerCase()
    .split(/\s+/)
}
