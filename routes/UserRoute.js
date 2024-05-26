import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/UserController.js";
import { verifyUser, superAdminOnly } from "../middleware/AuthUser.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// router.use(verifyUser, verifyToken, superAdminOnly);

router.get("/users", verifyUser, verifyToken, superAdminOnly, getUsers);
router.get("/users/:id", verifyUser, verifyToken, superAdminOnly, getUserById);
router.post("/users", createUser, verifyUser, verifyToken);
router.patch("/users/:id", verifyUser, verifyToken, superAdminOnly, updateUser);
router.delete(
  "/users/:id",
  verifyUser,
  verifyToken,
  superAdminOnly,
  deleteUser
);

export default router;
