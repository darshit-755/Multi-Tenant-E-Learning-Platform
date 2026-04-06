import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import express from "express";
import { upload } from "../configs/multer.js";
import {
  approveTenant,
  makeTenantInactive,
  blockTenant,
  getPendingTenants,
  getAllTenants,
  getOnlineUsers,
  updateProfile,
  getProfile,
  getAllTutors,
  getAllStudents,
  getAllBatches
} from "../controllers/admin.controller.js";



const router = express.Router();

// Admin dashboard
router.get(
  "/admin-dashboard",
  authMiddleware,
  authorizeRoles("superadmin"),
  (req, res) => {
    res.json({ message: "Welcome Superadmin " });
  }
);

// Get all tenants
router.get(
  "/tenants",
  authMiddleware,
  authorizeRoles("superadmin"),
  getAllTenants
);

// Get pending tenant requests
router.get(
  "/tenants/pending",
  authMiddleware,
  authorizeRoles("superadmin"),
  getPendingTenants
);

// Approve tenant
router.patch(
  "/tenants/:id/approve",
  authMiddleware,
  authorizeRoles("superadmin"),
  approveTenant
);
// inactive tenant
router.patch(
  "/tenants/:id/inactive",
  authMiddleware,
  authorizeRoles("superadmin"),
  makeTenantInactive
);



// Block tenant
router.patch(
  "/tenants/:id/block",
  authMiddleware,
  authorizeRoles("superadmin"),
  blockTenant
);

//update profile
router.put(
  "/profile",
  authMiddleware,
  authorizeRoles("superadmin"),
  upload.single("profileImage"),
  updateProfile
);

router.get(
  "/profile",
  authMiddleware,
  authorizeRoles("superadmin"),
  getProfile
);

//get online user
router.get("/online-users", authMiddleware, authorizeRoles("superadmin"), getOnlineUsers);

// Get all tutors
router.get(
  "/tutors",
  authMiddleware,
  authorizeRoles("superadmin"),
  getAllTutors
);

// Get all students
router.get(
  "/students",
  authMiddleware,
  authorizeRoles("superadmin"),
  getAllStudents
);

// Get all batches
router.get(
  "/batches",
  authMiddleware,
  authorizeRoles("superadmin"),
  getAllBatches
);

export default router;