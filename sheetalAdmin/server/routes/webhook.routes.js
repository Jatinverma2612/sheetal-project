/**
 * @fileoverview Webhook Routes
 *
 * IMPORTANT: These routes must be registered in main.js BEFORE the
 * express.json() / parseJsonAndUrlEncoded middleware so that the raw
 * request body buffer is preserved for HMAC signature verification.
 */

import express from "express";
import { razorpayWebhookHandler } from "../controllers/webhook.controller.js";

const router = express.Router();

/**
 * POST /api/v1/webhooks/razorpay
 *
 * Razorpay sends payment events here.
 * No auth middleware — Razorpay doesn't send cookies/JWT.
 * Security is handled via HMAC-SHA256 signature verification inside the controller.
 *
 * Register this in Razorpay Dashboard → Settings → Webhooks
 * URL: https://yourdomain.com/api/v1/webhooks/razorpay
 * Events to subscribe: payment_link.paid
 */
router.post("/razorpay", razorpayWebhookHandler);

export default router;
