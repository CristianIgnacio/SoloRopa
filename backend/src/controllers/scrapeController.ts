// src/routes/scrape.ts
import { NextFunction, Response, Request } from "express";
import runScraperFor from "../scrapers";

// const scrapeFreshBrand = async (req : Request, res : Response, next : NextFunction) => {
//   try {
//     const result = await runScraperFor("freshbrand");
//     res.json({ success: true, result });
//   } catch (err: any) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// }

// const scrapeMoreamor = async (req : Request, res : Response, next : NextFunction) => {
//   try {
//     const result = await runScraperFor("moreamor");
//     res.json({ success: true, result });
//   } catch (err: any) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// }


const scrapeBase = (Brand : string) =>  async (req : Request, res : Response, next : NextFunction) => {
  try {
    const result = await runScraperFor(Brand);
    res.json({ success: true, result });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

const scrapeRudeboys = scrapeBase("rudeboys")
const scrapeFreshBrand = scrapeBase("freshbrand")
const scrapeMoreamor = scrapeBase("moreamor")
const scrapeSubcomplot = scrapeBase("subcomplot")


export {scrapeFreshBrand, scrapeMoreamor, scrapeRudeboys, scrapeBase, scrapeSubcomplot};