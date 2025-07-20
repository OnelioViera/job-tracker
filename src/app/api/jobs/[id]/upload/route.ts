import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Upload API: Starting file upload for job:', id);
    console.log('Upload API: Job ID type:', typeof id);
    console.log('Upload API: Job ID length:', id?.length);
    
    await dbConnect();
    
    // Validate that the ID is not empty
    if (!id || id.trim() === '') {
      console.log('Upload API: Empty job ID');
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    console.log('Upload API: Received files:', files.length);
    
    if (!files || files.length === 0) {
      console.log('Upload API: No files received');
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Try to find the job - handle both MongoDB ObjectIds and mock IDs
    let job;
    const isMongoObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    console.log('Upload API: Is MongoDB ObjectId:', isMongoObjectId);
    
    if (isMongoObjectId) {
      // Valid MongoDB ObjectId format
      console.log('Upload API: Searching by MongoDB ObjectId');
      job = await Job.findById(id);
      
      // If not found by ObjectId, try as string (in case it's a string representation)
      if (!job) {
        console.log('Upload API: Job not found by ObjectId, trying as string');
        job = await Job.findOne({ _id: id.toString() });
      }
    } else {
      // Mock ID or other format - try to find by _id as string
      console.log('Upload API: Searching by string ID');
      job = await Job.findOne({ _id: id });
    }
    
    if (!job) {
      console.log('Upload API: Job not found in database, ID:', id);
      console.log('Upload API: This might be a timing issue or the job was not saved to database');
      
      // Try one more time with a small delay in case it's a timing issue
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (isMongoObjectId) {
        job = await Job.findById(id);
        if (!job) {
          job = await Job.findOne({ _id: id.toString() });
        }
      } else {
        job = await Job.findOne({ _id: id });
      }
      
      if (!job) {
        console.log('Upload API: Job still not found after retry, proceeding with file upload only');
      } else {
        console.log('Upload API: Job found after retry');
      }
    } else {
      console.log('Upload API: Job found in database');
    }

    console.log('Upload API: Creating upload directory');
    const uploadDir = join(process.cwd(), 'public', 'uploads', id);
    await mkdir(uploadDir, { recursive: true });

    const uploadedFiles = [];

    for (const file of files) {
      console.log('Upload API: Processing file:', file.name, 'Type:', file.type);
      if (file.type !== 'application/pdf') {
        console.log('Upload API: Skipping non-PDF file:', file.name);
        continue; // Skip non-PDF files
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filename = `${Date.now()}-${file.name}`;
      const filepath = join(uploadDir, filename);
      
      console.log('Upload API: Writing file to:', filepath);
      await writeFile(filepath, buffer);
      
      uploadedFiles.push({
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date(),
      });
    }

    // Only update the database if the job exists
    if (job) {
      console.log('Upload API: Files uploaded, updating job with documents');
      // Update job with new documents
      job.documents = [...(job.documents || []), ...uploadedFiles];
      await job.save();
      console.log('Upload API: Job updated successfully in database');
    } else {
      console.log('Upload API: Files uploaded for mock job, database not updated');
    }

    console.log('Upload API: Upload completed successfully');
    return NextResponse.json({ 
      message: 'Files uploaded successfully',
      uploadedFiles,
      jobUpdated: !!job,
      jobFound: !!job,
      filesUploaded: uploadedFiles.length
    });
  } catch (error) {
    console.error('Upload API: Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 