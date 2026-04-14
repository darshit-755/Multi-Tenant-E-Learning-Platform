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

// file filter (images only)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});
