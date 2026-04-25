import axiosSecure from "../utils/axiosSecure";

const API_URL = "/api/product-events";

type Credentials = {
  productId: string;
  type: string;
};

const createProductEvent = async (credentials : Credentials) => {
  const res = await axiosSecure.post(`${API_URL}`, credentials );
  return res.data;
}

export default createProductEvent