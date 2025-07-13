import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    console.log("Simple Mongo: Starting test");

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        error: "MONGODB_URI not found",
      });
    }

    console.log("Simple Mongo: Attempting connection");

    // Simple connection test
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });

    console.log("Simple Mongo: Connection successful");

    // Test basic ping
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();

    console.log("Simple Mongo: Ping result:", result);

    await mongoose.disconnect();

    return NextResponse.json({
      success: true,
      message: "MongoDB connection and ping successful",
      pingResult: result,
    });
  } catch (error) {
    console.error("Simple Mongo: Error:", error);
    return NextResponse.json(
      {
        error: "MongoDB connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
