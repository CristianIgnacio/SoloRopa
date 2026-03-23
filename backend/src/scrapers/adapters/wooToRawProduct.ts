import { RawProduct } from "../domain/Product"

export function wooToRawProduct(p: any, brand: string): RawProduct {
  return {
    title: p.name,
    description: p.description ?? "",
    collections: p.categories?.map((c: any) => c.name.toLowerCase()) ?? [],
    tags: p.tags?.map((t: any) => t.name.toLowerCase()) ?? [],
    attributes: Object.fromEntries(
      (p.attributes ?? []).map((a: any) => [
        a.name.toLowerCase(),
        (a.options ?? a.terms ?? []).join(" ").toLowerCase()
      ])
    ),
    price: p.prices?.price ? Number(p.prices.price) : 0,
    brand
  }
}
