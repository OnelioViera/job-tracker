import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    console.log("Simple test: Starting");
    console.log("Simple test: MONGODB_URI exists:", !!process.env.MONGODB_URI);

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        error: "MONGODB_URI not found",
        hasUri: false,
      });
    }

    console.log("Simple test: Attempting to connect");

    // Test basic connection
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Simple test: Connected successfully");

    // Test basic database operations
    const db = connection.connection.db;
    if (!db) {
      throw new Error("Database connection failed - db is undefined");
    }

    console.log("Simple test: Database name:", db.databaseName);

    // Test a simple query
    const collections = await db.listCollections().toArray();
    console.log("Simple test: Collections found:", collections.length);

    await mongoose.disconnect();
    console.log("Simple test: Disconnected successfully");

    return NextResponse.json({
      success: true,
      message: "MongoDB connection test successful",
      databaseName: db.databaseName,
      collectionsCount: collections.length,
    });
  } catch (error) {
    console.error("Simple test: Error:", error);
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
