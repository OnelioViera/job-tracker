import { NextResponse } from 'next/server';
import dbConnect, { useMockData } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('=== MongoDB Connection Test ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length || 0);
    
    if (process.env.MONGODB_URI) {
      console.log('MONGODB_URI starts with:', process.env.MONGODB_URI.substring(0, 20) + '...');
    }
    
    // Test the connection
    const connectionPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 10000)
    );
    
    try {
      await Promise.race([connectionPromise, timeoutPromise]);
      console.log('✅ MongoDB connection successful');
      
      return NextResponse.json({
        status: 'success',
        message: 'MongoDB connected successfully',
        useMockData: false,
        environment: process.env.NODE_ENV,
        uriExists: !!process.env.MONGODB_URI,
        uriLength: process.env.MONGODB_URI?.length || 0
      });
    } catch (error) {
      console.log('❌ MongoDB connection failed:', error);
      console.log('Using mock data:', useMockData);
      
      return NextResponse.json({
        status: 'error',
        message: 'MongoDB connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        useMockData: useMockData,
        environment: process.env.NODE_ENV,
        uriExists: !!process.env.MONGODB_URI,
        uriLength: process.env.MONGODB_URI?.length || 0
      });
    }
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Test endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 