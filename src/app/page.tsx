'use client';

import React, { useState, useEffect } from 'react';
import { Job } from '../components/JobForm';
import { Task } from '../components/TaskForm';
import { Navbar } from '../components/Navbar';
import { Dashboard } from '../components/Dashboard';
import { JobsPage } from '../components/JobsPage';
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

  const handleAddJob = async (jobData: Job): Promise<IJob> => {
    try {
      // Convert Job interface to JobData for database
      const jobForDb: any = {
        customer: jobData.customer,
        jobName: jobData.jobName,
        jobNumber: jobData.jobNumber,
        startDate: jobData.startDate!.toISOString(),
        finishedDate: jobData.finishedDate ? jobData.finishedDate.toISOString() : undefined,
        completedDate: jobData.completedDate ? jobData.completedDate.toISOString() : undefined,
        priority: jobData.priority,
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

  const handleAddTask = async (taskData: Task): Promise<ITask> => {
    try {
      // Convert Task interface to TaskData for database
      const taskForDb: any = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate!.toISOString(),
        priority: taskData.priority,
        status: taskData.status,
        assignedTo: taskData.assignedTo || undefined,
      };
      
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

  const handleTaskUpdated = (updatedTask: ITask) => {
    setTasks((prev) => {
      const newTasks = prev.map((task) => task._id === updatedTask._id ? updatedTask : task);
      return newTasks;
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

  const handleUpdateJob = async (jobId: string, updatedJobData: Partial<Job>) => {
    try {
      // Convert Job interface to JobData for database
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
        jobForDb.startDate = updatedJobData.startDate instanceof Date 
          ? updatedJobData.startDate.toISOString() 
          : (updatedJobData.startDate === null ? undefined : updatedJobData.startDate as string);
      }
      if (updatedJobData.finishedDate !== undefined) {
        jobForDb.finishedDate = updatedJobData.finishedDate instanceof Date 
          ? updatedJobData.finishedDate.toISOString() 
          : (updatedJobData.finishedDate === null ? undefined : updatedJobData.finishedDate as string);
      }
      if (updatedJobData.completedDate !== undefined) {
        jobForDb.completedDate = updatedJobData.completedDate instanceof Date 
          ? updatedJobData.completedDate.toISOString() 
          : (updatedJobData.completedDate === null ? undefined : updatedJobData.completedDate as string);
      }
      if (updatedJobData.priority !== undefined) jobForDb.priority = updatedJobData.priority;
      
      const updatedJob = await JobService.updateJob(jobId, jobForDb);
      setJobs((prev) => prev.map((job) => job._id === jobId ? updatedJob : job));
    } catch (err) {
      setError('Failed to update job');
      console.error('Error updating job:', err);
    }
  };

  const handleUpdateTask = async (taskId: string, updatedTaskData: Partial<Task>) => {
    try {
      // Convert Task interface to TaskData for database
      const taskForDb: Partial<TaskData> = {};
      if (updatedTaskData.title !== undefined) taskForDb.title = updatedTaskData.title;
      if (updatedTaskData.description !== undefined) taskForDb.description = updatedTaskData.description;
      if (updatedTaskData.dueDate !== undefined) {
        taskForDb.dueDate = updatedTaskData.dueDate instanceof Date 
          ? updatedTaskData.dueDate.toISOString() 
          : (updatedTaskData.dueDate === null ? undefined : updatedTaskData.dueDate as string);
      }
      if (updatedTaskData.priority !== undefined) taskForDb.priority = updatedTaskData.priority;
      if (updatedTaskData.status !== undefined) taskForDb.status = updatedTaskData.status;
      if (updatedTaskData.assignedTo !== undefined) taskForDb.assignedTo = updatedTaskData.assignedTo;
      
      const updatedTask = await TaskService.updateTask(taskId, taskForDb);
      setTasks((prev) => prev.map((task) => task._id === taskId ? updatedTask : task));
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
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
        <Dashboard jobs={jobs} onAddJob={handleAddJob} />
      )}
      
      {activeTab === 'jobs' && (
        <JobsPage 
          jobs={jobs} 
          onAddJob={handleAddJob} 
          onDeleteJob={handleDeleteJob}
          onUpdateJob={handleUpdateJob}
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
          onUpdateTask={handleUpdateTask}
          onTaskUpdated={handleTaskUpdated}
          projectManagers={projectManagers}
          jobs={jobs}
        />
      )}

      {activeTab === 'stats' && (
        <StatsPage jobs={jobs} />
      )}
    </div>
  );
}
