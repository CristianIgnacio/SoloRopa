// src/components/explore/gridFilterOptions.ts
export type GridFilterState = {
  gender: "" | "hombre" | "mujer"
  category: string
  sort: string
}

export const SORT_OPTIONS = [
  { key: "newest", label: "Nuevos", sort: "createdAt", order: "desc" },
  { key: "trending", label: "Tendencia", sort: "trendingScore", order: "desc" },
  { key: "price-asc", label: "Precio ↑", sort: "price", order: "asc" },
  { key: "price-desc", label: "Precio ↓", sort: "price", order: "desc" },
] as const
