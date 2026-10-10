import express from "express";
import {
  getLookbookBySlug,
  updateLookbook,
} from "../controllers/lookbook.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";
import { uploadTo } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Get lookbook by slug (public)
router.get("/:slug", getLookbookBySlug);

// Update/Create lookbook (admin)
router.post(
  "/:slug",
  isAuthenticated,
  isAdmin,
  uploadTo("lookbooks").fields([
    { name: "sliderImages", maxCount: 20 }, // unified shared slider (new)
    { name: "leftImages", maxCount: 5 },   // legacy
    { name: "rightImages", maxCount: 5 },  // legacy
  ]),
  updateLookbook,
);

export default router;
