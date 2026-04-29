import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { upload } from "../configs/multer.js";
import {
  addClassDoubtMessage,
  getClassDoubtConversation,
  markDoubtSolved,
} from "../controllers/classDoubt.controller.js";

const router = express.Router();

router.get(
  "/:classId",
  authMiddleware,
  authorizeRoles("student", "tutor", "tenant"),
  getClassDoubtConversation
);

router.post(
  "/:classId/messages",
  authMiddleware,
  authorizeRoles("student", "tutor", "tenant"),
  upload.array("screenshots", 5),
  addClassDoubtMessage
);

router.patch(
  "/:classId/solved",
  authMiddleware,
  authorizeRoles("student", "tenant"),
  markDoubtSolved
);

export default router;
