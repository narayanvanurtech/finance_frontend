import axios from "axios";
import axiosInstance from "../../utils/axios";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface ParentCategory {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  companyId: string;
  name: string;
  description?: string;
  parentCategory?: ParentCategory | null;
  isActive: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  subcategoriesCount?: number;
  children?: Category[];
}

interface CreateCategoryPayload {
  companyId: string;
  name: string;
  description?: string;
  parentCategory?: string | null;
  isActive?: boolean;
}

interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  parentCategory?: string | null;
  isActive?: boolean;
}

interface GetCategoriesFilters {
  companyId: string;
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  parentCategory?: string | null;
}

interface PaginationInfo {
  current: number;
  total: number;
  count: number;
  limit: number;
}

interface GetCategoriesResponse {
  success: boolean;
  statusCode?: number;
  message: string;
  data?: Category[]; // New API format
  result?: {
    categories: Category[];
    pagination: PaginationInfo;
  };
  pagination?: PaginationInfo;
}

interface SingleCategoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Category;
}

interface DeleteResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

const categoryApi = {
  // Get all categories with optional filters
  getCategories: async (
    filters: GetCategoriesFilters
  ): Promise<GetCategoriesResponse> => {
    try {
      const params = new URLSearchParams();

      // companyId is required
      params.append("companyId", filters.companyId);

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (typeof filters.isActive === "boolean")
        params.append("isActive", filters.isActive.toString());
      if (filters.parentCategory !== undefined) {
        params.append("parentCategory", filters.parentCategory || "null");
      }

      const response = await axiosInstance.get(
        `/api/v1/finance/inventory/category?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching categories");
    }
  },

  // Create a new category
  createCategory: async (
    categoryData: CreateCategoryPayload
  ): Promise<SingleCategoryResponse> => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/finance/inventory/category",
        categoryData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error creating category");
    }
  },

  // Get category by ID
  getCategoryById: async (
    categoryId: string
  ): Promise<SingleCategoryResponse> => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/finance/inventory/category/${categoryId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching category");
    }
  },

  // Update an existing category
  updateCategory: async (
    categoryId: string,
    categoryData: UpdateCategoryPayload
  ): Promise<SingleCategoryResponse> => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/finance/inventory/category/${categoryId}`,
        categoryData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      // If it's not an axiosInstance error (very rare), throw a generic one
      throw new Error("Unexpected error while updating category");
    }
  },

  // Delete a category
  deleteCategory: async (categoryId: string): Promise<DeleteResponse> => {
    try {
      const response = await axiosInstance.delete(
        `/api/v1/finance/inventory/category/${categoryId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error deleting category");
    }
  },

  // Get category hierarchy
  getCategoryHierarchy: async (): Promise<{
    success: boolean;
    statusCode: number;
    message: string;
    result: Category[];
  }> => {
    try {
      const response = await axiosInstance.get(
        "/api/v1/finance/inventory/category/hierarchy/all"
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching category hierarchy");
    }
  },
};

export default categoryApi;
export type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  GetCategoriesFilters,
  GetCategoriesResponse,
  SingleCategoryResponse,
  DeleteResponse,
  PaginationInfo,
  User,
  ParentCategory,
};
