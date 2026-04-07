import { useEffect, useState } from "react";
import type { Brand, Product } from "../../Types/Types";
import productsServices from "../../services/products";
import ProductShowcaseCard from "../product/ProductShowcaseCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faArrowRight } from "@fortawesome/free-solid-svg-icons";

interface BrandOfTheWeekProps {
  brand: Brand;
  onProductClick: (product: Product) => void;
}

export default function BrandOfTheWeek({ brand, onProductClick }: BrandOfTheWeekProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      setLoading(true);
      try {
        // Fetch up to 4 top products for this brand
        const result = await productsServices.getProducts(1, 4, "trendingScore", "desc", brand.id);
        setProducts(result.data);
      } catch (err) {
        console.error("Error fetching brand products", err);
      } finally {
        setLoading(false);
      }
    };
    if (brand) fetchTopProducts();
  }, [brand]);

  if (!brand) return null;

  return (
    <div className="relative my-10 overflow-hidden rounded-none md:rounded-2xl bg-[#F0F0F0] border-y-4 md:border-4 border-black p-6 md:p-10 shadow-[8px_8px_0_0_#000]">
      {/* Abstract Background Element (Streetwear Accent) */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-400 opacity-80 blur-[80px]"></div>

      <div className="relative z-10 flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
        
        {/* Left Side: Brand Info */}
        <div className="flex flex-col items-start space-y-4 md:w-1/3 text-black">
          <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-widest text-black shadow-[2px_2px_0_0_#000]">
            <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
            <span>Marca de la semana</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-black">
            {brand.name}
          </h2>
          
          <p className="text-sm md:text-base font-medium text-slate-800 leading-relaxed line-clamp-3">
            {brand.description || `Explora la colección más ruda de ${brand.name}. Lo mas prendido de esta semana, seleccionado a mano para tu guardarropa.`}
          </p>

          <a 
            href={brand.website || "#"} 
            target="_blank" 
            rel="noreferrer"
            className="group mt-4 inline-flex items-center gap-2 border-2 border-black bg-black px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-yellow-400 hover:text-black focus:outline-none"
          >
            Saber más
            <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Right Side: Product Showcase */}
        <div className="md:w-2/3 md:pl-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center border-2 border-dashed border-black bg-white/50">
              <span className="font-bold uppercase tracking-widest text-black/50">Cargando Drop...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductShowcaseCard 
                     key={product.id}
                     product={product} 
                     onClick={() => onProductClick(product)} 
                  />
                ))
              ) : (
                <div className="col-span-full py-10 text-center font-bold text-slate-500">
                  SIN STOCK EN ESTE DROP.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
