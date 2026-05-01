import Wishlist from "../models/Wishlist";
import Product from "../models/Product";
import { Response, Request, NextFunction } from "express";
import mongoose from "mongoose";
import UserModel from "../models/User";

const getMeWishlists = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = request.userId;
    const wishlists = await Wishlist.find({ userId }).populate({ path: 'items.productId', select: 'images' });

    // Migración lazy: marcar listas de sistema que se crearon antes del campo isSystem
    const toMigrate = wishlists.filter(
      (w) => !w.isSystem && (w.isDefault || w.name === 'Vistos Recientemente')
    );
    if (toMigrate.length > 0) {
      await Wishlist.updateMany(
        { _id: { $in: toMigrate.map((w) => w._id) } },
        { $set: { isSystem: true } }
      );
      toMigrate.forEach((w) => { w.isSystem = true; });
    }

    response.status(200).json({
      success: true,
      data: wishlists
    });
  } catch (err) {
    next(err);
  }
}

const getUserWishlists = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const username = request.params.username;
    const user = await UserModel.findOne({ username })
    if (!user) {
      return response.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    const wishlists = await Wishlist.find({ userId: user?.id, visibility: "public" })
      .populate({ path: 'items.productId', select: 'images' });
    response.status(200).json({
      success: true,
      data: wishlists
    });
  } catch (err) {
    next(err);
  }
}

const getWishlistById = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = request.userId;
    const wishlistId = request.params.id;
    const wishlist = await Wishlist.findOne({ _id: wishlistId })
      .populate("items.productId")
      .populate("userId", "username avatarUrl");
      
    if (!wishlist) throw new Error("Wishlist not found");

    const ownerId = (wishlist.userId as any)?._id?.toString() || String(wishlist.userId);

    if (wishlist.visibility === "private" && ownerId !== String(userId)) {
      throw new Error("Wishlist is private");
    }

    response.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (err) {
    next(err);
  }
}

const deleteWishlist = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = request.userId;
    const wishlistId = request.params.id;
    const wishlist = await Wishlist.findOne({ _id: wishlistId, userId });
    if (!wishlist) throw new Error("Wishlist not found");

    if (wishlist.isSystem) {
      return response.status(403).json({ success: false, message: "Cannot delete system wishlists" });
    }

    await Wishlist.deleteOne({ _id: wishlistId, userId });

    response.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (err) {
    next(err);
  }
}

const createWishlist = async (req: Request, res: Response, next: NextFunction) => {
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

const updateWishlist = async (request: Request, response: Response, next: NextFunction) => {
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
    if (name !== undefined && !wishlist.isSystem) updateData.name = name;
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


const addItemToWishlist = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = request.userId;
    const { productId, note, tags } = request.body;
    const wishlistId = request.params.id || request.body.wishlistId;
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

const deleteItemToWishlist = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = request.userId;
    const wishlistId = request.params.id;
    const itemId = request.params.productId;

    // Validar que itemId es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new Error("Invalid itemId format");
    }

    // Validar que wishlist existe y pertenece al usuario
    const wishlist = await Wishlist.findOne({ _id: wishlistId, userId });
    if (!wishlist) throw new Error("Wishlist not found");

    // Encontrar el índice del item a eliminar
    const itemIndex = wishlist.items.findIndex((i) => String(i.productId) === itemId);
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

const toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId
    const { productId } = req.body

    if (!productId) {
      return res.status(400).json({ message: "productId requerido" })
    }

    // 1️⃣ Buscar todas las listas válidas para favoritos (no sistema o default)
    const userWishlists = await Wishlist.find({
      userId,
      $or: [
        { isSystem: false },
        { isDefault: true }
      ]
    })

    // 2️⃣ Revisar si el producto está en alguna de ellas
    const wishlistsWithProduct = userWishlists.filter(w => 
      w.items.some((item: any) => item.productId.toString() === productId)
    )

    // 3️⃣ Si está en alguna, se quita de todas (unfavorite)
    if (wishlistsWithProduct.length > 0) {
      for (const w of wishlistsWithProduct) {
        w.items = w.items.filter((item: any) => item.productId.toString() !== productId) as any;
        if (w.items.length === 0) {
          w.coverImage = undefined;
        }
        await w.save();
      }
      return res.json({ isFavorite: false });
    }

    // 4️⃣ Si no está en ninguna, se agrega a la lista por defecto (favorite)
    let defaultWishlist = userWishlists.find(w => w.isDefault);
    
    if (!defaultWishlist) {
      defaultWishlist = await Wishlist.create({
        userId,
        name: "Favoritos",
        isDefault: true,
        isSystem: true,
        items: [],
      })
    }

    defaultWishlist.items.push({
      productId,
      addedAt: new Date(),
    } as any)

    await defaultWishlist.save()

    return res.json({
      isFavorite: true,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Error al toggle favorite" })
  }
}

export {
  getMeWishlists,
  getWishlistById,
  createWishlist,
  deleteWishlist,
  updateWishlist,
  addItemToWishlist,
  deleteItemToWishlist,
  toggleFavorite,
  getUserWishlists
}
