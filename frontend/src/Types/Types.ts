export interface Product {
  id : string;
  brand: Brand;
  title: string;
  price: number | null;
  currency?: string | null;
  url: string;
  images: {src : string, alt? : string}[] | [];
  inStock?: boolean;
  scrapedAt: Date;
  raw?: any;          // guarda el JSON/HTML bruto si quieres
}

export interface User {
  username : string,
  email : string,
  password : string,
  role : "admin" | "user",
  avatarUrl? : string,
}

export interface Brand {
  id : string;
  name : string;
  description? : string;
  website : string;
  logo? : string;
}