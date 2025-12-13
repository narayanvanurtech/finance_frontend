import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import purchaseExpenseApi, {
  CreatePurchasePayload,
  UpdatePurchasePayload,
  UpdatePaymentStatusPayload,
  UpdateDeliveryStatusPayload,
  AddAttachmentPayload,
  GetPurchasesFilters,
} from "@/api/finance/puchase-expenseeApi";

// Query keys
export const purchaseExpenseKeys = {
  all: ["purchaseExpenses"] as const,
  lists: () => [...purchaseExpenseKeys.all, "list"] as const,
  list: (filters: GetPurchasesFilters) =>
    [...purchaseExpenseKeys.lists(), filters] as const,
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
        console.log("🔄 Fetching purchases with filters:", filters);
        const response = await purchaseExpenseApi.getAllPurchases(filters);
        console.log("✅ Purchases fetched successfully:", response);
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
  const deletePurchase = useDeletePurchase();
  const bulkDeletePurchases = useBulkDeletePurchases();

  return {
    createPurchase,
    updatePurchase,
    updatePaymentStatus,
    updateDeliveryStatus,
    addAttachment,
    deletePurchase,
    bulkDeletePurchases,
    isLoading:
      createPurchase.isPending ||
      updatePurchase.isPending ||
      updatePaymentStatus.isPending ||
      updateDeliveryStatus.isPending ||
      addAttachment.isPending ||
      deletePurchase.isPending ||
      bulkDeletePurchases.isPending,
  };
};
