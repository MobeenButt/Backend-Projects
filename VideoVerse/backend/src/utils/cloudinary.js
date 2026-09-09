import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Configure once on module load so every call uses the same instance.
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey    = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "[cloudinary] Missing credentials. Set CLOUDINARY_CLOUD_NAME, " +
    "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in environment variables."
  );
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key:    apiKey,
    api_secret: apiSecret,
    secure:     true, // ALL generated URLs use https://
  });
}

/**
 * Upload a local file to Cloudinary and remove the temp copy regardless of
 * outcome.  Always returns an object whose `.url` is an https:// string.
 */
const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  const absolutePath = path.resolve(localFilePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Temp file not found: ${absolutePath}`);
  }

  try {
    const response = await cloudinary.uploader.upload(absolutePath, {
      resource_type: "auto",
      secure:        true, // double-enforce https in the returned URL
    });

    // Force https even if Cloudinary ever returns http (old free-tier behaviour)
    if (response.url) {
      response.url         = response.url.replace(/^http:\/\//i, "https://");
      response.secure_url  = response.secure_url || response.url;
    }

    return response;
  } catch (error) {
    throw new Error(
      error.http_code
        ? `Cloudinary upload failed (${error.http_code}): ${error.message}`
        : `Cloudinary upload failed: ${error.message || error}`
    );
  } finally {
    // Always clean up the temp file
    try {
      if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
    } catch (_) {
      // ignore cleanup errors
    }
  }
};

/**
 * Delete an asset from Cloudinary by its public URL.
 * Silently returns null on failure so upload errors aren't masked.
 */
const deleteFromCloudinary = async (fileUrl) => {
  if (!fileUrl) return null;

  try {
    const url   = fileUrl.split("?")[0];
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return null;

    const publicId = match[1].replace(/\.[^.]+$/, "");

    // Try image first; fall back to video for video assets
    let result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result === "not found") {
      result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "video",
      });
    }

    return result;
  } catch (error) {
    console.error("[cloudinary] deleteFromCloudinary error:", error.message);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
