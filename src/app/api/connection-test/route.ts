import { NextResponse } from "next/server";

export async function GET() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      return NextResponse.json({
        error: "MONGODB_URI not found",
        hasUri: false,
      });
    }

    // Check if it's a valid MongoDB connection string
    const isValidFormat =
      uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");

    // Extract parts of the connection string for debugging
    const uriParts = {
      protocol: uri.split("://")[0],
      hasUsername: uri.includes("@"),
      hasDatabase: uri.includes("/") && uri.split("/").length > 1,
      hasOptions: uri.includes("?"),
      length: uri.length,
    };

    return NextResponse.json({
      success: true,
      hasUri: true,
      isValidFormat,
      uriParts,
      // Don't return the full URI for security
      uriPreview: uri.substring(0, 20) + "...",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Connection test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
