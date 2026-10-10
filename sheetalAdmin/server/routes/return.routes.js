import express from "express";
import {
  createReturnRequest,
  adminUpdateReturn,
  getAllReturns,
} from "../controllers/return.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";
import { uploadTo } from "../middlewares/multer.middleware.js";

const router = express.Router();

// --- USER ROUTES ---
// User defective product ki photos (max 3) ke sath return mang sakta hai
router.post(
  "/request",
  isAuthenticated,
  uploadTo("returns").array("images", 3),
  createReturnRequest,
);

// --- ADMIN ROUTES ---
router.get("/admin/all", isAuthenticated, isAdmin, getAllReturns);
router.put("/admin/update/:id", isAuthenticated, isAdmin, adminUpdateReturn);

export default router;
