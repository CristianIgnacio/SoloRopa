import { Router } from "express";
import { getMessage } from "../controllers/controller.example";

const router = Router();

router.get("/", getMessage);

export default router;