import express from "express";
const router = express.Router();
import {
  sendOtp,
  verifyFirebaseIdTokenController,
  sendEmailOtp,
  verifyEmailOtp,
} from "../controllers/client.auth.controller.js";

router.post("/send-otp", sendOtp);
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/verify-id-token", verifyFirebaseIdTokenController);

export default router;
