// src/components/explore/BrandOfTheWeek.tsx
// "Marca de la semana": rota cada lunes entre las marcas de SoloRopa y se muestra solo con fotos reales de la marca.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Brand, Product } from "../../Types/Types";
import productsServices from "../../services/products";
import ProductImage from "../ui/ProductImage";
import FavoriteButton from "../ui/FavoriteButton";
import BrandLogo from "../ui/BrandLogo";
import { BRAND_PHOTOS } from "../../data/exploreImages";
import { getDiscount } from "../../utils/discount";
import { brandRotation, weekRangeLabel } from "../../utils/brandOfTheWeek";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faArrowRight } from "@fortawesome/free-solid-svg-icons";

interface BrandOfTheWeekProps {
  brands: Brand[];
  onProductClick: (product: Product) => void;
}

const PANEL_PHOTOS = 3;
const ROTATE_MS = 5000;

export default function BrandOfTheWeek({ brands, onProductClick }: BrandOfTheWeekProps) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [active, setActive] = useState(0);

  // Marca de esta semana; si no tiene stock, pasa a la siguiente de la rotación
  useEffect(() => {
    let cancelled = false;
    const pick = async () => {
      setLoading(true);
      for (const candidate of brandRotation(brands)) {
        try {
          const result = await productsServices.getProducts({
            page: 1, limit: 5, sort: "trendingScore", order: "desc", brand: candidate.id, inStock: true,
          });
          if (cancelled) return;
          if (result.data.length > 0) {
            setBrand(candidate);
            setProducts(result.data);
            break;
          }
        } catch (err) {
          console.error("Error fetching brand products", err);
        }
      }
      if (!cancelled) setLoading(false);
    };
    if (brands.length > 0) pick();
    return () => {
      cancelled = true;
    };
  }, [brands]);

  // Fotos de campaña de la marca (de su página oficial), sin las que fallaron al cargar
  const campaign = useMemo(
    () => (brand ? (BRAND_PHOTOS[brand.slug || ""] ?? []).filter((src) => !failed.has(src)) : []),
    [brand, failed]
  );

  // Sin fotos de campaña: tríptico con fotos reales de su catálogo
  const photos = useMemo(() => {
    if (!brand) return [];
    const featured = products.slice(0, 2);
    const rest = products.slice(2);
    // La 2ª foto de cada producto suele ser la que lleva modelo; las fotos de producto plano van al final
    const candidates = [
      ...rest.map((p) => p.images[1]?.src),
      ...featured.map((p) => p.images[1]?.src),
      ...rest.map((p) => p.images[0]?.src),
    ].filter((src): src is string => !!src && !failed.has(src));
    return [...new Set(candidates)].slice(0, PANEL_PHOTOS);
  }, [brand, products, failed]);

  // Rota las fotos de campaña
  useEffect(() => {
    if (campaign.length < 2 || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % campaign.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [campaign.length]);

  const featured = products.slice(0, 2);
  const current = campaign.length ? active % campaign.length : 0;

  if (!loading && !brand) return null;

  return (
    <section className="mt-16 grid gap-3 md:h-[600px] md:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,1fr)_240px]">
      {/* Tríptico de fotos reales de la marca, con la marca encima */}
      <Link
        to={brand ? `/search?brand=${brand.id}` : "/search"}
        className="group relative block h-[440px] overflow-hidden bg-black sm:h-[480px] md:h-auto"
      >
        {loading || !brand ? (
          <div className="h-full w-full skeleton-shimmer" />
        ) : campaign.length > 0 ? (
          // Fotos de campaña: una grande, rotando con fundido
          campaign.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Campaña de ${brand.name}`}
              loading="lazy"
              onError={() => setFailed((prev) => new Set(prev).add(src))}
              className={`absolute inset-0 h-full w-full object-cover object-[center_30%] transition-all duration-1000 group-hover:scale-105 ${
                i === current ? "opacity-100" : "opacity-0"
              }`}
            />
          ))
        ) : (
          <div
            className="grid h-full gap-1 bg-black"
            style={{ gridTemplateColumns: `repeat(${Math.max(photos.length, 1)}, minmax(0, 1fr))` }}
          >
            {photos.map((src) => (
              <div key={src} className="relative overflow-hidden bg-slate-200">
                <img
                  src={src}
                  alt={`Foto de ${brand.name}`}
                  loading="lazy"
                  onError={() => setFailed((prev) => new Set(prev).add(src))}
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

        <span className="absolute left-4 top-4 inline-flex items-center gap-2 bg-yellow-400 px-3 py-1 text-xs font-black uppercase tracking-widest text-black">
          <FontAwesomeIcon icon={faStar} />
          Marca de la semana
          <span className="font-bold normal-case tracking-normal text-black/60">· {weekRangeLabel()}</span>
        </span>

        {brand && (
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 md:p-8">
            <div
              style={{ backgroundColor: brand.logo?.backgroundColor || "#ffffff" }}
              className="flex h-12 w-12 items-center justify-center text-black md:h-14 md:w-14"
            >
              <BrandLogo brand={brand} className="h-4/5 w-4/5 object-contain" />
            </div>
            <h2 className="text-5xl font-black uppercase leading-[0.85] tracking-tighter text-white md:text-7xl lg:text-8xl">
              {brand.name}
            </h2>
            <p className="max-w-md text-sm font-medium leading-relaxed text-white/80 line-clamp-2">
              {brand.description || `Lo más prendido de ${brand.name} esta semana, seleccionado a mano para tu guardarropa.`}
            </p>
            <span className="mt-1 inline-flex w-fit items-center gap-2 bg-white px-5 py-2 text-sm font-bold uppercase tracking-wider text-black transition-colors group-hover:bg-yellow-400">
              Ver la marca
              <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        )}
      </Link>

      {/* Un par de prendas destacadas */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:grid-rows-2">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="aspect-[3/4] skeleton-shimmer md:aspect-auto" />)
          : featured.map((product) => {
              const discount = getDiscount(product);
              return (
                <div
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onProductClick(product)}
                  onKeyDown={(e) => e.key === "Enter" && onProductClick(product)}
                  className="group relative aspect-[3/4] cursor-pointer overflow-hidden bg-slate-100 md:aspect-auto"
                >
                  <ProductImage
                    src={product.images[0]?.src}
                    alt={product.images[0]?.alt || product.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {discount && (
                    <span className="absolute left-2 top-2 bg-yellow-400 px-1.5 py-0.5 text-xs font-black text-black">
                      -{discount.percent}%
                    </span>
                  )}

                  <div className="absolute right-2 top-2 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <FavoriteButton productId={product.id} />
                  </div>

                  {/* Nombre y precio */}
                  <div className="absolute inset-x-2 bottom-2 bg-white/95 px-3 py-2 transition-colors group-hover:bg-yellow-400">
                    <p className="truncate text-[11px] font-bold uppercase tracking-tight text-black sm:text-xs">
                      {product.title}
                    </p>
                    <p className="flex items-baseline gap-2 text-xs font-extrabold text-black sm:text-sm">
                      ${product.price?.toLocaleString("es-CL")}
                      {discount && (
                        <span className="text-[10px] font-semibold text-slate-500 line-through sm:text-xs">
                          ${discount.originalPrice.toLocaleString("es-CL")}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
      </div>
    </section>
  );
}
