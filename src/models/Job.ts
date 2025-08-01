import mongoose from 'mongoose';

export interface IJob {
  _id?: string;
  customer: string;
  jobName: string;
  jobNumber: string;
  projectManager?: string;
  startDate?: Date | null;
  waitingSubmittalDate?: Date | null;
  finishedDate?: Date | null;
  completedDate?: Date | null;
  priority: 'High' | 'Medium' | 'Low';
  documents?: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
    content?: string; // Optional for serverless environments
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new mongoose.Schema<IJob>({
  customer: {
    type: String,
    required: [true, 'Customer is required'],
    trim: true,
  },
  jobName: {
    type: String,
    required: [true, 'Job name is required'],
    trim: true,
  },
  jobNumber: {
    type: String,
    required: [true, 'Job number is required'],
    trim: true,
  },
  projectManager: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
    required: false, // Allow null for pending jobs
  },
  waitingSubmittalDate: {
    type: Date,
    required: false,
  },
  finishedDate: {
    type: Date,
    required: false,
  },
  completedDate: {
    type: Date,
    required: false,
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Low',
  },
  documents: [{
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    content: {
      type: String,
      required: false, // Optional for serverless environments
    },
  }],
}, {
  timestamps: true,
});

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema); 