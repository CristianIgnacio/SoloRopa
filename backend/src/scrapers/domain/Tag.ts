import { Category, Fit, Style, Color } from "./enums" 

export type CanonicalTags = {
  category?: Category
  fit?: Fit[]
  style?: Style[]
  color?: Color[]
  season?: string[]
}
