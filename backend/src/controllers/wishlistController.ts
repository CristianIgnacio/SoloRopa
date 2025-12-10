import Wishlist from "../models/Whishlist";
import Product from "../models/Product";
import { Response, Request, NextFunction } from "express";
import mongoose from "mongoose";

const getUserWishlists = async ( request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = request.userId;
    const wishlists = await Wishlist.find({ userId });
    response.status(200).json({
      success: true,
      data: wishlists
    });
  } catch (err) {
    next(err);
  }
}

const getWishlistById = async( request: Request,response: Response, next: NextFunction) => {
  try {
    const userId = request.userId;
    const wishlistId = request.params.id;
    const wishlist = await Wishlist.findOne({ _id: wishlistId, userId });
    if (!wishlist) throw new Error("Wishlist not found");

    response.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (err) {
    next(err);
  }
}

const deleteWishlist = async ( request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = request.userId;
    const wishlistId = request.params.id;
    const wishlist = await Wishlist.findOneAndDelete({ _id: wishlistId, userId });
    if (!wishlist) throw new Error("Wishlist not found");

    response.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (err) {
    next(err);
  }
}

const createWishlist = async (req : Request, res : Response, next : NextFunction) => {
  try {
    const userId = req.userId;
    const data = req.body;

    if (data.isDefault) {
      await Wishlist.updateMany({ userId }, { $set: { isDefault: false } });
    }

    const wishlist = await Wishlist.create({
      userId,
      name: data.name,
      description: data.description || "",
      visibility: data.visibility || "private",
      isDefault: data.isDefault || false,
      coverImage: data.coverImage || ""
    });
    
    res.status(201).json({
      success: true,
      data: wishlist
    });

    
  } catch (err) {
    next(err);
  }
}

const updateWishlist = async ( request: Request, response : Response, next: NextFunction) => {
  try {
    const userId = request.userId;
    const wishlistId = request.params.id;
    const { name, description, visibility, isDefault, coverImage } = request.body;

    // Validar que wishlist existe y pertenece al usuario
    const wishlist = await Wishlist.findOne({ _id: wishlistId, userId });
    if (!wishlist) throw new Error("Wishlist not found");

    // Si isDefault es true, desactivar otros wishlists del usuario
    if (isDefault === true) {
      await Wishlist.updateMany({ userId }, { $set: { isDefault: false } });
    }

    // Actualizar solo los campos proporcionados
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (coverImage !== undefined) updateData.coverImage = coverImage;

    const updatedWishlist = await Wishlist.findByIdAndUpdate(
      wishlistId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    response.status(200).json({
      success: true,
      data: updatedWishlist
    });
  } catch (error) {
    next(error);
  }
}


const addItemToWishlist = async ( request: Request,response: Response, next: NextFunction) => {
  try {
    const userId = request.userId;
    const { wishlistId, productId, note, tags } = request.body;
    const wishlist = await Wishlist.findOne({ _id: wishlistId, userId });
    if (!wishlist) throw new Error("Wishlist not found");
    // Verificar si ya está agregado
    const exists = wishlist.items.find((i) => String(i.productId) === productId);
    if (exists) {
      throw new Error("Product already in wishlist");
    } else {

      const item = {
        productId,
        addedAt: new Date(),
        note,
        tags,
      };
      // corregir
      wishlist.items.push(item as any);
    }
    // actualizar portada si no existe
    if (!wishlist.coverImage) {
      const product = await Product.findById(productId);
      if (product?.images) wishlist.coverImage = product.images[0].src;
    }
    await wishlist.save();
    response.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (err) {
    next(err);
  }
}

const deleteItemToWishlist = async ( request: Request,response: Response, next: NextFunction) => {
  try {
    const userId = request.userId;
    const wishlistId = request.params.wishlistId;
    const itemId = request.params.itemId;

    // Validar que itemId es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new Error("Invalid itemId format");
    }

    // Validar que wishlist existe y pertenece al usuario
    const wishlist = await Wishlist.findOne({ _id: wishlistId, userId });
    if (!wishlist) throw new Error("Wishlist not found");

    // Encontrar el índice del item a eliminar
    const itemIndex = wishlist.items.findIndex((i) => String(i._id) === itemId);
    if (itemIndex === -1) {
      throw new Error("Item not found in wishlist");
    }

    // Eliminar el item del array
    wishlist.items.splice(itemIndex, 1);

    // Si no quedan items, limpiar coverImage
    if (wishlist.items.length === 0) {
      wishlist.coverImage = undefined;
    }

    await wishlist.save();
    response.status(200).json({
      success: true,
      message: "Item removed from wishlist",
      data: wishlist
    });
  } catch (err) {
    next(err);
  }
}

export {
  getUserWishlists,
  getWishlistById,
  createWishlist,
  deleteWishlist,
  updateWishlist,
  addItemToWishlist,
  deleteItemToWishlist
}