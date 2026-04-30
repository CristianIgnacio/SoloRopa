// import detectPlatform from "../core/detectPlatform"
// import fetchHTML from "../core/fetchHTML"
import Brand  from "../../models/Brand"
import mongoose from "mongoose";
import config from "../../utils/config";

// intrucciones correr este script:
// npm run any

const seedBrands = async () => {
  try {
    const MONGODB_URI = config.MONGODB_URI || "mongodb://localhost:27017";

    await mongoose.connect(MONGODB_URI, {
      dbName: config.MONGODB_DBNAME
    });

    console.log("✅ MongoDB conectado");

    const rudeboys = {
      name: "Rudeboys",
      slug: "rudeboys",
      description: "Ropa urbana y skate",
      website: "https://www.rudeboys.cl/",
      logo: {
        src : "https://www.rudeboys.cl/wp-content/uploads/2021/08/logo_rudeboys_new.png",
        alt : "Logo Rudeboys",
        backgroundColor : "black"
      },
      isActive: true
    };

    const freshbrand = {
      name: "Freshbrand",
      slug: "freshbrand",
      description: "Ropa urbana y skate",
      website: "https://www.freshbrand.cl/",
      logo: {
        src : "https://www.freshbrand.cl/cdn/shop/files/logo-png.png",
        alt : "Logo Freshbrand",
        backgroundColor : "black"
      },
      isActive: true
    };

    const moreamor = {
      name: "Moreamor",
      slug: "moreamor",
      description: "Ropa urbana y skate",
      website: "https://moreamor.cl/",
      logo: { 
        src : "https://moreamor.cl/cdn/shop/files/isologo.png",
        alt : "Logo Moreamor",
        backgroundColor : "#FFFFFF"
      },
      isActive: true
    };

    const subcomplot = {
      name: "SubComplot",
      slug: "subcomplot",
      description: "Ropa urbana y skate",
      website: "https://subcomplot.cl/",
      logo: { 
        src : "https://i0.wp.com/subcomplot.cl/wp-content/uploads/2021/07/logo-200x200-1.png?fit=200%2C200&ssl=1",
        alt : "Logo Subcomplot",
        backgroundColor : "#FFFFFF"
      },
      isActive: true
    };

    const belowapparel = {
      name: "Below Apparel",
      slug: "belowapparel",
      description: "Ropa urbana y skate",
      website: "https://www.belowapparel.com/",
      logo: { 
        src : "https://www.belowapparel.com/cdn/shop/files/LOGO_BELOW_07bce012-5dd6-4c78-8da7-d7425a69a067.png?v=1755789612&width=290",
        alt : "Logo Below Apparel",
        backgroundColor : "#FFFFFF"
      },
      isActive: true
    };

    const bvnggvng = {
      name: "Bvnggvng",
      slug: "bvnggvng",
      description: "Ropa urbana y skate",
      website: "https://bvnggvng.cl/",
      logo: { 
        src : "https://bvnggvng.cl/cdn/shop/files/BG_LOGO_2024_WHITE_d1fef4d6-2338-4f8d-ae3f-b94ad71e92a4.png?v=1749676717&width=220",
        alt : "Logo Bvnggvng",
        backgroundColor : "#000000"
      },
      isActive: true
    };

    const mdf = {
      name: "MDF",
      slug: "mdf",
      description: "Ropa urbana y skate",
      website: "https://ropamdf.cl/",
      logo: { 
        src : "https://ropamdf.cl/cdn/shop/files/logo_df.png?v=1761413134&width=180",
        alt : "Logo MDF",
        backgroundColor : "#FFFFFF"
      },
      isActive: true
    };

    const treinoficial = {
      name: "Treinoficial",
      slug: "treinoficial",
      description: "Streetwear 100% confeccionado en Chile",
      website: "https://www.treinoficial.cl/",
      logo: {
        src: "https://images.jumpseller.com/store/treino/store/logo/400X272-1,2MB.gif?1641506970",
        alt: "Logo Treinoficial",
        backgroundColor: "#000000"
      },
      isActive: true
    };

    const whatup = {
      name: "Whatup",
      slug: "whatup",
      description: "Ropa urbana y skate",
      website: "https://www.streetmachine.cl/collections/whatup",
      logo: {
        src: "https://www.streetmachine.cl/cdn/shop/collections/WHATUP_9af49086-b6de-44cc-b693-5ad5f462f065.jpg?v=1772633125&width=720",
        alt: "Logo Whatup",
        backgroundColor: "#FFFFFF"
      },
      isActive: true
    };

    const nubebrand = {
      name: "NubeBrand",
      slug: "nubebrand",
      description: "Ropa urbana",
      website: "https://www.nubebrand.cl/",
      logo: {
        src: "https://www.nubebrand.cl/cdn/shop/files/logo_nube_180x.png?v=1615320851",
        alt: "Logo NubeBrand",
        backgroundColor: "#FFFFFF"
      },
      isActive: true
    };

    // Usar updateOne con upsert para insertar si no existe, o actualizar si ya existe
    // De esta forma solo actualizamos los campos especificados sin borrar otros
    const brands = [rudeboys, freshbrand, moreamor, subcomplot, belowapparel, bvnggvng, mdf, treinoficial, whatup, nubebrand];
    
    for (const brand of brands) {
      await Brand.updateOne(
        { slug: brand.slug },  // Filtro por slug (único)
        { $set: brand },        // Actualizar con los nuevos datos
        { upsert: true }        // Crear si no existe
      );
      console.log(`✅ ${brand.name} procesado (insertado o actualizado)`);
    }

    console.log("✅ Marcas procesadas correctamente");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Conexión cerrada");
  }
};
seedBrands()