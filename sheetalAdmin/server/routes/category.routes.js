import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  getAdminCategories,
  getCategoryStats,
  updateCategory,
  deleteCategory,
  reorderCategories,
  generateSchema,
} from "../controllers/category.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";
import { uploadTo } from "../middlewares/multer.middleware.js";

const router = express.Router();

// public routes
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

// admin routes
router.put("/admin/reorder", isAuthenticated, isAdmin, reorderCategories);
router.post("/admin/generate-schema", isAuthenticated, isAdmin, generateSchema);
router.get("/admin/all", isAuthenticated, isAdmin, getAdminCategories);
router.get("/admin/stats", isAuthenticated, isAdmin, getCategoryStats);
router.post(
  "/admin",
  isAuthenticated,
  isAdmin,
  uploadTo("categories").fields([
    { name: "mainImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
    { name: "ogImage", maxCount: 1 },
  ]),
  createCategory,
);
router
  .route("/admin/:id")
  .put(
    isAuthenticated,
    isAdmin,
    uploadTo("categories").fields([
      { name: "mainImage", maxCount: 1 },
      { name: "bannerImage", maxCount: 1 },
      { name: "ogImage", maxCount: 1 },
    ]),
    updateCategory,
  )
  .delete(isAuthenticated, isAdmin, deleteCategory);

export default router;
