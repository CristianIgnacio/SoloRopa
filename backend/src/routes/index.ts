import { Router } from "express";
import brandRoutes from "../routes/brandRoutes"
import scrapeRoutes from "../routes/scrapeRoutes"
import productRoutes from "../routes/productRoutes"
import authRoutes from "../routes/authRoutes"
import userRoutes from "../routes/userRoutes"
import whislistRoutes from "../routes/wishlistRoutes"
import productEventRoutes from "../routes/producteventRoutes"

const router = Router();

router.use("/scrape", scrapeRoutes)
router.use("/api/brands", brandRoutes)
router.use("/api/products", productRoutes)
router.use("/api/auth", authRoutes);
router.use("/api/users", userRoutes);
router.use("/api/wishlist", whislistRoutes)
router.use("/api/product-events", productEventRoutes)

export default router;