import express from "express";
import {
  getBasicInfo,
  getPublicBasicInfo,
  updateBasicInfo,
} from "../controllers/basicInfo.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/public", getPublicBasicInfo);
router.get("/", isAuthenticated, isAdmin, getBasicInfo);
router.put("/", isAuthenticated, isAdmin, updateBasicInfo);

export default router;
