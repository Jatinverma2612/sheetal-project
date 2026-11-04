import express from "express";
import {
  getSettings,
  updateSettings,
  updateLogo,
  restoreLogo,
  updateFavicon,
  updateLoginImage,
  updateEnquiryImage,
} from "../controllers/settings.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";
import { uploadTo } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.get("/", getSettings); // Public read for frontend
router.put("/", isAuthenticated, isAdmin, updateSettings);
router.post(
  "/logo",
  isAuthenticated,
  isAdmin,
  uploadTo("brand").single("logo"),
  updateLogo,
);
router.post("/logo/restore/:historyId", isAuthenticated, isAdmin, restoreLogo);
router.post(
  "/favicon",
  isAuthenticated,
  isAdmin,
  uploadTo("brand").single("favicon"),
  updateFavicon,
);
router.post(
  "/login-image",
  isAuthenticated,
  isAdmin,
  uploadTo("brand").single("loginImage"),
  updateLoginImage,
);
router.post(
  "/enquiry-image",
  isAuthenticated,
  isAdmin,
  uploadTo("brand").single("enquiryImage"),
  updateEnquiryImage,
);

export default router;
