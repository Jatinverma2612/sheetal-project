import express from "express";
import {
  getSections,
  updateSections,
  getSectionContent,
  generateSchema,
} from "../controllers/homepage.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/sections", getSections);
router.get("/section/:sectionName", getSectionContent);
router.patch("/sections", isAuthenticated, isAdmin, updateSections);
router.post("/generate-schema", isAuthenticated, isAdmin, generateSchema);

export default router;
