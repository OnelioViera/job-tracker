import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    console.log("Debug: Starting MongoDB connection test");

    // Check if MONGODB_URI exists
    const hasUri = !!process.env.MONGODB_URI;
    console.log("Debug: MONGODB_URI exists:", hasUri);

    if (!hasUri) {
      return NextResponse.json({
        error: "MONGODB_URI not found",
        hasUri: false,
      });
    }

    // Test connection
    console.log("Debug: Attempting to connect to MongoDB");
    const connection = await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Debug: MongoDB connected successfully");

    // Test if we can access the database
    const db = connection.connection.db;
    console.log("Debug: Database name:", db.databaseName);

    // List collections
    const collections = await db.listCollections().toArray();
    console.log(
      "Debug: Collections:",
      collections.map((c) => c.name)
    );

    await mongoose.disconnect();
    console.log("Debug: MongoDB disconnected");

    return NextResponse.json({
      success: true,
      hasUri: true,
      databaseName: db.databaseName,
      collections: collections.map((c) => c.name),
      message: "MongoDB connection successful",
    });
  } catch (error) {
    console.error("Debug: MongoDB connection error:", error);
    return NextResponse.json(
      {
        error: "MongoDB connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
        hasUri: !!process.env.MONGODB_URI,
      },
      { status: 500 }
    );
  }
}
