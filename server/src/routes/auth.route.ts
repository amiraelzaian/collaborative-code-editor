import { Router } from "express";
import { getMe, login, logout, refreshAccessToken, register } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth";


const router = Router();

router.post("/register", register)
router.post("/login", login)
router.post('/logout', logout)
router.post("/refresh", refreshAccessToken)
router.get("/me", authenticate, getMe)

export default router;




