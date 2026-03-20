import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import purchaseExpenseApi, {
  CreatePurchasePayload,
  UpdatePurchasePayload,
  UpdatePaymentStatusPayload,
  UpdateDeliveryStatusPayload,
  AddAttachmentPayload,
  GetPurchasesFilters,
  UpdatePriorityPayload,
  DuplicatePurchasePayload,
} from "@/api/finance/puchase-expenseeApi";

// Query keys
export const purchaseExpenseKeys = {
  all: ["purchaseExpenses"] as const,
  lists: () => [...purchaseExpenseKeys.all, "list"] as const,
  list: (filters: GetPurchasesFilters) =>
    [...purchaseExpenseKeys.lists(), filters] as const,
  search: (filters: GetPurchasesFilters) =>
    [...purchaseExpenseKeys.all, "search", filters] as const,
  stats: () => [...purchaseExpenseKeys.all, "stats"] as const,
  pending: () => [...purchaseExpenseKeys.all, "pending"] as const,
  summary: (startDate: string, endDate: string) =>
    [...purchaseExpenseKeys.all, "summary", startDate, endDate] as const,
  byVendor: (vendorId: string, filters: GetPurchasesFilters) =>
    [...purchaseExpenseKeys.all, "byVendor", vendorId, filters] as const,
  details: () => [...purchaseExpenseKeys.all, "detail"] as const,
  detail: (id: string) => [...purchaseExpenseKeys.details(), id] as const,
};

// ===========================
// QUERY HOOKS
// ===========================

/**
 * Hook to fetch all purchases with optional filters and pagination
 */
