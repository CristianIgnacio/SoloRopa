// src/routes/scrape.ts
import { NextFunction, Response, Request } from "express";
import runScraperFor from "../scrapers";
import stores from "../scrapers/core/brands";
import ProductModel from "../models/Product";
import BrandModel from "../models/Brand";




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
const scrapeBelowApparel = scrapeBase("belowapparel")
const scrapeBvnggvng = scrapeBase("bvnggvng")
const scrapeMDF = scrapeBase("mdf")
const scrapeTreinoficial = scrapeBase("treinoficial")

const scrapeAll = async (req: Request, res: Response, next: NextFunction) => {
  const brandKeys = Object.keys(stores);
  const feed: { brand: string; count: number; success: boolean; error?: string }[] = [];

  for (const key of brandKeys) {
    try {
      const result = await runScraperFor(key);
      feed.push({ brand: key, count: result.count, success: true });
    } catch (err: any) {
      feed.push({ brand: key, count: 0, success: false, error: err.message });
    }
  }

  const total = feed.reduce((sum, f) => sum + f.count, 0);
  res.json({ success: true, total, feed });
};

const getLastScrapeStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await BrandModel.find({}, "_id name slug");

    const stats = await Promise.all(
      brands.map(async (brand) => {
        const latest = await ProductModel.findOne(
          { brand: brand._id },
          "scrapedAt"
        ).sort({ scrapedAt: -1 });

        const count = await ProductModel.countDocuments({ brand: brand._id });

        return {
          slug: brand.slug,
          name: brand.name,
          lastScraped: latest?.scrapedAt ?? null,
          totalProducts: count,
        };
      })
    );

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

export {
  scrapeFreshBrand,
  scrapeMoreamor,
  scrapeRudeboys,
  scrapeBase,
  scrapeSubcomplot,
  scrapeBelowApparel,
  scrapeBvnggvng,
  scrapeMDF,
  scrapeTreinoficial,
  scrapeAll,
  getLastScrapeStats
};