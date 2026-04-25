import { CanonicalTags } from "./Tag"

export type RawProduct = {
  title: string
  description: string
  collections?: string[]
  tags?: string[]
  attributes?: Record<string, string>
  price: number
  brand: string
}

export type NormalizedProduct = {
  title: string
  brand: string
  price: number
  tags: CanonicalTags
}
