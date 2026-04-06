import express from "express";
import { createMeetLink } from "../controllers/meet.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// POST /api/meet/create
router.post("/create", authMiddleware, authorizeRoles("tenant"), createMeetLink);

export default router;