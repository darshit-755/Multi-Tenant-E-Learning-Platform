import express from 'express';
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { getProfile, updateProfile } from "../controllers/tutor.controller.js";
import { getBatchesByTutor } from "../controllers/batch.controller.js";
import { upload } from "../configs/multer.js";

const router = express.Router();

// Placeholder route for tutor dashboard
router.get('/dashboard', (req, res) => {
    res.json({ message: 'Tutor dashboard data' });
});

router.put("/profile",
    authMiddleware,
    authorizeRoles("tutor"),
    upload.single("profileImage"),
    updateProfile
);

router.get(
    "/profile",
    authMiddleware,
    authorizeRoles("tutor"),
    getProfile
);

// Get my batches (tutor)
router.get(
    "/my-batches",
    authMiddleware,
    authorizeRoles("tutor"),
    getBatchesByTutor
);

export default router;

