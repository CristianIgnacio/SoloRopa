const DICTIONARY: Record<string, string> = {
  "t-shirt": "polera",
  "tee": "polera",
  "oversized": "oversize",
  "over-size": "oversize",
  "hooded": "hoodie",
  "black": "negro",
  "white": "blanco",
  "street": "streetwear",
}

export function normalizeTokens(tokens: string[]): string[] {
  return tokens.map(t => DICTIONARY[t] ?? t)
}
