import axios from "axios";
import axiosInstance from "../../utils/axios";

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
  companyId: string;
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
  companyId: string;
  search?: string;
  isActive?: boolean;
  category?: string;
  page?: number;
  limit?: number;
}

interface PaginationInfo {
  current: number;
  total: number;
  count: number;
  limit: number;
}

interface GetSubcategoriesResponse {
  success: boolean;
  statusCode?: number;
  message: string;
  data?: Subcategory[]; // New API format
  result?: {
    subcategories: Subcategory[];
    pagination: PaginationInfo;
  };
  pagination?: PaginationInfo;
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
  getSubcategories: async (
    filters: GetSubcategoriesFilters
  ): Promise<Subcategory[]> => {
    try {
      const params = new URLSearchParams();

      // companyId is required
      params.append("companyId", filters.companyId);

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (typeof filters.isActive === "boolean")
        params.append("isActive", filters.isActive.toString());
      if (filters.category) params.append("category", filters.category);

      const response = await axiosInstance.get(
        `/api/v1/finance/inventory/subcategory?${params.toString()}`
      );

      // Return the subcategories array directly from data property
      return (
        response.data?.data ||
        response.data?.result?.subcategories ||
        response.data?.result ||
        []
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching subcategories");
    }
  },

  // Create a new subcategory
  createSubcategory: async (
    subcategoryData: CreateSubcategoryPayload
  ): Promise<Subcategory> => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/finance/inventory/subcategory",
        subcategoryData
      );
      // Return the subcategory object directly from data property
      return response.data?.data || response.data?.result || response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error creating subcategory");
    }
  },

  // Get subcategory by ID
  getSubcategoryById: async (subcategoryId: string): Promise<Subcategory> => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/finance/inventory/subcategory/${subcategoryId}`
      );
      // Return the subcategory object directly from data property
      return response.data?.data || response.data?.result || response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching subcategory");
    }
  },

  // Update an existing subcategory
  updateSubcategory: async (
    subcategoryId: string,
    subcategoryData: UpdateSubcategoryPayload
  ): Promise<Subcategory> => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/finance/inventory/subcategory/${subcategoryId}`,
        subcategoryData
      );
      // Return the subcategory object directly from data property
      return response.data?.data || response.data?.result || response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Unexpected error while updating subcategory");
    }
  },

  // Delete a subcategory
  deleteSubcategory: async (subcategoryId: string): Promise<DeleteResponse> => {
    try {
      const response = await axiosInstance.delete(
        `/api/v1/finance/inventory/subcategory/${subcategoryId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error deleting subcategory");
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
  PaginationInfo,
  User,
  Category,
};
