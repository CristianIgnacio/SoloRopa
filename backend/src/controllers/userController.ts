import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from 'express';
import UserModel from "../models/User";
import WishlistModel from "../models/Wishlist";
import PriceAlertModel from "../models/PriceAlert";
import { verifyUnsubscribeToken } from "../utils/emailTokens";

const serializePublicUser = (user: {
    id?: string;
    username: string;
    role: "user" | "admin";
    avatarUrl?: string | null;
}) => ({
    id: user.id,
    username: user.username,
    role: user.role,
    avatarUrl: user.avatarUrl || null,
});

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserModel.find({});

        res.json(users);

    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Obtenemos el id del usuario buscado
        const userId = req.params.id;
        const user = await UserModel.findById(userId);

        if (user) {
            res.json(serializePublicUser(user));
        } else {
            res.status(404).json({ error: "User not found" })
        }

    } catch (error) {
        next(error);
    }
};

export const getUserbyUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Obtenemos el id del usuario buscado
        const username = req.params.username;
        const user = await UserModel.findOne({ username: username });

        if (user) {
            res.json(serializePublicUser(user));
        } else {
            res.status(404).json({ error: "User not found" })
        }

    } catch (error) {
        next(error);
    }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password, email } = req.body;

        // const avatarUrl = req.file
        //     ? `/uploads/avatars/${req.file.filename}`
        //     : null;

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const user = new UserModel({
            username: username,
            password: passwordHash,
            email: email,
            role: "user",
            // avatarUrl: avatarUrl || null,
        });
        const savedUser = await user.save();

        await WishlistModel.create({
            userId: user._id,
            name: "Favoritos",
            visibility: "private",
            isDefault: true,
            items: []
        });

        res.status(201).json(savedUser.toJSON());

    } catch (error) {
        next(error);
    }
};

// Preferencias de correo del usuario con sesión: PATCH /api/users/me/notifications { priceDrops }
export const updateMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { priceDrops } = req.body ?? {};
        if (typeof priceDrops !== "boolean") {
            return res.status(400).json({ error: "priceDrops debe ser true o false" });
        }

        const user = await UserModel.findByIdAndUpdate(
            req.userId,
            { $set: { "notifications.priceDrops": priceDrops } },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        if (!priceDrops) await skipPendingPriceAlerts(user._id.toString());
        res.status(200).json({ notifications: user.notifications });
    } catch (error) {
        next(error);
    }
};

// Link "dejar de recibir avisos" de los correos, sin sesión. El token va en el body (página
// /desuscribir) o en la query (botón de Gmail/Outlook, RFC 8058). Nunca por GET: los antivirus
// de correo abren los links y desuscribirían a la gente sin querer.
export const unsubscribePriceDrops = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = verifyUnsubscribeToken(req.body?.token ?? req.query.token);
        if (!userId) return res.status(400).json({ error: "El link no es válido" });

        await UserModel.updateOne({ _id: userId }, { $set: { "notifications.priceDrops": false } });
        await skipPendingPriceAlerts(userId);
        res.status(200).json({ ok: true });
    } catch (error) {
        next(error);
    }
};

const skipPendingPriceAlerts = (userId: string) =>
    PriceAlertModel.updateMany(
        { user: userId, status: { $in: ["pending", "failed"] } },
        { $set: { status: "skipped", skipReason: "opted-out" } }
    );
