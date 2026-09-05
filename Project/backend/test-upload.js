import { uploadOnCloudinary } from "./src/utils/cloudinary.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUpload() {
  try {
    console.log("\n🔄 Testing file upload to Cloudinary...\n");

    // Check for test files in public/temp folder
    const tempDir = path.join(__dirname, "public", "temp");
    
    if (!fs.existsSync(tempDir)) {
      console.log("❌ Temp folder not found:", tempDir);
      console.log("💡 Creating temp folder...\n");
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Look for any test file
    const files = fs.readdirSync(tempDir);
    const imageFiles = files.filter(f => 
      f.endsWith('.png') || 
      f.endsWith('.jpg') || 
      f.endsWith('.jpeg') || 
      f.endsWith('.gif')
    );

    if (imageFiles.length === 0) {
      console.log("❌ No test images found in:", tempDir);
      console.log("\n💡 To test upload:");
      console.log("   1. Copy any image to: backend/public/temp/");
      console.log("   2. Run this script again\n");
      return;
    }

    const testFile = imageFiles[0];
    const testFilePath = path.join(tempDir, testFile);

    console.log("📁 Found test file:", testFile);
    console.log("📍 Full path:", testFilePath);
    console.log("📊 File size:", (fs.statSync(testFilePath).size / 1024).toFixed(2), "KB");
    console.log("\n⬆️  Uploading to Cloudinary...\n");

    // Make a copy of the file (since uploadOnCloudinary deletes it)
    const copyPath = path.join(tempDir, `copy_${testFile}`);
    fs.copyFileSync(testFilePath, copyPath);

    // Upload to Cloudinary
    const result = await uploadOnCloudinary(copyPath);

    if (result) {
      console.log("✅ Upload successful!\n");
      console.log("📦 Response Details:");
      console.log("   🔗 URL:", result.url);
      console.log("   📊 Type:", result.resource_type);
      console.log("   📏 Size:", (result.bytes / 1024).toFixed(2), "KB");
      console.log("   🆔 Public ID:", result.public_id);
      console.log("   📅 Created:", new Date(result.created_at).toLocaleString());
      console.log("\n🎉 Cloudinary upload working perfectly!");
      console.log("💡 Check your Cloudinary dashboard to see the uploaded file\n");
      console.log("🌐 Dashboard: https://cloudinary.com/console/media_library\n");
    }
  } catch (error) {
    console.log("\n❌ Upload failed!");
    console.log("Error:", error.message);
    console.log("\n⚠️  Troubleshooting:");
    console.log("   1. Check your internet connection");
    console.log("   2. Verify Cloudinary credentials in .env");
    console.log("   3. Make sure file is not corrupted");
    console.log("   4. Try a smaller file (< 10MB)\n");
  }
}

testUpload();
