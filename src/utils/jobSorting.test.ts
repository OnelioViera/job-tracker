import { sortJobsByStatus } from './jobSorting';
import { IJob } from '../models/Job';

// Mock jobs for testing
const mockJobs: IJob[] = [
  {
    _id: '1',
    customer: 'Company A',
    jobName: 'Completed Job',
    jobNumber: 'JOB-001',
    projectManager: 'John Doe',
    startDate: new Date('2024-01-01'),
    completedDate: new Date('2024-03-01'),
    priority: 'High',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    customer: 'Company B',
    jobName: 'Pending Job',
    jobNumber: 'JOB-002',
    projectManager: 'Jane Smith',
    priority: 'Medium',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    customer: 'Company C',
    jobName: 'In Progress Job',
    jobNumber: 'JOB-003',
    projectManager: 'Bob Johnson',
    startDate: new Date('2024-02-01'),
    priority: 'Low',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

describe('sortJobsByStatus', () => {
  it('should sort jobs by status: Pending -> In Progress -> Completed', () => {
    const sortedJobs = sortJobsByStatus(mockJobs);
    
    // Check that jobs are sorted correctly
    expect(sortedJobs[0].jobName).toBe('Pending Job'); // Should be first (Pending)
    expect(sortedJobs[1].jobName).toBe('In Progress Job'); // Should be second (In Progress)
    expect(sortedJobs[2].jobName).toBe('Completed Job'); // Should be last (Completed)
  });

  it('should handle jobs with null dates correctly', () => {
    const jobsWithNullDates: IJob[] = [
      {
        _id: '1',
        customer: 'Company A',
        jobName: 'Job with null startDate',
        jobNumber: 'JOB-001',
        projectManager: 'John Doe',
        startDate: null,
        priority: 'High',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        customer: 'Company B',
        jobName: 'Job with startDate',
        jobNumber: 'JOB-002',
        projectManager: 'Jane Smith',
        startDate: new Date('2024-01-01'),
        priority: 'Medium',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const sortedJobs = sortJobsByStatus(jobsWithNullDates);
    
    // Job with null startDate should be first (Pending)
    expect(sortedJobs[0].jobName).toBe('Job with null startDate');
    // Job with startDate should be second (In Progress)
    expect(sortedJobs[1].jobName).toBe('Job with startDate');
  });

  it('should not modify the original array', () => {
    const originalJobs = [...mockJobs];
    const sortedJobs = sortJobsByStatus(mockJobs);
    
    // Original array should remain unchanged
    expect(mockJobs).toEqual(originalJobs);
    // Sorted array should be different
    expect(sortedJobs).not.toEqual(originalJobs);
  });
}); 