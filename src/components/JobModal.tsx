import React from 'react';
import { JobForm, Job } from './JobForm';
import { IJob } from '../models/Job';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  editingJob: Job | null;
  editingJobId?: string | null;
  onAddJob: (job: Job) => Promise<IJob>;
  onUpdateJob: (job: Job) => void;
  onCancelEdit: () => void;
  onJobUpdated?: (job: IJob) => void;
  projectManagers: string[];
  onAddProjectManager: (manager: string) => void;
  onDeleteProjectManager: (manager: string) => void;
}

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  isEditing,
  editingJob,
  editingJobId,
  onAddJob,
  onUpdateJob,
  onCancelEdit,
  onJobUpdated,
  projectManagers,
  onAddProjectManager,
  onDeleteProjectManager
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      onCancelEdit();
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Job' : 'Add New Job'}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <JobForm
            onAddJob={async (job) => {
              const result = await onAddJob(job);
              onClose();
              return result;
            }}
            onJobUpdated={onJobUpdated}
            isEditing={isEditing}
            editingJob={editingJob}
            editingJobId={editingJobId}
            onUpdateJob={(job) => {
              onUpdateJob(job);
              onClose();
            }}
            onCancelEdit={handleCancel}
            projectManagers={projectManagers}
            onAddProjectManager={onAddProjectManager}
            onDeleteProjectManager={onDeleteProjectManager}
          />
        </div>
      </div>
    </div>
  );
}; 