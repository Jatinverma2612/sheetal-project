import express from "express";
import {
  getMe,
  updateProfile,
  deleteMe,
  getAllUsers,
  deleteUser,
  updateUser,
  createUser,
  guestLogin,
  getUserStats,
  getSingleUserDetails,
  toggleWishlist,
  getWishlist,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserOrders,
} from "../controllers/user.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";
import { uploadTo } from "../middlewares/multer.middleware.js"; // Import uploadTo

const router = express.Router();

// public guest login route
router.post("/guest-login", guestLogin);

// protected routes
router.get("/me", isAuthenticated, getMe);
router.delete("/me", isAuthenticated, deleteMe);
router.put(
  "/update",
  isAuthenticated,
  uploadTo("users").single("profilePicture"),
  updateProfile,
); // Added multer middleware
router.post("/wishlist", isAuthenticated, toggleWishlist);
router.get("/wishlist", isAuthenticated, getWishlist);

// Address Routes
router.post("/address", isAuthenticated, addAddress);
router.put("/address/:addressId", isAuthenticated, updateAddress);
router.delete("/address/:addressId", isAuthenticated, deleteAddress);
router.put("/address/:addressId/default", isAuthenticated, setDefaultAddress);

// admin routes
router.get("/admin/all", isAuthenticated, isAdmin, getAllUsers);
router.post("/admin", isAuthenticated, isAdmin, createUser);
router.get("/admin/stats", isAuthenticated, isAdmin, getUserStats);
router.get("/admin/:id/orders", isAuthenticated, isAdmin, getUserOrders);
router
  .route("/admin/:id")
  .get(isAuthenticated, isAdmin, getSingleUserDetails)
  .put(isAuthenticated, isAdmin, updateUser)
  .delete(isAuthenticated, isAdmin, deleteUser);

export default router;
