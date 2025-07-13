import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

export async function GET() {
  try {
    console.log("API: Starting GET /api/tasks");
    console.log("API: MONGODB_URI exists:", !!process.env.MONGODB_URI);

    // Force a fresh connection
    await mongoose.disconnect();
    await dbConnect();
    console.log("API: Database connected successfully");

    const tasks = await Task.find({}).sort({ createdAt: -1 });
    console.log("API: Found tasks count:", tasks.length);

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("API: Received POST request for task");
    // Force a fresh connection
    await mongoose.disconnect();
    await dbConnect();
    const body = await request.json();
    console.log("API: Request body:", JSON.stringify(body, null, 2));

    // Convert date strings to Date objects
    if (body.dueDate) {
      body.dueDate = new Date(body.dueDate);
    }

    console.log("API: Processed body:", JSON.stringify(body, null, 2));
    const task = await Task.create(body);
    console.log("API: Created task:", task);
    return NextResponse.json(task, { status: 201 });
  } catch (error: unknown) {
    console.error("API: Error creating task:", error);
    type ValidationError = { errors: unknown };
    if (typeof error === "object" && error !== null && "errors" in error) {
      console.error(
        "API: Validation errors:",
        JSON.stringify((error as ValidationError).errors, null, 2)
      );
    }
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
