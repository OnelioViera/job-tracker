import React, { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { ITask } from '../models/Task';

interface TaskListProps {
  tasks: ITask[];
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  jobs: any[];
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onDeleteTask, onEditTask, jobs }) => {
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
      case 'High': return 'text-red-700';
      case 'Medium': return 'text-yellow-800';
      case 'Low': return 'text-green-800';
      default: return 'text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-700';
      case 'In Progress': return 'text-blue-700';
      case 'Completed': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  const renderTaskTable = (taskList: ITask[], title: string, isCompleted: boolean = false) => {
    if (taskList.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Title</th>
                <th className="border px-2 py-1">Description</th>
                <th className="border px-2 py-1">Due Date</th>
                <th className="border px-2 py-1">Priority</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Assigned To</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {taskList.map((task) => (
                <tr key={task._id} className={`even:bg-gray-50 ${isCompleted ? 'opacity-75' : ''}`}>
                  <td className="border px-2 py-1 font-medium">{task.title}</td>
                  <td className="border px-2 py-1">
                    {task.description ? (
                      <div className="max-w-xs truncate" title={task.description}>
                        {task.description}
                      </div>
                    ) : (
                      <span className="text-gray-400">No description</span>
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </td>
                  <td className="border px-2 py-1 font-bold">
                    <span className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="border px-2 py-1 font-bold">
                    <span className={getStatusColor(task.status)}>
                      {task.status}
                    </span>
                  </td>
                  <td className="border px-2 py-1">
                    {task.assignedTo || 'Unassigned'}
                  </td>
                  <td className="border px-2 py-1 text-center">
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
    );
  };

  if (tasks.length === 0) {
    return <div className="text-gray-900 mt-4">No tasks added yet.</div>;
  }

  return (
    <div className="mt-8 w-full max-w-6xl">
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