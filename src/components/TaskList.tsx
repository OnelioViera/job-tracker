import React, { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { ITask } from '../models/Task';

interface TaskListProps {
  tasks: ITask[];
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onDeleteTask, onEditTask }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; taskId: string | null; taskTitle: string }>({
    isOpen: false,
    taskId: null,
    taskTitle: ''
  });

  const pendingTasks = tasks.filter(task => task.status === 'Pending');
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
  const completedTasks = tasks.filter(task => task.status === 'Completed');

  const handleDeleteClick = (taskId: string, taskTitle: string) => {
    setDeleteConfirm({
      isOpen: true,
      taskId: taskId,
      taskTitle: taskTitle
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.taskId) {
      onDeleteTask(deleteConfirm.taskId);
    }
  };

  const handleCloseConfirm = () => {
    setDeleteConfirm({
      isOpen: false,
      taskId: null,
      taskTitle: ''
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTaskTable = (taskList: ITask[], title: string, isCompleted: boolean = false) => {
    if (taskList.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taskList.map((task) => (
                  <tr key={task._id} className={`hover:bg-gray-50 ${isCompleted ? 'opacity-75' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {task.description ? (
                          <div className="truncate" title={task.description}>
                            {task.description}
                          </div>
                        ) : (
                          <span className="text-gray-400">No description</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2 justify-center">
                        <button
                          className="text-blue-600 hover:text-blue-800 font-bold"
                          onClick={() => onEditTask(task._id!)}
                          title="Edit task"
                        >
                          ✏️
                        </button>
                        <button
                          className="text-red-700 hover:text-red-900 font-bold"
                          onClick={() => handleDeleteClick(task._id!, task.title)}
                          title="Delete task"
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
      </div>
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border p-8">
        <div className="text-center">
          <div className="p-4 bg-gray-100 rounded-lg inline-block mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500">No tasks added yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {renderTaskTable(pendingTasks, 'Pending Tasks')}
      {renderTaskTable(inProgressTasks, 'In Progress Tasks')}
      {renderTaskTable(completedTasks, 'Completed Tasks', true)}
      
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteConfirm.taskTitle}"? This action cannot be undone.`}
        confirmText="Yes, Delete Task"
        cancelText="Cancel"
      />
    </div>
  );
}; 