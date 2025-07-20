import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    console.log('=== Detailed MongoDB Debug ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MONGODB_URI exists:', !!MONGODB_URI);
    console.log('MONGODB_URI length:', MONGODB_URI?.length || 0);
    
    if (MONGODB_URI) {
      console.log('MONGODB_URI starts with:', MONGODB_URI.substring(0, 30) + '...');
      console.log('MONGODB_URI ends with:', '...' + MONGODB_URI.substring(MONGODB_URI.length - 20));
      
      // Check if URI contains database name
      const hasDatabase = MONGODB_URI.includes('/job-tracker');
      console.log('Contains database name:', hasDatabase);
    }
    
    if (!MONGODB_URI) {
      return NextResponse.json({
        status: 'error',
        message: 'MONGODB_URI is not defined',
        environment: process.env.NODE_ENV,
        allEnvVars: Object.keys(process.env).filter(key => key.includes('MONGODB'))
      });
    }
    
    // Test connection with detailed error handling
    try {
      console.log('Attempting to connect...');
      
      const connectionOptions = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      };
      
      await mongoose.connect(MONGODB_URI, connectionOptions);
      console.log('✅ Connection successful');
      
      // Test a simple operation
      let collections = 0;
      if (mongoose.connection.db) {
        collections = (await mongoose.connection.db.listCollections().toArray()).length;
      }
      console.log('Collections found:', collections);
      
      return NextResponse.json({
        status: 'success',
        message: 'MongoDB connected and tested successfully',
        environment: process.env.NODE_ENV,
        uriExists: true,
        uriLength: MONGODB_URI.length,
        hasDatabase: MONGODB_URI.includes('/job-tracker'),
        collections: collections,
        connectionState: mongoose.connection.readyState
      });
      
    } catch (error) {
      console.log('❌ Connection failed:', error);
      
      return NextResponse.json({
        status: 'error',
        message: 'MongoDB connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV,
        uriExists: true,
        uriLength: MONGODB_URI.length,
        hasDatabase: MONGODB_URI.includes('/job-tracker'),
        connectionState: mongoose.connection.readyState
      });
    }
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Debug endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 