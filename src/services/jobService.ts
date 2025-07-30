import { IJob } from '@/models/Job';

export interface JobData {
  customer: string;
  jobName: string;
  jobNumber: string;
  projectManager?: string;
  startDate?: string | null;
  finishedDate?: string | null;
  completedDate?: string | null;
  priority: 'High' | 'Medium' | 'Low';
}

export class JobService {
  static async getAllJobs(): Promise<IJob[]> {
    const response = await fetch('/api/jobs');
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    return response.json();
  }

  static async createJob(jobData: JobData): Promise<IJob> {
    console.log('Creating job with data:', JSON.stringify(jobData, null, 2));
    
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error('Failed to create job');
    }

    const result = await response.json();
    console.log('Created job:', result);
    return result;
  }

  static async updateJob(id: string, jobData: Partial<JobData>): Promise<IJob> {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      const errorData = await response.json() as { error: string };
      throw new Error(errorData.error || 'Failed to update job');
    }

    return response.json();
  }

  static async deleteJob(id: string): Promise<void> {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete job');
    }
  }

  static async getJob(id: string): Promise<IJob> {
    const response = await fetch(`/api/jobs/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }

    return response.json();
  }

  static async uploadFiles(jobId: string, files: File[]): Promise<Record<string, unknown>> {
    console.log('=== JOB SERVICE UPLOAD START ===');
    console.log('JobService: Starting file upload for job:', jobId);
    console.log('JobService: Files to upload:', files.map(f => f.name));
    console.log('JobService: Job ID type:', typeof jobId);
    console.log('JobService: Job ID length:', jobId?.length);
    console.log('JobService: Job ID value:', jobId);
    
    const formData = new FormData();
    files.forEach(file => {
      console.log('JobService: Adding file to FormData:', file.name, 'Size:', file.size);
      formData.append('files', file);
    });

    console.log('JobService: FormData created, making fetch request...');
    const response = await fetch(`/api/jobs/${jobId}/upload`, {
      method: 'POST',
      body: formData,
    });

    console.log('JobService: Upload response status:', response.status);
    console.log('JobService: Upload response ok:', response.ok);
    console.log('JobService: Upload response status text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('JobService: Upload error response:', errorText);
      console.error('JobService: Upload failed with status:', response.status);
      throw new Error(`Failed to upload files: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('JobService: Upload result:', result);
    console.log('=== JOB SERVICE UPLOAD END ===');
    return result;
  }

  static getFileDownloadUrl(jobId: string, filename: string): string {
    return `/api/jobs/${jobId}/files/${filename}`;
  }
} 