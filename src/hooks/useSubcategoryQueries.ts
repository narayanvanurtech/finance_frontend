import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import subcategoryApi, {
  CreateSubcategoryPayload,
  UpdateSubcategoryPayload,
  GetSubcategoriesFilters,
} from "@/api/finance/subCategoryApi";

// Query keys
export const subcategoryKeys = {
  all: ["subcategories"] as const,
  lists: () => [...subcategoryKeys.all, "list"] as const,
  list: (filters?: GetSubcategoriesFilters) =>
    [...subcategoryKeys.lists(), filters] as const,
  details: () => [...subcategoryKeys.all, "detail"] as const,
  detail: (id: string) => [...subcategoryKeys.details(), id] as const,
};

// ===========================
// QUERY HOOKS
// ===========================

/**
 * Hook to fetch all subcategories with optional filters and pagination
 */
export const useGetSubcategories = (
  filters: GetSubcategoriesFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: subcategoryKeys.list(filters),
    queryFn: async () => {
      try {
        const response = await subcategoryApi.getSubcategories(filters);
        return response;
      } catch (error) {
        console.error("❌ Error fetching subcategories:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
    enabled: options?.enabled !== false, // Default to true, but allow override
  });
};

/**
 * Hook to fetch a single subcategory by ID
 */
export const useGetSubcategoryById = (
  subcategoryId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: subcategoryKeys.detail(subcategoryId),
    queryFn: async () => {
      const response = await subcategoryApi.getSubcategoryById(subcategoryId);
      return response;
    },
    enabled: !!subcategoryId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ===========================
// MUTATION HOOKS
// ===========================

/**
 * Hook to create a new subcategory
 */
export const useCreateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSubcategoryPayload) => {
      const response = await subcategoryApi.createSubcategory(payload);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate subcategories list to refetch
      queryClient.invalidateQueries({ queryKey: subcategoryKeys.lists() });
      toast.success("Subcategory created successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create subcategory";
      toast.error(errorMessage);
      console.error("❌ Error creating subcategory:", error);
    },
  });
};

/**
 * Hook to update an existing subcategory
 */
export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subcategoryId,
      payload,
    }: {
      subcategoryId: string;
      payload: UpdateSubcategoryPayload;
    }) => {
      const response = await subcategoryApi.updateSubcategory(
        subcategoryId,
        payload
      );
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate subcategories list and the specific subcategory detail
      queryClient.invalidateQueries({ queryKey: subcategoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: subcategoryKeys.detail(variables.subcategoryId),
      });
      toast.success("Subcategory updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update subcategory";
      toast.error(errorMessage);
      console.error("❌ Error updating subcategory:", error);
    },
  });
};

/**
 * Hook to delete a subcategory
 */
export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subcategoryId: string) => {
      const response = await subcategoryApi.deleteSubcategory(subcategoryId);
      return response;
    },
    onSuccess: () => {
      // Invalidate subcategories list
      queryClient.invalidateQueries({ queryKey: subcategoryKeys.lists() });
      toast.success("Subcategory deleted successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete subcategory";
      toast.error(errorMessage);
      console.error("❌ Error deleting subcategory:", error);
    },
  });
};

/**
 * Hook to bulk delete subcategories
 */
export const useBulkDeleteSubcategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subcategoryIds: string[]) => {
      // Delete subcategories one by one since bulkDelete doesn't exist
      const promises = subcategoryIds.map((id) =>
        subcategoryApi.deleteSubcategory(id)
      );
      await Promise.all(promises);
      return { success: true };
    },
    onSuccess: (data, variables) => {
      // Invalidate subcategories list
      queryClient.invalidateQueries({ queryKey: subcategoryKeys.lists() });
      toast.success(`${variables.length} subcategories deleted successfully`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete subcategories";
      toast.error(errorMessage);
      console.error("❌ Error bulk deleting subcategories:", error);
    },
  });
};
