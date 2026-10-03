type ExistingProduct = { _id: unknown; title: string; url: string };
type CatalogProduct = { title: string; url: string };

const normalizeTitle = (title: string) => title.normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, " ").trim();

const handle = (url: string) => decodeURIComponent(new URL(url).pathname)
  .replace(/^\/products\//, "/").replace(/^\/|\/$/g, "");

// Sólo coincidencias únicas; nunca asignar por similitud aproximada.
export function planTreinoMigration<T extends ExistingProduct, U extends CatalogProduct>(existing: T[], catalog: U[]) {
  if (!catalog.length) throw new Error("No se puede migrar un catálogo vacío");
  if (new Set(catalog.map(p => p.url)).size !== catalog.length) {
    throw new Error("El catálogo tiene URLs duplicadas");
  }
  const matched: { existing: T; product: U; reason: string }[] = [];
  const retired: T[] = [];
  const used = new Set<string>();
  for (const old of existing) {
    let candidates = catalog.filter(p => p.url === old.url);
    let reason = "url";
    if (!candidates.length && new URL(old.url).hostname.endsWith("treinoficial.cl")) {
      candidates = catalog.filter(p => normalizeTitle(p.title) === normalizeTitle(old.title));
      reason = "title";
      if (!candidates.length) {
        candidates = catalog.filter(p => handle(p.url) === handle(old.url));
        reason = "handle";
      }
    }
    if (candidates.length > 1) throw new Error(`Coincidencia ambigua: ${old.title}`);
    if (!candidates.length) { retired.push(old); continue; }
    const product = candidates[0];
    if (used.has(product.url)) throw new Error(`Dos registros corresponden a ${product.url}`);
    used.add(product.url);
    matched.push({ existing: old, product, reason });
  }
  return { matched, retired, added: catalog.filter(p => !used.has(p.url)) };
}
