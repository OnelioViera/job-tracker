import React, { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { JobDocuments } from './JobDocuments';
import { IJob } from '../models/Job';
import { sortJobsByStatus } from '../utils/jobSorting';

interface JobListProps {
  jobs: IJob[];
  onDeleteJob: (jobId: string) => void;
  onEditJob: (jobId: string) => void;
}

export const JobList: React.FC<JobListProps> = ({ jobs, onDeleteJob, onEditJob }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; jobId: string | null; jobName: string }>({
    isOpen: false,
    jobId: null,
    jobName: ''
  });

  const currentJobs = jobs.filter(job => !job.completedDate || job.completedDate === null);
  const completedJobs = jobs.filter(job => job.completedDate && job.completedDate !== null);

  const sortedCurrentJobs = sortJobsByStatus(currentJobs);
  const sortedCompletedJobs = sortJobsByStatus(completedJobs);

  const handleDeleteClick = (jobId: string, jobName: string) => {
    setDeleteConfirm({
      isOpen: true,
      jobId: jobId,
      jobName: jobName
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.jobId) {
      onDeleteJob(deleteConfirm.jobId);
    }
  };

  const handleCloseConfirm = () => {
    setDeleteConfirm({
      isOpen: false,
      jobId: null,
      jobName: ''
    });
  };

  const renderJobTable = (jobList: IJob[], title: string, isCompleted: boolean = false) => {
    if (jobList.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
        <div className="w-full">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 w-1/9">Customer</th>
                <th className="border px-2 py-1 w-2/9">Job Name</th>
                <th className="border px-2 py-1 w-1/9">Job #</th>
                <th className="border px-2 py-1 w-1/9">Project Manager</th>
                <th className="border px-2 py-1 w-1/9">Start Date</th>
                <th className="border px-2 py-1 w-1/9">Completed Date</th>
                <th className="border px-2 py-1 w-1/9">Priority</th>
                <th className="border px-2 py-1 w-1/9">Documents</th>
                <th className="border px-2 py-1 w-1/9">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobList.map((job) => (
                <tr key={job._id} className={`even:bg-gray-50 ${isCompleted ? 'opacity-75' : ''}`}>
                  <td className="border px-2 py-1 truncate">{job.customer}</td>
                  <td className="border px-2 py-1 truncate">{job.jobName}</td>
                  <td className="border px-2 py-1 truncate">{job.jobNumber}</td>
                  <td className="border px-2 py-1 truncate">{job.projectManager || 'Not assigned'}</td>
                  <td className="border px-2 py-1 truncate">{job.startDate && job.startDate !== null ? new Date(job.startDate).toLocaleDateString() : ''}</td>
                  <td className="border px-2 py-1 truncate">{job.completedDate && job.completedDate !== null ? new Date(job.completedDate).toLocaleDateString() : ''}</td>
                  <td className="border px-2 py-1 font-bold">
                    <span className={
                      job.priority === 'High' ? 'text-red-700' : job.priority === 'Medium' ? 'text-yellow-800' : 'text-green-800'
                    }>
                      {job.priority}
                    </span>
                  </td>
                  <td className="border px-2 py-1">
                    <JobDocuments job={job} />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        className="text-blue-600 hover:text-blue-800 font-bold"
                        onClick={() => onEditJob(job._id!)}
                        title="Edit job"
                      >
                        ✏️
                      </button>
                      <button
                        className="text-red-700 hover:text-red-900 font-bold"
                        onClick={() => handleDeleteClick(job._id!, job.jobName)}
                        title="Delete job"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (jobs.length === 0) {
    return <div className="text-gray-900 mt-4">No jobs added yet.</div>;
  }

  return (
    <div className="mt-8 w-full">
      {renderJobTable(sortedCurrentJobs, 'Current Jobs')}
      {renderJobTable(sortedCompletedJobs, 'Completed Jobs', true)}
      
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        title="Delete Job"
        message={`Are you sure you want to delete "${deleteConfirm.jobName}"? This action cannot be undone.`}
        confirmText="Yes, Delete Job"
        cancelText="Cancel"
      />
    </div>
  );
}; 