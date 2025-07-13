import { IJob } from "@/models/Job";

export interface JobData {
  customer: string;
  jobName: string;
  jobNumber: string;
  projectManager?: string;
  startDate: string;
  finishedDate?: string | null;
  completedDate?: string | null;
  priority: "High" | "Medium" | "Low";
}

export class JobService {
  static async getAllJobs(): Promise<IJob[]> {
    const response = await fetch("/api/jobs");
    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }
    return response.json();
  }

  static async createJob(jobData: JobData): Promise<IJob> {
    console.log("Creating job with data:", JSON.stringify(jobData, null, 2));

    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error:", errorText);
      throw new Error("Failed to create job");
    }

    const result = await response.json();
    console.log("Created job:", result);
    return result;
  }

  static async updateJob(id: string, jobData: Partial<JobData>): Promise<IJob> {
    const response = await fetch(`/api/jobs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      throw new Error("Failed to update job");
    }

    return response.json();
  }

  static async deleteJob(id: string): Promise<void> {
    const response = await fetch(`/api/jobs/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete job");
    }
  }

  static async getJob(id: string): Promise<IJob> {
    const response = await fetch(`/api/jobs/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch job");
    }

    return response.json();
  }

  static async uploadFiles(
    jobId: string,
    files: File[]
  ): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`/api/jobs/${jobId}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload files");
    }

    return response.json();
  }

  static getFileDownloadUrl(jobId: string, filename: string): string {
    return `/api/jobs/${jobId}/files/${filename}`;
  }
}
