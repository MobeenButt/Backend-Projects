import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection
async function testCloudinary() {
  try {
    console.log("\n🔄 Testing Cloudinary connection...\n");
    console.log("📋 Configuration:");
    console.log("   Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("   API Key:", process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Not Set");
    console.log("   API Secret:", process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Not Set");
    console.log();

    // Test: Ping Cloudinary API
    const result = await cloudinary.api.ping();

    console.log("✅ SUCCESS! Cloudinary connected successfully.\n");
    console.log("📊 Status:", result.status);
    console.log("☁️  Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("\n🎉 Your Cloudinary setup is working perfectly!\n");
    console.log("💡 Next step: Try uploading a file with 'node test-upload.js'\n");
  } catch (error) {
    console.log("❌ ERROR: Cloudinary connection failed\n");
    console.log("Error message:", error.message);
    console.log("\n⚠️  Troubleshooting:");
    console.log("   1. Check your .env file exists in backend folder");
    console.log("   2. Verify credentials are correct (no extra spaces)");
    console.log("   3. Make sure you copied from Cloudinary dashboard");
    console.log("   4. Try regenerating API secret from Cloudinary\n");
    
    if (error.error && error.error.http_code) {
      console.log("HTTP Status Code:", error.error.http_code);
    }
  }
}

testCloudinary();
