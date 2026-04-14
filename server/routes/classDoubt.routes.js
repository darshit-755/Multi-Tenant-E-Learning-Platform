import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { upload } from "../configs/multer.js";
import {
  addClassDoubtMessage,
  getClassDoubtConversation,
} from "../controllers/classDoubt.controller.js";

const router = express.Router();

router.get(
  "/:classId",
  authMiddleware,
  authorizeRoles("student", "tutor"),
  getClassDoubtConversation
);

router.post(
  "/:classId/messages",
  authMiddleware,
  authorizeRoles("student", "tutor"),
  upload.array("screenshots", 5),
  addClassDoubtMessage
);

export default router;
