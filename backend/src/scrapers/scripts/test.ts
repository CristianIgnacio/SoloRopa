// import detectPlatform from "../core/detectPlatform"
// import fetchHTML from "../core/fetchHTML"
import Brand  from "../../models/Brand"
import mongoose from "mongoose";
import config from "../../utils/config";

const prueba = async () => {
    // const brands = [
    //     "https://www.freshbrand.cl/",
    //     "https://moreamor.cl/",
    //     "https://www.errante85.com/",
    //     "https://www.belowapparel.com/",
    //     "https://bvnggvng.cl/",
    //     "https://www.streetmachine.cl/c/marcas/whatup/",
    //     "https://www.rudeboys.cl/",
    //     "https://subcomplot.cl/"
    // ]

    // const result: { brand: string; platform: string }[] = []

    // for (const brand of brands) {
    //     try {
    //         const html = await fetchHTML(brand)
    //         const plataforma = detectPlatform(html)
    //         result.push({ brand, platform: plataforma })
    //     } catch (err) {
    //         result.push({ brand, platform: `error: ${String(err)}` })
    //     }
    // }

    // // Muestra resultados en consola; también puedes exportar/retornar los datos
    // console.log('platform detection results:', result)
    // return result

    const MONGODB_URI = config.MONGODB_URI || "mongodb://localhost:27017";

    mongoose.connect(MONGODB_URI, {dbName : config.MONGODB_DBNAME} );
    console.log("✅ Conectado a MongoDB");

    const rudeboys = {
        name : "Rudeboys",
        slug : "rudeboys",
        description : "Ropa urbana y skate",
        website : "https://www.rudeboys.cl/",
        logo : "https://www.rudeboys.cl/wp-content/uploads/2021/08/logo_rudeboys_new.png",
        is_active : true,
    }

    const freshbrand = {
        name : "Freshbrand",
        slug : "freshbrand",
        description : "Ropa urbana y skate",
        website : "https://www.freshbrand.cl/",
        logo : "https://www.freshbrand.cl/cdn/shop/files/logo-png.png",
        is_active : true,
    }

    const moreamor = {
        name : "Moreamor",
        slug : "moreamor",
        description : "Ropa urbana y skate",
        website : "https://moreamor.cl/",
        logo : "https://moreamor.cl/cdn/shop/files/isologo.png",
        is_active : true,
    }

    Brand.insertMany([rudeboys, freshbrand, moreamor])

    mongoose.connection.close()
    return 
}
prueba()