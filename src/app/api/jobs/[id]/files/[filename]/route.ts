import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  try {
    const { id, filename } = await params;
    
    // Validate that the ID is not empty
    if (!id || id.trim() === '') {
      console.log('File download: Empty job ID');
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // First try to get the file from the database (for serverless environments)
    try {
      await dbConnect();
      
      // Try to find the job - handle both MongoDB ObjectIds and mock IDs
      let job;
      const isMongoObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      
      if (isMongoObjectId) {
        job = await Job.findById(id);
      } else {
        job = await Job.findOne({ _id: id });
      }
      
      if (job) {
        // Look for the file in the job's documents
        const document = job.documents?.find((doc: any) => doc.filename === filename);
        if (document && document.content) {
          console.log('File download: Found file in database');
          // Convert base64 content back to buffer
          const buffer = Buffer.from(document.content, 'base64');
          
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': document.mimeType || 'application/pdf',
              'Content-Disposition': `attachment; filename="${document.originalName}"`,
              'Cache-Control': 'no-cache',
            },
          });
        }
      }
    } catch (dbError) {
      console.log('File download: Database lookup failed, trying filesystem');
    }
    
    // Fallback to filesystem (for local development)
    const filePath = join(process.cwd(), 'public', 'uploads', id, filename);
    
    // Check if file exists
    if (!existsSync(filePath)) {
      console.log('File download: File not found:', filePath);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: unknown) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
} 