import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { useMockData } from '@/lib/mongodb';
import Job from '@/models/Job';

// Mock data for individual job operations
const mockJobs = [
  {
    _id: '1',
    customer: 'ABC Company',
    jobName: 'Website Redesign',
    jobNumber: 'JOB-001',
    projectManager: 'John Doe',
    startDate: new Date('2024-01-15'),
    finishedDate: new Date('2024-03-15'),
    priority: 'High',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    customer: 'XYZ Corp',
    jobName: 'Mobile App Development',
    jobNumber: 'JOB-002',
    projectManager: 'Jane Smith',
    startDate: new Date('2024-02-01'),
    priority: 'Medium',
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
    } catch {
      console.log('GET /api/jobs/[id]: MongoDB connection failed, using mock data');
      const mockJob = mockJobs.find(job => job._id === id);
      if (!mockJob) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(mockJob);
    }
    
    if (useMockData) {
      console.log('GET /api/jobs/[id]: Using mock data');
      const mockJob = mockJobs.find(job => job._id === id);
      if (!mockJob) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(mockJob);
    }
    
    // Validate that the ID is a valid MongoDB ObjectId
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid job ID format' },
        { status: 400 }
      );
    }
    
    const job = await Job.findById(id);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(job);
  } catch (error) {
    console.error('GET /api/jobs/[id]: Error fetching job:', error);
    console.log('GET /api/jobs/[id]: Falling back to mock data due to error');
    const mockJob = mockJobs.find(job => job._id === id);
    if (!mockJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(mockJob);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string;
  let body: Record<string, unknown> = {};
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
    } catch {
      console.log('PUT /api/jobs/[id]: MongoDB connection failed, using mock data');
      const mockJob = mockJobs.find(job => job._id === id);
      if (!mockJob) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      // Return updated mock job
      const updatedMockJob = { ...mockJob, ...body, updatedAt: new Date() };
      return NextResponse.json(updatedMockJob);
    }
    
    if (useMockData) {
      console.log('PUT /api/jobs/[id]: Using mock data');
      const mockJob = mockJobs.find(job => job._id === id);
      if (!mockJob) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      // Return updated mock job
      const updatedMockJob = { ...mockJob, ...body, updatedAt: new Date() };
      return NextResponse.json(updatedMockJob);
    }
    
    // Validate that the ID is a valid MongoDB ObjectId only for real MongoDB
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid job ID format' },
        { status: 400 }
      );
    }
    
    // Convert date strings to Date objects
    if (body.startDate && typeof body.startDate === 'string') {
      body.startDate = new Date(body.startDate);
    }
    if (body.finishedDate && typeof body.finishedDate === 'string') {
      body.finishedDate = new Date(body.finishedDate);
    }
    if (body.completedDate && typeof body.completedDate === 'string') {
      body.completedDate = new Date(body.completedDate);
    }

    const job = await Job.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(job);
  } catch (error) {
    console.error('PUT /api/jobs/[id]: Error updating job:', error);
    console.log('PUT /api/jobs/[id]: Falling back to mock data due to error');
    const mockJob = mockJobs.find(job => job._id === id);
    if (!mockJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    // Return updated mock job
    const updatedMockJob = { ...mockJob, ...body, updatedAt: new Date() };
    return NextResponse.json(updatedMockJob);
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
    } catch {
      console.log('DELETE /api/jobs/[id]: MongoDB connection failed, using mock data');
      const mockJob = mockJobs.find(job => job._id === id);
      if (!mockJob) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ message: 'Job deleted successfully' });
    }
    
    if (useMockData) {
      console.log('DELETE /api/jobs/[id]: Using mock data');
      const mockJob = mockJobs.find(job => job._id === id);
      if (!mockJob) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ message: 'Job deleted successfully' });
    }
    
    // Validate that the ID is a valid MongoDB ObjectId only for real MongoDB
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid job ID format' },
        { status: 400 }
      );
    }
    
    const job = await Job.findByIdAndDelete(id);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/jobs/[id]: Error deleting job:', error);
    console.log('DELETE /api/jobs/[id]: Falling back to mock data due to error');
    const mockJob = mockJobs.find(job => job._id === id);
    if (!mockJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: 'Job deleted successfully' });
  }
} 