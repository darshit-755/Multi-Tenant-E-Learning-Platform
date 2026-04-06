import express from 'express';
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { getProfile, updateProfile } from "../controllers/student.controller.js";
import { getBatchesByStudent } from "../controllers/batch.controller.js";
import { upload } from "../configs/multer.js";

const router = express.Router();

// Placeholder route for student dashboard
router.get('/dashboard', (req, res) => {
    res.json({ message: 'Student dashboard data' });
});

router.put("/profile",
    authMiddleware,
    authorizeRoles("student"),
    upload.single("profileImage"),
    updateProfile
);

router.get(
    "/profile",
    authMiddleware,
    authorizeRoles("student"),
    getProfile
);

// Get my batches (student)
router.get(
    "/my-batches",
    authMiddleware,
    authorizeRoles("student"),
    getBatchesByStudent
);

export default router;

