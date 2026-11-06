import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const createRateLimiter = ({
  windowMs,
  limit,
  message,
  keyType = "ip", // "ip" | "ip_and_identifier" | "user_id"
  skipSuccessfulRequests = false,
}) => {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests,
    keyGenerator: (req) => {
      const clientIp = ipKeyGenerator(req.ip);
      if (keyType === "user_id") {
        return String(req.user?._id || clientIp);
      }
      if (keyType === "ip_and_identifier") {
        const identifier = String(
          req.body?.email || req.body?.phoneNumber || req.body?.phone || "",
        )
          .trim()
          .toLowerCase();
        if (identifier) {
          return `${clientIp}_${identifier}`;
        }
      }
      return clientIp;
    },
    handler: (req, res, next, options) => {
      const retryAfterSeconds = Math.ceil(options.windowMs / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message: options.message || "Too many requests, please try again later.",
        retryAfter: retryAfterSeconds,
      });
    },
    message,
  });
};

// 1a. Login (IP-level throttle): 20 failed login attempts per 15 minutes per IP
export const loginIpLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message:
    "Too many login attempts from this network. Please try again after 15 minutes.",
  keyType: "ip",
  skipSuccessfulRequests: true,
});

// 1b. Login (Target account throttle): 5 failed attempts per 15 minutes per IP + email
export const loginTargetLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message:
    "Too many login attempts for this account. Please try again after 15 minutes.",
  keyType: "ip_and_identifier",
  skipSuccessfulRequests: true,
});

// 2. Register: 10 accounts per hour per IP
export const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: "Too many accounts created from this IP. Please try again in an hour.",
  keyType: "ip",
});

// 3. Forgot Password: 3 requests per 15 minutes per IP + email
export const forgotPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  message:
    "Too many password reset requests. Please check your inbox or try again after 15 minutes.",
  keyType: "ip_and_identifier",
});

// 4. Password Reset Token Confirmation: 10 attempts per 15 minutes per IP
export const resetPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message:
    "Too many password reset attempts. Please try again after 15 minutes.",
  keyType: "ip",
});

// 5. Admin Password Change: 10 attempts per 15 minutes per authenticated admin user ID
export const adminChangePasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message:
    "Too many password change attempts. Please try again after 15 minutes.",
  keyType: "user_id",
});

// 6a. OTP Send (IP-level throttle): 10 OTP dispatches per 10 minutes per IP
export const otpSendIpLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  message:
    "Too many OTP requests from this network. Please wait a few minutes before trying again.",
  keyType: "ip",
});

// 6b. OTP Send (Target phone/email throttle): 3 OTP dispatches per 10 minutes per IP + phone/email
export const otpSendTargetLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 3,
  message:
    "Too many OTP requests for this number or email. Please wait a few minutes before requesting another code.",
  keyType: "ip_and_identifier",
});

// 7. OTP Verify (Email OTP): 10 attempts per 15 minutes per IP + email
export const otpVerifyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "Too many incorrect OTP attempts. Please request a new OTP code.",
  keyType: "ip_and_identifier",
});

// 8. Firebase ID Token Verification: 30 attempts per 15 minutes per IP
export const firebaseVerifyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message:
    "Too many authentication verification attempts. Please try again after 15 minutes.",
  keyType: "ip",
});

