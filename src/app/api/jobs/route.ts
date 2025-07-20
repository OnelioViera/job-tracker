import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { useMockData } from '@/lib/mongodb';
import Job from '@/models/Job';

// Mock data for when MongoDB is not available
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

export async function GET() {
  try {
    console.log('GET /api/jobs: Starting request');
    
    // Try to connect to MongoDB with a timeout
    const connectionPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    try {
      await Promise.race([connectionPromise, timeoutPromise]);
    } catch {
      console.log('GET /api/jobs: MongoDB connection failed, using mock data');
      return NextResponse.json(mockJobs);
    }
    
    if (useMockData) {
      console.log('GET /api/jobs: Using mock data');
      return NextResponse.json(mockJobs);
    }
    
    console.log('GET /api/jobs: Database connected, fetching jobs');
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    console.log('GET /api/jobs: Found', jobs.length, 'jobs');
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('GET /api/jobs: Error fetching jobs:', error);
    console.log('GET /api/jobs: Falling back to mock data due to error');
    return NextResponse.json(mockJobs);
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    console.log('API: Received POST request');
    body = await request.json();
    console.log('API: Request body:', JSON.stringify(body, null, 2));
    
    // Try to connect to MongoDB with a timeout
    const connectionPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    try {
      await Promise.race([connectionPromise, timeoutPromise]);
    } catch {
      console.log('POST /api/jobs: MongoDB connection failed, using mock data');
      const newJob = {
        _id: Date.now().toString(),
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
        documents: []
      };
      return NextResponse.json(newJob, { status: 201 });
    }
    
    if (useMockData) {
      console.log('POST /api/jobs: Using mock data');
      // Create a new mock job
      const newMockJob = {
        _id: Date.now().toString(),
        ...body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return NextResponse.json(newMockJob, { status: 201 });
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

    // Handle empty projectManager field
    if (body.projectManager === '') {
      delete body.projectManager;
    }

    console.log('API: Processed body:', JSON.stringify(body, null, 2));
    const job = await Job.create(body);
    console.log('API: Created job:', job);
    return NextResponse.json(job, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /api/jobs: Error creating job:', error);
    console.log('POST /api/jobs: Falling back to mock data due to error');
    const newJob = {
      _id: Date.now().toString(),
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      documents: []
    };
    return NextResponse.json(newJob, { status: 201 });
  }
} 