import { Category, Fit, Style, Color, Gender } from "./enums" 

export type CanonicalTags = {
  category?: Category
  fit?: Fit[]
  style?: Style[]
  color?: Color[]
  season?: string[]
  gender?: Gender
}

