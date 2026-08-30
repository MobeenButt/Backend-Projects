import fs from "fs";
import path from "path";

const uploadsRoot = path.join(process.cwd(), "public", "uploads");

const saveUploadedFile = (localFilePath, folder = "misc") => {
  if (!localFilePath) return "";

  const destDir = path.join(uploadsRoot, folder);
  fs.mkdirSync(destDir, { recursive: true });

  const filename = path.basename(localFilePath);
  const destPath = path.join(destDir, filename);

  fs.renameSync(localFilePath, destPath);

  return `/uploads/${folder}/${filename}`.replace(/\\/g, "/");
};

const deleteUploadedFile = (fileUrl) => {
  if (!fileUrl) return;

  const relativePath = String(fileUrl)
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\//, "");

  const filePath = path.join(process.cwd(), "public", relativePath);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export { saveUploadedFile, deleteUploadedFile };
