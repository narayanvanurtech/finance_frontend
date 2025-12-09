import { create } from 'zustand';
import taskApi, { Task, CreateTaskPayload, UpdateTaskPayload, TaskFilters } from '../../api/taskApi';

interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  totalTasks: number;
  currentPage: number;
  totalPages: number;
  // Actions
  fetchTasks: (companyId: string, filters?: TaskFilters) => Promise<void>;
  getTaskById: (taskId: string, companyId: string) => Promise<void>;
  addTask: (leadId: string, companyId: string, task: CreateTaskPayload) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteAllTasks: (companyId: string) => Promise<void>;
  bulkDeleteTasks: (taskIds: string[]) => Promise<void>;
  updateTask: (taskId: string, taskData: UpdateTaskPayload) => Promise<void>;
  fetchLeadTasks: (leadId: string, companyId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  totalTasks: 0,
  currentPage: 1,
  totalPages: 1,

  getTaskById: async (taskId: string, companyId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await taskApi.getTaskById(taskId, companyId);
      set({ currentTask: response.result.task, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch task',
        isLoading: false 
      });
    }
  },

  fetchTasks: async (companyId: string, filters?: TaskFilters) => {
    try {
      set({ isLoading: true, error: null });
      const response = await taskApi.getAllTasks(companyId, filters);
      set({ 
        tasks: response.result.tasks, 
        isLoading: false,
        totalTasks: response.result.total,
        currentPage: response.result.currentPage,
        totalPages: response.result.totalPages
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tasks', 
        isLoading: false 
      });
    }
  },

  addTask: async (leadId: string, companyId: string, taskData: CreateTaskPayload) => {
    try {
      set({ isLoading: true, error: null });
      await taskApi.createTask(leadId, companyId, taskData);
      // Refresh the tasks list after adding
      await get().fetchTasks(companyId);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add task',
        isLoading: false 
      });
    }
  },

  // updateTask: async (id: string, taskData: UpdateTaskPayload) => {
  //   try {
  //     set({ isLoading: true, error: null });
  //     // id is already the MongoDB ObjectId (_id)
  //     await taskApi.updateTask(id, taskData);
  //     // Update the local state
  //     const tasks = get().tasks.map(task =>
  //       task.id === id ? { ...task, ...taskData } : task
  //     ) as Task[];
  //     set({ tasks, isLoading: false });
  //   } catch (error) {
  //     set({ 
  //       error: error instanceof Error ? error.message : 'Failed to update task',
  //       isLoading: false 
  //     });
  //   }
  // },

  deleteTask: async (taskId: string) => {
    try {
      set({ isLoading: true, error: null });
      await taskApi.deleteTask(taskId);
      // Remove the task from local state
      const tasks = get().tasks.filter(task => task.id !== taskId);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete task',
        isLoading: false 
      });
      throw error; // Re-throw so component can handle it
    }
  },

  deleteAllTasks: async (companyId: string) => {
    try {
      set({ isLoading: true, error: null });
      // Get all current task IDs and use bulk delete
      const currentTasks = get().tasks;
      const allTaskIds = currentTasks.map(task => task.id);
      
      if (allTaskIds.length > 0) {
        await taskApi.bulkDeleteTasks(allTaskIds);
      }
      
      // Clear all tasks from local state
      set({ tasks: [], isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete all tasks',
        isLoading: false 
      });
      throw error;
    }
  },

  bulkDeleteTasks: async (taskIds: string[]) => {
    try {
      set({ isLoading: true, error: null });
      await taskApi.bulkDeleteTasks(taskIds);
      // Remove the tasks from local state
      const tasks = get().tasks.filter(task => !taskIds.includes(task.id));
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete tasks',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchTasksWithFilters: async (companyId: string, filters: TaskFilters) => {
    try {
      set({ isLoading: true, error: null });
      const response = await taskApi.getAllTasks(companyId, filters);
      set({ tasks: response.result.tasks, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tasks with filters', 
        isLoading: false 
      });
    }
  },

  updateTask: async (taskId: string, taskData: UpdateTaskPayload) => {
    try {
      set({ isLoading: true, error: null });
      
      // Call the API with taskId
      await taskApi.updateTask(taskId, taskData);
      
      // Update the current task if it matches the updated task
      const currentTask = get().currentTask;
      if (currentTask && currentTask.id === taskId) {
        set({ 
          currentTask: { ...currentTask, ...taskData },
          isLoading: false 
        });
      }
      
      // Update the task in the tasks array
      const tasks = get().tasks.map(task => 
        task.id === taskId ? { ...task, ...taskData } : task
      );
      set({ tasks, isLoading: false });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update task',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchLeadTasks: async (leadId: string, companyId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await taskApi.getLeadAllTasks(leadId, companyId);
      set({ 
        tasks: response.result.tasks, 
        isLoading: false,
        totalTasks: response.result.total,
        currentPage: response.result.currentPage,
        totalPages: response.result.totalPages
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch lead tasks', 
        isLoading: false 
      });
    }
  },

  setError: (error: string | null) => set({ error }),
}));


