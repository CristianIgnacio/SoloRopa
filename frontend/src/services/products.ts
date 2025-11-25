import axios from "axios";

const API_URL = "/api/products";

const getAllProducts = async () => {
  const res = await axios.get(`${API_URL}`);
  return res.data.data;
}

export default {getAllProducts}