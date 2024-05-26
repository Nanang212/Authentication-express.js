import express from "express";
import { login, logOut, Me } from "../controllers/AuthController.js";
import { refreshToken } from "../controllers/RefreshTokenController.js";
import { verifyUser } from "../middleware/AuthUser.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", verifyUser, Me);
router.delete("/logout", verifyUser, logOut);
router.get("/token", verifyUser, verifyToken, refreshToken);

export default router;
