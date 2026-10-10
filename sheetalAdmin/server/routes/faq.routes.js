import express from "express";
import {
  getFaqPage,
  updateFaqPage,
  generateFaqSchemaAction,
} from "../controllers/faq.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getFaqPage);
router.post("/", isAuthenticated, isAdmin, updateFaqPage);
router.post(
  "/generate-schema",
  isAuthenticated,
  isAdmin,
  generateFaqSchemaAction,
);

export default router;
