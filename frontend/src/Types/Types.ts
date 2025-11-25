export interface Product {
  id : string;
  brand: string;      // e.g., "freshbrand"
  title: string;
  price: number | null;
  currency?: string | null;
  url: string;
  images: {src : string, alt? : string}[] | [];
  inStock?: boolean;
  scrapedAt: Date;
  raw?: any;          // guarda el JSON/HTML bruto si quieres
}