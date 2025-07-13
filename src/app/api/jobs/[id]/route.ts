import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    // Validate that the ID is a valid MongoDB ObjectId
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid job ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Convert date strings to Date objects
    if (body.startDate) {
      body.startDate = new Date(body.startDate);
    }
    if (body.finishedDate) {
      body.finishedDate = new Date(body.finishedDate);
    }
    if (body.completedDate) {
      body.completedDate = new Date(body.completedDate);
    }

    const job = await Job.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    // Validate that the ID is a valid MongoDB ObjectId
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid job ID format" },
        { status: 400 }
      );
    }

    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
