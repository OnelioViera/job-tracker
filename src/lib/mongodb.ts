import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables");
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached: typeof mongoose | null = null;

async function dbConnect() {
  if (cached) {
    return cached;
  }

  try {
    const connectionOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    };

    cached = await mongoose.connect(MONGODB_URI!, connectionOptions);
    console.log("MongoDB connected successfully");
    return cached;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export default dbConnect;
