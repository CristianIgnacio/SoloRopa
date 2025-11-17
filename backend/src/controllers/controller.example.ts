import { Request, Response} from "express";

export const getMessage = (req : Request, res : Response) => {
    res.json({ message: "API funcionando correctamente 🚀" });
};