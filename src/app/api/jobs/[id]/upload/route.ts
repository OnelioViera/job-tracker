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
    console.log('=== UPLOAD API START ===');
    
    // Basic parameter validation first
    let id: string;
    try {
      const paramsResult = await params;
      id = paramsResult.id;
      console.log('Upload API: Job ID from params:', id);
    } catch (paramError) {
      console.error('Upload API: Error getting params:', paramError);
      return NextResponse.json(
        { error: 'Invalid job ID parameter' },
        { status: 400 }
      );
    }
    
    console.log('Upload API: Starting file upload for job:', id);
    console.log('Upload API: Job ID type:', typeof id);
    console.log('Upload API: Job ID length:', id?.length);
    console.log('Upload API: Job ID value:', id);
    
    // Validate that the ID is not empty
    if (!id || id.trim() === '') {
      console.log('Upload API: Empty job ID');
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Upload API: Parsing form data...');
    let formData: FormData;
    let files: File[];
    try {
      formData = await request.formData();
      files = formData.getAll('files') as File[];
      console.log('Upload API: Received files:', files.length);
      console.log('Upload API: File names:', files.map(f => f.name));
      console.log('Upload API: File types:', files.map(f => f.type));
    } catch (formError) {
      console.error('Upload API: Error parsing form data:', formError);
      return NextResponse.json(
        { error: 'Failed to parse uploaded files' },
        { status: 400 }
      );
    }
    
    if (!files || files.length === 0) {
      console.log('Upload API: No files received');
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Try to connect to database (optional)
    let job = null;
    let dbConnected = false;
    try {
      console.log('Upload API: Connecting to database...');
      await dbConnect();
      console.log('Upload API: Database connected');
      dbConnected = true;
      
      // Try to find the job - handle both MongoDB ObjectIds and mock IDs
      const isMongoObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      console.log('Upload API: Is MongoDB ObjectId:', isMongoObjectId);
      
      if (isMongoObjectId) {
        // Valid MongoDB ObjectId format
        console.log('Upload API: Searching by MongoDB ObjectId');
        job = await Job.findById(id);
        console.log('Upload API: Job found by ObjectId:', !!job);
        
        // If not found by ObjectId, try as string (in case it's a string representation)
        if (!job) {
          console.log('Upload API: Job not found by ObjectId, trying as string');
          job = await Job.findOne({ _id: id.toString() });
          console.log('Upload API: Job found by string:', !!job);
        }
      } else {
        // Mock ID or other format - try to find by _id as string
        console.log('Upload API: Searching by string ID');
        job = await Job.findOne({ _id: id });
        console.log('Upload API: Job found by string ID:', !!job);
      }
      
      if (!job) {
        console.log('Upload API: Job not found in database, ID:', id);
        console.log('Upload API: This might be a timing issue or the job was not saved to database');
        
        // Try one more time with a small delay in case it's a timing issue
        console.log('Upload API: Retrying with delay...');
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
    } catch (dbError) {
      console.error('Upload API: Database connection or job lookup failed:', dbError);
      console.log('Upload API: Continuing with file upload only (no database operations)');
      dbConnected = false;
    }

    // Always proceed with file upload
    console.log('Upload API: Processing files for upload');
    
    // For serverless environments like Vercel, we'll store file info in the database
    // but not actually write files to the filesystem
    const uploadedFiles = [];

    for (const file of files) {
      console.log('Upload API: Processing file:', file.name, 'Type:', file.type);
      if (file.type !== 'application/pdf') {
        console.log('Upload API: Skipping non-PDF file:', file.name);
        continue; // Skip non-PDF files
      }

      try {
        console.log('Upload API: Converting file to buffer...');
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        console.log('Upload API: File converted, size:', buffer.length);
        
        // In serverless environment, we don't write to filesystem
        // Instead, we store the file metadata and optionally the content
        const filename = `${Date.now()}-${file.name}`;
        
        console.log('Upload API: File processed successfully:', filename);
        
        uploadedFiles.push({
          filename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          uploadedAt: new Date(),
          // Store the file content as base64 for serverless environments
          content: buffer.toString('base64')
        });
      } catch (fileError) {
        console.error('Upload API: Error processing file:', file.name, fileError);
        // Continue with other files
      }
    }

    console.log('Upload API: Files processed, count:', uploadedFiles.length);

    // Only update the database if the job exists and database is connected
    if (job && dbConnected) {
      console.log('Upload API: Files uploaded, updating job with documents');
      console.log('Upload API: Current job documents:', job.documents?.length || 0);
      try {
        // Update job with new documents
        job.documents = [...(job.documents || []), ...uploadedFiles];
        console.log('Upload API: Updated job documents count:', job.documents.length);
        await job.save();
        console.log('Upload API: Job updated successfully in database');
      } catch (saveError) {
        console.error('Upload API: Error saving job:', saveError);
        console.log('Upload API: Continuing without database update');
      }
    } else {
      console.log('Upload API: Files uploaded, database not updated (job not found or db not connected)');
    }

    console.log('Upload API: Upload completed successfully');
    console.log('=== UPLOAD API END ===');
    return NextResponse.json({ 
      message: 'Files uploaded successfully',
      uploadedFiles,
      jobUpdated: !!(job && dbConnected),
      jobFound: !!job,
      filesUploaded: uploadedFiles.length,
      dbConnected
    });
  } catch (error) {
    console.error('=== UPLOAD API ERROR ===');
    console.error('Upload API: Error uploading files:', error);
    console.error('Upload API: Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Upload API: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('=== UPLOAD API ERROR END ===');
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 