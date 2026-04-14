import axiosSecure from "../utils/axiosSecure";

const API_URL = "/api/scrape";

export interface ScrapeResult {
  success: boolean;
  result?: { ok: boolean; count: number };
  message?: string;
}

export interface ScrapeFeedItem {
  brand: string;
  count: number;
  success: boolean;
  error?: string;
}

export interface ScrapeAllResult {
  success: boolean;
  total: number;
  feed: ScrapeFeedItem[];
}

export interface BrandStat {
  slug: string;
  name: string;
  lastScraped: string | null;
  totalProducts: number;
}

const scrapeBrand = async (brand: string): Promise<ScrapeResult> => {
  const res = await axiosSecure.get(`${API_URL}/${brand}`);
  return res.data;
};

const scrapeAll = async (): Promise<ScrapeAllResult> => {
  const res = await axiosSecure.post(`${API_URL}/all`);
  return res.data;
};

const getStats = async (): Promise<{ success: boolean; data: BrandStat[] }> => {
  const res = await axiosSecure.get(`${API_URL}/stats`);
  return res.data;
};

export default { scrapeBrand, scrapeAll, getStats };
