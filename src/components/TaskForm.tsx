import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export interface Task {
  title: string;
  description: string;
  dueDate: Date | null;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo?: string;
}

interface TaskFormProps {
  onSubmit: (task: Task) => void;
  initialTask?: Task;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialTask }) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [dueDate, setDueDate] = useState<Date | null>(initialTask?.dueDate || null);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>(initialTask?.priority || 'Medium');
  const [status, setStatus] = useState<'Pending' | 'In Progress' | 'Completed'>(initialTask?.status || 'Pending');
  const [assignedTo, setAssignedTo] = useState(initialTask?.assignedTo || '');

  // Populate form when editing
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setDueDate(initialTask.dueDate || null);
      setPriority(initialTask.priority || 'Medium');
      setStatus(initialTask.status || 'Pending');
      setAssignedTo(initialTask.assignedTo || '');
    }
  }, [initialTask]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setTitle(value);
    } else if (name === 'description') {
      setDescription(value);
    } else if (name === 'assignedTo') {
      setAssignedTo(value);
    }
  };

  const handleDateChange = (date: Date | null) => {
    setDueDate(date);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as 'Low' | 'Medium' | 'High');
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as 'Pending' | 'In Progress' | 'Completed');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure title is not empty
    if (!title.trim()) {
      alert('Task title is required');
      return;
    }
    
    const newTask: Task = {
      title: title,
      description: description,
      dueDate: dueDate,
      priority: priority,
      status: status,
      assignedTo: assignedTo,
    };

    onSubmit(newTask);
  };

  const handleCancel = () => {
    // No resetForm needed as state is managed directly
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded bg-white shadow">
      <div className="flex flex-col gap-1">
        <label className="font-medium">Task Title *</label>
        <input
          className="border rounded px-2 py-1"
          name="title"
          value={title}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="font-medium">Description</label>
        <textarea
          className="border rounded px-2 py-1"
          name="description"
          value={description}
          onChange={handleChange}
          rows={3}
          placeholder="Enter task description..."
        />
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="font-medium">Due Date (Optional)</label>
        <DatePicker
          className="border rounded px-2 py-1"
          selected={dueDate}
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
            priority === 'Low' ? 'bg-gray-200 text-gray-800' :
            priority === 'Medium' ? 'bg-orange-200 text-orange-800' :
            'bg-red-200 text-red-800'
          }`}
          name="priority"
          value={priority}
          onChange={handlePriorityChange}
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
            status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
            status === 'In Progress' ? 'bg-blue-200 text-blue-800' :
            'bg-green-200 text-green-800'
          }`}
          name="status"
          value={status}
          onChange={handleStatusChange}
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
          value={assignedTo}
          onChange={handleChange}
          placeholder="Enter assignee name..."
        />
      </div>
      
      <div className="flex gap-2 mt-2">
        <button 
          type="submit" 
          className={`flex-1 px-4 py-2 rounded text-white transition-colors ${
            initialTask ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {initialTask ? 'Update Task' : 'Add Task'}
        </button>
        {initialTask && (
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