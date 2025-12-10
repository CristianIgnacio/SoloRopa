import axios from "axios";

const API_URL = "/api/brands";

const getAllBrands = async () => {
  const res = await axios.get(`${API_URL}`);
  return res.data.data;
}

export default {getAllBrands}