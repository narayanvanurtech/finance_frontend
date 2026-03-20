import axios from '../utils/axios';

export interface TaskResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    total: number;
    currentPage: number;
    totalPages: number;
    tasks: Task[];
  };
}

export interface SingleTaskResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    totalTasks: number;
    task: Task;
  };
}

export interface TaskFilters {
  title?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'progress' | 'done' | 'cancel';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completedAt: string | null;
  taskOwner: {
    id: string;
    name: string;
    email: string;
  };
  assign: {
    id: string;
    name: string;
    email: string;
  } | null;
  company: {
    id: string;
    name: string;
  };
  lead: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'open' | 'progress' | 'done' | 'cancel';
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  status?: 'open' | 'progress' | 'done' | 'cancel';
}

const taskApi = {
  getTaskById: async (taskId: string, companyId: string): Promise<SingleTaskResponse> => {
    try {
      const response = await axios.get<SingleTaskResponse>(
        `/api/v1/task/getTaskById/${taskId}/${companyId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllTasks: async (companyId: string, filters?: TaskFilters): Promise<TaskResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      const response = await axios.get<TaskResponse>(
        `/api/v1/task/getAllTask/${companyId}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTask: async (leadId: string, companyId: string, taskData: CreateTaskPayload) => {
    try {
      const response = await axios.post(
        `/api/v1/task/createNewTask/${leadId}/${companyId}`,
        taskData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTask: async (taskId: string, taskData: UpdateTaskPayload) => {
    try {
      const response = await axios.put(
        `/api/v1/task/updateTask/${taskId}`,
        taskData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      //console.log('Deleting task with ID:', taskId);
      const response = await axios.delete(`/api/v1/task/deleteTask/${taskId}`);
      //console.log('Delete task response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Delete task error:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting task. Please try again.');
      } else if (error.response?.status === 404) {
        throw new Error('Task not found or may have already been deleted.');
      } else {
        throw new Error('Failed to delete task. Please check your connection and try again.');
      }
    }
  },

  bulkDeleteTasks: async (taskIds: string[]) => {
    try {
      const response = await axios.delete('/api/v1/task/bulkTaskDelete', {
        data: { taskIds }
      });
      return response.data;
    } catch (error: any) {
      console.error('Bulk delete tasks error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting tasks. Please try again.');
      } else {
        throw new Error('Failed to delete tasks. Please check your connection and try again.');
      }
    }
  },

  getLeadAllTasks: async (leadId: string, companyId: string): Promise<TaskResponse> => {
    try {
      const response = await axios.get<TaskResponse>(
        `/api/v1/task/getLeadAllTasks/${leadId}/${companyId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default taskApi;
