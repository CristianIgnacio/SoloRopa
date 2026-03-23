import {scrapeFreshBrand, scrapeMoreamor, scrapeRudeboys, scrapeSubcomplot} from "../controllers/scrapeController"
import express from "express"
import { authenticate, authorizeRole } from "../middleware/authMiddleware"

const router = express.Router()

// const adminOnly = [authenticate, authorizeRole(["admin"])]
const adminOnly : any[] = []

router.get("/freshbrand", ...adminOnly, scrapeFreshBrand)
router.get("/moreamor", ...adminOnly, scrapeMoreamor)
router.get("/rudeboys", ...adminOnly, scrapeRudeboys)
router.get("/subcomplot", ...adminOnly, scrapeSubcomplot)

export default router
