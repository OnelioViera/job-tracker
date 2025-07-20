# MongoDB Setup Guide

## Current Issue
The application is currently using mock data because the MongoDB Atlas connection is failing. The error indicates that the cluster `cluster0.pbjgwoh.mongodb.net` cannot be found.

## Solutions

### Option 1: Use MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account or sign in
3. Create a new cluster (free tier is sufficient)
4. Get your connection string from the cluster
5. Update your `.env.local` file with the new connection string

### Option 2: Use Local MongoDB
1. Install MongoDB locally:
   ```bash
   # On macOS with Homebrew
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Start MongoDB
   brew services start mongodb/brew/mongodb-community
   ```

2. Update your `.env.local` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/job-tracker
   MONGODB_DB=job-tracker
   ```

### Option 3: Use MongoDB Atlas Free Tier
1. Go to MongoDB Atlas
2. Create a free cluster
3. Get the connection string
4. Replace the current connection string in `.env.local`

## Current Status
The application is working with mock data, so you can continue developing and testing. When you're ready to use real data, follow one of the options above.

## Testing the Connection
After updating the connection string, restart the development server:
```bash
npm run dev
```

The application will automatically switch between mock data and real MongoDB data based on connection success. 