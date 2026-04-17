import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { addClassNote, getClassNotes } from "../controllers/classNote.controller.js";
import { upload } from "../configs/multer.js";

const router = express.Router();

router.get(
  "/:classId",
  authMiddleware,
  authorizeRoles("tutor", "student"),
  getClassNotes
);

router.post(
  "/:classId",
  authMiddleware,
  authorizeRoles("tutor"),
  upload.fields([
    { name: "notePdfs", maxCount: 10 },
    { name: "lectureVideos", maxCount: 5 },
  ]),
  addClassNote
);

export default router;
