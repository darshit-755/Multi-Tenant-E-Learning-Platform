import express from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { addClassNote, getClassNotes, deleteClassNote, updateClassNote } from "../controllers/classNote.controller.js";
import { upload } from "../configs/multer.js";

const router = express.Router();

// Delete a class note by noteId
router.delete(
  "/note/:noteId",
  authMiddleware,
  authorizeRoles("tutor"),
  deleteClassNote
);

// Update a class note by noteId
router.put(
  "/note/:noteId",
  authMiddleware,
  authorizeRoles("tutor"),
  upload.fields([
    { name: "notePdfs", maxCount: 10 },
    { name: "lectureVideos", maxCount: 5 },
  ]),
  updateClassNote
);

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
