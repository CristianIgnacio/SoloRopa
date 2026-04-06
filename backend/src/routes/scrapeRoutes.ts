import {scrapeFreshBrand, scrapeMoreamor, scrapeRudeboys, scrapeSubcomplot, scrapeBelowApparel, scrapeBvnggvng, scrapeMDF} from "../controllers/scrapeController"
import express from "express"
import { authenticate, authorizeRole } from "../middleware/authMiddleware"

const router = express.Router()

const adminOnly = [authenticate, authorizeRole(["admin"])]

router.get("/freshbrand", ...adminOnly, scrapeFreshBrand)
router.get("/moreamor", ...adminOnly, scrapeMoreamor)
router.get("/rudeboys", ...adminOnly, scrapeRudeboys)
router.get("/subcomplot", ...adminOnly, scrapeSubcomplot)
router.get("/belowapparel", ...adminOnly, scrapeBelowApparel)
router.get("/bvnggvng", ...adminOnly, scrapeBvnggvng)
router.get("/mdf", ...adminOnly, scrapeMDF)

export default router
