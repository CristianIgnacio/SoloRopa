// src/components/explore/GridFilters.tsx
// Filtros rápidos para "Todos los productos": género, categoría y orden. Quedan fijos bajo el navbar.

import { SORT_OPTIONS, type GridFilterState } from "./gridFilterOptions"

const GENDERS = [
  { key: "", label: "Todo" },
  { key: "hombre", label: "Hombre" },
  { key: "mujer", label: "Mujer" },
] as const

const CATEGORIES = [
  { key: "poleras", label: "Poleras" },
  { key: "polerones", label: "Polerones" },
  { key: "pantalones", label: "Pantalones" },
  { key: "shorts", label: "Shorts" },
  { key: "chaquetas", label: "Chaquetas" },
  { key: "accesorios", label: "Accesorios" },
]

type Props = {
  value: GridFilterState
  onChange: (next: GridFilterState) => void
}

const chip = (active: boolean) =>
  `shrink-0 px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
    active ? "bg-black text-white" : "bg-white text-black hover:bg-yellow-400"
  }`

export default function GridFilters({ value, onChange }: Props) {
  return (
    <div className="sticky top-[65px] z-30 -mx-4 mb-4 border-b border-slate-200 bg-neutral-50/95 px-4 py-3 backdrop-blur md:mx-0 md:px-0">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GENDERS.map((g) => (
            <button key={g.key} onClick={() => onChange({ ...value, gender: g.key })} className={chip(value.gender === g.key)}>
              {g.label}
            </button>
          ))}

          <span className="mx-1 h-5 w-px shrink-0 bg-slate-300" />

          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => onChange({ ...value, category: value.category === c.key ? "" : c.key })}
              className={chip(value.category === c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <label className="relative shrink-0">
          <span className="sr-only">Ordenar por</span>
          <select
            value={value.sort}
            onChange={(e) => onChange({ ...value, sort: e.target.value })}
            className="cursor-pointer appearance-none bg-black py-1.5 pl-2.5 pr-7 text-[10px] sm:pl-3 sm:pr-8 sm:text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white">▼</span>
        </label>
      </div>
    </div>
  )
}
