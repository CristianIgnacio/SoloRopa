// src/utils/brandOfTheWeek.ts
// Rotación semanal de "Marca de la semana": cada lunes cambia a la siguiente marca, en orden fijo.
import type { Brand } from "../Types/Types"

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
// Lunes 1 de enero de 2024: punto de partida de la cuenta de semanas
const EPOCH_MONDAY = new Date(2024, 0, 1)

/** Lunes (00:00, hora local) de la semana de `date`. */
export function startOfWeek(date = new Date()): Date {
  const day = (date.getDay() + 6) % 7 // lunes = 0
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day)
}

/** Número de semana desde EPOCH_MONDAY (igual para todos los usuarios durante la semana). */
export function weekNumber(date = new Date()): number {
  return Math.round((startOfWeek(date).getTime() - EPOCH_MONDAY.getTime()) / WEEK_MS)
}

/**
 * Marcas ordenadas para esta semana: la primera es la marca de la semana y el resto son
 * las siguientes en la rotación (para saltar a la próxima si una no tiene stock).
 * El orden base es por id (orden de creación), así que una marca nueva entra al final de la rotación.
 */
export function brandRotation(brands: Brand[], date = new Date()): Brand[] {
  if (brands.length === 0) return []
  const sorted = [...brands].sort((a, b) => a.id.localeCompare(b.id))
  const start = weekNumber(date) % sorted.length
  return [...sorted.slice(start), ...sorted.slice(0, start)]
}

/** Texto del rango de la semana, por ejemplo "23 – 29 nov". */
export function weekRangeLabel(date = new Date()): string {
  const monday = startOfWeek(date)
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)
  const fmt = (d: Date, withMonth: boolean) =>
    d.toLocaleDateString("es-CL", withMonth ? { day: "numeric", month: "short" } : { day: "numeric" }).replace(".", "")
  const sameMonth = monday.getMonth() === sunday.getMonth()
  return `${fmt(monday, !sameMonth)} – ${fmt(sunday, true)}`
}
