const hero = () => {
    return (
        <></>
    //    <>
    //     HERO
    //   <div className="rounded-xl border border-slate-300 bg-white p-5">
    //     <h1 className="text-xl font-semibold">Explora ropa</h1>
    //     <p className="mt-1 text-sm text-slate-500">
    //       Descubre productos de marcas pequeñas y compáralos en el tiempo.
    //     </p>

    //     búsqueda
    //     <div className="mt-4">
    //       <input
    //         value={query}
    //         onChange={(e) => setQuery(e.target.value)}
    //         placeholder="Buscar productos o marcas…"
    //         className="w-full rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
    //       />
    //     </div>

    //     filtros rápidos
    //     <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    //       <div>
    //         <label className="mb-1 block text-xs font-medium text-slate-600">
    //           Marca
    //         </label>
    //         <select
    //           value={brandId}
    //           onChange={(e) => setBrandId(e.target.value)}
    //           className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
    //         >
    //           <option value="all">Todas</option>
    //           {brands.map((b) => (
    //             <option key={b.id} value={b.id}>
    //               {b.name}
    //             </option>
    //           ))}
    //         </select>
    //       </div>

    //       <div>
    //         <label className="mb-1 block text-xs font-medium text-slate-600">
    //           Precio
    //         </label>
    //         <select
    //           value={priceRange ?? ""}
    //           onChange={(e) => {
    //             const v = e.target.value
    //             setPriceRange((v === "" ? null : (v as PriceRange)) ?? null)
    //           }}
    //           className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
    //         >
    //           {priceRanges.map((r) => (
    //             <option key={String(r.value)} value={r.value ?? ""}>
    //               {r.label}
    //             </option>
    //           ))}
    //         </select>
    //       </div>

    //       <div className="flex items-end">
    //         <label className="flex select-none items-center gap-2 text-sm text-slate-700">
    //           <input
    //             type="checkbox"
    //             checked={inStockOnly}
    //             onChange={(e) => setInStockOnly(e.target.checked)}
    //             className="h-4 w-4"
    //           />
    //           Solo con stock
    //         </label>
    //       </div>

    //       <div className="flex items-end justify-start lg:justify-end">
    //         {hasActiveFilters && (
    //           <button
    //             onClick={resetFilters}
    //             className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
    //           >
    //             Limpiar filtros
    //           </button>
    //         )}
    //       </div>
    //     </div>

    //   </div>

    //   RESULTADOS (por ahora, simple)
    //   <div className="mt-6 flex items-center justify-between">
    //     <p className="text-sm text-slate-600">
    //       {loading ? "Cargando…" : `${filteredProducts.length} productos`}
    //     </p>
    //   </div>
    //    </> 
    )
}

export default hero