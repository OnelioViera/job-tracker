import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

console.log('MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');
console.log('Environment:', process.env.NODE_ENV);

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  throw new Error('Please define the MONGODB_URI environment variable');
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
    console.log('URI length:', MONGODB_URI.length);
    connectionAttempted = true;
    
    // Set connection options
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
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