import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlay,
  faRocket,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faStore,
  faTerminal,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons"
import scrapeService from "../services/scrape"
import type { ScrapeFeedItem, BrandStat } from "../services/scrape"

const BRANDS = [
  { key: "freshbrand",   label: "Freshbrand",     url: "freshbrand.cl" },
  { key: "moreamor",     label: "Moreamor",       url: "moreamor.cl" },
  { key: "rudeboys",     label: "Rudeboys",       url: "rudeboys.cl" },
  { key: "subcomplot",   label: "SubComplot",     url: "subcomplot.cl" },
  { key: "belowapparel", label: "Below Apparel",  url: "belowapparel.com" },
  { key: "bvnggvng",     label: "Bvnggvng",       url: "bvnggvng.cl" },
  { key: "mdf",          label: "MDF",            url: "ropamdf.cl" },
  { key: "treinoficial", label: "Treinoficial",   url: "treinoficial.cl" },
  { key: "whatup",       label: "Whatup",         url: "streetmachine.cl/collections/whatup" },
]

type BrandStatus = "idle" | "loading" | "success" | "error"

interface BrandState {
  status: BrandStatus
  count?: number
  error?: string
}

interface LogEntry {
  time: string
  type: "info" | "success" | "error"
  message: string
}

export default function Admin() {
  const [brandStates, setBrandStates] = useState<Record<string, BrandState>>(
    Object.fromEntries(BRANDS.map((b) => [b.key, { status: "idle" }]))
  )
  const [scrapingAll, setScrapingAll] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [dbStats, setDbStats] = useState<Record<string, BrandStat>>({})

  useEffect(() => {
    scrapeService.getStats().then((res) => {
      const map: Record<string, BrandStat> = {}
      res.data.forEach((s) => { map[s.slug] = s })
      setDbStats(map)
    }).catch(() => {})
  }, [])

  const addLog = (type: LogEntry["type"], message: string) => {
    const time = new Date().toLocaleTimeString("es-CL")
    setLogs((prev) => [{ time, type, message }, ...prev].slice(0, 100))
  }

  const setBrandState = (key: string, state: BrandState) => {
    setBrandStates((prev) => ({ ...prev, [key]: state }))
  }

  const handleScrapeBrand = async (brand: typeof BRANDS[0]) => {
    setBrandState(brand.key, { status: "loading" })
    addLog("info", `Iniciando scraping de ${brand.label}...`)
    try {
      const res = await scrapeService.scrapeBrand(brand.key)
      const count = res.result?.count ?? 0
      setBrandState(brand.key, { status: "success", count })
      addLog("success", `✅ ${brand.label}: ${count} productos actualizados`)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err.message
      setBrandState(brand.key, { status: "error", error: msg })
      addLog("error", `❌ ${brand.label}: ${msg}`)
    }
  }

  const handleScrapeAll = async () => {
    setScrapingAll(true)
    BRANDS.forEach((b) => setBrandState(b.key, { status: "loading" }))
    addLog("info", "🚀 Iniciando scraping de TODAS las marcas...")

    try {
      const res = await scrapeService.scrapeAll()
      res.feed.forEach((item: ScrapeFeedItem) => {
        const label = BRANDS.find((b) => b.key === item.brand)?.label ?? item.brand
        if (item.success) {
          setBrandState(item.brand, { status: "success", count: item.count })
          addLog("success", `✅ ${label}: ${item.count} productos actualizados`)
        } else {
          setBrandState(item.brand, { status: "error", error: item.error })
          addLog("error", `❌ ${label}: ${item.error}`)
        }
      })
      addLog("info", `🏁 Scraping completo. Total: ${res.total} productos actualizados`)
    } catch (err: any) {
      addLog("error", `Error general: ${err?.response?.data?.message ?? err.message}`)
      BRANDS.forEach((b) => setBrandState(b.key, { status: "idle" }))
    } finally {
      setScrapingAll(false)
    }
  }

  const getStatusIcon = (status: BrandStatus) => {
    if (status === "loading") return <FontAwesomeIcon icon={faSpinner} spin className="text-yellow-500" />
    if (status === "success") return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
    if (status === "error") return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
    return <FontAwesomeIcon icon={faStore} className="text-slate-400" />
  }

  const getLogColor = (type: LogEntry["type"]) => {
    if (type === "success") return "text-green-400"
    if (type === "error") return "text-red-400"
    return "text-slate-300"
  }

  return (
    <div className="min-h-screen bg-[#F4F4F0] p-6">
      {/* Header */}
      <div className="mb-8 border-b-4 border-black pb-6">
        <div className="flex items-center gap-3">
          <div className="border-2 border-black bg-black p-2 shadow-[4px_4px_0_0_#FFD700]">
            <FontAwesomeIcon icon={faShieldHalved} className="text-xl text-yellow-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Panel Admin</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">SoloRopa · Control de Scrapers</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">

        {/* LEFT: Brands */}
        <div className="space-y-4">
          {/* Scrape All button */}
          <div className="border-2 border-black bg-black p-4 shadow-[4px_4px_0_0_#FFD700]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-yellow-400">Scraping Global</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Actualiza todas las tiendas de una vez</p>
              </div>
              <button
                id="btn-scrape-all"
                onClick={handleScrapeAll}
                disabled={scrapingAll}
                className="flex items-center gap-2 border-2 border-yellow-400 bg-yellow-400 px-5 py-3 text-sm font-black uppercase tracking-widest text-black shadow-[4px_4px_0_0_#fff] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#fff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {scrapingAll
                  ? <><FontAwesomeIcon icon={faSpinner} spin /> Scrapeando...</>
                  : <><FontAwesomeIcon icon={faRocket} /> Scrape All</>
                }
              </button>
            </div>
          </div>

          {/* Brand cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            {BRANDS.map((brand) => {
              const state = brandStates[brand.key]
              return (
                <div
                  key={brand.key}
                  className={`
                    border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] transition-all
                    ${state.status === "success" ? "border-green-500 shadow-[4px_4px_0_0_#22c55e]" : ""}
                    ${state.status === "error" ? "border-red-400 shadow-[4px_4px_0_0_#f87171]" : ""}
                    ${state.status === "loading" ? "border-yellow-400 shadow-[4px_4px_0_0_#facc15]" : ""}
                  `}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="text-lg">{getStatusIcon(state.status)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black uppercase tracking-tighter text-black">{brand.label}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{brand.url}</p>
                    </div>
                  </div>

                  {/* Stats de DB */}
                  {dbStats[brand.key] && (
                    <div className="mb-3 border-t border-slate-200 pt-2 flex gap-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total productos</p>
                        <p className="text-sm font-black text-black">{dbStats[brand.key].totalProducts.toLocaleString("es-CL")}</p>
                      </div>
                      <div className="border-l border-slate-200 pl-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Último scrape</p>
                        <p className="text-[11px] font-bold text-slate-600">
                          {dbStats[brand.key].lastScraped
                            ? new Date(dbStats[brand.key].lastScraped!).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "Nunca"}
                        </p>
                      </div>
                    </div>
                  )}

                  {state.status === "success" && (
                    <p className="mb-2 text-xs font-bold uppercase text-green-600">
                      {state.count} productos actualizados
                    </p>
                  )}
                  {state.status === "error" && (
                    <p className="mb-2 truncate text-xs font-bold uppercase text-red-500">
                      {state.error}
                    </p>
                  )}

                  <button
                    id={`btn-scrape-${brand.key}`}
                    onClick={() => handleScrapeBrand(brand)}
                    disabled={state.status === "loading" || scrapingAll}
                    className="flex w-full items-center justify-center gap-2 border-2 border-black bg-black py-2 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-yellow-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {state.status === "loading"
                      ? <><FontAwesomeIcon icon={faSpinner} spin /> Scrapeando...</>
                      : <><FontAwesomeIcon icon={faPlay} /> Iniciar Scrape</>
                    }
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT: Log terminal */}
        <div className="flex flex-col border-2 border-black bg-black shadow-[4px_4px_0_0_#000]" style={{ maxHeight: "80vh" }}>
          <div className="flex items-center gap-2 border-b-2 border-slate-700 px-4 py-3">
            <FontAwesomeIcon icon={faTerminal} className="text-yellow-400" />
            <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Feed de actividad</span>
            <span className="ml-auto rounded-none border border-slate-600 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
              {logs.length} eventos
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-slate-600">// Sin actividad aún. Inicia un scrape.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1 leading-relaxed">
                  <span className="text-slate-600">[{log.time}]</span>{" "}
                  <span className={getLogColor(log.type)}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}