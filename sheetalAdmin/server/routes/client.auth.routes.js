import express from "express";
const router = express.Router();
import {
  sendOtp,
  verifyFirebaseIdTokenController,
  sendEmailOtp,
  verifyEmailOtp,
} from "../controllers/client.auth.controller.js";
import {
  otpSendIpLimiter,
  otpSendTargetLimiter,
  otpVerifyLimiter,
  firebaseVerifyLimiter,
} from "../middlewares/rateLimiter.middleware.js";

router.post("/send-otp", otpSendIpLimiter, otpSendTargetLimiter, sendOtp);
router.post(
  "/send-email-otp",
  otpSendIpLimiter,
  otpSendTargetLimiter,
  sendEmailOtp,
);
router.post("/verify-email-otp", otpVerifyLimiter, verifyEmailOtp);
router.post(
  "/verify-id-token",
  firebaseVerifyLimiter,
  verifyFirebaseIdTokenController,
);

export default router;
