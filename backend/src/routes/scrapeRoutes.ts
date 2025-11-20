import scrapeContorller from "../controllers/scrapeController"
import express from "express"

const router = express.Router()

router.get("/freshbrand", scrapeContorller)

export default router