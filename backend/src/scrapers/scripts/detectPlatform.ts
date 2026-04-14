import detectPlatform from "../core/detectPlatform"
import fetchHTML from "../core/fetchHTML"

const prueba = async () => {
    const brands = [
        "https://www.freshbrand.cl/",
        "https://moreamor.cl/",
        "https://www.errante85.com/",
        "https://www.belowapparel.com/",
        "https://bvnggvng.cl/",
        "https://www.streetmachine.cl/c/marcas/whatup/",
        "https://www.rudeboys.cl/",
        "https://subcomplot.cl/",
        "https://www.treinoficial.cl/",
        "https://ropamdf.cl/",
        "https://volcom.cl/"
    ]

    const result: { brand: string; platform: string }[] = []

    for (const brand of brands) {
        try {
            const html = await fetchHTML(brand)
            const plataforma = detectPlatform(html)
            result.push({ brand, platform: plataforma })
        } catch (err) {
            result.push({ brand, platform: `error: ${String(err)}` })
        }
    }

    // Muestra resultados en consola; también puedes exportar/retornar los datos
    console.log('platform detection results:', result)
    return result
}
prueba()