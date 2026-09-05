import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async (retries = 3, delayMs = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connectionInstance = await mongoose.connect(
        `${process.env.MONGODB_URI}/${DB_NAME}`,
        {
          serverSelectionTimeoutMS: 10000, // fail fast if unreachable
          connectTimeoutMS: 10000,
        }
      );
      console.log(
        `MongoDB connected! Host: ${connectionInstance.connection.host}`
      );
      return connectionInstance;
    } catch (error) {
      console.error(
        `MongoDB connection failed (attempt ${attempt}/${retries}):`,
        error.message
      );
      if (attempt === retries) {
        console.error(
          "MongoDB is unreachable. Check your network, the Atlas IP allowlist, and credentials in backend/.env"
        );
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

export default connectDB;