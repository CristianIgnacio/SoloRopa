// import detectPlatform from "../core/detectPlatform"
// import fetchHTML from "../core/fetchHTML"
import Brand  from "../../models/Brand"
import mongoose from "mongoose";
import config from "../../utils/config";

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
      logo: "https://www.rudeboys.cl/wp-content/uploads/2021/08/logo_rudeboys_new.png",
      isActive: true
    };

    const freshbrand = {
      name: "Freshbrand",
      slug: "freshbrand",
      description: "Ropa urbana y skate",
      website: "https://www.freshbrand.cl/",
      logo: "https://www.freshbrand.cl/cdn/shop/files/logo-png.png",
      isActive: true
    };

    const moreamor = {
      name: "Moreamor",
      slug: "moreamor",
      description: "Ropa urbana y skate",
      website: "https://moreamor.cl/",
      logo: "https://moreamor.cl/cdn/shop/files/isologo.png",
      isActive: true
    };

    await Brand.insertMany([rudeboys, freshbrand, moreamor]);

    console.log("✅ Marcas insertadas correctamente");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Conexión cerrada");
  }
};
seedBrands()