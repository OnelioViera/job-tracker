import React, { useState } from "react";
import { Task } from "./TaskForm";
import { TaskList } from "./TaskList";
import { TaskModal } from "./TaskModal";
import { ITask } from "../models/Task";

interface TasksPageProps {
  tasks: ITask[];
  onAddTask: (task: Task) => Promise<ITask>;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, task: Task) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
}) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditTask = (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (task) {
      // Convert ITask to Task interface
      const taskForEdit: Task = {
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedTo || "",
      };
      setEditingTask(taskForEdit);
      setEditingTaskId(taskId);
      setIsModalOpen(true);
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    if (editingTaskId) {
      onUpdateTask(editingTaskId, updatedTask);
      setEditingTask(null);
      setEditingTaskId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditingTaskId(null);
  };

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setEditingTaskId(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setEditingTaskId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Tasks</h2>
        <p className="text-gray-600">Add new tasks and manage existing ones</p>
      </div>

      <div className="mb-6">
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Add New Task
        </button>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Task List</h3>
        <TaskList
          tasks={tasks}
          onDeleteTask={onDeleteTask}
          onEditTask={handleEditTask}
        />
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isEditing={!!editingTask}
        editingTask={editingTask}
        onAddTask={onAddTask}
        onUpdateTask={handleUpdateTask}
        onCancelEdit={handleCancelEdit}
      />
    </div>
  );
};
