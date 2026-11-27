export interface Product {
  id : string;
  brand: Brand;
  title: string;
  price: number | null;
  currency?: string | null;
  url: string;
  images: {src : string, alt? : string}[] | [];
  variants : VariantsProduct[]
  inStock?: boolean;
  isActive?: boolean;
  favoritesCount : Number,
  category?: string;
  gender?: "hombre" | "mujer" | "unisex";
  tags?: string[];
  canonicalTags?: {
    fit?: string[];
    style?: string[];
    color?: string[];
    [key: string]: string[] | undefined;
  };
  scrapedAt: Date;
  createdAt: Date;
  updateAt: Date;
  priceStats?: PriceStats | null; // resumen del historial; null/ausente = sin historial
  raw?: any;          // guarda el JSON/HTML bruto si quieres
}

/** Resumen de los últimos 30 días del precio "desde" (el más bajo entre variantes). */
export interface PriceStats {
  current: number;
  min30d: number;
  max30d: number;
  isLowest30d: boolean;
  trackedSince: string;
  lastChangeAt: string;
  computedAt?: string;
}

export interface PricePoint {
  price: number;
  recordedAt: string;
}

export interface PriceHistory {
  days: number;
  points: PricePoint[];
  stats: PriceStats | null;
}

interface VariantsProduct {
  title: string;
  color?: string;
  size?: string;
  sku?: string;
  price?: number;
  comparePrice? : number ;
  inStock?: boolean 
}

export interface User {
  id: string,
  username : string,
  email : string,
  // password : string,
  role : "admin" | "user",
  avatarUrl? : string,
  notifications?: { priceDrops?: boolean },
}

export interface Brand {
  id : string;
  name : string;
  slug? : string;
  description? : string;
  website : string;
  logo? : {src: string, alt?: string, backgroundColor?: string};
}

export interface WishlistItem {
  productId: Product
  addedAt: Date;
  note?: string;          
  tags?: string[];        
}

export interface Wishlist {
  id : string;
  userId: string;  
  name: string;
  description?: string;
  coverImage?: string;
  items: WishlistItem[];
  visibility: "private" | "public" | "unlisted";
  isDefault: boolean;
  isSystem: boolean;
  createdAt: Date;
}
