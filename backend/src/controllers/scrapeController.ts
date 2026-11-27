// src/routes/scrape.ts
import { NextFunction, Response, Request } from "express";
import runScraperFor, { runAllScrapers } from "../scrapers";
import ProductModel from "../models/Product";
import BrandModel from "../models/Brand";
import { JobLockedError } from "../utils/jobLock";




const scrapeBase = (Brand : string) =>  async (req : Request, res : Response, next : NextFunction) => {
  try {
    const result = await runScraperFor(Brand);
    res.json({ success: true, result });
  } catch (err: any) {
    if (err instanceof JobLockedError) {
      return res.status(409).json({ success: false, message: "Esta marca ya se está scrapeando (puede ser el cron diario). Intenta en unos minutos." });
    }
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
const scrapeWhatup = scrapeBase("whatup")
const scrapeNubeBrand = scrapeBase("nubebrand")
const scrapeJoiaMarket = scrapeBase("joiamarket")
const scrapeStodak = scrapeBase("stodak")

const scrapeAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { total, feed } = await runAllScrapers();
    res.json({ success: true, total, feed });
  } catch (err) {
    next(err);
  }
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
  scrapeWhatup,
  scrapeNubeBrand,
  scrapeJoiaMarket,
  scrapeStodak,
  scrapeAll,
  getLastScrapeStats
};
