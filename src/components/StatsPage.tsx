import React, { useState } from 'react';
import { Job } from './JobForm';
import { IJob } from '../models/Job';

interface StatsPageProps {
  jobs: IJob[];
}

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const StatsPage: React.FC<StatsPageProps> = ({ jobs }) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  
  const currentJobs = jobs.filter(job => !job.completedDate);
  const completedJobs = jobs.filter(job => job.completedDate);
  
  // Calculate statistics
  const totalJobs = jobs.length;
  const completionRate = totalJobs > 0 ? Math.round((completedJobs.length / totalJobs) * 100) : 0;
  const highPriorityJobs = jobs.filter(job => job.priority === 'High').length;
  const mediumPriorityJobs = jobs.filter(job => job.priority === 'Medium').length;
  const lowPriorityJobs = jobs.filter(job => job.priority === 'Low').length;
  
  // Time period stats
  const getTimePeriodStats = () => {
    const periodData: { [key: string]: number } = {};
    
    completedJobs.forEach(job => {
      if (job.completedDate) {
        let periodKey: string;
        
        switch (timePeriod) {
          case 'daily':
            periodKey = new Date(job.completedDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric' 
            });
            break;
          case 'weekly':
            const weekStart = new Date(job.completedDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            periodKey = `Week of ${weekStart.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric' 
            })}`;
            break;
          case 'monthly':
            periodKey = new Date(job.completedDate).toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric' 
            });
            break;
          case 'yearly':
            periodKey = new Date(job.completedDate).getFullYear().toString();
            break;
          default:
            periodKey = new Date(job.completedDate).toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric' 
            });
        }
        
        periodData[periodKey] = (periodData[periodKey] || 0) + 1;
      }
    });
    
    return periodData;
  };

  const timePeriodStats = getTimePeriodStats();

  // Priority distribution chart
  const renderPriorityChart = () => {
    const total = highPriorityJobs + mediumPriorityJobs + lowPriorityJobs;
    if (total === 0) return <div className="text-gray-500 text-center py-8">No jobs to display</div>;

    const highPercent = total > 0 ? Math.round((highPriorityJobs / total) * 100) : 0;
    const mediumPercent = total > 0 ? Math.round((mediumPriorityJobs / total) * 100) : 0;
    const lowPercent = total > 0 ? Math.round((lowPriorityJobs / total) * 100) : 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">High Priority</span>
          <span className="text-sm text-gray-600">{highPriorityJobs} ({highPercent}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-red-600 h-2 rounded-full" style={{ width: `${highPercent}%` }}></div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Medium Priority</span>
          <span className="text-sm text-gray-600">{mediumPriorityJobs} ({mediumPercent}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${mediumPercent}%` }}></div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Low Priority</span>
          <span className="text-sm text-gray-600">{lowPriorityJobs} ({lowPercent}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${lowPercent}%` }}></div>
        </div>
      </div>
    );
  };

  // Time period completion chart
  const renderTimePeriodChart = () => {
    const periods = Object.keys(timePeriodStats).sort();
    if (periods.length === 0) return <div className="text-gray-500 text-center py-8">No completion data available</div>;

    const maxValue = Math.max(...Object.values(timePeriodStats));
    
    return (
      <div className="space-y-4">
        {periods.map(period => {
          const value = timePeriodStats[period];
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={period} className="flex items-center space-x-4">
              <div className="w-32 text-sm font-medium truncate">{period}</div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
              <div className="w-12 text-sm text-gray-600 text-right">{value}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Workflow Statistics</h2>
            <p className="text-gray-600">Track your job performance and completion metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="timePeriod" className="text-sm font-medium text-gray-700">Time Period:</label>
            <select
              id="timePeriod"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
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
              <p className="text-2xl font-bold text-gray-900">{currentJobs.length}</p>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Priority Distribution</h3>
          {renderPriorityChart()}
        </div>

        {/* Time Period Completion Trend */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Completion Trend
          </h3>
          {renderTimePeriodChart()}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Completions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedJobs.slice(0, 5).map((job) => (
                  <tr key={job._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.jobName}</div>
                      <div className="text-sm text-gray-500">#{job.jobNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.completedDate ? new Date(job.completedDate).toLocaleDateString() : ''}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}; 