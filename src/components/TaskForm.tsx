import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ITask } from '../models/Task';

export interface Task {
  title: string;
  description?: string;
  dueDate: Date | null;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo?: string;
}

interface TaskFormProps {
  onAddTask: (task: Task) => Promise<ITask>;
  onTaskUpdated?: (task: ITask) => void;
  isEditing?: boolean;
  editingTask?: Task | null;
  editingTaskId?: string | null;
  onUpdateTask?: (task: Task) => void;
  onCancelEdit?: () => void;
  projectManagers: string[];
  jobs: any[];
}

export const TaskForm: React.FC<TaskFormProps> = ({ 
  onAddTask, 
  onTaskUpdated,
  isEditing = false, 
  editingTask = null, 
  editingTaskId = null,
  onUpdateTask, 
  onCancelEdit,
  projectManagers,
  jobs
}) => {
  const [form, setForm] = useState<Task>({
    title: '',
    description: '',
    dueDate: null,
    priority: 'Low',
    status: 'Pending',
    assignedTo: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditing && editingTask) {
      setForm(editingTask);
    }
  }, [isEditing, editingTask]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setForm((prev) => ({ ...prev, dueDate: date }));
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      dueDate: null,
      priority: 'Low',
      status: 'Pending',
      assignedTo: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure title is not empty
    if (!form.title.trim()) {
      alert('Task title is required');
      return;
    }
    
    if (isEditing && onUpdateTask) {
      onUpdateTask(form);
    } else {
      await onAddTask(form);
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
        <label className="font-medium">Task Title *</label>
        <input
          className="border rounded px-2 py-1"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="font-medium">Description</label>
        <textarea
          className="border rounded px-2 py-1"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Enter task description..."
        />
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="font-medium">Due Date (Optional)</label>
        <DatePicker
          className="border rounded px-2 py-1"
          selected={form.dueDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select due date (optional)"
          minDate={new Date()}
        />
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="font-medium">Priority</label>
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
        <label className="font-medium">Status</label>
        <select
          className={`border rounded px-2 py-1 font-medium ${
            form.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
            form.status === 'In Progress' ? 'bg-blue-200 text-blue-800' :
            'bg-green-200 text-green-800'
          }`}
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="Pending" className="bg-yellow-200 text-yellow-800">Pending</option>
          <option value="In Progress" className="bg-blue-200 text-blue-800">In Progress</option>
          <option value="Completed" className="bg-green-200 text-green-800">Completed</option>
        </select>
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="font-medium">Assigned To</label>
        <input
          className="border rounded px-2 py-1"
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
          placeholder="Enter assignee name..."
        />
      </div>
      
      <div className="flex gap-2 mt-2">
        <button 
          type="submit" 
          className={`flex-1 px-4 py-2 rounded text-white transition-colors ${
            isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isEditing ? 'Update Task' : 'Add Task'}
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