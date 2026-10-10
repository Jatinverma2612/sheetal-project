import express from "express";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getAuthStatus,
} from "../controllers/auth.controller.js";
import {
  validateRegister,
  validateLogin,
} from "../middlewares/validator.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

// register
router.post("/register", validateRegister, register);

// login
router.post("/login", validateLogin, login);

// status (login check)
router.get("/status", isAuthenticated, getAuthStatus);

// logout
router.post("/logout", logout);

// forgot password
router.post("/password/forgot", forgotPassword);

// reset password
router.put("/password/reset/:token", resetPassword);

export default router;
