import { NextResponse } from 'next/server';
import dbConnect, { useMockData } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('=== Vercel MongoDB Test ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length || 0);
    
    if (process.env.MONGODB_URI) {
      console.log('MONGODB_URI starts with:', process.env.MONGODB_URI.substring(0, 30) + '...');
      console.log('MONGODB_URI ends with:', '...' + process.env.MONGODB_URI.substring(process.env.MONGODB_URI.length - 20));
      
      // Check if URI contains database name
      const hasDatabase = process.env.MONGODB_URI.includes('/job-tracker');
      console.log('Contains database name:', hasDatabase);
      
      // Check if URI has proper format
      const isProperFormat = process.env.MONGODB_URI.includes('mongodb+srv://') && 
                            process.env.MONGODB_URI.includes('@cluster0.vnvheh3.mongodb.net/');
      console.log('Has proper format:', isProperFormat);
    }
    
    // Test the connection
    await dbConnect();
    
    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connection test completed',
      useMockData: useMockData,
      environment: process.env.NODE_ENV,
      uriExists: !!process.env.MONGODB_URI,
      uriLength: process.env.MONGODB_URI?.length || 0,
      hasDatabase: process.env.MONGODB_URI?.includes('/job-tracker') || false,
      hasProperFormat: process.env.MONGODB_URI?.includes('mongodb+srv://') && 
                      process.env.MONGODB_URI?.includes('@cluster0.vnvheh3.mongodb.net/') || false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Vercel test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'MongoDB connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      useMockData: useMockData,
      environment: process.env.NODE_ENV,
      uriExists: !!process.env.MONGODB_URI,
      uriLength: process.env.MONGODB_URI?.length || 0,
      hasDatabase: process.env.MONGODB_URI?.includes('/job-tracker') || false,
      hasProperFormat: process.env.MONGODB_URI?.includes('mongodb+srv://') && 
                      process.env.MONGODB_URI?.includes('@cluster0.vnvheh3.mongodb.net/') || false,
      timestamp: new Date().toISOString()
    });
  }
} 