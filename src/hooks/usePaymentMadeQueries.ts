import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import paymentMadeApi, {
  CreatePayoutReceiptPayload,
  UpdatePayoutReceiptPayload,
  GetPayoutReceiptsFilters,
} from "@/api/finance/paymentMadeApi";

// Query keys
export const paymentMadeKeys = {
  all: ["paymentMade"] as const,
  lists: () => [...paymentMadeKeys.all, "list"] as const,
  list: (filters?: GetPayoutReceiptsFilters) =>
    [...paymentMadeKeys.lists(), filters] as const,
  details: () => [...paymentMadeKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentMadeKeys.details(), id] as const,
  search: (searchTerm: string) =>
    [...paymentMadeKeys.all, "search", searchTerm] as const,
  stats: (filters?: {
    startDate?: string;
    endDate?: string;
    vendorId?: string;
  }) => [...paymentMadeKeys.all, "stats", filters] as const,
  generateNumber: () => [...paymentMadeKeys.all, "generateNumber"] as const,
  paymentBreakdown: (filters?: {
    startDate?: string;
    endDate?: string;
    vendorId?: string;
  }) => [...paymentMadeKeys.all, "paymentBreakdown", filters] as const,
  vendorPendingPurchases: (vendorId: string) =>
    [...paymentMadeKeys.all, "vendorPendingPurchases", vendorId] as const,
  debugListVendors: () => [...paymentMadeKeys.all, "debugListVendors"] as const,
  debugVendorData: (vendorId: string) =>
    [...paymentMadeKeys.all, "debugVendorData", vendorId] as const,
};

// ===========================
// QUERY HOOKS
// ===========================

/**
 * Hook to fetch all payout receipts with optional filters and pagination
 */
export const useGetPayoutReceipts = (filters?: GetPayoutReceiptsFilters) => {
  return useQuery({
    queryKey: paymentMadeKeys.list(filters),
    queryFn: async () => {
      try {
        console.log("🔍 Fetching payments with filters:", filters);
        const response = await paymentMadeApi.getAllPayoutReceipts(filters);
        console.log("✅ Payments fetched:", response);
        return response;
      } catch (error) {
        console.error("❌ Error fetching payout receipts:", error);
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
 * Hook to fetch a single payout receipt by ID
 */
export const useGetPayoutReceiptById = (receiptId: string, enabled = true) => {
  return useQuery({
    queryKey: paymentMadeKeys.detail(receiptId),
    queryFn: () => paymentMadeApi.getPayoutReceiptById(receiptId),
    enabled: !!receiptId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to search payout receipts
 */
export const useSearchPayoutReceipts = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: paymentMadeKeys.search(searchTerm),
    queryFn: () => paymentMadeApi.searchPayoutReceipts(searchTerm),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to fetch payout receipt statistics
 */
export const useGetPayoutReceiptStats = (filters?: {
  startDate?: string;
  endDate?: string;
  vendorId?: string;
}) => {
  return useQuery({
    queryKey: paymentMadeKeys.stats(filters),
    queryFn: () => paymentMadeApi.getPayoutReceiptStats(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to generate receipt number
 */
export const useGenerateReceiptNumber = (enabled = false) => {
  return useQuery({
    queryKey: paymentMadeKeys.generateNumber(),
    queryFn: () => paymentMadeApi.generateReceiptNumber(),
    enabled: enabled,
    staleTime: 0, // Always fetch fresh
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch payment method breakdown
 */
export const useGetPaymentBreakdown = (filters?: {
  startDate?: string;
  endDate?: string;
  vendorId?: string;
}) => {
  return useQuery({
    queryKey: paymentMadeKeys.paymentBreakdown(filters),
    queryFn: () => paymentMadeApi.getPaymentBreakdown(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch vendor's pending purchases
 */
export const useGetVendorPendingPurchases = (
  vendorId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: paymentMadeKeys.vendorPendingPurchases(vendorId),
    queryFn: () => paymentMadeApi.getVendorPendingPurchases(vendorId),
    enabled: !!vendorId && enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to fetch all vendors (Debug endpoint)
 */
export const useDebugListAllVendors = (enabled = true) => {
  return useQuery({
    queryKey: paymentMadeKeys.debugListVendors(),
    queryFn: () => paymentMadeApi.debugListAllVendors(),
    enabled: enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch vendor debug data (Debug endpoint)
 */
export const useDebugVendorData = (vendorId: string, enabled = true) => {
  return useQuery({
    queryKey: paymentMadeKeys.debugVendorData(vendorId),
    queryFn: () => paymentMadeApi.debugVendorData(vendorId),
    enabled: !!vendorId && enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// ===========================
// MUTATION HOOKS
// ===========================

/**
 * Hook to create a new payout receipt
 */
export const useCreatePayoutReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePayoutReceiptPayload) =>
      paymentMadeApi.createPayoutReceipt(data),
    onSuccess: (response) => {
      // Invalidate and refetch payout receipt lists
      queryClient.invalidateQueries({
        queryKey: paymentMadeKeys.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: paymentMadeKeys.all,
      });
      toast.success(response.message || "Payment created successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create payment";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to update an existing payout receipt
 */
export const useUpdatePayoutReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      receiptId,
      data,
    }: {
      receiptId: string;
      data: UpdatePayoutReceiptPayload;
    }) => paymentMadeApi.updatePayoutReceipt(receiptId, data),
    onSuccess: (response, variables) => {
      // Invalidate specific payout receipt detail
      queryClient.invalidateQueries({
        queryKey: paymentMadeKeys.detail(variables.receiptId),
      });
      // Invalidate payout receipt lists
      queryClient.invalidateQueries({
        queryKey: paymentMadeKeys.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: paymentMadeKeys.all,
      });
      toast.success(response.message || "Payment updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update payment";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to delete a payout receipt
 */
export const useDeletePayoutReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiptId: string) =>
      paymentMadeApi.deletePayoutReceipt(receiptId),
    onSuccess: (response) => {
      // Invalidate payout receipt lists
      queryClient.invalidateQueries({
        queryKey: paymentMadeKeys.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: paymentMadeKeys.all,
      });
      toast.success(response.message || "Payment deleted successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete payment";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to manually generate receipt number (for forms)
 */
export const useGenerateReceiptNumberMutation = () => {
  return useMutation({
    mutationFn: () => paymentMadeApi.generateReceiptNumber(),
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to generate receipt number";
      toast.error(errorMessage);
    },
  });
};
