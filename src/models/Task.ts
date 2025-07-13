import mongoose from 'mongoose';

export interface ITask {
  _id?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo?: string;
  jobId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new mongoose.Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  dueDate: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Low',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
  },
  assignedTo: {
    type: String,
    trim: true,
  },
  jobId: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema); 