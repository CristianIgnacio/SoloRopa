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

    // Usar updateOne con upsert para insertar si no existe, o actualizar si ya existe
    // De esta forma solo actualizamos los campos especificados sin borrar otros
    const brands = [rudeboys, freshbrand, moreamor, subcomplot];
    
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