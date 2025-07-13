import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  try {
    const { id, filename } = await params;
    // Force a fresh connection
    await mongoose.disconnect();
    await dbConnect();

    // Validate that the ID is a valid MongoDB ObjectId
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid job ID format" },
        { status: 400 }
      );
    }

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const document = job.documents?.find(
      (doc: { filename: string; mimeType: string; originalName: string }) =>
        doc.filename === filename
    );
    if (!document) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filepath = join(process.cwd(), "public", "uploads", id, filename);
    const fileBuffer = await readFile(filepath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${document.originalName}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
