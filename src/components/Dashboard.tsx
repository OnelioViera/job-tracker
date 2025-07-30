import React, { useState, useEffect } from 'react';
import { IJob } from '../models/Job';
import { ITask } from '../models/Task';
import { JobService } from '../services/jobService';
import { Job } from './JobForm';
import { JobModal } from './JobModal';
import { ConfirmDialog } from './ConfirmDialog';

interface DashboardProps {
  jobs: IJob[];
  tasks: ITask[];
  onUpdateJob?: (jobId: string, updatedJobData: Partial<IJob>) => Promise<IJob>;
  onAddJob?: (job: Job) => Promise<IJob>;
  onDeleteJob?: (jobId: string) => void;
  onJobUpdated?: (job: IJob) => void;
  projectManagers?: string[];
  onAddProjectManager?: (manager: string) => void;
  onDeleteProjectManager?: (manager: string) => void;
}

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: IJob | null;
}

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

  console.log('ProgressEditModal: Rendering with job:', job);
  console.log('ProgressEditModal: isOpen:', isOpen);

  // Update currentJob when job prop changes
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

  const handleStatusUpdate = async (status: 'pending' | 'inProgress' | 'completed') => {
    if (isUpdating) return; // Prevent multiple clicks
    
    console.log('ProgressEditModal: handleStatusUpdate called with status:', status);
    console.log('ProgressEditModal: Current job:', currentJob);
    
    setIsUpdating(true);
    setUpdateSuccess(false);
    
    const updatedData: Partial<IJob> = {};
    
    switch (status) {
      case 'pending':
        // Clear both start and completed dates by setting them to null
        updatedData.startDate = null;
        updatedData.completedDate = null;
        break;
      case 'inProgress':
        // Set start date to today if not already set, clear completed date
        updatedData.startDate = new Date();
        updatedData.completedDate = null; // Explicitly clear completed date
        break;
      case 'completed':
        // Set start date to today if not already set, set completed date to today
        updatedData.startDate = currentJob.startDate || new Date();
        updatedData.completedDate = new Date();
        break;
    }
    
    console.log('ProgressEditModal: Updated data to send:', updatedData);
    
    try {
      if (onUpdateJob) {
        const result = await onUpdateJob(currentJob._id!, updatedData);
        console.log('ProgressEditModal: onUpdateJob completed successfully', result);
        
        // Update the current job with the result
        if (result) {
          setCurrentJob(result);
        }
        
        // Show success state
        setIsUpdating(false);
        setUpdateSuccess(true);
        // Don't close the modal immediately - let the user see the change
        // onClose(); // Removed immediate close
      } else {
        console.log('ProgressEditModal: onUpdateJob is undefined');
        setIsUpdating(false);
        onClose();
      }
    } catch (error) {
      console.error('ProgressEditModal: Error updating job:', error);
      setIsUpdating(false);
      onClose();
    }
  };

  const getCurrentStatus = () => {
    console.log('Dashboard: getCurrentStatus called for job:', currentJob);
    console.log('Dashboard: job.startDate:', currentJob.startDate);
    console.log('Dashboard: job.completedDate:', currentJob.completedDate);
    
    // Check for completed status first (has completedDate)
    if (currentJob.completedDate && currentJob.completedDate !== null) {
      console.log('Dashboard: Status is completed');
      return 'completed';
    }
    // Check for in progress status (has startDate but no completedDate)
    if (currentJob.startDate && currentJob.startDate !== null) {
      console.log('Dashboard: Status is inProgress');
      return 'inProgress';
    }
    // Default to pending (no startDate or completedDate)
    console.log('Dashboard: Status is pending');
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
              {updateSuccess ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PDFModal: React.FC<PDFModalProps> = ({ isOpen, onClose, job }) => {
  if (!isOpen || !job) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = (filename: string, originalName: string) => {
    const downloadUrl = JobService.getFileDownloadUrl(job._id!, filename);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            PDF Documents - {job.jobName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          {job.documents && job.documents.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                {job.documents.length} document{job.documents.length !== 1 ? 's' : ''} uploaded
              </p>
              {job.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.originalName}</p>
                      <p className="text-xs text-gray-500">
                        {(doc.size / 1024).toFixed(1)} KB • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(doc.filename, doc.originalName)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-100 rounded-lg inline-block mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">No PDF documents uploaded for this job</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  jobs, 
  onUpdateJob,
  onAddJob,
  onDeleteJob,
  onJobUpdated,
  projectManagers = [],
  onAddProjectManager,
  onDeleteProjectManager
}) => {
  const [selectedJob, setSelectedJob] = useState<IJob | null>(null);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<IJob | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobForModal, setEditingJobForModal] = useState<Job | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; jobId: string | null; jobName: string }>({
    isOpen: false,
    jobId: null,
    jobName: ''
  });

  // Update editingJob when jobs array changes
  // useEffect(() => {
  //   if (editingJob && jobs.length > 0) {
  //     const updatedJob = jobs.find(job => job._id === editingJob._id);
  //     if (updatedJob) {
  //       setEditingJob(updatedJob);
  //     }
  //   }
  // }, [jobs, editingJob]);

  // Categorize jobs for statistics
  const inProgressJobs = jobs.filter(job => (job.startDate && job.startDate !== null) && (!job.completedDate || job.completedDate === null));
  const completedJobs = jobs.filter(job => job.completedDate && job.completedDate !== null);
  
  const totalJobs = jobs.length;
  const completedJobsCount = completedJobs.length;
  const highPriorityJobs = jobs.filter(job => job.priority === 'High' && !job.completedDate).length;
  const inProgressJobsCount = inProgressJobs.length;

  const handleViewPDFs = (job: IJob) => {
    setSelectedJob(job);
    setIsPDFModalOpen(true);
  };

  const handleClosePDFModal = () => {
    setIsPDFModalOpen(false);
    setSelectedJob(null);
  };

  const handleEditProgress = (job: IJob) => {
    setEditingJob(job);
    setIsProgressModalOpen(true);
  };

  const handleCloseProgressModal = () => {
    setIsProgressModalOpen(false);
    setEditingJob(null);
  };

  const handleUpdateJobProgress = async (jobId: string, updatedJobData: Partial<IJob>): Promise<IJob> => {
    if (onUpdateJob) {
      try {
        const updatedJob = await onUpdateJob(jobId, updatedJobData);
        console.log('Dashboard: Job progress updated successfully', updatedJob);
        
        // Update the editingJob state with the updated job data
        if (editingJob && editingJob._id === jobId && updatedJob) {
          setEditingJob(updatedJob);
        }
        
        // Call onJobUpdated if available to ensure UI updates
        if (onJobUpdated && updatedJob) {
          onJobUpdated(updatedJob);
        }
        
        return updatedJob;
      } catch (error) {
        console.error('Dashboard: Error updating job progress:', error);
        throw error;
      }
    } else {
      throw new Error('onUpdateJob is not available');
    }
  };

  // Job management functions
  const handleEditJob = (jobId: string) => {
    const job = jobs.find(j => j._id === jobId);
    if (job) {
      // Convert IJob to Job interface
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

  const handleUpdateJob = (updatedJob: Job) => {
    if (editingJobId && onUpdateJob) {
      // Convert Job interface to Partial<IJob>
      const jobForUpdate: Partial<IJob> = {
        customer: updatedJob.customer,
        jobName: updatedJob.jobName,
        jobNumber: updatedJob.jobNumber,
        projectManager: updatedJob.projectManager,
        priority: updatedJob.priority,
      };
      onUpdateJob(editingJobId, jobForUpdate);
      setEditingJobForModal(null);
      setEditingJobId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingJobForModal(null);
    setEditingJobId(null);
  };

  const handleOpenAddModal = () => {
    setEditingJobForModal(null);
    setEditingJobId(null);
    setIsJobModalOpen(true);
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
    if (deleteConfirm.jobId && onDeleteJob) {
      onDeleteJob(deleteConfirm.jobId);
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
    if (job.startDate && job.startDate !== null) return 'In Progress';
    return 'Pending';
  };

  const getStatusColor = (job: IJob) => {
    if (job.completedDate && job.completedDate !== null) return 'bg-green-100 text-green-800';
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
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewPDFs(job);
          }}
          className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            job.documents && job.documents.length > 0
              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!job.documents || job.documents.length === 0}
        >
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          {job.documents && job.documents.length > 0 
            ? `${job.documents.length} PDF${job.documents.length !== 1 ? 's' : ''}`
            : 'No PDFs'
          }
        </button>
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Statistics Cards */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{totalJobs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedJobsCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{inProgressJobsCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900">{highPriorityJobs}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Management Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Job Management</h3>
              <button
                onClick={handleOpenAddModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                + Add New Job
              </button>
            </div>
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Manager</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobs.map((job) => renderJobRow(job))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PDFModal 
        isOpen={isPDFModalOpen}
        onClose={handleClosePDFModal}
        job={selectedJob}
      />

      <ProgressEditModal
        isOpen={isProgressModalOpen}
        onClose={handleCloseProgressModal}
        job={editingJob}
        onUpdateJob={handleUpdateJobProgress}
      />

      <JobModal
        isOpen={isJobModalOpen}
        onClose={handleCloseJobModal}
        isEditing={!!editingJobForModal}
        editingJob={editingJobForModal}
        editingJobId={editingJobId}
        onAddJob={onAddJob || (async () => ({}) as IJob)}
        onUpdateJob={handleUpdateJob}
        onCancelEdit={handleCancelEdit}
        projectManagers={projectManagers}
        onAddProjectManager={onAddProjectManager || (() => {})}
        onDeleteProjectManager={onDeleteProjectManager || (() => {})}
        onJobUpdated={onJobUpdated}
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
};