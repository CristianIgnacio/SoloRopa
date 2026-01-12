import {scrapeFreshBrand, scrapeMoreamor, scrapeRudeboys, scrapeSubcomplot} from "../controllers/scrapeController"
import express from "express"

const router = express.Router()

router.get("/freshbrand", scrapeFreshBrand)
router.get("/moreamor", scrapeMoreamor)
router.get("/rudeboys", scrapeRudeboys)
router.get("/subcomplot", scrapeSubcomplot)

export default router