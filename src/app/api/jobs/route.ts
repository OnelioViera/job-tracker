import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET() {
  try {
    await dbConnect();
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("API: Received POST request");
    await dbConnect();
    const body = await request.json();
    console.log("API: Request body:", JSON.stringify(body, null, 2));

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

    // Handle empty projectManager field
    if (body.projectManager === "") {
      delete body.projectManager;
    }

    console.log("API: Processed body:", JSON.stringify(body, null, 2));
    const job = await Job.create(body);
    console.log("API: Created job:", job);
    return NextResponse.json(job, { status: 201 });
  } catch (error: unknown) {
    console.error("API: Error creating job:", error);
    type ValidationError = { errors: unknown };
    if (typeof error === "object" && error !== null && "errors" in error) {
      console.error(
        "API: Validation errors:",
        JSON.stringify((error as ValidationError).errors, null, 2)
      );
    }
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
