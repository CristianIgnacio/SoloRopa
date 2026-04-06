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
  favoritesCount : Number,
  scrapedAt: Date;
  createdAt: Date;
  updateAt: Date;
  raw?: any;          // guarda el JSON/HTML bruto si quieres
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
  username : string,
  email : string,
  // password : string,
  role : "admin" | "user",
  avatarUrl? : string,
}

export interface Brand {
  id : string;
  name : string;
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
  createdAt: Date;
}
