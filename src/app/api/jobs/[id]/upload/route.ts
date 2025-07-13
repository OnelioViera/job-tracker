import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("Upload API: Starting file upload for job:", id);
    await dbConnect();

    // Validate that the ID is a valid MongoDB ObjectId
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      console.log("Upload API: Invalid job ID format:", id);
      return NextResponse.json(
        { error: "Invalid job ID format" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    console.log("Upload API: Received files:", files.length);

    if (!files || files.length === 0) {
      console.log("Upload API: No files received");
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const job = await Job.findById(id);
    if (!job) {
      console.log("Upload API: Job not found:", id);
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if we're in a serverless environment (Vercel)
    const isServerless = process.env.VERCEL === "1";

    if (isServerless) {
      console.log(
        "Upload API: Running in serverless environment, skipping file write"
      );
      // In serverless, we can't write files to filesystem
      // For now, just update the job with file metadata
      const uploadedFiles = files
        .filter((file) => file.type === "application/pdf")
        .map((file) => ({
          filename: `${Date.now()}-${file.name}`,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          uploadedAt: new Date(),
        }));

      if (uploadedFiles.length > 0) {
        job.documents = [...(job.documents || []), ...uploadedFiles];
        await job.save();
        console.log("Upload API: Job updated with file metadata");
      }

      return NextResponse.json({
        message: "Files processed successfully (serverless mode)",
        uploadedFiles,
        note: "File uploads are not supported in production yet. Please implement cloud storage.",
      });
    }

    // Local development - write files to filesystem
    console.log("Upload API: Job found, creating upload directory");
    const uploadDir = join(process.cwd(), "public", "uploads", id);
    await mkdir(uploadDir, { recursive: true });

    const uploadedFiles = [];

    for (const file of files) {
      console.log(
        "Upload API: Processing file:",
        file.name,
        "Type:",
        file.type
      );
      if (file.type !== "application/pdf") {
        console.log("Upload API: Skipping non-PDF file:", file.name);
        continue; // Skip non-PDF files
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${file.name}`;
      const filepath = join(uploadDir, filename);

      console.log("Upload API: Writing file to:", filepath);
      await writeFile(filepath, buffer);

      uploadedFiles.push({
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date(),
      });
    }

    console.log("Upload API: Files uploaded, updating job with documents");
    // Update job with new documents
    job.documents = [...(job.documents || []), ...uploadedFiles];
    await job.save();

    console.log("Upload API: Job updated successfully");
    return NextResponse.json({
      message: "Files uploaded successfully",
      uploadedFiles,
    });
  } catch (error) {
    console.error("Upload API: Error uploading files:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
