import Product from "../models/Product";
import { Response, Request, NextFunction } from "express";
import ProductEventModel from "../models/ProductEvent";
import mongoose from "mongoose";

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