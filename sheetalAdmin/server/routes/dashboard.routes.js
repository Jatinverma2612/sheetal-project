import express from "express";
import { getAdminDashboardStats } from "../controllers/dashboard.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/admin/stats", isAuthenticated, isAdmin, getAdminDashboardStats);

export default router;
