import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from 'express';
import UserModel from "../models/User";
import WishlistModel from "../models/Wishlist";

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
            res.json(user);
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
            res.json(user);
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

        const avatarUrl = req.file
            ? `/uploads/avatars/${req.file.filename}`
            : null;

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const user = new UserModel({
            username: username,
            password: passwordHash,
            email: email,
            role: "user",
            avatarUrl: avatarUrl || null,
        });
        const savedUser = await user.save();

        await WishlistModel.create({
            userId: user._id,
            name: "Favoritos",
            visibility: "private",
            isDefault: true,
            items: []
        });

        res.status(201).json(savedUser);

    } catch (error) {
        next(error);
    }
};
