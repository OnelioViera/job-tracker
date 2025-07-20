import React, { useState } from 'react';
import { Task } from './TaskForm';
import { TaskList } from './TaskList';
import { TaskModal } from './TaskModal';
import { ITask } from '../models/Task';

interface TasksPageProps {
  tasks: ITask[];
  onAddTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ 
  tasks, 
  onAddTask, 
  onDeleteTask
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = (task: Task) => {
    onAddTask(task);
    setIsModalOpen(false);
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      setEditingTask({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedTo || ''
      });
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Task
        </button>
      </div>

      <TaskList 
        tasks={tasks} 
        onDeleteTask={onDeleteTask} 
        onEditTask={handleEditTask}
      />
      
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddTask}
        initialTask={editingTask || undefined}
      />
    </div>
  );
}; 