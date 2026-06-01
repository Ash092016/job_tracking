import { Router } from "express";

import { protect }                          from "../middleware/auth.js";
import { register, login, logout, getMe }   from "../controllers/authController.js";

const router = Router();


router.post("/register", register);
router.post("/login",    login);

router.post("/logout", protect, logout);
router.get("/me",      protect, getMe);

export default router;
