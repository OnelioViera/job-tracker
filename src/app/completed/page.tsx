'use client';

import React, { useState, useEffect } from 'react';
import { IJob } from '../../models/Job';
import { JobService, JobData } from '../../services/jobService';
import { JobModal } from '../../components/JobModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { sortJobsByStatus } from '../../utils/jobSorting';
import { Job } from '../../components/JobForm';

interface ProgressEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: IJob | null;
  onUpdateJob: (jobId: string, updatedJobData: Partial<IJob>) => Promise<IJob>;
}

const ProgressEditModal: React.FC<ProgressEditModalProps> = ({ isOpen, onClose, job, onUpdateJob }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [currentJob, setCurrentJob] = useState<IJob | null>(null);

  useEffect(() => {
    if (job) {
      setCurrentJob(job);
      setUpdateSuccess(false);
    }
  }, [job]);

  if (!isOpen || !currentJob) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isUpdating) {
      onClose();
    }
  };

  const handleStatusUpdate = async (status: 'pending' | 'inProgress' | 'waitingSubmittal' | 'completed') => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setUpdateSuccess(false);
    
    const updatedData: Partial<IJob> = {};
    
    switch (status) {
      case 'pending':
        updatedData.startDate = null;
        updatedData.waitingSubmittalDate = null;
        updatedData.completedDate = null;
        break;
      case 'inProgress':
        updatedData.startDate = new Date();
        updatedData.waitingSubmittalDate = null;
        updatedData.completedDate = null;
        break;
      case 'waitingSubmittal':
        updatedData.startDate = currentJob.startDate || new Date();
        updatedData.waitingSubmittalDate = new Date();
        updatedData.completedDate = null;
        break;
      case 'completed':
        updatedData.startDate = currentJob.startDate || new Date();
        updatedData.waitingSubmittalDate = currentJob.waitingSubmittalDate || new Date();
        updatedData.completedDate = new Date();
        break;
    }
    
    try {
      if (onUpdateJob) {
        const result = await onUpdateJob(currentJob._id!, updatedData);
        if (result) {
          setCurrentJob(result);
        }
        setIsUpdating(false);
        setUpdateSuccess(true);
      } else {
        setIsUpdating(false);
        onClose();
      }
    } catch (error) {
      console.error('Error updating job:', error);
      setIsUpdating(false);
      onClose();
    }
  };

  const getCurrentStatus = () => {
    if (currentJob.completedDate && currentJob.completedDate !== null) {
      return 'completed';
    }
    if (currentJob.waitingSubmittalDate && currentJob.waitingSubmittalDate !== null) {
      return 'waitingSubmittal';
    }
    if (currentJob.startDate && currentJob.startDate !== null) {
      return 'inProgress';
    }
    return 'pending';
  };

  const currentStatus = getCurrentStatus();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Update Job Status - {currentJob.jobName}
            {isUpdating && (
              <span className="ml-2 text-sm text-gray-500">(Updating...)</span>
            )}
            {updateSuccess && (
              <span className="ml-2 text-sm text-green-500">✓ Updated successfully!</span>
            )}
          </h2>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className={`text-gray-400 hover:text-gray-600 text-2xl font-bold ${
              isUpdating ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Status:</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleStatusUpdate('pending')}
                  disabled={isUpdating}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    currentStatus === 'pending'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span className="font-medium">
                        {isUpdating ? 'Updating...' : 'Pending'}
                      </span>
                    </div>
                    {currentStatus === 'pending' && !isUpdating && (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isUpdating && (
                      <svg className="w-5 h-5 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 ml-7">Job has not started yet</p>
                </button>

                <button
                  onClick={() => handleStatusUpdate('inProgress')}
                  disabled={isUpdating}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    currentStatus === 'inProgress'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <span className="font-medium">
                        {isUpdating ? 'Updating...' : 'In Progress'}
                      </span>
                    </div>
                    {currentStatus === 'inProgress' && !isUpdating && (
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isUpdating && (
                      <svg className="w-5 h-5 animate-spin text-yellow-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 ml-7">Work has started on this job</p>
                </button>

                <button
                  onClick={() => handleStatusUpdate('waitingSubmittal')}
                  disabled={isUpdating}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    currentStatus === 'waitingSubmittal'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                      <span className="font-medium">
                        {isUpdating ? 'Updating...' : 'Waiting Submittal'}
                      </span>
                    </div>
                    {currentStatus === 'waitingSubmittal' && !isUpdating && (
                      <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isUpdating && (
                      <svg className="w-5 h-5 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 ml-7">Waiting for submittal approval</p>
                </button>

                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={isUpdating}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    currentStatus === 'completed'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span className="font-medium">
                        {isUpdating ? 'Updating...' : 'Completed'}
                      </span>
                    </div>
                    {currentStatus === 'completed' && !isUpdating && (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isUpdating && (
                      <svg className="w-5 h-5 animate-spin text-green-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 ml-7">Job has been finished</p>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                updateSuccess 
                  ? 'text-white bg-green-600 hover:bg-green-700' 
                  : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
              } ${
                isUpdating ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              {updateSuccess ? 'Close' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CompletedJobsPage() {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<IJob | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [editingJobForModal, setEditingJobForModal] = useState<Job | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; jobId: string | null; jobName: string }>({
    isOpen: false,
    jobId: null,
    jobName: ''
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const fetchedJobs = await JobService.getAllJobs();
      // Filter to only show completed jobs
      const completedJobs = fetchedJobs.filter(job => job.completedDate && job.completedDate !== null);
      setJobs(completedJobs);
      setError(null);
    } catch (err) {
      setError('Failed to load completed jobs');
      console.error('Error loading completed jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJob = async (jobId: string, updatedJobData: Partial<IJob>) => {
    try {
      // Convert IJob interface to JobData for database
      const jobForDb: Partial<JobData> = {};
      if (updatedJobData.customer !== undefined) jobForDb.customer = updatedJobData.customer;
      if (updatedJobData.jobName !== undefined) jobForDb.jobName = updatedJobData.jobName;
      if (updatedJobData.jobNumber !== undefined) jobForDb.jobNumber = updatedJobData.jobNumber;
      if (updatedJobData.projectManager !== undefined) {
        if (updatedJobData.projectManager && updatedJobData.projectManager.trim() !== '') {
          jobForDb.projectManager = updatedJobData.projectManager;
        } else {
          jobForDb.projectManager = undefined;
        }
      }
      if (updatedJobData.startDate !== undefined) {
        if (updatedJobData.startDate instanceof Date) {
          jobForDb.startDate = updatedJobData.startDate.toISOString();
        } else if (updatedJobData.startDate === null || updatedJobData.startDate === undefined) {
          jobForDb.startDate = null;
        } else if (updatedJobData.startDate !== undefined) {
          jobForDb.startDate = updatedJobData.startDate as string;
        }
      }
      if (updatedJobData.waitingSubmittalDate !== undefined) {
        if (updatedJobData.waitingSubmittalDate instanceof Date) {
          jobForDb.waitingSubmittalDate = updatedJobData.waitingSubmittalDate.toISOString();
        } else if (updatedJobData.waitingSubmittalDate === null || updatedJobData.waitingSubmittalDate === undefined) {
          jobForDb.waitingSubmittalDate = null;
        } else if (updatedJobData.waitingSubmittalDate !== undefined) {
          jobForDb.waitingSubmittalDate = updatedJobData.waitingSubmittalDate as string;
        }
      }
      if (updatedJobData.finishedDate !== undefined) {
        if (updatedJobData.finishedDate instanceof Date) {
          jobForDb.finishedDate = updatedJobData.finishedDate.toISOString();
        } else if (updatedJobData.finishedDate === null || updatedJobData.finishedDate === undefined) {
          jobForDb.finishedDate = null;
        } else if (updatedJobData.finishedDate !== undefined) {
          jobForDb.finishedDate = updatedJobData.finishedDate as string;
        }
      }
      if (updatedJobData.completedDate !== undefined) {
        if (updatedJobData.completedDate instanceof Date) {
          jobForDb.completedDate = updatedJobData.completedDate.toISOString();
        } else if (updatedJobData.completedDate === null || updatedJobData.completedDate === undefined) {
          jobForDb.completedDate = null;
        } else if (updatedJobData.completedDate !== undefined) {
          jobForDb.completedDate = updatedJobData.completedDate as string;
        }
      }
      if (updatedJobData.priority !== undefined) jobForDb.priority = updatedJobData.priority;

      const updatedJob = await JobService.updateJob(jobId, jobForDb);
      setJobs((prev) => prev.map((job) => job._id === jobId ? updatedJob : job));
      return updatedJob;
    } catch (err) {
      setError('Failed to update job');
      console.error('Error updating job:', err);
      throw err;
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await JobService.deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      setError('Failed to delete job');
      console.error('Error deleting job:', err);
    }
  };

  const handleEditProgress = (job: IJob) => {
    setEditingJob(job);
    setIsProgressModalOpen(true);
  };

  const handleCloseProgressModal = () => {
    setIsProgressModalOpen(false);
    setEditingJob(null);
  };

  const handleEditJob = (jobId: string) => {
    const job = jobs.find(j => j._id === jobId);
    if (job) {
      const jobForEdit: Job = {
        customer: job.customer,
        jobName: job.jobName,
        jobNumber: job.jobNumber,
        projectManager: job.projectManager,
        priority: job.priority,
      };
      setEditingJobForModal(jobForEdit);
      setEditingJobId(jobId);
      setIsJobModalOpen(true);
    }
  };

  const handleUpdateJobDetails = (updatedJob: Job) => {
    if (editingJobId && handleUpdateJob) {
      const jobForUpdate: Partial<IJob> = {
        customer: updatedJob.customer,
        jobName: updatedJob.jobName,
        jobNumber: updatedJob.jobNumber,
        projectManager: updatedJob.projectManager,
        priority: updatedJob.priority,
      };
      handleUpdateJob(editingJobId, jobForUpdate);
      setEditingJobForModal(null);
      setEditingJobId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingJobForModal(null);
    setEditingJobId(null);
  };

  const handleCloseJobModal = () => {
    setIsJobModalOpen(false);
    setEditingJobForModal(null);
    setEditingJobId(null);
  };

  const handleDeleteClick = (jobId: string, jobName: string) => {
    setDeleteConfirm({
      isOpen: true,
      jobId: jobId,
      jobName: jobName
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.jobId && handleDeleteJob) {
      handleDeleteJob(deleteConfirm.jobId);
    }
    setDeleteConfirm({
      isOpen: false,
      jobId: null,
      jobName: ''
    });
  };

  const handleCloseConfirm = () => {
    setDeleteConfirm({
      isOpen: false,
      jobId: null,
      jobName: ''
    });
  };

  const getJobStatus = (job: IJob) => {
    if (job.completedDate && job.completedDate !== null) return 'Completed';
    if (job.waitingSubmittalDate && job.waitingSubmittalDate !== null) return 'Waiting Submittal';
    if (job.startDate && job.startDate !== null) return 'In Progress';
    return 'Pending';
  };

  const getStatusColor = (job: IJob) => {
    if (job.completedDate && job.completedDate !== null) return 'bg-green-100 text-green-800';
    if (job.waitingSubmittalDate && job.waitingSubmittalDate !== null) return 'bg-orange-100 text-orange-800';
    if (job.startDate && job.startDate !== null) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const renderJobRow = (job: IJob) => (
    <tr 
      key={job._id} 
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => handleEditProgress(job)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{job.jobName}</div>
        <div className="text-sm text-gray-500">#{job.jobNumber}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.customer}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {job.projectManager || 'Not assigned'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          job.priority === 'High' ? 'bg-red-100 text-red-800' :
          job.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {job.priority}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job)}`}>
          {getJobStatus(job)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex gap-2 justify-center">
          <button
            className="text-blue-600 hover:text-blue-800 font-bold"
            onClick={(e) => {
              e.stopPropagation();
              handleEditJob(job._id!);
            }}
            title="Edit job"
          >
            ✏️
          </button>
          <button
            className="text-red-700 hover:text-red-900 font-bold"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(job._id!, job.jobName);
            }}
            title="Delete job"
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading completed jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadJobs}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Completed Jobs</h1>
          <p className="text-gray-600 mt-2">View and manage all completed jobs</p>
        </div>

        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Completed Jobs ({jobs.length})</h3>
          </div>
          <div className="overflow-x-auto">
            {jobs.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Manager</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortJobsByStatus(jobs).map((job) => renderJobRow(job))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-8 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">No completed jobs found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProgressEditModal
        isOpen={isProgressModalOpen}
        onClose={handleCloseProgressModal}
        job={editingJob}
        onUpdateJob={handleUpdateJob}
      />

      <JobModal
        isOpen={isJobModalOpen}
        onClose={handleCloseJobModal}
        isEditing={!!editingJobForModal}
        editingJob={editingJobForModal}
        editingJobId={editingJobId}
        onAddJob={async () => ({} as IJob)}
        onUpdateJob={handleUpdateJobDetails}
        onCancelEdit={handleCancelEdit}
        projectManagers={[]}
        onAddProjectManager={() => {}}
        onDeleteProjectManager={() => {}}
        onJobUpdated={() => {}}
      />

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
} 