import axios from 'axios';
import axiosInstance from '../../utils/axios';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Subcategory {
  _id: string;
  companyId: string;
  name: string;
  description?: string;
  category: Category;
  isActive: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

interface CreateSubcategoryPayload {
  name: string;
  description?: string;
  category: string;
  isActive?: boolean;
}

interface UpdateSubcategoryPayload {
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

interface GetSubcategoriesFilters {
  search?: string;
  isActive?: boolean;
  category?: string;
}

interface GetSubcategoriesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Subcategory[];
}

interface SingleSubcategoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Subcategory;
}

interface DeleteResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

const subcategoryApi = {
  // Get all subcategories with optional filters
  getSubcategories: async (filters: GetSubcategoriesFilters = {}): Promise<GetSubcategoriesResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (typeof filters.isActive === 'boolean') params.append('isActive', filters.isActive.toString());
      if (filters.category) params.append('category', filters.category);

      const response = await axiosInstance.get(`/api/v1/finance/inventory/subcategory?${params.toString()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error fetching subcategories');
    }
  },

  // Create a new subcategory
  createSubcategory: async (subcategoryData: CreateSubcategoryPayload): Promise<SingleSubcategoryResponse> => {
    try {
      const response = await axiosInstance.post('/api/v1/finance/inventory/subcategory', subcategoryData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error creating subcategory');
    }
  },

  // Get subcategory by ID
  getSubcategoryById: async (subcategoryId: string): Promise<SingleSubcategoryResponse> => {
    try {
      const response = await axiosInstance.get(`/api/v1/finance/inventory/subcategory/${subcategoryId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error fetching subcategory');
    }
  },

  // Update an existing subcategory
  updateSubcategory: async (subcategoryId: string, subcategoryData: UpdateSubcategoryPayload): Promise<SingleSubcategoryResponse> => {
    try {
      const response = await axiosInstance.put(`/api/v1/finance/inventory/subcategory/${subcategoryId}`, subcategoryData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Unexpected error while updating subcategory');
    }
  },

  // Delete a subcategory
  deleteSubcategory: async (subcategoryId: string): Promise<DeleteResponse> => {
    try {
      const response = await axiosInstance.delete(`/api/v1/finance/inventory/subcategory/${subcategoryId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error deleting subcategory');
    }
  },
};

export default subcategoryApi;
export type {
  Subcategory,
  CreateSubcategoryPayload,
  UpdateSubcategoryPayload,
  GetSubcategoriesFilters,
  GetSubcategoriesResponse,
  SingleSubcategoryResponse,
  DeleteResponse,
  User,
  Category
};
