import { CATEGORY_MAPPING, ProductCategory, PRODUCT_CATEGORIES } from "../../constants/productCategories"
import { COLOR_MAPPING, FIT_MAPPING, GENDER_MAPPING, STYLE_MAPPING } from "../../constants/tagMappings"
import { Category, Fit, Style, Color, Gender } from "../domain/enums"
import { CanonicalTags } from "../domain/Tag"

export interface NormalizedMetadata {
  category: ProductCategory
  categoryConfidence: number
  gender?: Gender
  tags: string[]
  canonicalTags: CanonicalTags
}

/**
 * Función maestra para normalizar el título, descripción y tags crudos de un producto.
 */
export function normalizeProductMetadata(
  title: string,
  rawTags: string[] = [],
  description: string = ""
): NormalizedMetadata {
  const combinedText = `${title} ${rawTags.join(" ")} ${description}`.toLowerCase()
  const tokens: string[] = combinedText.match(/[a-záéíóúñ]+/g) || []

  // 1. Limpiar Tags Crudos (Purificación)
  const cleanTags = new Set<string>()
  const validKeywords = [
    ...Object.keys(CATEGORY_MAPPING), 
    ...Object.keys(FIT_MAPPING), 
    ...Object.keys(STYLE_MAPPING), 
    ...Object.keys(COLOR_MAPPING),
    ...Object.keys(GENDER_MAPPING)
  ]

  tokens.forEach(token => {
    if (validKeywords.includes(token)) {
      cleanTags.add(token)
    }
  })

  // 2. Determinar Categoría y Confianza
  let category: ProductCategory = "otros"
  let categoryConfidence = 0.3

  // Buscamos si algún token del título o tags coincide con el Mapping oficial
  for (const token of tokens) {
    if (CATEGORY_MAPPING[token]) {
      category = CATEGORY_MAPPING[token]
      categoryConfidence = 0.95
      break // Tomamos la primera coincidencia fuerte
    }
  }

  // 3. Extraer Canonical Tags (Fit, Style, Color, Gender)
  const canonicalTags: CanonicalTags = {}
  
  const extractedFits = new Set<Fit>()
  const extractedStyles = new Set<Style>()
  const extractedColors = new Set<Color>()
  const extractedGenders = new Set<Gender>()

  tokens.forEach(token => {
    if (FIT_MAPPING[token]) extractedFits.add(FIT_MAPPING[token])
    if (STYLE_MAPPING[token]) extractedStyles.add(STYLE_MAPPING[token])
    if (COLOR_MAPPING[token]) extractedColors.add(COLOR_MAPPING[token])
    if (GENDER_MAPPING[token]) extractedGenders.add(GENDER_MAPPING[token])
  })

  if (extractedFits.size > 0) canonicalTags.fit = Array.from(extractedFits)
  if (extractedStyles.size > 0) canonicalTags.style = Array.from(extractedStyles)
  if (extractedColors.size > 0) canonicalTags.color = Array.from(extractedColors)

  // Gender detection logic
  let gender: Gender | undefined;

  if (extractedGenders.has(Gender.UNISEX)) {
    gender = Gender.UNISEX;
  } else if (extractedGenders.has(Gender.HOMBRE) && extractedGenders.has(Gender.MUJER)) {
    gender = Gender.UNISEX;
  } else if (extractedGenders.has(Gender.HOMBRE)) {
    gender = Gender.HOMBRE;
  } else if (extractedGenders.has(Gender.MUJER)) {
    gender = Gender.MUJER;
  }

  // Asignar enums strict
  canonicalTags.category = category as unknown as Category

  return {
    category,
    categoryConfidence,
    gender,
    tags: Array.from(cleanTags),
    canonicalTags
  }
}