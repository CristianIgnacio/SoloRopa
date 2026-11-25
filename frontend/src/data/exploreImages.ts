// src/data/exploreImages.ts
// Imágenes editoriales temporales para Explore (Unsplash, licencia gratuita).
// Reemplazar por fotos propias cuando existan.

const unsplash = (id: string, w: number, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=75&w=${w}${h ? `&h=${h}` : ""}`

export const HERO_IMAGE = unsplash("1721713168896-11db10d9740b", 2400)

// Slides del carrusel de la portada. Las fotos propias (campaña SoloRopa) van primero.
// `position` encuadra al protagonista a la derecha para que el texto quede libre a la izquierda.
// `editorial` aplica el filtro de color común (solo para fotos de stock).
export const HERO_SLIDES = [
  { id: "calle", src: HERO_IMAGE, alt: "Persona con ropa urbana en una calle de noche", position: "70% center", editorial: true },
  { id: "campana", src: "/img/hero/hero-collage.webp", alt: "Campaña SoloRopa: skater en Santiago, chaqueta bordó de noche y grupo en la costanera", position: "center", editorial: false },
  { id: "crew-2000s", src: unsplash("1573748240263-a4e9c57a7fcd", 2400), alt: "Crew hip-hop estilo 2000s con boina roja, audífonos y polerones frente a una reja", position: "center", editorial: true },
]

const tile = (id: string) => unsplash(id, 600, 800)

export const CATEGORY_IMAGES: Record<string, string> = {
  poleras: tile("1622445275463-afa2ab738c34"),
  polerones: tile("1609885654455-f81e5a682c87"),
  pantalones: tile("1774413511100-54f34b2912e5"),
  shorts: tile("1768854183124-810c9a6d624c"),
  accesorios: tile("1554201277-9e2c0d5bcd39"),
}

export const STYLE_IMAGES: Record<string, string> = {
  urbano: tile("1580079906050-84bb132e4c4f"),
  streetwear: tile("1542053254535-def95e944232"),
  skate: tile("1591311337241-cecfd26f1da1"),
}

// Fotos de campaña reales de cada marca para "Marca de la semana" (clave = slug de la marca).
// Sacadas de los banners y lookbooks de la página oficial de cada marca (revisado nov 2026).
// Criterio: fotos con personas o de la tienda, sin texto de promociones ni logos de terceros.
// La primera es la principal; si hay varias, la sección las va rotando.
// Marcas sin fotos aquí (MDF, Bvnggvng, Joia Market) usan automáticamente fotos de su catálogo.
// Si una foto deja de existir en la web de la marca, se salta sola.
export const BRAND_PHOTOS: Record<string, string[]> = {
  belowapparel: [
    "https://www.belowapparel.com/cdn/shop/files/MG_9022_ef2e4ef9-9924-423f-ad14-b208cb253131.jpg?v=1792088171&width=1200",
    "https://www.belowapparel.com/cdn/shop/files/DSC8510.jpg?v=1788570808&width=1600",
    "https://www.belowapparel.com/cdn/shop/files/below_denim.jpg?v=1794861572&width=1200",
  ],
  freshbrand: [
    "https://www.freshbrand.cl/cdn/shop/files/FRESH-3.png?v=1789140722&width=1200",
    "https://www.freshbrand.cl/cdn/shop/files/FRESH-7.png?v=1789169718&width=1200",
    "https://www.freshbrand.cl/cdn/shop/files/FRESH-1.png?v=1789144983&width=1200",
  ],
  moreamor: [
    "https://moreamor.cl/cdn/shop/files/coleccion-04.jpg?v=1795025872&width=1600",
    "https://moreamor.cl/cdn/shop/files/banner_camisas-03_fc596891-69d3-4310-af9f-2a7ff96084d0.jpg?v=1792592308&width=1600",
    "https://moreamor.cl/cdn/shop/files/banner-01.jpg?v=1793900243&width=1600",
  ],
  nubebrand: [
    "https://www.nubebrand.cl/cdn/shop/files/1010A39C-5610-45EF-83C5-4BD9FAC18C7B.jpg?v=1774998153&width=1600",
  ],
  rudeboys: [
    "https://www.rudeboys.cl/wp-content/uploads/2026/07/desktop-portada-baner-jul-2026-013-.jpg",
    "https://www.rudeboys.cl/wp-content/uploads/2026/11/rb-desk-nov-2026-010.jpg",
  ],
  stodak: [
    "https://www.stodak.com/cdn/shop/files/IMG_6791.jpg?v=1794176655&width=1200",
  ],
  subcomplot: [
    "https://i0.wp.com/subcomplot.cl/wp-content/uploads/2026/04/subcomplot-puff-53-scaled-e1777494490807.jpg?fit=1600%2C1067&ssl=1",
    "https://i0.wp.com/subcomplot.cl/wp-content/uploads/2026/04/subcomplot-puff-52-scaled.jpg?fit=1600%2C1066&ssl=1",
    "https://i0.wp.com/subcomplot.cl/wp-content/uploads/2021/12/5473DD94-B8CF-461E-B3BD-D2A4299DF689.jpeg?w=1080&ssl=1",
  ],
  treinoficial: [
    "https://treino.cl/cdn/shop/files/1024X1024-aura-mob-poleras.webp?v=1794427167",
    "https://treino.cl/cdn/shop/files/1024X1024-aura-mob-polerones.webp?v=1794427166",
    "https://treino.cl/cdn/shop/files/1024X1024-aura-mob.webp?v=1794427167",
  ],
  whatup: [
    "https://www.whatup.cl/cdn/shop/files/Banner_Web_2_corregido.jpg?v=1793715385&width=1600",
    "https://www.whatup.cl/cdn/shop/files/Banner_wtup_jort_Web.jpg?v=1795096330&width=1600",
    "https://www.whatup.cl/cdn/shop/files/BANNER_WEB_5_LOOK_WOMAN.jpg?v=1787675844&width=1200",
  ],
}

// Looks editoriales (Unsplash temporal)
export const LOOK_IMAGES = {
  hombre: unsplash("1767899390509-892ad3978dfa", 1200, 1500),
  mujer: unsplash("1538329972958-465d6d2144ed", 1200, 1500),
}

// Fondo de la sección "Marcas chilenas"
export const BRANDS_BANNER_IMAGE = unsplash("1635650803802-b8ee1d6568c7", 2400)

export const TREND_IMAGES = [
  tile("1538329972958-465d6d2144ed"),
  tile("1586396847415-2c76ae7e79fc"),
]
