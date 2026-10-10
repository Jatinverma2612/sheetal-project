import express from "express";
import {
  createAdminPage,
  deleteAdminPage,
  getAdminPage,
  getAdminPages,
  getAboutPage,
  updateAboutPage,
  getPageBySlug,
  getPublishedFooterPages,
  updateAdminPage,
  updatePageBySlug,
  generateSchema,
} from "../controllers/pages.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";
import { uploadTo } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Get about page (public)
router.get("/about", getAboutPage);

// Update about page (admin)
router.post(
  "/about",
  isAuthenticated,
  isAdmin,
  uploadTo("pages").fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "founderImage", maxCount: 1 },
    { name: "missionImage", maxCount: 1 },
    { name: "craftImage", maxCount: 1 },
  ]),
  updateAboutPage,
);

router.get("/public/footer", getPublishedFooterPages);

router
  .route("/admin")
  .get(isAuthenticated, isAdmin, getAdminPages)
  .post(isAuthenticated, isAdmin, createAdminPage);

router
  .route("/admin/:id")
  .get(isAuthenticated, isAdmin, getAdminPage)
  .put(isAuthenticated, isAdmin, updateAdminPage)
  .delete(isAuthenticated, isAdmin, deleteAdminPage);

// Get page by slug (public)
router.get("/slug/:slug", getPageBySlug);

// Update page by slug (admin)
router.post("/slug/:slug", isAuthenticated, isAdmin, updatePageBySlug);
router.post("/generate-schema", isAuthenticated, isAdmin, generateSchema);

export default router;
