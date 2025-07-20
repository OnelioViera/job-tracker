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
  // If we have a valid cached connection, use it
  if (cached && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    useMockData = false;
    return cached;
  }

  // If connection was attempted and failed, but we have a valid connection now, reset
  if (connectionAttempted && mongoose.connection.readyState === 1) {
    console.log('MongoDB connection is now valid, resetting mock data flag');
    useMockData = false;
    cached = mongoose;
    return cached;
  }

  // If we previously failed and don't have a valid connection, use mock data
  if (connectionAttempted && mongoose.connection.readyState !== 1) {
    console.log('Using mock data (connection previously failed)');
    useMockData = true;
    return {} as typeof mongoose;
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