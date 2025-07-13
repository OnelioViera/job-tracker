import React from "react";
import { TaskForm, Task } from "./TaskForm";
import { ITask } from "../models/Task";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  editingTask: Task | null;
  onAddTask: (task: Task) => Promise<ITask>;
  onUpdateTask: (task: Task) => void;
  onCancelEdit: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  isEditing,
  editingTask,
  onAddTask,
  onUpdateTask,
  onCancelEdit,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      onCancelEdit();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Edit Task" : "Add New Task"}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <TaskForm
            onAddTask={async (task) => {
              const result = await onAddTask(task);
              onClose();
              return result;
            }}
            isEditing={isEditing}
            editingTask={editingTask}
            onUpdateTask={(task) => {
              onUpdateTask(task);
              onClose();
            }}
            onCancelEdit={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};
