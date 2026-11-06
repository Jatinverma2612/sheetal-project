import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.js";
import { signToken } from "../utils/jwt.js";
import sendEmail from "../utils/sendEmail.js";
import { config } from "../config/config.js";
import logger from "../utils/logger.js";

const escapeHtml = (str) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

// register service
export const registerService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser)
    return {
      success: false,
      statusCode: 400,
      message: "Email already registered",
    };

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashedPassword });
  const token = signToken({ id: user._id, role: user.role });

  return {
    success: true,
    statusCode: 201,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

// login service
export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) return { success: false, message: "Invalid email or password" };

  if (user.status === "Inactive") {
    return {
      success: false,
      message:
        "This ID has been blocked by the admin due to some reasons, please contact the team for further procedures",
    };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return { success: false, message: "Invalid email or password" };

  const token = signToken({ id: user._id, role: user.role });

  return {
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

// forgot password service
export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user)
    return {
      success: false,
      statusCode: 404,
      message: "User with this email does not exist",
    };

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${config.frontendDomain}/reset-password/${resetToken}`;
  const safeName = escapeHtml(user.name);
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #111;">Password Reset Request</h2>
      <p>Hello ${safeName || "there"},</p>
      <p>You requested a password reset. Please click the button below to set a new password. This link is valid for 15 minutes:</p>
      <p style="margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
      </p>
      <p>If the button above does not work, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #666;"><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="margin-top: 30px; font-size: 13px; color: #888;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request - Studio By Sheetal",
      html,
    });
  } catch (emailError) {
    logger.error("[Auth] Password reset email dispatch failed:", {
      error: emailError.message,
    });
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return {
      success: false,
      statusCode: 500,
      message: "Email could not be sent. Please try again later.",
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Password reset link sent to your email",
  };
};

// reset password service
export const resetPasswordService = async (token, password) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return {
      success: false,
      statusCode: 400,
      message: "Invalid or expired reset token",
    };

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return {
    success: true,
    statusCode: 200,
    message: "Password updated successfully",
  };
};
