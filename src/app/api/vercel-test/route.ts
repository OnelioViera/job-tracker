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
      timestamp: new Date().toISOString()
    });
  }
} 