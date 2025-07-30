'use client';

import React, { useState, useEffect } from 'react';
import { Job } from '../components/JobForm';
import { Task } from '../components/TaskForm';
import { Navbar } from '../components/Navbar';
import { Dashboard } from '../components/Dashboard';
import { TasksPage } from '../components/TasksPage';
import { StatsPage } from '../components/StatsPage';
import { JobService, JobData } from '../services/jobService';
import { TaskService, TaskData } from '../services/taskService';
import { IJob } from '../models/Job';
import { ITask } from '../models/Task';

export default function Home() {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projectManagers, setProjectManagers] = useState<string[]>([]);

  // Load jobs and tasks from database on component mount
  useEffect(() => {
    loadJobs();
    loadTasks();
    loadProjectManagers();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const fetchedJobs = await JobService.getAllJobs();
      setJobs(fetchedJobs);
      setError(null);
    } catch (err) {
      setError('Failed to load jobs');
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const fetchedTasks = await TaskService.getAllTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  };

  const loadProjectManagers = () => {
    try {
      const savedManagers = localStorage.getItem('projectManagers');
      if (savedManagers) {
        setProjectManagers(JSON.parse(savedManagers));
      }
    } catch (err) {
      console.error('Error loading project managers:', err);
    }
  };

  const saveProjectManagers = (managers: string[]) => {
    try {
      localStorage.setItem('projectManagers', JSON.stringify(managers));
    } catch (err) {
      console.error('Error saving project managers:', err);
    }
  };

  const handleAddJob = async (jobData: Job) => {
    try {
      // Convert Job interface to JobData for database
      const jobForDb: JobData = {
        customer: jobData.customer,
        jobName: jobData.jobName,
        jobNumber: jobData.jobNumber,
        priority: jobData.priority,
        projectManager: jobData.projectManager
      };
      
      // Only add projectManager if it's not empty
      if (jobData.projectManager && jobData.projectManager.trim() !== '') {
        jobForDb.projectManager = jobData.projectManager;
      }
      
      const newJob = await JobService.createJob(jobForDb);
      setJobs((prev) => [newJob, ...prev]);
      return newJob;
    } catch (err) {
      setError('Failed to add job');
      console.error('Error adding job:', err);
      throw err;
    }
  };

  const handleAddTask = async (taskData: Task) => {
    try {
      // Convert Task interface to TaskData for database
      const taskForDb: TaskData = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate?.toISOString() || '',
        priority: taskData.priority,
        status: taskData.status,
        assignedTo: taskData.assignedTo
      };
      
      // Only add dueDate if it's not null
      if (taskData.dueDate) {
        taskForDb.dueDate = taskData.dueDate.toISOString();
      }
      
      const newTask = await TaskService.createTask(taskForDb);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
      throw err;
    }
  };

  const handleJobUpdated = (updatedJob: IJob) => {
    console.log('Main page: handleJobUpdated called with:', updatedJob);
    setJobs((prev) => {
      const newJobs = prev.map((job) => job._id === updatedJob._id ? updatedJob : job);
      console.log('Main page: Updated jobs list:', newJobs);
      return newJobs;
    });
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

  const handleDeleteTask = async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const handleUpdateJob = async (jobId: string, updatedJobData: Partial<IJob>) => {
    try {
      console.log('Main page: handleUpdateJob called with jobId:', jobId);
      console.log('Main page: updatedJobData:', updatedJobData);
      
      // Convert IJob interface to JobData for database
      const jobForDb: Partial<JobData> = {};
      if (updatedJobData.customer !== undefined) jobForDb.customer = updatedJobData.customer;
      if (updatedJobData.jobName !== undefined) jobForDb.jobName = updatedJobData.jobName;
      if (updatedJobData.jobNumber !== undefined) jobForDb.jobNumber = updatedJobData.jobNumber;
      if (updatedJobData.projectManager !== undefined) {
        // Only add projectManager if it's not empty
        if (updatedJobData.projectManager && updatedJobData.projectManager.trim() !== '') {
          jobForDb.projectManager = updatedJobData.projectManager;
        } else {
          // Set to undefined to remove the field
          jobForDb.projectManager = undefined;
        }
      }
      if (updatedJobData.startDate !== undefined) {
        if (updatedJobData.startDate instanceof Date) {
          jobForDb.startDate = updatedJobData.startDate.toISOString();
        } else if (updatedJobData.startDate === null || updatedJobData.startDate === undefined) {
          jobForDb.startDate = undefined; // Use undefined instead of null for startDate
        } else if (updatedJobData.startDate !== undefined) {
          jobForDb.startDate = updatedJobData.startDate as string;
        }
      }
      if (updatedJobData.finishedDate !== undefined) {
        if (updatedJobData.finishedDate instanceof Date) {
          jobForDb.finishedDate = updatedJobData.finishedDate.toISOString();
        } else if (updatedJobData.finishedDate === null || updatedJobData.finishedDate === undefined) {
          jobForDb.finishedDate = null; // Send null instead of empty string
        } else if (updatedJobData.finishedDate !== undefined) {
          jobForDb.finishedDate = updatedJobData.finishedDate as string;
        }
      }
      if (updatedJobData.completedDate !== undefined) {
        if (updatedJobData.completedDate instanceof Date) {
          jobForDb.completedDate = updatedJobData.completedDate.toISOString();
        } else if (updatedJobData.completedDate === null || updatedJobData.completedDate === undefined) {
          jobForDb.completedDate = null; // Send null instead of empty string
        } else if (updatedJobData.completedDate !== undefined) {
          jobForDb.completedDate = updatedJobData.completedDate as string;
        }
      }
      if (updatedJobData.priority !== undefined) jobForDb.priority = updatedJobData.priority;
      
      console.log('Main page: jobForDb to send to API:', jobForDb);
      
      const updatedJob = await JobService.updateJob(jobId, jobForDb);
      console.log('Main page: API returned updated job:', updatedJob);
      
      // Update the jobs state with the new data
      setJobs((prev) => {
        console.log('Main page: Previous jobs state:', prev);
        const newJobs = prev.map((job) => job._id === jobId ? updatedJob : job);
        console.log('Main page: Updated jobs list:', newJobs);
        console.log('Main page: Updated job details:', newJobs.find(job => job._id === jobId));
        return newJobs;
      });
      
      return updatedJob; // Return the updated job for the caller
    } catch (err) {
      setError('Failed to update job');
      console.error('Error updating job:', err);
      throw err; // Re-throw the error so the modal can handle it
    }
  };

  const handleAddProjectManager = (manager: string) => {
    if (manager && !projectManagers.includes(manager)) {
      const updatedManagers = [...projectManagers, manager];
      setProjectManagers(updatedManagers);
      saveProjectManagers(updatedManagers);
    }
  };

  const handleDeleteProjectManager = (manager: string) => {
    const updatedManagers = projectManagers.filter((m) => m !== manager);
    setProjectManagers(updatedManagers);
    saveProjectManagers(updatedManagers);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
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
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'dashboard' && (
        <Dashboard 
          jobs={jobs} 
          tasks={tasks} 
          onUpdateJob={handleUpdateJob}
          onAddJob={handleAddJob}
          onDeleteJob={handleDeleteJob}
          onJobUpdated={handleJobUpdated}
          projectManagers={projectManagers}
          onAddProjectManager={handleAddProjectManager}
          onDeleteProjectManager={handleDeleteProjectManager}
        />
      )}

      {activeTab === 'tasks' && (
        <TasksPage 
          tasks={tasks} 
          onAddTask={handleAddTask} 
          onDeleteTask={handleDeleteTask}
          onEditTask={(taskId) => {
            // Handle edit task - for now just log it
            console.log('Edit task:', taskId);
          }}
        />
      )}

      {activeTab === 'stats' && (
        <StatsPage jobs={jobs} />
      )}
    </div>
  );
}
