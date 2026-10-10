import {
  sendOtp as sendOtpService,
  verifyFirebaseIdToken as verifyFirebaseIdTokenService,
  sendEmailOtp as sendEmailOtpService,
  verifyEmailOtp as verifyEmailOtpService,
} from "../services/client.auth.service.js";
import { verifyToken } from "../utils/jwt.js";

const sendOtp = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const result = await sendOtpService(phoneNumber);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const sendEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await sendEmailOtpService(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = verifyToken(token);
        currentUserId = decoded.id;
      } catch (e) {
        console.error("Invalid token in email verification:", e.message);
      }
    }
    const result = await verifyEmailOtpService(email, otp, currentUserId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const verifyFirebaseIdTokenController = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!idToken) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization token not found." });
    }

    const sessionToken = req.headers["x-session-token"];
    let currentUserId = null;
    if (sessionToken) {
      try {
        const decoded = verifyToken(sessionToken);
        currentUserId = decoded.id;
      } catch (e) {
        console.error("Invalid session token in verification:", e.message);
      }
    }

    const result = await verifyFirebaseIdTokenService(idToken, currentUserId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    const errorMsg = typeof error?.message === "string" ? error.message : "";
    const errorCode = typeof error?.code === "string" ? error.code : "";

    if (
      errorCode.startsWith("auth/") ||
      errorMsg.includes("Firebase ID token") ||
      errorMsg.includes("verifyIdToken") ||
      errorMsg.includes("Decoding Firebase ID token failed") ||
      errorMsg.includes("Firebase ID token has expired") ||
      errorMsg.includes("Firebase ID token has no \"kid\" claim")
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Firebase token. Please sign in again.",
        code: errorCode || "auth/invalid-token",
      });
    }

    if (errorMsg.includes("blocked by the admin")) {
      return res.status(403).json({
        success: false,
        message: errorMsg,
      });
    }

    if (errorMsg.includes("Neither phone number nor email")) {
      return res.status(400).json({
        success: false,
        message: errorMsg,
      });
    }

    next(error);
  }
};

export {
  sendOtp,
  verifyFirebaseIdTokenController,
  sendEmailOtp,
  verifyEmailOtp,
};
