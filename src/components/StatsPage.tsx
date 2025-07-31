import React, { useState } from 'react';
import { IJob } from '../models/Job';

interface StatsPageProps {
  jobs: IJob[];
}

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const StatsPage: React.FC<StatsPageProps> = ({ jobs }) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [selectedProjectManager, setSelectedProjectManager] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  
  // Debug logging to understand the job data
  console.log('StatsPage: Total jobs received:', jobs.length);
  console.log('StatsPage: Jobs with completedDate:', jobs.filter(job => job.completedDate).length);
  console.log('StatsPage: Jobs with null/undefined completedDate:', jobs.filter(job => !job.completedDate || job.completedDate === null || job.completedDate === undefined).length);
  
  // Filter jobs based on selected filters
  const getFilteredJobs = () => {
    let filteredJobs = [...jobs];
    
    // Filter by customer
    if (selectedCustomer !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.customer === selectedCustomer);
    }
    
    // Filter by project manager
    if (selectedProjectManager !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.projectManager === selectedProjectManager);
    }
    
    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case 'last7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'thisyear':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          return filteredJobs;
      }
      
      filteredJobs = filteredJobs.filter(job => {
        const jobDate = job.createdAt ? new Date(job.createdAt) : new Date();
        return jobDate >= startDate;
      });
    }
    
    return filteredJobs;
  };
  
  const filteredJobs = getFilteredJobs();
  
  // More robust filtering for completed jobs
  const currentJobs = filteredJobs.filter(job => !job.completedDate || job.completedDate === null || job.completedDate === undefined);
  const completedJobs = filteredJobs.filter(job => job.completedDate && job.completedDate !== null && job.completedDate !== undefined);
  
  console.log('StatsPage: Filtered completed jobs:', completedJobs.length);
  console.log('StatsPage: Completed jobs details:', completedJobs.map(job => ({
    id: job._id,
    name: job.jobName,
    completedDate: job.completedDate,
    hasCompletedDate: !!job.completedDate
  })));
  
  // Calculate statistics
  const totalJobs = filteredJobs.length;
  const completionRate = totalJobs > 0 ? Math.round((completedJobs.length / totalJobs) * 100) : 0;
  const highPriorityJobs = filteredJobs.filter(job => job.priority === 'High').length;
  const mediumPriorityJobs = filteredJobs.filter(job => job.priority === 'Medium').length;
  const lowPriorityJobs = filteredJobs.filter(job => job.priority === 'Low').length;
  
  // Get unique customers and project managers for filters
  const customers = Array.from(new Set(jobs.map(job => job.customer))).sort();
  const projectManagers = Array.from(new Set(jobs.map(job => job.projectManager).filter(Boolean))).sort();
  
  // Top Project Managers by Volume
  const getTopProjectManagers = () => {
    const pmStats: { [key: string]: { total: number; completed: number; inProgress: number } } = {};
    
    jobs.forEach(job => {
      if (job.projectManager) {
        if (!pmStats[job.projectManager]) {
          pmStats[job.projectManager] = { total: 0, completed: 0, inProgress: 0 };
        }
        
        pmStats[job.projectManager].total++;
        
        if (job.completedDate && job.completedDate !== null) {
          pmStats[job.projectManager].completed++;
        } else if (job.startDate && job.startDate !== null) {
          pmStats[job.projectManager].inProgress++;
        }
      }
    });
    
    return Object.entries(pmStats)
      .map(([projectManager, stats]) => ({ projectManager, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 project managers
  };
  
  const topProjectManagers = getTopProjectManagers();
  
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

  // Calculate date range for the report
  const getReportDateRange = () => {
    if (filteredJobs.length === 0) {
      return { startDate: null, endDate: null };
    }
    
    const jobDates = filteredJobs
      .map(job => job.createdAt ? new Date(job.createdAt) : null)
      .filter(date => date !== null) as Date[];
    
    if (jobDates.length === 0) {
      return { startDate: null, endDate: null };
    }
    
    const startDate = new Date(Math.min(...jobDates.map(d => d.getTime())));
    const endDate = new Date(Math.max(...jobDates.map(d => d.getTime())));
    
    return { startDate, endDate };
  };

  const reportDateRange = getReportDateRange();

  // PDF Export functionality
  const exportDataAsPDF = async () => {
    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;
      
      // Helper function to check if we need a new page
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
      };
      
      // Company Logo and Title
      try {
        // Add logo (if available)
        const logoResponse = await fetch('/logo.png');
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob();
          const logoBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(logoBlob);
          });
          
          // Add logo to PDF (positioned on the left)
          doc.addImage(logoBase64, 'PNG', margin, yPosition, 30, 15);
        }
      } catch {
        console.log('Logo not available, continuing without it');
      }
      
      // Company Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Lindsay Precast', pageWidth / 2, yPosition + 10, { align: 'center' });
      yPosition += 25;
      
      // Report Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Workflow Statistics Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Date Range and Generation Date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      if (reportDateRange.startDate && reportDateRange.endDate) {
        const startDateStr = reportDateRange.startDate.toLocaleDateString();
        const endDateStr = reportDateRange.endDate.toLocaleDateString();
        doc.text(`Data Period: ${startDateStr} to ${endDateStr}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
      }
      
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Time Period Information
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Time Period Analysis: ${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}`, margin, yPosition);
      yPosition += 10;
      
      // Filters applied
      if (selectedCustomer !== 'all' || selectedProjectManager !== 'all' || dateRange !== 'all') {
        checkPageBreak(50); // Reserve space for filters section
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Filters Applied:', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (selectedCustomer !== 'all') {
          doc.text(`Customer: ${selectedCustomer}`, margin + 10, yPosition);
          yPosition += 7;
        }
        if (selectedProjectManager !== 'all') {
          doc.text(`Project Manager: ${selectedProjectManager}`, margin + 10, yPosition);
          yPosition += 7;
        }
        if (dateRange !== 'all') {
          doc.text(`Date Range: ${dateRange}`, margin + 10, yPosition);
          yPosition += 7;
        }
        yPosition += 10;
        
        // Add filtered jobs list if there are specific filters
        if (filteredJobs.length > 0 && (selectedCustomer !== 'all' || selectedProjectManager !== 'all')) {
          checkPageBreak(30); // Reserve space for job list header
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Filtered Jobs:', margin, yPosition);
          yPosition += 10;
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          
          filteredJobs.forEach((job, index) => {
            checkPageBreak(15); // Reserve space for each job entry
            
            const jobStatus = job.completedDate ? 'Completed' : 
                             job.startDate ? 'In Progress' : 'Pending';
            const jobDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'No date';
            
            doc.text(`${index + 1}. ${job.jobName} (#${job.jobNumber})`, margin, yPosition);
            yPosition += 5;
            doc.text(`   Customer: ${job.customer} | PM: ${job.projectManager || 'Not assigned'} | Status: ${jobStatus} | Priority: ${job.priority} | Created: ${jobDate}`, margin + 10, yPosition);
            yPosition += 8;
          });
          
          yPosition += 10;
          
          // Add Project Manager breakdown if customer filter is applied
          if (selectedCustomer !== 'all') {
            const pmBreakdown = filteredJobs.reduce((acc, job) => {
              const pm = job.projectManager || 'Not assigned';
              if (!acc[pm]) {
                acc[pm] = { total: 0, completed: 0, inProgress: 0, pending: 0 };
              }
              acc[pm].total++;
              
              if (job.completedDate) {
                acc[pm].completed++;
              } else if (job.startDate) {
                acc[pm].inProgress++;
              } else {
                acc[pm].pending++;
              }
              return acc;
            }, {} as { [key: string]: { total: number; completed: number; inProgress: number; pending: number } });
            
            checkPageBreak(30 + (Object.keys(pmBreakdown).length * 10)); // Reserve space for PM breakdown
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Project Manager Breakdown for ${selectedCustomer}:`, margin, yPosition);
            yPosition += 10;
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            
            Object.entries(pmBreakdown)
              .sort(([,a], [,b]) => b.total - a.total)
              .forEach(([pm, stats]) => {
                checkPageBreak(10); // Reserve space for each PM entry
                
                doc.text(`${pm}: ${stats.total} jobs (${stats.completed} completed, ${stats.inProgress} in progress, ${stats.pending} pending)`, margin + 10, yPosition);
                yPosition += 6;
              });
            
            yPosition += 10;
          }
        }
      }
      
      // Summary Statistics
      checkPageBreak(50); // Reserve space for summary section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Jobs: ${totalJobs}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Completion Rate: ${completionRate}%`, margin, yPosition);
      yPosition += 7;
      doc.text(`In Progress: ${currentJobs.length}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Completed: ${completedJobs.length}`, margin, yPosition);
      yPosition += 15;
      
      // Priority Breakdown
      checkPageBreak(40); // Reserve space for priority section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Priority Breakdown', margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`High Priority: ${highPriorityJobs}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Medium Priority: ${mediumPriorityJobs}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Low Priority: ${lowPriorityJobs}`, margin, yPosition);
      yPosition += 15;
      
      // Top Project Managers
      if (topProjectManagers.length > 0) {
        checkPageBreak(30 + (topProjectManagers.length * 15)); // Reserve space for PM section
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Top Project Managers by Volume', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        topProjectManagers.forEach((pm, index) => {
          checkPageBreak(15); // Reserve space for each PM entry
          
          doc.text(`${index + 1}. ${pm.projectManager}`, margin, yPosition);
          yPosition += 7;
          doc.text(`   Total: ${pm.total} | Completed: ${pm.completed} | In Progress: ${pm.inProgress} | Pending: ${pm.total - pm.completed - pm.inProgress}`, margin + 10, yPosition);
          yPosition += 10;
        });
      }
      
      // Time Period Statistics
      const periods = Object.keys(timePeriodStats).sort();
      if (periods.length > 0) {
        checkPageBreak(30 + (periods.length * 10)); // Reserve space for time period section
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Completion Trend`, margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        periods.forEach(period => {
          checkPageBreak(10); // Reserve space for each period entry
          
          doc.text(`${period}: ${timePeriodStats[period]} jobs completed`, margin, yPosition);
          yPosition += 7;
        });
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Lindsay Precast - Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
      
      // Save the PDF
      const filename = `lindsay-precast-workflow-statistics-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

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

  // Top Project Managers chart
  const renderTopProjectManagersChart = () => {
    if (topProjectManagers.length === 0) return <div className="text-gray-500 text-center py-8">No project manager data available</div>;

    const maxValue = Math.max(...topProjectManagers.map(pm => pm.total));
    
    return (
      <div className="space-y-4">
        {topProjectManagers.map(pm => {
          const percentage = maxValue > 0 ? (pm.total / maxValue) * 100 : 0;
          
          return (
            <div key={pm.projectManager} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{pm.projectManager}</span>
                <span className="text-sm text-gray-600">{pm.total} jobs</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-indigo-600 h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{pm.completed} completed</span>
                <span>{pm.inProgress} in progress</span>
                <span>{pm.total - pm.completed - pm.inProgress} pending</span>
              </div>
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
          <div className="flex items-center space-x-4">
            <button
              onClick={exportDataAsPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              📊 Export Data
            </button>
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
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow border mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="customerFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <select
                id="customerFilter"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Customers</option>
                {customers.map(customer => (
                  <option key={customer} value={customer}>{customer}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="projectManagerFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Project Manager
              </label>
              <select
                id="projectManagerFilter"
                value={selectedProjectManager}
                onChange={(e) => setSelectedProjectManager(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Project Managers</option>
                {projectManagers.map(pm => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="dateRangeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                id="dateRangeFilter"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="thisyear">This Year</option>
              </select>
            </div>
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

      {/* Top Project Managers by Volume */}
      <div className="mt-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Project Managers by Volume</h3>
          {renderTopProjectManagersChart()}
        </div>
      </div>
    </div>
  );
}; 