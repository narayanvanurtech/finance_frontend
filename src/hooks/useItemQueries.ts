import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import itemApi, {
  Item,
  ItemFilters,
  UpdateStockPayload,
} from "@/api/finance/itemApi";

// Query keys
export const itemKeys = {
  all: ["items"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
  list: (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    filters?: ItemFilters;
  }) => [...itemKeys.lists(), params] as const,
  details: () => [...itemKeys.all, "detail"] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,
  lowStock: () => [...itemKeys.all, "lowStock"] as const,
  byCategory: (categoryId: string) =>
    [...itemKeys.all, "category", categoryId] as const,
  search: (searchTerm: string) =>
    [...itemKeys.all, "search", searchTerm] as const,
  statistics: () => [...itemKeys.all, "statistics"] as const,
};

// ===========================
// QUERY HOOKS
// ===========================

/**
 * Hook to fetch all items with optional filters, pagination, and sorting
 */
export const useGetItems = (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: ItemFilters;
}) => {
  return useQuery({
    queryKey: itemKeys.list(params),
    queryFn: async () => {
      try {
        const response = await itemApi.getAllItems(params);
        return response;
      } catch (error) {
        console.error("❌ Error fetching items:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook to fetch a single item by ID
 */
export const useGetItemById = (itemId: string, enabled = true) => {
  return useQuery({
    queryKey: itemKeys.detail(itemId),
    queryFn: () => itemApi.getItemById(itemId),
    enabled: !!itemId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch low stock items
 */
export const useGetLowStockItems = () => {
  return useQuery({
    queryKey: itemKeys.lowStock(),
    queryFn: () => itemApi.getLowStockItems(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch items by category
 */
export const useGetItemsByCategory = (categoryId: string, enabled = true) => {
  return useQuery({
    queryKey: itemKeys.byCategory(categoryId),
    queryFn: () => itemApi.getItemsByCategory(categoryId),
    enabled: !!categoryId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to search items
 */
export const useSearchItems = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: itemKeys.search(searchTerm),
    queryFn: () => itemApi.searchItems(searchTerm),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to fetch item statistics
 */
export const useGetItemStatistics = () => {
  return useQuery({
    queryKey: itemKeys.statistics(),
    queryFn: () => itemApi.getItemStatistics(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// ===========================
// MUTATION HOOKS
// ===========================

/**
 * Hook to create a new item
 */
export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Item>) => itemApi.createItem(data),
    onSuccess: (response) => {
      // Invalidate and refetch item lists
      queryClient.invalidateQueries({
        queryKey: itemKeys.lists(),
      });
      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: itemKeys.statistics(),
      });
      toast.success(response.message || "Item created successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create item";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to update an existing item
 */
export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: Partial<Item> }) =>
      itemApi.updateItem(itemId, data),
    onSuccess: (response, variables) => {
      // Invalidate specific item detail
      queryClient.invalidateQueries({
        queryKey: itemKeys.detail(variables.itemId),
      });
      // Invalidate item lists
      queryClient.invalidateQueries({
        queryKey: itemKeys.lists(),
      });
      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: itemKeys.statistics(),
      });
      toast.success(response.message || "Item updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update item";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to delete an item
 */
export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => itemApi.deleteItem(itemId),
    onSuccess: (response) => {
      // Invalidate item lists
      queryClient.invalidateQueries({
        queryKey: itemKeys.lists(),
      });
      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: itemKeys.statistics(),
      });
      toast.success(response.message || "Item deleted successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete item";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to bulk delete items
 */
export const useBulkDeleteItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemIds: string[]) => itemApi.bulkDeleteItems(itemIds),
    onSuccess: (response) => {
      // Invalidate item lists
      queryClient.invalidateQueries({
        queryKey: itemKeys.lists(),
      });
      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: itemKeys.statistics(),
      });
      toast.success(
        response.message ||
          `${response.result.deletedCount} item(s) deleted successfully`
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete items";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to update item stock
 */
export const useUpdateItemStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: UpdateStockPayload;
    }) => itemApi.updateStock(itemId, payload),
    onSuccess: (response, variables) => {
      // Invalidate specific item detail
      queryClient.invalidateQueries({
        queryKey: itemKeys.detail(variables.itemId),
      });
      // Invalidate item lists
      queryClient.invalidateQueries({
        queryKey: itemKeys.lists(),
      });
      // Invalidate low stock items
      queryClient.invalidateQueries({
        queryKey: itemKeys.lowStock(),
      });
      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: itemKeys.statistics(),
      });
      toast.success(response.message || "Stock updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update stock";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to upload item image
 */
export const useUploadItemImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, file }: { itemId: string; file: File }) =>
      itemApi.uploadItemImage(itemId, file),
    onSuccess: (response, variables) => {
      // Invalidate specific item detail
      queryClient.invalidateQueries({
        queryKey: itemKeys.detail(variables.itemId),
      });
      // Invalidate item lists
      queryClient.invalidateQueries({
        queryKey: itemKeys.lists(),
      });
      toast.success(response.message || "Image uploaded successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload image";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to delete item image
 */
export const useDeleteItemImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => itemApi.deleteItemImage(itemId),
    onSuccess: (response, itemId) => {
      // Invalidate specific item detail
      queryClient.invalidateQueries({
        queryKey: itemKeys.detail(itemId),
      });
      // Invalidate item lists
      queryClient.invalidateQueries({
        queryKey: itemKeys.lists(),
      });
      toast.success(response.message || "Image deleted successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete image";
      toast.error(errorMessage);
    },
  });
};
