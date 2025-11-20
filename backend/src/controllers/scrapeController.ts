// src/routes/scrape.ts
import { NextFunction, Response, Request } from "express";
import runScraperFor from "../scrapers";

const scrapeFreshBrand = async (req : Request, res : Response, next : NextFunction) => {
  try {
    const result = await runScraperFor("freshbrand");
    res.json({ success: true, result });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export default scrapeFreshBrand;