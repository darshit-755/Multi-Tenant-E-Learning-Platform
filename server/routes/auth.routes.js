import express from "express";

import {
  registerTenant,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  googleLogin
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();


// Tenant self registration
router.post("/register", registerTenant);

// Login (superadmin, tenant, tutor, student)
router.post("/login", loginUser);

// Google Login
router.post("/google-login", googleLogin);

// Logout (sets onlineStatus = false)
router.post("/logout", authMiddleware, logoutUser);

// Get logged in user
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "User fetched successfully",
    user: req.user,
  });
});



// Request reset email
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password/:token", resetPassword);

export default router;