import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import categoryApi, {
  CreateCategoryPayload,
  UpdateCategoryPayload,
  GetCategoriesFilters,
} from "@/api/finance/categoryApi";

// Query keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: GetCategoriesFilters) =>
    [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// ===========================
// QUERY HOOKS
// ===========================

/**
 * Hook to fetch all categories with optional filters and pagination
 */
export const useGetCategories = (
  filters: GetCategoriesFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: async () => {
      try {
        const response = await categoryApi.getCategories(filters);
        // API returns different structures - handle all cases
        if (response.data) {
          // If data is an array, return it with pagination from response
          if (Array.isArray(response.data)) {
            return {
              categories: response.data,
              pagination: response.pagination || response.result?.pagination,
            };
          }
          // If data has categories field
          return response.data;
        }
        if (response.result?.categories) {
          return {
            categories: response.result.categories,
            pagination: response.result.pagination,
          };
        }
        return { categories: [], pagination: null };
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
    enabled: options?.enabled !== false && !!filters.companyId, // Must have companyId
  });
};

/**
 * Hook to fetch a single category by ID
 */
export const useGetCategoryById = (categoryId: string, enabled = true) => {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: async () => {
      const response = await categoryApi.getCategoryById(categoryId);
      return response.result;
    },
    enabled: !!categoryId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ===========================
// MUTATION HOOKS
// ===========================

/**
 * Hook to create a new category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const response = await categoryApi.createCategory(payload);
      return response.result;
    },
    onSuccess: (data) => {
      // Invalidate categories list to refetch
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category created successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create category";
      toast.error(errorMessage);
      console.error("❌ Error creating category:", error);
    },
  });
};

/**
 * Hook to update an existing category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: UpdateCategoryPayload;
    }) => {
      const response = await categoryApi.updateCategory(categoryId, payload);
      return response.result;
    },
    onSuccess: (data, variables) => {
      // Invalidate categories list and the specific category detail
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.categoryId),
      });
      toast.success("Category updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update category";
      toast.error(errorMessage);
      console.error("❌ Error updating category:", error);
    },
  });
};

/**
 * Hook to delete a category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await categoryApi.deleteCategory(categoryId);
      return response;
    },
    onSuccess: () => {
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category deleted successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete category";
      toast.error(errorMessage);
      console.error("❌ Error deleting category:", error);
    },
  });
};

/**
 * Hook to bulk delete categories
 */
export const useBulkDeleteCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryIds: string[]) => {
      // Delete categories one by one since bulkDelete doesn't exist
      const promises = categoryIds.map((id) => categoryApi.deleteCategory(id));
      await Promise.all(promises);
      return { success: true };
    },
    onSuccess: (data, variables) => {
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success(`${variables.length} categories deleted successfully`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete categories";
      toast.error(errorMessage);
      console.error("❌ Error bulk deleting categories:", error);
    },
  });
};
