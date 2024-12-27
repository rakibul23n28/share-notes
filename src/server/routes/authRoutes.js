import express from "express";
import {
  login,
  register,
  logout,
  getUser,
  validate,
} from "../controllers/authController.js";
import { validateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.get("/user", validateToken, getUser);

router.get("/validate", validateToken, validate);

export default router;
