import multer from "multer";
import fs from "fs";
import path from "path";

const tempDir = path.join(process.cwd(), "public", "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/x-matroska", // .mkv
]);

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || "";
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    const err = new Error(
      `Unsupported file type: ${file.mimetype}. Allowed: ${[
        ...ALLOWED_MIME_TYPES,
      ].join(", ")}`
    );
    err.statusCode = 400;
    return cb(err, false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});