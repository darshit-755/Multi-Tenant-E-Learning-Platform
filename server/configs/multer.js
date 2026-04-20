import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

const toSafeFolderName = (value, fallback = "misc") => {
  const safeName = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

  return safeName || fallback;
};

const getUploadFolder = (req, file) => {
  if (file.fieldname === "screenshots") {
    return "doubt";
  }

  if (file.fieldname === "notePdfs") {
    return "notes";
  }

  if (file.fieldname === "lectureVideos") {
    return "lectures";
  }

  if (file.fieldname === "profileImage") {
    return toSafeFolderName(req.user?.role, "profile");
  }

  return "misc";
};

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = getUploadFolder(req, file);
    const folderPath = path.join(uploadsDir, folder);
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

// file filter
const fileFilter = (req, file, cb) => {
  const isImage =
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg";

  if (file.fieldname === "screenshots" || file.fieldname === "profileImage") {
    if (isImage) {
      cb(null, true);
      return;
    }

    cb(new Error("Only image files allowed"), false);
    return;
  }

  if (file.fieldname === "notePdfs") {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
      return;
    }

    cb(new Error("Only PDF files allowed"), false);
    return;
  }

  if (file.fieldname === "lectureVideos") {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
      return;
    }

    cb(new Error("Only video files allowed"), false);
    return;
  }

  cb(new Error("Unsupported file field"), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1000 * 1024 * 1024, 
  },
});