export const useGetPurchases = (filters: GetPurchasesFilters = {}) => {
  return useQuery({
    queryKey: purchaseExpenseKeys.list(filters),
    queryFn: async () => {
      try {
        //console.log("🔄 Fetching purchases with filters:", filters);
        const response = await purchaseExpenseApi.getAllPurchases(filters);
        //console.log("✅ Purchases fetched successfully:", response);
        return response;
      } catch (error) {
        console.error("❌ Error fetching purchases:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
  });
};

/**
 * Hook to fetch a single purchase by ID
 */
export const useGetPurchaseById = (purchaseId: string, enabled = true) => {
  return useQuery({
    queryKey: purchaseExpenseKeys.detail(purchaseId),
    queryFn: () => purchaseExpenseApi.getPurchaseById(purchaseId),
    enabled: !!purchaseId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to search purchases with advanced filters
 */
export const useSearchPurchases = (filters: GetPurchasesFilters = {}) => {
  return useQuery({
    queryKey: purchaseExpenseKeys.search(filters),
    queryFn: async () => {
      try {
        //console.log("🔍 Searching purchases with filters:", filters);
        const response = await purchaseExpenseApi.searchPurchases(filters);
        //console.log("✅ Purchases found:", response);
        return response;
      } catch (error) {
        console.error("❌ Error searching purchases:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook to fetch purchase statistics
 */
export const useGetPurchaseStats = () => {
  return useQuery({
    queryKey: purchaseExpenseKeys.stats(),
    queryFn: async () => {
      try {
        //console.log("📊 Fetching purchase statistics");
        const response = await purchaseExpenseApi.getPurchaseStats();
        //console.log("✅ Statistics fetched:", response);
        return response;
      } catch (error) {
        console.error("❌ Error fetching statistics:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook to fetch pending purchases
 */
export const useGetPendingPurchases = () => {
  return useQuery({
    queryKey: purchaseExpenseKeys.pending(),
    queryFn: async () => {
      try {
        //console.log("⏳ Fetching pending purchases");
        const response = await purchaseExpenseApi.getPendingPurchases();
        //console.log("✅ Pending purchases fetched:", response);
        return response;
      } catch (error) {
        console.error("❌ Error fetching pending purchases:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook to fetch purchases summary for a date range
 */
export const useGetPurchasesSummary = (
  startDate: string,
  endDate: string,
  enabled = true
) => {
  return useQuery({
    queryKey: purchaseExpenseKeys.summary(startDate, endDate),
    queryFn: async () => {
      try {
        //console.log("📈 Fetching purchases summary for", {
          startDate,
          endDate,
        });
        const response = await purchaseExpenseApi.getPurchasesSummary(
          startDate,
          endDate
        );
        //console.log("✅ Summary fetched:", response);
        return response;
      } catch (error) {
        console.error("❌ Error fetching summary:", error);
        throw error;
      }
    },
    enabled: !!startDate && !!endDate && enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook to fetch purchases by vendor
 */
export const useGetPurchasesByVendor = (
  vendorId: string,
  filters: GetPurchasesFilters = {},
  enabled = true
) => {
  return useQuery({
    queryKey: purchaseExpenseKeys.byVendor(vendorId, filters),
    queryFn: async () => {
      try {
        //console.log("👥 Fetching purchases for vendor:", vendorId);
        const response = await purchaseExpenseApi.getPurchasesByVendor(
          vendorId,
          filters
        );
        //console.log("✅ Vendor purchases fetched:", response);
        return response;
      } catch (error) {
        console.error("❌ Error fetching vendor purchases:", error);
        throw error;
      }
    },
    enabled: !!vendorId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

// ===========================
// MUTATION HOOKS
// ===========================

/**
 * Hook to create a new purchase
 */
export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchasePayload) =>
      purchaseExpenseApi.createPurchase(data),
    onSuccess: (response) => {
      // Invalidate and refetch purchase lists
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.lists(),
      });
      toast.success(response.message || "Purchase created successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create purchase";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to update an existing purchase
 */
export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseId,
      data,
    }: {
      purchaseId: string;
      data: UpdatePurchasePayload;
    }) => purchaseExpenseApi.updatePurchase(purchaseId, data),
    onSuccess: (response, variables) => {
      // Invalidate specific purchase detail
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.detail(variables.purchaseId),
      });
      // Invalidate purchase lists
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.lists(),
      });
      toast.success(response.message || "Purchase updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update purchase";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to update payment status of a purchase
 */
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseId,
      data,
    }: {
      purchaseId: string;
      data: UpdatePaymentStatusPayload;
    }) => purchaseExpenseApi.updatePaymentStatus(purchaseId, data),
    onSuccess: (response, variables) => {
      // Invalidate specific purchase detail
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.detail(variables.purchaseId),
      });
      // Invalidate purchase lists
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.lists(),
      });
      toast.success(response.message || "Payment status updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update payment status";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to update delivery status of a purchase
 */
export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseId,
      data,
    }: {
      purchaseId: string;
      data: UpdateDeliveryStatusPayload;
    }) => purchaseExpenseApi.updateDeliveryStatus(purchaseId, data),
    onSuccess: (response, variables) => {
      // Invalidate specific purchase detail
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.detail(variables.purchaseId),
      });
      // Invalidate purchase lists
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.lists(),
      });
      toast.success(response.message || "Delivery status updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update delivery status";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to add attachment to a purchase
 */
export const useAddAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseId,
      data,
    }: {
      purchaseId: string;
      data: AddAttachmentPayload;
    }) => purchaseExpenseApi.addAttachment(purchaseId, data),
    onSuccess: (response, variables) => {
      // Invalidate specific purchase detail
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.detail(variables.purchaseId),
      });
      toast.success(response.message || "Attachment added successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add attachment";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to remove attachment from a purchase
 */
export const useRemoveAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseId,
      attachmentIndex,
    }: {
      purchaseId: string;
      attachmentIndex: number;
    }) => purchaseExpenseApi.removeAttachment(purchaseId, attachmentIndex),
    onSuccess: (response, variables) => {
      // Invalidate specific purchase detail
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.detail(variables.purchaseId),
      });
      toast.success(response.message || "Attachment removed successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to remove attachment";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to update purchase priority
 */
export const useUpdatePurchasePriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseId,
      data,
    }: {
      purchaseId: string;
      data: UpdatePriorityPayload;
    }) => purchaseExpenseApi.updatePurchasePriority(purchaseId, data),
    onSuccess: (response, variables) => {
      // Invalidate specific purchase detail
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.detail(variables.purchaseId),
      });
      // Invalidate purchase lists
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.lists(),
      });
      toast.success(
        response.message || "Purchase priority updated successfully"
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update priority";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to duplicate a purchase
 */
export const useDuplicatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseId,
      data,
    }: {
      purchaseId: string;
      data?: DuplicatePurchasePayload;
    }) => purchaseExpenseApi.duplicatePurchase(purchaseId, data),
    onSuccess: (response) => {
      // Invalidate purchase lists
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.lists(),
      });
      toast.success(response.message || "Purchase duplicated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to duplicate purchase";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to delete a purchase
 */
export const useDeletePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseId: string) =>
      purchaseExpenseApi.deletePurchase(purchaseId),
    onSuccess: (response) => {
      // Invalidate purchase lists
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.lists(),
      });
      toast.success(response.message || "Purchase deleted successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete purchase";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to bulk delete purchases
 */
export const useBulkDeletePurchases = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseIds: string[]) =>
      purchaseExpenseApi.bulkDeletePurchases(purchaseIds),
    onSuccess: (response) => {
      // Invalidate purchase lists
      queryClient.invalidateQueries({
        queryKey: purchaseExpenseKeys.lists(),
      });
      toast.success(
        response.message ||
          `${response.result.deletedCount} purchases deleted successfully`
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete purchases";
      toast.error(errorMessage);
    },
  });
};

// ===========================
// COMPOUND HOOKS (Optional - for common patterns)
// ===========================

/**
 * Hook that combines purchase data fetching with common filters
 * Useful for main listing pages
 */
export const usePurchasesList = (filters: GetPurchasesFilters = {}) => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetPurchases(filters);

  return {
    purchases: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  };
};

/**
 * Hook that provides all purchase mutations in one place
 * Useful for forms that need multiple mutation actions
 */
export const usePurchaseMutations = () => {
  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const updateDeliveryStatus = useUpdateDeliveryStatus();
  const addAttachment = useAddAttachment();
  const removeAttachment = useRemoveAttachment();
  const updatePurchasePriority = useUpdatePurchasePriority();
  const duplicatePurchase = useDuplicatePurchase();
  const deletePurchase = useDeletePurchase();
  const bulkDeletePurchases = useBulkDeletePurchases();

  return {
    createPurchase,
    updatePurchase,
    updatePaymentStatus,
    updateDeliveryStatus,
    addAttachment,
    removeAttachment,
    updatePurchasePriority,
    duplicatePurchase,
    deletePurchase,
    bulkDeletePurchases,
    isLoading:
      createPurchase.isPending ||
      updatePurchase.isPending ||
      updatePaymentStatus.isPending ||
      updateDeliveryStatus.isPending ||
      addAttachment.isPending ||
      removeAttachment.isPending ||
      updatePurchasePriority.isPending ||
      duplicatePurchase.isPending ||
      deletePurchase.isPending ||
      bulkDeletePurchases.isPending,
  };
};
