import { Router } from "express";
import brandRoutes from "../routes/brandRoutes"
import scrapeRoutes from "../routes/scrapeRoutes"
import productRoutes from "../routes/productRoutes"

const router = Router();

router.use("/scrape", scrapeRoutes)
router.use("/api/brand", brandRoutes)
router.use("/api/products", productRoutes)

export default router;