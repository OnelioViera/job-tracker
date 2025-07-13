import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ProjectManagerSelect from './ProjectManagerSelect';
import { IJob } from '../models/Job';
import { JobService } from '../services/jobService';

export interface Job {
  customer: string;
  jobName: string;
  jobNumber: string;
  projectManager?: string;
  startDate: Date | null;
  finishedDate: Date | null;
  completedDate: Date | null;
  priority: 'High' | 'Medium' | 'Low';
}

interface JobFormProps {
  onAddJob: (job: Job) => Promise<IJob>;
  onJobUpdated?: (job: IJob) => void;
  isEditing?: boolean;
  editingJob?: Job | null;
  editingJobId?: string | null;
  onUpdateJob?: (job: Job) => void;
  onCancelEdit?: () => void;
  projectManagers: string[];
  onAddProjectManager: (manager: string) => void;
  onDeleteProjectManager: (manager: string) => void;
}

export const JobForm: React.FC<JobFormProps> = ({ 
  onAddJob, 
  onJobUpdated,
  isEditing = false, 
  editingJob = null, 
  editingJobId = null,
  onUpdateJob, 
  onCancelEdit,
  projectManagers,
  onAddProjectManager,
  onDeleteProjectManager
}) => {
  const [form, setForm] = useState<Job>({
    customer: '',
    jobName: '',
    jobNumber: '',
    projectManager: '',
    startDate: null,
    finishedDate: null,
    completedDate: null,
    priority: 'Low',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (isEditing && editingJob) {
      setForm(editingJob);
    }
  }, [isEditing, editingJob]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: keyof Job, date: Date | null) => {
    setForm((prev) => ({ ...prev, [name]: date }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    setSelectedFiles(pdfFiles);
  };

  const resetForm = () => {
    setForm({
      customer: '',
      jobName: '',
      jobNumber: '',
      projectManager: '',
      startDate: null,
      finishedDate: null,
      completedDate: null,
      priority: 'Low',
    });
    setSelectedFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure startDate is not null before submitting
    if (!form.startDate) {
      alert('Start date is required');
      return;
    }
    
    // Ensure project manager is selected when editing
    if (isEditing && (!form.projectManager || form.projectManager.trim() === '')) {
      alert('Please select a project manager when editing a job');
      return;
    }
    
    if (isEditing && onUpdateJob) {
      // Update the job first
      onUpdateJob(form);
      
      // Upload files if any were selected
      if (selectedFiles.length > 0 && editingJobId) {
        setUploading(true);
        try {
          console.log('JobForm: Starting file upload for editing job:', editingJobId);
          console.log('JobForm: Files to upload:', selectedFiles.map(f => f.name));
          
          await JobService.uploadFiles(editingJobId, selectedFiles);
          console.log('JobForm: Files uploaded successfully for editing job');
          
          // Refresh the job data to get the updated documents
          const updatedJob = await JobService.getJob(editingJobId);
          console.log('JobForm: Updated job data after editing:', updatedJob);
          
          // Notify parent component about the updated job
          if (onJobUpdated) {
            console.log('JobForm: Calling onJobUpdated with:', updatedJob);
            onJobUpdated(updatedJob);
          }
          setSelectedFiles([]);
        } catch (error) {
          console.error('JobForm: Error uploading files for editing job:', error);
          alert('Job updated but files failed to upload');
        } finally {
          setUploading(false);
        }
      }
    } else {
      const newJob = await onAddJob(form);
      
      // Upload files if any were selected
      if (selectedFiles.length > 0 && newJob?._id) {
        setUploading(true);
        try {
          console.log('JobForm: Starting file upload for job:', newJob._id);
          console.log('JobForm: Files to upload:', selectedFiles.map(f => f.name));
          
          await JobService.uploadFiles(newJob._id, selectedFiles);
          console.log('JobForm: Files uploaded successfully');
          
          // Refresh the job data to get the updated documents
          const updatedJob = await JobService.getJob(newJob._id);
          console.log('JobForm: Updated job data:', updatedJob);
          
          // Notify parent component about the updated job
          if (onJobUpdated) {
            console.log('JobForm: Calling onJobUpdated with:', updatedJob);
            onJobUpdated(updatedJob);
          }
          setSelectedFiles([]);
        } catch (error) {
          console.error('JobForm: Error uploading files:', error);
          alert('Job created but files failed to upload');
        } finally {
          setUploading(false);
        }
      }
    }
    
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded bg-white shadow">
      <div className="flex flex-col gap-1">
        <label className="font-medium">Customer</label>
        <input
          className="border rounded px-2 py-1"
          name="customer"
          value={form.customer}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium">Job Name</label>
        <input
          className="border rounded px-2 py-1"
          name="jobName"
          value={form.jobName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium">Job #</label>
        <input
          className="border rounded px-2 py-1"
          name="jobNumber"
          value={form.jobNumber}
          onChange={handleChange}
          required
        />
      </div>
      <ProjectManagerSelect 
        value={form.projectManager || ''} 
        onChange={(val) => setForm((prev) => ({ ...prev, projectManager: val }))}
        projectManagers={projectManagers}
        onAddProjectManager={onAddProjectManager}
        onDeleteProjectManager={onDeleteProjectManager}
        isEditing={isEditing}
      />
      <div className="flex flex-col gap-1">
        <label className="font-medium">Start Date</label>
        <DatePicker
          className="border rounded px-2 py-1"
          selected={form.startDate}
          onChange={(date) => handleDateChange('startDate', date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select start date"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium">Finished Date (Optional)</label>
        <DatePicker
          className="border rounded px-2 py-1"
          selected={form.finishedDate}
          onChange={(date) => handleDateChange('finishedDate', date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select finished date"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium">Completed Date (Optional)</label>
        <DatePicker
          className="border rounded px-2 py-1"
          selected={form.completedDate}
          onChange={(date) => handleDateChange('completedDate', date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select completed date"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium">Priority (Optional)</label>
        <select
          className={`border rounded px-2 py-1 font-medium ${
            form.priority === 'Low' ? 'bg-gray-200 text-gray-800' :
            form.priority === 'Medium' ? 'bg-orange-200 text-orange-800' :
            'bg-red-200 text-red-800'
          }`}
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="Low" className="bg-gray-200 text-gray-800">Low</option>
          <option value="Medium" className="bg-orange-200 text-orange-800">Medium</option>
          <option value="High" className="bg-red-200 text-red-800">High</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium">Upload PDF Documents (Optional)</label>
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileChange}
          className="border rounded px-2 py-1"
        />
        {selectedFiles.length > 0 && (
          <div className="text-sm text-gray-600">
            Selected files: {selectedFiles.map(f => f.name).join(', ')}
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <button 
          type="submit" 
          disabled={uploading}
          className={`flex-1 px-4 py-2 rounded text-white transition-colors ${
            uploading ? 'bg-gray-400 cursor-not-allowed' :
            isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {uploading ? 'Uploading...' : (isEditing ? 'Update Job' : 'Add Job')}
        </button>
        {isEditing && (
          <button 
            type="button" 
            onClick={handleCancel}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}; 