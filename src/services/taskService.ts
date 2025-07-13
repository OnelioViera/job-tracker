import { ITask } from "@/models/Task";

export interface TaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed";
  assignedTo?: string;
}

export class TaskService {
  static async getAllTasks(): Promise<ITask[]> {
    const response = await fetch("/api/tasks");
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return response.json();
  }

  static async createTask(taskData: TaskData): Promise<ITask> {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error("Failed to create task");
    }

    return response.json();
  }

  static async updateTask(
    id: string,
    taskData: Partial<TaskData>
  ): Promise<ITask> {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error("Failed to update task");
    }

    return response.json();
  }

  static async deleteTask(id: string): Promise<void> {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  }

  static async getTask(id: string): Promise<ITask> {
    const response = await fetch(`/api/tasks/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch task");
    }

    return response.json();
  }
}
