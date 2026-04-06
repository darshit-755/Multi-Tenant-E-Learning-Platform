import express from "express";
import {
  createClass,
  getClassesByTenant,
  updateClass,
  deleteClass,
  getClassesByTutor,
  getClassesByStudent,
} from "../controllers/class.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Tenant routes
router.post(
  "/",
  authMiddleware,
  authorizeRoles("tenant"),
  createClass
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("tenant"),
  getClassesByTenant
);

router.put(
  "/:classId",
  authMiddleware,
  authorizeRoles("tenant"),
  updateClass
);

router.delete(
  "/:classId",
  authMiddleware,
  authorizeRoles("tenant"),
  deleteClass
);

// Tutor route - get my classes
router.get(
  "/tutor/my-classes",
  authMiddleware,
  authorizeRoles("tutor"),
  getClassesByTutor
);

// Student route - get my classes
router.get(
  "/student/my-classes",
  authMiddleware,
  authorizeRoles("student"),
  getClassesByStudent
);

export default router;
