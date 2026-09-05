import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const configureCloudinary = () => {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary credentials missing. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env"
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
};

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  configureCloudinary();

  const absolutePath = path.resolve(localFilePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Local file not found: ${absolutePath}`);
  }

  console.log("Uploading file:", absolutePath);

  try {
    const uploadOptions = { resource_type: "auto" };

    if (process.env.CLOUDINARY_UPLOAD_PRESET?.trim()) {
      uploadOptions.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET.trim();
    }

    const response = await cloudinary.uploader.upload(
      absolutePath,
      uploadOptions
    );

    console.log("Upload success:", response.url);
    fs.unlinkSync(absolutePath);
    return response;
  } catch (error) {
    console.log(
      "Cloudinary error:",
      error.http_code || "N/A",
      error.message || error
    );

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    throw new Error(
      error.http_code
        ? `Cloudinary upload failed (${error.http_code}): ${error.message}`
        : `Cloudinary upload failed: ${error.message || error}`
    );
  }
};

const deleteFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) return null;

    configureCloudinary();

    // Extract public_id from a Cloudinary URL.
    // URLs follow the pattern: /<cloud>/image/upload/v<version>/<public_id>.<ext>
    // We strip query params and find "/upload/" segment.
    const url = fileUrl.split("?")[0];
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) {
      console.log("Cloudinary delete error: could not parse public_id from URL");
      return null;
    }

    let publicId = match[1];
    // Remove file extension
    publicId = publicId.replace(/\.[^.]+$/, "");

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    return response;
  } catch (error) {
    console.log("Cloudinary delete error:", error.message);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
