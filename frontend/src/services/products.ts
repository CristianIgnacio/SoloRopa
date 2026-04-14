import axios from "axios";

const API_URL = "/api/products";

export interface PaginatedResponse {
  data: any[];
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
}

const getProducts = async (params: Record<string, any> = {}): Promise<PaginatedResponse> => {
  const defaultParams = { page: 1, limit: 20, sort: "createdAt", order: "desc" };
  const res = await axios.get(API_URL, {
    params: { ...defaultParams, ...params },
  });
  return res.data;
};

const getTrendingProducts = async (limit = 15) => {
  const res = await axios.get(`${API_URL}/trending`, {
    params: { limit },
  });
  return res.data.data;
};

const getNewestProducts = async (limit = 15) => {
  const res = await axios.get(`${API_URL}/newest`, {
    params: { limit },
  });
  return res.data.data;
};

const getProductById = async (id: string) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data.data;
};

export default { getProducts, getTrendingProducts, getNewestProducts, getProductById };