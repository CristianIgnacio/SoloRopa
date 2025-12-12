// src/mocks/products.mock.ts
export const productsMock = Array.from({ length: 100 }).map((_, i) => ({
  id: i.toString(),
  title: `Producto ${i + 1}`,
  brand: {name : ["Freshbrand", "Errante", "Below"][i % 3]},
  images: [{src : `https://picsum.photos/400/600?random=${i}`}],
  price: 19990 + i * 500,
}))