import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { useMockData } from '@/lib/mongodb';
import Task from '@/models/Task';

// Mock data for when MongoDB is not available
const mockTasks = [
  {
    _id: '1',
    title: 'Sample Task 1',
    description: 'This is a sample task for testing',
    dueDate: new Date('2024-12-31'),
    priority: 'High',
    status: 'Pending',
    assignedTo: 'John Doe',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    title: 'Sample Task 2',
    description: 'Another sample task',
    dueDate: new Date('2024-11-30'),
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: 'Jane Smith',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function GET() {
  try {
    console.log('GET /api/tasks: Starting request');
    
    // Try to connect to MongoDB with a timeout
    const connectionPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    try {
      await Promise.race([connectionPromise, timeoutPromise]);
    } catch {
      console.log('GET /api/tasks: MongoDB connection failed, using mock data');
      return NextResponse.json(mockTasks);
    }
    
    if (useMockData) {
      console.log('GET /api/tasks: Using mock data');
      return NextResponse.json(mockTasks);
    }
    
    console.log('GET /api/tasks: Database connected, fetching tasks');
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    console.log('GET /api/tasks: Found', tasks.length, 'tasks');
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks: Error fetching tasks:', error);
    console.log('GET /api/tasks: Falling back to mock data due to error');
    return NextResponse.json(mockTasks);
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    console.log('API: Received POST request for task');
    body = await request.json();
    console.log('API: Request body:', body);
    
    // Try to connect to MongoDB with a timeout
    const connectionPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    try {
      await Promise.race([connectionPromise, timeoutPromise]);
    } catch {
      console.log('POST /api/tasks: MongoDB connection failed, using mock data');
      const newTask = {
        _id: Date.now().toString(),
        ...body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return NextResponse.json(newTask, { status: 201 });
    }
    
    if (useMockData) {
      console.log('POST /api/tasks: Using mock data');
      const newTask = {
        _id: Date.now().toString(),
        ...body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return NextResponse.json(newTask, { status: 201 });
    }
    
    // Convert date strings to Date objects
    if (body.dueDate && typeof body.dueDate === 'string') {
      body.dueDate = new Date(body.dueDate);
    }

    console.log('API: Processed body:', JSON.stringify(body, null, 2));
    const task = await Task.create(body);
    console.log('API: Created task:', task);
    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/tasks: Error creating task:', error);
    console.log('POST /api/tasks: Falling back to mock data due to error');
    const newTask = {
      _id: Date.now().toString(),
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return NextResponse.json(newTask, { status: 201 });
  }
} 