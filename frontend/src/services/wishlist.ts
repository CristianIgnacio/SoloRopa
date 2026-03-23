import axiosSecure from "../utils/axiosSecure";

interface WishlistPayload {
  name?: string;
  userId: string;
  items?: string[];
}

const createWishlist = async (payload: WishlistPayload) => {
  const res = await axiosSecure.post("/api/wishlist", payload);
  return res.data;
};

const deleteWishlist = async (wishlistId: string) => {
  const res = await axiosSecure.delete(`/api/wishlist/${wishlistId}`);
  return res.data;
};

const updateWishlist = async (payload: WishlistPayload) => {
  const res = await axiosSecure.put("/api/wishlist", payload);
  return res.data;
};

const addItemToWishlist = async (wishlistId: string, productId: string) => {
  const res = await axiosSecure.post(`/api/wishlist/${wishlistId}/items`,{ productId });
  return res.data;
};

const deleteItemToWishlist = async (wishlistId: string, productId: string) => {
  const res = await axiosSecure.delete(`/api/wishlist/${wishlistId}/items/${productId}`);
  return res.data;
};

const getMeWishlists = async () => {
  const res = await axiosSecure.get("/api/wishlist");
  return res.data;
};

const getWishlistById = async (wishlistId: string,) => {
  const res = await axiosSecure.get(`/api/wishlist/${wishlistId}`);
  return res.data;
};

const getUserWishlists = async (username: string) => {
  const res = await axiosSecure.get(`/api/wishlist/${username}/username`)
  return res.data
}

const toggleFavorite = async (productId: string) => {
  const res = await axiosSecure.post("/api/wishlist/default/toggle", {productId})
  return res.data
}

export default {
  createWishlist,
  deleteWishlist,
  updateWishlist,
  addItemToWishlist,
  deleteItemToWishlist,
  getUserWishlists,
  toggleFavorite,
  getWishlistById,
  getMeWishlists
}