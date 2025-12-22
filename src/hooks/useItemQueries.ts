import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import itemApi from "@/api/finance/itemApi";

// -----------------------------------------------------
//                    QUERY KEYS
// -----------------------------------------------------

export const itemKeys = {
  all: ["items"] as const,

  lists: () => [...itemKeys.all, "list"] as const,
  list: (companyId: string, params?: any) =>
    [...itemKeys.lists(), companyId, params] as const,

  details: () => [...itemKeys.all, "detail"] as const,
  detail: (companyId: string, itemId: string) =>
    [...itemKeys.details(), companyId, itemId] as const,

  stats: (companyId: string) => [...itemKeys.all, "stats", companyId] as const,
};

// -----------------------------------------------------
//                    QUERIES
// -----------------------------------------------------

// GET ALL ITEMS
export const useItems = (companyId: string, params?: any) =>
  useQuery({
    queryKey: itemKeys.list(companyId, params),
    queryFn: () => itemApi.getAllItems(companyId, params),
    enabled: !!companyId, // ⭐ VERY IMPORTANT
  });

// GET ITEM BY ID
export const useItemById = (companyId: string, itemId: string) =>
  useQuery({
    queryKey: itemKeys.detail(companyId, itemId),
    queryFn: () => itemApi.getItemById(companyId, itemId),
    enabled: !!companyId && !!itemId,
  });

// LOW STOCK ITEMS
export const useLowStockItems = (companyId: string) =>
  useQuery({
    queryKey: [...itemKeys.all, "low-stock", companyId],
    queryFn: () => itemApi.getLowStockItems(companyId),
    enabled: !!companyId,
  });

// ITEMS BY CATEGORY
export const useItemsByCategory = (companyId: string, categoryId: string) =>
  useQuery({
    queryKey: [...itemKeys.all, "category", companyId, categoryId],
    queryFn: () => itemApi.getItemsByCategory(companyId, categoryId),
    enabled: !!companyId && !!categoryId,
  });

// SEARCH ITEMS
export const useSearchItems = (companyId: string, params: { search: string }) =>
  useQuery({
    queryKey: [...itemKeys.all, "search", companyId, params],
    queryFn: () => itemApi.searchItems(companyId, params),
    enabled: !!companyId && !!params?.search,
  });

// ITEM STATISTICS
export const useItemStatistics = (companyId: string) =>
  useQuery({
    queryKey: itemKeys.stats(companyId),
    queryFn: () => itemApi.getItemStatistics(companyId),
    enabled: !!companyId,
  });

// -----------------------------------------------------
//                    MUTATIONS
// -----------------------------------------------------

// CREATE ITEM
export const useCreateItem = (companyId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: itemApi.createItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.lists() });
      toast.success("Item created successfully");
    },
  });
};

// UPDATE ITEM
export const useUpdateItem = (companyId: string, itemId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => itemApi.updateItem(companyId, itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.lists() });
      qc.invalidateQueries({
        queryKey: itemKeys.detail(companyId, itemId),
      });
      toast.success("Item updated successfully");
    },
  });
};

// DELETE ITEM
export const useDeleteItem = (companyId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => itemApi.deleteItem(companyId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.lists() });
      toast.success("Item deleted successfully");
    },
  });
};

// BULK DELETE ITEMS
export const useBulkDeleteItems = (companyId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (itemIds: string[]) =>
      itemApi.bulkDeleteItems(companyId, itemIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.lists() });
      toast.success("Items deleted successfully");
    },
  });
};

// UPDATE STOCK
export const useUpdateStock = (companyId: string, itemId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { quantity: number; type: "add" | "remove" }) =>
      itemApi.updateStock(companyId, itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.lists() });
      qc.invalidateQueries({
        queryKey: itemKeys.detail(companyId, itemId),
      });
      toast.success("Stock updated successfully");
    },
  });
};

// UPLOAD ITEM IMAGE
export const useUploadItemImage = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, file }: { itemId: string; file: File }) => {
      // Validate file before upload
      if (!file) {
        throw new Error("No file selected");
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error("Image must be less than 2MB");
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
      }

      return itemApi.uploadItemImage(itemId, file);
    },
    onSuccess: (data, variables) => {
      // Invalidate all item-related queries for consistency
      qc.invalidateQueries({
        queryKey: itemKeys.all,
      });

      toast.success("Image uploaded successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to upload image";
      toast.error(errorMessage);
    },
  });
};

// DELETE ITEM IMAGE
export const useDeleteItemImage = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => itemApi.deleteItemImage(itemId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: itemKeys.all,
      });
      toast.success("Image deleted successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to delete image";
      toast.error(errorMessage);
    },
  });
};

// UPDATE ITEM IMAGE (Upload new image replacing old one)
export const useUpdateItemImage = (itemId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // Validate file before upload
      if (!file) {
        throw new Error("No file selected");
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error("Image must be less than 2MB");
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
      }

      // Delete old image if exists
      try {
        await itemApi.deleteItemImage(itemId);
      } catch (error) {
        console.warn("Could not delete old image:", error);
      }

      // Upload new image
      return itemApi.uploadItemImage(itemId, file);
    },
    onSuccess: () => {
      // Invalidate all item-related queries for consistency
      qc.invalidateQueries({
        queryKey: itemKeys.all,
      });
      toast.success("Item image updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to update image";
      toast.error(errorMessage);
    },
  });
};
