
export const PRODUCT_CATEGORIES = [
  "poleras",
  "polerones",
  "pantalones",
  "zapatillas",
  "accesorios",
  "otros",
];

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export const CATEGORY_MAPPING: Record<string, ProductCategory> = {
  // Poleras
  "polera": "poleras",
  "poleras": "poleras",
  "t-shirt": "poleras",
  "tshirt": "poleras",
  "tee": "poleras",
  "camiseta": "poleras",

  // Polerones
  "poleron": "polerones",
  "polerón": "polerones",
  "hoodie": "polerones",
  "sweatshirt": "polerones",
  "crewneck": "polerones",

  // Pantalones
  "pantalon": "pantalones",
  "pantalón": "pantalones",
  "jeans": "pantalones",
  "denim": "pantalones",
  "cargo": "pantalones",
  "jogger": "pantalones",

  // Zapatillas
  "zapatillas": "zapatillas",
  "zapatilla": "zapatillas",
  "sneakers": "zapatillas",
  "sneaker": "zapatillas",
  "running": "zapatillas",

  // Accesorios
  "accesorios": "accesorios",
  "gorra": "accesorios",
  "cap": "accesorios",
  "beanie": "accesorios",
  "bolso": "accesorios",
  "bag": "accesorios",
};


