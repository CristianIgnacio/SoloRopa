import axios from "axios";

export interface WishlistPayload {
  name?: string;
  userId: string;
  items?: string[];
}

export const createWishlist = async (payload: WishlistPayload) => {
  const res = await axios.post("/api/wishlist", payload);
  return res.data;
};

export const deleteWishlist = async (wishlistId: string) => {
  const res = await axios.post(`/api/wishlist/${wishlistId}`);
  return res.data;
};

export const updateWishlist = async (payload: WishlistPayload) => {
  const res = await axios.put("/api/wishlist", payload);
  return res.data;
};

export const addItemToWishlist = async (wishlistId: string, productId: string) => {
  const res = await axios.post(`/api/wishlist/${wishlistId}/items`,{ productId });
  return res.data;
};

export const deleteItemToWishlist = async (wishlistId: string,productId: string) => {
  const res = await axios.delete(`/api/wishlist/${wishlistId}/items/${productId}`);
  return res.data;
};

export const getUserWishlists = async () => {
  const res = await axios.get("/api/wishlist");
  return res.data;
};