import { Router, Request, Response } from "express";
import { registerUser } from "../controllers/authController";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  registerUser(req, res);
});

export default router;