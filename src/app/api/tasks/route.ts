import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET() {
  try {
    await dbConnect();
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API: Received POST request for task');
    await dbConnect();
    const body = await request.json();
    console.log('API: Request body:', JSON.stringify(body, null, 2));
    
    // Convert date strings to Date objects
    if (body.dueDate) {
      body.dueDate = new Date(body.dueDate);
    }

    console.log('API: Processed body:', JSON.stringify(body, null, 2));
    const task = await Task.create(body);
    console.log('API: Created task:', task);
    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('API: Error creating task:', error);
    if (error.errors) {
      console.error('API: Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 