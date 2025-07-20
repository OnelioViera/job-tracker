import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('GET /api/jobs/[id]: Starting request for job:', id);
    await dbConnect();
    
    // Validate that the ID is not empty
    if (!id || id.trim() === '') {
      console.log('GET /api/jobs/[id]: Empty job ID');
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // Try to find the job - handle both MongoDB ObjectIds and mock IDs
    let job;
    const isMongoObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    console.log('GET /api/jobs/[id]: Is MongoDB ObjectId:', isMongoObjectId);
    
    if (isMongoObjectId) {
      // Valid MongoDB ObjectId format
      console.log('GET /api/jobs/[id]: Searching by MongoDB ObjectId');
      job = await Job.findById(id);
    } else {
      // Mock ID or other format - try to find by _id as string
      console.log('GET /api/jobs/[id]: Searching by string ID');
      job = await Job.findOne({ _id: id });
    }
    
    if (!job) {
      console.log('GET /api/jobs/[id]: Job not found:', id);
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    console.log('GET /api/jobs/[id]: Job found:', job._id);
    return NextResponse.json(job);
  } catch (error) {
    console.error('GET /api/jobs/[id]: Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('PUT /api/jobs/[id]: Starting update for job:', id);
    await dbConnect();
    
    // Validate that the ID is not empty
    if (!id || id.trim() === '') {
      console.log('PUT /api/jobs/[id]: Empty job ID');
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // Try to find the job - handle both MongoDB ObjectIds and mock IDs
    let job;
    const isMongoObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    console.log('PUT /api/jobs/[id]: Is MongoDB ObjectId:', isMongoObjectId);
    
    if (isMongoObjectId) {
      // Valid MongoDB ObjectId format
      console.log('PUT /api/jobs/[id]: Searching by MongoDB ObjectId');
      job = await Job.findById(id);
    } else {
      // Mock ID or other format - try to find by _id as string
      console.log('PUT /api/jobs/[id]: Searching by string ID');
      job = await Job.findOne({ _id: id });
    }
    
    if (!job) {
      console.log('PUT /api/jobs/[id]: Job not found:', id);
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
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

    // Update the job
    Object.assign(job, body);
    await job.save();
    
    console.log('PUT /api/jobs/[id]: Job updated successfully');
    return NextResponse.json(job);
  } catch (error) {
    console.error('PUT /api/jobs/[id]: Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
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
    console.log('DELETE /api/jobs/[id]: Starting delete for job:', id);
    await dbConnect();
    
    // Validate that the ID is not empty
    if (!id || id.trim() === '') {
      console.log('DELETE /api/jobs/[id]: Empty job ID');
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // Try to find the job - handle both MongoDB ObjectIds and mock IDs
    let job;
    const isMongoObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    console.log('DELETE /api/jobs/[id]: Is MongoDB ObjectId:', isMongoObjectId);
    
    if (isMongoObjectId) {
      // Valid MongoDB ObjectId format
      console.log('DELETE /api/jobs/[id]: Searching by MongoDB ObjectId');
      job = await Job.findById(id);
    } else {
      // Mock ID or other format - try to find by _id as string
      console.log('DELETE /api/jobs/[id]: Searching by string ID');
      job = await Job.findOne({ _id: id });
    }
    
    if (!job) {
      console.log('DELETE /api/jobs/[id]: Job not found:', id);
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Delete the job
    await Job.findByIdAndDelete(job._id);
    
    console.log('DELETE /api/jobs/[id]: Job deleted successfully');
    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/jobs/[id]: Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
} 