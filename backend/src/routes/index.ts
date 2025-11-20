import { Router } from "express";
import brandRoutes from "../routes/brandRoutes"
import scrapeRoutes from "../routes/scrapeRoutes"

const router = Router();

router.use("/scrape", scrapeRoutes)
router.use("/brand", brandRoutes)

export default router;