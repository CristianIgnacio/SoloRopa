import detectPlatform from "../core/detectPlatform"
import fetchHTML from "../core/fetchHTML"

const prueba1 = async () => {
    const brands = [
        "https://www.freshbrand.cl/",
        "https://moreamor.cl/",
        "https://www.errante85.com/",
        "https://www.belowapparel.com/",
        "https://bvnggvng.cl/",
        "https://www.streetmachine.cl/c/marcas/whatup/",
        "https://www.rudeboys.cl/",
        "https://subcomplot.cl/"
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
prueba1()

export default prueba1
// Ejecuta la prueba automáticamente si este archivo se corre directamente
// if (require.main === module) {
//     test().catch(err => console.error('test failed:', err))
// }