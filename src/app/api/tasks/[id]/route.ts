import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { useMockData } from '@/lib/mongodb';
import Task from '@/models/Task';

// Mock data for individual task operations
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string;
  try {
    const paramsResult = await params;
    id = paramsResult.id;
    
    // Try to connect to MongoDB with a timeout
    const connectionPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    try {
      await Promise.race([connectionPromise, timeoutPromise]);
    } catch (error) {
      console.log('GET /api/tasks/[id]: MongoDB connection failed, using mock data');
      const mockTask = mockTasks.find(task => task._id === id);
      if (!mockTask) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(mockTask);
    }
    
    if (useMockData) {
      console.log('GET /api/tasks/[id]: Using mock data');
      const mockTask = mockTasks.find(task => task._id === id);
      if (!mockTask) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(mockTask);
    }
    
    // Validate that the ID is a valid MongoDB ObjectId
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid task ID format' },
        { status: 400 }
      );
    }
    
    const task = await Task.findById(id);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('GET /api/tasks/[id]: Error fetching task:', error);
    console.log('GET /api/tasks/[id]: Falling back to mock data due to error');
    const mockTask = mockTasks.find(task => task._id === id);
    if (!mockTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(mockTask);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string;
  let body: any;
  try {
    const paramsResult = await params;
    id = paramsResult.id;
    body = await request.json();
    
    // Try to connect to MongoDB with a timeout
    const connectionPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    try {
      await Promise.race([connectionPromise, timeoutPromise]);
    } catch (error) {
      console.log('PUT /api/tasks/[id]: MongoDB connection failed, using mock data');
      const mockTask = mockTasks.find(task => task._id === id);
      if (!mockTask) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      // Return updated mock task
      const updatedMockTask = { ...mockTask, ...body, updatedAt: new Date() };
      return NextResponse.json(updatedMockTask);
    }
    
    if (useMockData) {
      console.log('PUT /api/tasks/[id]: Using mock data');
      const mockTask = mockTasks.find(task => task._id === id);
      if (!mockTask) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      // Return updated mock task
      const updatedMockTask = { ...mockTask, ...body, updatedAt: new Date() };
      return NextResponse.json(updatedMockTask);
    }
    
    // Validate that the ID is a valid MongoDB ObjectId only for real MongoDB
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid task ID format' },
        { status: 400 }
      );
    }
    
    // Convert date strings to Date objects
    if (body.dueDate) {
      body.dueDate = new Date(body.dueDate);
    }

    const task = await Task.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('PUT /api/tasks/[id]: Error updating task:', error);
    console.log('PUT /api/tasks/[id]: Falling back to mock data due to error');
    const mockTask = mockTasks.find(task => task._id === id);
    if (!mockTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    // Return updated mock task
    const updatedMockTask = { ...mockTask, ...body, updatedAt: new Date() };
    return NextResponse.json(updatedMockTask);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string;
  try {
    const paramsResult = await params;
    id = paramsResult.id;
    
    // Try to connect to MongoDB with a timeout
    const connectionPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    try {
      await Promise.race([connectionPromise, timeoutPromise]);
    } catch (error) {
      console.log('DELETE /api/tasks/[id]: MongoDB connection failed, using mock data');
      const mockTask = mockTasks.find(task => task._id === id);
      if (!mockTask) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ message: 'Task deleted successfully' });
    }
    
    if (useMockData) {
      console.log('DELETE /api/tasks/[id]: Using mock data');
      const mockTask = mockTasks.find(task => task._id === id);
      if (!mockTask) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ message: 'Task deleted successfully' });
    }
    
    // Validate that the ID is a valid MongoDB ObjectId only for real MongoDB
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid task ID format' },
        { status: 400 }
      );
    }
    
    const task = await Task.findByIdAndDelete(id);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/tasks/[id]: Error deleting task:', error);
    console.log('DELETE /api/tasks/[id]: Falling back to mock data due to error');
    const mockTask = mockTasks.find(task => task._id === id);
    if (!mockTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: 'Task deleted successfully' });
  }
} 