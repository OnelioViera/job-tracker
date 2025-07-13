# Lindsay Precast Job Tracker

A comprehensive job tracking application built with Next.js, TypeScript, and MongoDB Atlas.

## Features

- **Job Management**: Add, edit, and delete jobs with customer information, job details, and project management
- **Priority Tracking**: Set and track job priorities (High, Medium, Low)
- **Date Management**: Track start, finished, and completed dates
- **Project Manager Management**: Add and remove project managers
- **Dashboard**: Overview of job statistics and recent activity
- **Statistics**: Detailed analytics with time period filtering (daily, weekly, monthly, yearly)
- **Database Integration**: MongoDB Atlas for persistent data storage

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas with Mongoose ODM
- **Date Picker**: react-datepicker
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd job-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Free tier is sufficient)

2. **Configure Database Access**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these securely)
   - Set privileges to "Read and write to any database"

3. **Configure Network Access**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, you can add "0.0.0.0/0" to allow all IPs
   - For production, add your specific IP addresses

4. **Get Connection String**:
   - Go to "Database" in the left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

### 4. Configure Environment Variables

1. **Create `.env.local` file**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Update the connection string**:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
   MONGODB_DB=job-tracker
   ```

   Replace:
   - `<username>`: Your MongoDB Atlas username
   - `<password>`: Your MongoDB Atlas password
   - `<cluster-url>`: Your cluster URL
   - `<database-name>`: Your database name (e.g., "job-tracker")

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Job Collection

```typescript
interface Job {
  _id?: string;
  customer: string;           // Required
  jobName: string;           // Required
  jobNumber: string;         // Required
  projectManager: string;    // Required
  startDate: Date;           // Required
  finishedDate?: Date;       // Optional
  completedDate?: Date;      // Optional
  priority: 'High' | 'Medium' | 'Low'; // Default: 'Low'
  createdAt: Date;          // Auto-generated
  updatedAt: Date;          // Auto-generated
}
```

## API Endpoints

- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create a new job
- `GET /api/jobs/[id]` - Get a specific job
- `PUT /api/jobs/[id]` - Update a job
- `DELETE /api/jobs/[id]` - Delete a job

## Features Overview

### Dashboard
- Total jobs count
- Completion rate
- In-progress jobs
- High priority jobs
- Recent jobs list

### Jobs Management
- Add new jobs with form validation
- Edit existing jobs
- Delete jobs with confirmation
- Project manager management
- Separate views for current and completed jobs

### Statistics
- Key performance metrics
- Priority distribution charts
- Time period completion trends (daily/weekly/monthly/yearly)
- Recent completions table

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy

### Environment Variables for Production

Make sure to set these in your production environment:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `MONGODB_DB`: Your database name

## Troubleshooting

### Common Issues

1. **Connection Error**: 
   - Verify your MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has correct permissions

2. **Build Errors**:
   - Make sure all dependencies are installed
   - Check TypeScript compilation errors
   - Verify environment variables are set

3. **Date Issues**:
   - Ensure dates are properly formatted
   - Check timezone settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
