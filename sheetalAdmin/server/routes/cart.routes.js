import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  mergeGuestCart,
  recordCartActivity,
  checkoutExit,
} from "../controllers/cart.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getCart);
router.route("/add").post(isAuthenticated, addToCart);
router.route("/remove/:id").delete(isAuthenticated, removeFromCart);
router.route("/update/:id").put(isAuthenticated, updateCartItemQuantity);
router.route("/clear/:userId").delete(isAuthenticated, clearCart);
router.route("/activity").post(isAuthenticated, recordCartActivity);
router.route("/checkout-exit").post(isAuthenticated, checkoutExit);

// Guest cart merge â€” called once after user logs in
router.route("/merge-guest").post(isAuthenticated, mergeGuestCart);

export default router;
