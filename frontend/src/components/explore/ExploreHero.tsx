// src/components/explore/ExploreHero.tsx
// Portada de Explore: carrusel de fotos a todo el ancho con el texto fijo encima.
import { useCallback, useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { HERO_SLIDES } from "../../data/exploreImages"

type Props = {
  onCtaClick: () => void
}

const INTERVAL_MS = 6000

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

export default function ExploreHero({ onCtaClick }: Props) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)
  const total = HERO_SLIDES.length

  const go = useCallback((dir: 1 | -1) => setActive((i) => (i + dir + total) % total), [total])

  // Avance automático (se pausa con hover/foco y si el usuario prefiere menos movimiento)
  useEffect(() => {
    if (paused || total < 2 || prefersReducedMotion()) return
    const id = window.setInterval(() => go(1), INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [paused, total, go, active])

  return (
    <section
      className="relative h-[70vh] min-h-[460px] w-full overflow-hidden bg-black md:h-[72vh] md:max-h-[720px]"
      aria-roledescription="carrusel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      // Deslizar con el dedo en móvil
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
        touchX.current = null
      }}
    >
      {/* Slides (fundido entre una y otra) */}
      {HERO_SLIDES.map((slide, i) => (
        <img
          key={slide.id}
          src={slide.src}
          alt={slide.alt}
          aria-hidden={i !== active}
          fetchPriority={i === 0 ? "high" : "low"}
          style={{ objectPosition: slide.position }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            slide.editorial ? "editorial-photo" : ""
          } ${i === active ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent md:hidden" />

      {/* Texto fijo */}
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end gap-5 px-6 pb-16 md:justify-center md:pb-0">
        <h1 className="text-6xl font-black uppercase leading-[0.85] tracking-tighter text-white sm:text-8xl lg:text-9xl">
          Solo
          <br />
          Ropa
        </h1>

        <p className="max-w-xs text-sm font-medium leading-relaxed text-white/85 sm:text-base">
          Streetwear multimarca en un solo lugar. Descubre, combina y viste tu estilo.
        </p>

        <button
          onClick={onCtaClick}
          className="group inline-flex w-fit items-center gap-3 border-2 border-white bg-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-black transition-colors hover:border-yellow-400 hover:bg-yellow-400"
        >
          Explorar ahora
          <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Controles */}
      {total > 1 && (
        <div className="absolute inset-x-0 bottom-5 mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setActive(i)}
                aria-label={`Ir a la imagen ${i + 1}`}
                aria-current={i === active}
                className={`h-1 transition-all duration-300 ${i === active ? "w-10 bg-white" : "w-5 bg-white/40 hover:bg-white/70"}`}
              />
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => go(-1)}
              aria-label="Imagen anterior"
              className="flex h-10 w-10 items-center justify-center bg-white/15 text-white backdrop-blur transition-colors hover:bg-white hover:text-black"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Imagen siguiente"
              className="flex h-10 w-10 items-center justify-center bg-white/15 text-white backdrop-blur transition-colors hover:bg-white hover:text-black"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
