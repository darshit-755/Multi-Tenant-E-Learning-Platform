import express from "express";
import {
  markAttendance,
  getAttendanceByClass,
  getAttendanceByStudent,
  getMyAttendance,
  getAttendanceSummary,
  updateAttendance,
} from "../controllers/attendance.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Tutor routes - mark attendance
router.post(
  "/mark",
  authMiddleware,
  authorizeRoles("tutor"),
  markAttendance
);

// Get attendance for a class (accessible to tenant, tutor)
router.get(
  "/class/:classId",
  authMiddleware,
  authorizeRoles("tenant", "tutor"),
  getAttendanceByClass
);

// Get student attendance history (accessible to student, tenant)
router.get(
  "/student/me",
  authMiddleware,
  authorizeRoles("student"),
  getMyAttendance
);

router.get(
  "/student/:studentId",
  authMiddleware,
  authorizeRoles("student", "tenant"),
  getAttendanceByStudent
);

// Get attendance summary for batch (accessible to tenant, tutor)
router.get(
  "/batch/:batchId/summary",
  authMiddleware,
  authorizeRoles("tenant", "tutor"),
  getAttendanceSummary
);

// Update attendance record (tutor can correct)
router.put(
  "/:attendanceId",
  authMiddleware,
  authorizeRoles("tutor", "tenant"),
  updateAttendance
);

export default router;
