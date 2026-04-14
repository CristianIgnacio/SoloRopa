
export const PRODUCT_CATEGORIES = [
  "poleras",
  "polerones",
  "pantalones",
  "shorts",
  "chaquetas",
  "zapatillas",
  "accesorios",
  "otros",
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export const CATEGORY_MAPPING: Record<string, ProductCategory> = {

  // ──────────────────────────────────────────────
  // POLERAS
  // ──────────────────────────────────────────────
  "polera": "poleras",
  "poleras": "poleras",
  "t-shirt": "poleras",
  "tshirt": "poleras",
  "tee": "poleras",
  "camiseta": "poleras",
  "camisetas": "poleras",
  "remera": "poleras",
  "remeras": "poleras",
  // "manga": "poleras",        // "polera manga corta"
  "top": "poleras",
  "musculosa": "poleras",
  "tank": "poleras",
  "tanktop": "poleras",
  "longsleeve": "poleras",
  
  // ──────────────────────────────────────────────
  // POLERONES
  // ──────────────────────────────────────────────
  "poleron": "polerones",
  "polerón": "polerones",
  "polerones": "polerones",
  "hoodie": "polerones",
  "hoodies": "polerones",
  "sweatshirt": "polerones",
  "sweatshirts": "polerones",
  "crewneck": "polerones",
  // "buzo": "polerones",       // buzo en Chile = poleron
  // "buzos": "polerones",
  "capucha": "polerones",
  "pullover": "polerones",
  "fleece": "polerones",
  "zip": "polerones",        // "zip hoodie"

  // ──────────────────────────────────────────────
  // PANTALONES
  // ──────────────────────────────────────────────
  "pantalon": "pantalones",
  "pantalón": "pantalones",
  "pantalones": "pantalones",
  "jeans": "pantalones",
  "jean": "pantalones",
  "denim": "pantalones",
  "cargo": "pantalones",
  "cargos": "pantalones",
  "jogger": "pantalones",
  "joggers": "pantalones",
  "baggy": "pantalones",
  "baggies": "pantalones",
  "chino": "pantalones",
  "chinos": "pantalones",
  "legging": "pantalones",
  "leggings": "pantalones",
  "trackpant": "pantalones",
  "trackpants": "pantalones",
  "slim": "pantalones",      // "jean slim"

  // ──────────────────────────────────────────────
  // SHORTS
  // ──────────────────────────────────────────────
  "short": "shorts",
  "shorts": "shorts",
  "bermuda": "shorts",
  "bermudas": "shorts",
  "jort": "shorts",          // jean shorts
  "jorts": "shorts",

  // ──────────────────────────────────────────────
  // CHAQUETAS
  // ──────────────────────────────────────────────
  "chaqueta": "chaquetas",
  "chaquetas": "chaquetas",
  "jacket": "chaquetas",
  "jackets": "chaquetas",
  "chaleco": "chaquetas",    // chaleco en Chile = chaqueta sin mangas
  "chalecos": "chaquetas",
  "parka": "chaquetas",
  "parkas": "chaquetas",
  "cortaviento": "chaquetas",
  "windbreaker": "chaquetas",
  "bomber": "chaquetas",
  "reconocible": "chaquetas",
  "anorak": "chaquetas",
  "sobretodo": "chaquetas",
  "camisa": "chaquetas",     // camisas en streetwear suelen ir por fuera
  "camisas": "chaquetas",
  "overshirt": "chaquetas",

  // ──────────────────────────────────────────────
  // ZAPATILLAS
  // ──────────────────────────────────────────────
  "zapatilla": "zapatillas",
  "zapatillas": "zapatillas",
  "sneaker": "zapatillas",
  "sneakers": "zapatillas",
  "running": "zapatillas",
  "tenis": "zapatillas",
  "tennis": "zapatillas",
  "calzado": "zapatillas",
  "zapato": "zapatillas",
  "zapatos": "zapatillas",
  "boot": "zapatillas",
  "boots": "zapatillas",
  "bota": "zapatillas",
  "botas": "zapatillas",
  "suela": "zapatillas",
  "slides": "zapatillas",
  "sandalia": "zapatillas",
  "sandalias": "zapatillas",

  // ──────────────────────────────────────────────
  // ACCESORIOS
  // ──────────────────────────────────────────────
  "accesorio": "accesorios",
  "accesorios": "accesorios",
  "gorra": "accesorios",
  "gorras": "accesorios",
  "cap": "accesorios",
  "caps": "accesorios",
  "beanie": "accesorios",
  "beanies": "accesorios",
  "gorro": "accesorios",
  "gorros": "accesorios",
  "bucket": "accesorios",
  "buckets": "accesorios",
  "legionario": "accesorios",
  "legionarios": "accesorios",
  "bolso": "accesorios",
  "bolsos": "accesorios",
  "bag": "accesorios",
  "bags": "accesorios",
  "mochila": "accesorios",
  "mochilas": "accesorios",
  "bufanda": "accesorios",
  "bufandas": "accesorios",
  "cinturon": "accesorios",
  "cinturo": "accesorios",
  "cinturones": "accesorios",
  "belt": "accesorios",
  "llavero": "accesorios",
  "llaveros": "accesorios",
  "billetera": "accesorios",
  "billeteras": "accesorios",
  "calcetines": "accesorios",
  "calcetín": "accesorios",
  "medias": "accesorios",
  "socks": "accesorios",
  "joya": "accesorios",
  "joyas": "accesorios",
  "collar": "accesorios",
  "collares": "accesorios",
  "pulsera": "accesorios",
  "pulseras": "accesorios",
  "anillo": "accesorios",
  "anillos": "accesorios",
  "aretes": "accesorios",
  "aro": "accesorios",
  "aros": "accesorios",
  "reloj": "accesorios",
  "relojes": "accesorios",
  "cartera": "accesorios",
  "carteras": "accesorios",
  "porta": "accesorios",     // "porta documentos"
  "bandolera": "accesorios",
  "fanny": "accesorios",     // "fanny pack"
  "crossbody": "accesorios",
  "tote": "accesorios",

};
