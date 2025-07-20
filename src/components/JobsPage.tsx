import React, { useState } from 'react';
import { Job } from './JobForm';
import { JobList } from './JobList';
import { JobModal } from './JobModal';
import { IJob } from '../models/Job';

interface JobsPageProps {
  jobs: IJob[];
  onAddJob: (job: Job) => Promise<IJob>;
  onDeleteJob: (jobId: string) => void;
  onUpdateJob: (jobId: string, job: Job) => void;
  onJobUpdated?: (job: IJob) => void;
  projectManagers: string[];
  onAddProjectManager: (manager: string) => void;
  onDeleteProjectManager: (manager: string) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({ 
  jobs, 
  onAddJob, 
  onDeleteJob, 
  onUpdateJob, 
  onJobUpdated,
  projectManagers, 
  onAddProjectManager, 
  onDeleteProjectManager 
}) => {
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditJob = (jobId: string) => {
    const job = jobs.find(j => j._id === jobId);
    if (job) {
      // Convert IJob to Job interface
      const jobForEdit: Job = {
        customer: job.customer,
        jobName: job.jobName,
        jobNumber: job.jobNumber,
        projectManager: job.projectManager,
        startDate: job.startDate,
        finishedDate: job.finishedDate || null,
        completedDate: job.completedDate || null,
        priority: job.priority,
      };
      setEditingJob(jobForEdit);
      setEditingJobId(jobId);
      setIsModalOpen(true);
    }
  };

  const handleUpdateJob = (updatedJob: Job) => {
    if (editingJobId) {
      onUpdateJob(editingJobId, updatedJob);
      setEditingJob(null);
      setEditingJobId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingJob(null);
    setEditingJobId(null);
  };

  const handleOpenAddModal = () => {
    setEditingJob(null);
    setEditingJobId(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
    setEditingJobId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Jobs</h2>
        <p className="text-gray-600">Add new jobs and manage existing ones</p>
      </div>
      
      <div className="mb-6">
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Add New Job
        </button>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Job List</h3>
        <JobList 
          jobs={jobs} 
          onDeleteJob={onDeleteJob}
          onEditJob={handleEditJob}
        />
      </div>

      <JobModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isEditing={!!editingJob}
        editingJob={editingJob}
        editingJobId={editingJobId}
        onAddJob={onAddJob}
        onUpdateJob={handleUpdateJob}
        onCancelEdit={handleCancelEdit}
        projectManagers={projectManagers}
        onAddProjectManager={onAddProjectManager}
        onDeleteProjectManager={onDeleteProjectManager}
        onJobUpdated={onJobUpdated}
      />
    </div>
  );
}; 