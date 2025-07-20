import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

console.log('MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached: typeof mongoose | null = null;
let useMockData = false;
let connectionAttempted = false;

async function dbConnect() {
  // If we've already determined we should use mock data, return immediately
  if (connectionAttempted && useMockData) {
    console.log('Using mock data (connection previously failed)');
    return {} as typeof mongoose;
  }

  if (cached && !useMockData) {
    console.log('Using cached MongoDB connection');
    return cached;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    connectionAttempted = true;
    
    // Set a shorter timeout for the connection
    const connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };
    
    cached = await mongoose.connect(MONGODB_URI, connectionOptions);
    console.log('MongoDB connected successfully');
    useMockData = false;
    return cached;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Falling back to mock data mode');
    useMockData = true;
    cached = null; // Clear any failed connection
    // Return a mock connection object
    return {} as typeof mongoose;
  }
}

export { useMockData };
export default dbConnect; 