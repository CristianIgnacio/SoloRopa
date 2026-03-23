import { Category, Fit, Style, Color } from "../domain/enums"
import { CanonicalTags } from "../domain/Tag"

export function inferTags(tokens: string[]): CanonicalTags {
  const tags: CanonicalTags = {}

  // CATEGORY (1 sola)
  if (tokens.includes("polera")) tags.category = Category.POLERA
  else if (tokens.includes("hoodie")) tags.category = Category.HOODIE

  // FIT
  tags.fit = []
  if (tokens.includes("oversize")) tags.fit.push(Fit.OVERSIZE)
  if (tokens.includes("boxy")) tags.fit.push(Fit.BOXY)

  // STYLE
  tags.style = []
  if (tokens.includes("streetwear")) tags.style.push(Style.STREETWEAR)
  if (tokens.includes("skate")) tags.style.push(Style.SKATE)

  // COLOR
  tags.color = []
  if (tokens.includes("negro")) tags.color.push(Color.NEGRO)
  if (tokens.includes("blanco")) tags.color.push(Color.BLANCO)

  return tags
}
