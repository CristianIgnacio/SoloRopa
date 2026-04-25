import Product from "../models/Product";
import { Response, Request, NextFunction } from "express";
import ProductEventModel from "../models/ProductEvent";
import mongoose from "mongoose";
import WishlistModel from "../models/Wishlist";

// Obtner todos los productos
const createProductEvent = async (req : Request, res : Response, next : NextFunction) => {
  try {
    const { productId, type } = req.body
    const userId = req.userId || null
    const ip = req.ip || "unknown"

    if (!productId || !type) {
        return res.status(400).json({ message: "Missing data" })
    }

    if (!["view", "favorite", "unfavorite", "click"].includes(type)) {
        return res.status(400).json({ message: "Invalid event type" })
    }

    // --- Lógica Anti-Spam / Sincronización ---
    // Solo para vistas y clicks (acciones repetitivas). 
    // Favoritos no se saltan para mantener sincronía con el estado actual.
    let skipUpdate = false
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

    if (["view", "click"].includes(type)) {
        // Definir criterios de búsqueda para el usuario (por ID si está logueado, o por IP)
        const userCriteria: any[] = [{ ip }]
        if (userId) userCriteria.push({ userId })

        const existingEvent = await ProductEventModel.findOne({
            productId,
            type,
            $or: userCriteria,
            createdAt: { $gte: last24h }
        })

        if (existingEvent) {
            skipUpdate = true
            // Si el evento existente no tenía userId y ahora sí, lo actualizamos (sync guest -> user)
            if (!existingEvent.userId && userId) {
                await ProductEventModel.updateOne({ _id: existingEvent._id }, { $set: { userId } })
            }
        }
    } else if (["favorite", "unfavorite"].includes(type) && userId) {
        // Para favoritos, evitamos sumar/restar múltiples veces seguidas de forma descontrolada
        // Verificamos si el último evento de este usuario fue del mismo tipo
        const lastEvent = await ProductEventModel.findOne({
            productId,
            userId,
            type: { $in: ["favorite", "unfavorite"] }
        }).sort({ createdAt: -1 });

        // Si el último evento fue exactamente el mismo (ej: favorite y vuelve a mandar favorite),
        // ignoramos la actualización para no duplicar el contador.
        if (lastEvent && lastEvent.type === type) {
            skipUpdate = true;
        }
    }


    // Crear el evento siempre para analíticas brutas
    await ProductEventModel.create({
        productId,
        userId,
        type,
        ip
    })

    if (skipUpdate) {
        return res.status(201).json({ ok: true, message: "Repeated event, log saved but score ignored" })
    }

    // --- Actualizar el Producto ---
    const update: any = {
        lastUpdateScore: new Date()
    }

    if (type === "view") {
        update.$inc = {
            viewsCount: 1,
            viewsLastNDays: 1,
            trendingScore: 1
        }

        // LÓGICA DE HISTORIAL/VISTOS RECIENTEMENTE
        if (userId && !skipUpdate) {
            // Se hace async flotante para no bloquear la respuesta HTTP
            (async () => {
                try {
                    let recentsList = await WishlistModel.findOne({ userId, name: "Vistos Recientemente" });
                    
                    if (!recentsList) {
                        recentsList = await WishlistModel.create({
                            userId,
                            name: "Vistos Recientemente",
                            isDefault: false,
                            visibility: "private",
                            items: []
                        });
                    }

                    // Remover si ya existía para actualizar posicionamiento
                    const itemIndex = recentsList.items.findIndex(
                        (item) => item.productId.toString() === productId
                    );

                    if (itemIndex !== -1) {
                        recentsList.items.splice(itemIndex, 1);
                    }

                    // Agregar al principio
                    recentsList.items.unshift({
                        productId,
                        addedAt: new Date()
                    } as any);

                    // Limitar a los últimos 30 elementos
                    if (recentsList.items.length > 30) {
                        recentsList.items = recentsList.items.slice(0, 30);
                    }

                    await recentsList.save();
                } catch (error) {
                    console.error("Error guardando Vistos Recientemente: ", error);
                }
            })();
        }
    }

    if (type === "click") {
        update.$inc = {
            clicksCount: 1,
            clicksLastNDays: 1,
            trendingScore: 2
        }
    }

    if (type === "favorite") {
        update.$inc = {
            favoritesCount: 1,
            favoritesLastNDays: 1,
            trendingScore: 5
        }
    }

    if (type === "unfavorite") {
        update.$inc = {
            favoritesCount: -1,
            favoritesLastNDays: -1,
            trendingScore: -5
        }
    }

    await Product.updateOne({ _id: productId }, update)

    return res.status(201).json({ ok: true })

    } catch (err){
        next(err);
    }
}

export {
    createProductEvent,
}