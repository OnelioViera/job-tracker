import { IJob } from '../models/Job';

/**
 * Sort jobs by status: Pending -> In Progress -> Completed
 * @param jobs Array of jobs to sort
 * @returns Sorted array of jobs
 */
export const sortJobsByStatus = (jobs: IJob[]): IJob[] => {
  return [...jobs].sort((a, b) => {
    const getStatusPriority = (job: IJob) => {
      if (job.completedDate && job.completedDate !== null) return 3; // Completed - lowest priority
      if (job.startDate && job.startDate !== null) return 2; // In Progress - medium priority
      return 1; // Pending - highest priority
    };
    
    const statusA = getStatusPriority(a);
    const statusB = getStatusPriority(b);
    
    return statusA - statusB;
  });
}; 