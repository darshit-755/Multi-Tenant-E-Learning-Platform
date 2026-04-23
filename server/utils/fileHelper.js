import fs from "fs";
import path from "path";

/**
 * Sanitizes a filename to remove special characters
 * @param {string} value - The value to sanitize
 * @returns {string} Sanitized filename
 */
export const sanitizeFilename = (value) => {
  if (!value) return "file";
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    || "file";
};

/**
 * Renames a file on the filesystem and returns the new filename
 * @param {string} oldFilePath - The full path to the existing file
 * @param {string} classTitle - The class title to use for renaming
 * @returns {Promise<string>} The new filename or null if rename fails
 */
export const renameFileWithClassTitle = async (oldFilePath, classTitle) => {
  try {
    // Check if file exists
    if (!fs.existsSync(oldFilePath)) {
      console.warn(`File not found: ${oldFilePath}`);
      return null;
    }

    const dir = path.dirname(oldFilePath);
    const ext = path.extname(oldFilePath);
    const sanitizedTitle = sanitizeFilename(classTitle);
    
    // Generate new filename with class title + timestamp + random
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const newFilename = `${sanitizedTitle}_${timestamp}-${random}${ext}`;
    const newFilePath = path.join(dir, newFilename);

    // Rename the file
    await fs.promises.rename(oldFilePath, newFilePath);
    
    return newFilename;
  } catch (error) {
    console.error(`Error renaming file ${oldFilePath}:`, error.message);
    return null;
  }
};

/**
 * Builds uploaded file objects with class title in the name
 * Used when files need to be displayed with the class topic as their name
 * @param {object} req - Express request object
 * @param {array} files - Array of uploaded file objects from multer
 * @param {string} classTitle - The class title/topic to use
 * @param {string} fallbackFolder - Fallback folder name if not determinable
 * @returns {array} Array of file objects with url and name
 */
export const buildUploadedFileObjectsWithClassTitle = (
  req,
  files = [],
  classTitle = "",
  fallbackFolder = "misc"
) => {
  if (!Array.isArray(files) || files.length === 0) return [];
  
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const sanitizedTitle = sanitizeFilename(classTitle);

  return files.map((file, index) => {
    const folder = file.destination?.split(/[\\/]/).pop() || fallbackFolder;
    const displayName = sanitizedTitle
      ? `${classTitle}${files.length > 1 ? ` (Part ${index + 1})` : ""}`
      : file.originalname || file.filename;

    return {
      url: `${baseUrl}/uploads/${folder}/${file.filename}`,
      name: displayName,
    };
  });
};
