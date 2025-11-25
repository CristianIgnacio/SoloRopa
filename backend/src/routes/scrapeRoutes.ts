import {scrapeFreshBrand, scrapeMoreamor, scrapeRudeboys} from "../controllers/scrapeController"
import express from "express"

const router = express.Router()

router.get("/freshbrand", scrapeFreshBrand)
router.get("/moreamor", scrapeMoreamor)
router.get("/rudeboys", scrapeRudeboys)


export default router