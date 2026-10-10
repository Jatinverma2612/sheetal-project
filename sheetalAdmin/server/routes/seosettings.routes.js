import express from "express";
import {
  getSeoSettings,
  updateSeoSettings,
  generateSeoSchema,
} from "../controllers/seosettings.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getSeoSettings);
router.patch("/", isAuthenticated, isAdmin, updateSeoSettings);
router.post("/generate-schema", isAuthenticated, isAdmin, generateSeoSchema);

export default router;
