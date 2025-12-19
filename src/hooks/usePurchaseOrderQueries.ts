import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import purchaseOrderApi, {
  CreatePurchaseOrderPayload,
  UpdatePurchaseOrderPayload,
  UpdateApprovalStatusPayload,
  VendorAcknowledgmentPayload,
} from "@/api/finance/purchaseOrderApi";

// Query Keys
export const purchaseOrderKeys = {
  all: ["purchaseOrders"] as const,
  lists: () => [...purchaseOrderKeys.all, "list"] as const,
  list: (filters?: any) => [...purchaseOrderKeys.lists(), filters] as const,
  details: () => [...purchaseOrderKeys.all, "detail"] as const,
  detail: (id: string) => [...purchaseOrderKeys.details(), id] as const,
  stats: () => [...purchaseOrderKeys.all, "stats"] as const,

  search: (query: any) => [...purchaseOrderKeys.all, "search", query] as const,

  bulkDelete: () => [...purchaseOrderKeys.all, "bulkDelete"] as const,
};

// =====================================================
// GET ALL PURCHASE ORDERS
// =====================================================
export const useGetPurchaseOrders = (filters?: any) => {
  return useQuery({
    queryKey: purchaseOrderKeys.list(filters),
    queryFn: () => {
      console.log("🔥 Query function called with filters:", filters);
      return purchaseOrderApi.getAllPurchaseOrders(filters);
    },
    staleTime: 0,
    gcTime: 0, // Previously cacheTime
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

// =====================================================
// GET SINGLE PURCHASE ORDER BY ID
// =====================================================
export const useGetPurchaseOrderById = (purchaseOrderId: string) => {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(purchaseOrderId),
    queryFn: () => purchaseOrderApi.getPurchaseOrderById(purchaseOrderId),
    enabled: !!purchaseOrderId,
  });
};

// =====================================================
// GET PURCHASE ORDER STATS
// =====================================================
export const useGetPurchaseOrderStats = () => {
  return useQuery({
    queryKey: purchaseOrderKeys.stats(),
    queryFn: () => purchaseOrderApi.getPurchaseOrderStats(),
    staleTime: 1000 * 60 * 10,
  });
};

// =====================================================
// SEARCH PURCHASE ORDERS 🔥
// =====================================================
export const useSearchPurchaseOrders = (
  filters?: {
    search?: string;
    status?: string;
    priority?: string;
    vendorId?: string;
    page?: number;
    limit?: number;
  },
  enabled: boolean = true
) => {
  const hasSearchTerm = !!(filters?.search && filters.search.trim().length > 0);

  return useQuery({
    queryKey: purchaseOrderKeys.search(filters),
    queryFn: () => {
      // Double check before making API call
      if (!hasSearchTerm) {
        throw new Error("Search term is required");
      }
      return purchaseOrderApi.searchPurchaseOrders(filters!);
    },
    enabled: enabled && hasSearchTerm,
    staleTime: 0,
    retry: false, // Don't retry on error
  });
};

// =====================================================
// CREATE PURCHASE ORDER
// =====================================================
export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderPayload) =>
      purchaseOrderApi.createPurchaseOrder(data),

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.stats() });

      toast.success(response.message || "Purchase order created");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create purchase order"
      );
    },
  });
};

// =====================================================
// UPDATE PURCHASE ORDER
// =====================================================
export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseOrderId,
      data,
    }: {
      purchaseOrderId: string;
      data: UpdatePurchaseOrderPayload;
    }) => purchaseOrderApi.updatePurchaseOrderDetails(purchaseOrderId, data),

    onSuccess: (response, vars) => {
      queryClient.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(vars.purchaseOrderId),
      });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.stats() });

      toast.success(response.message || "Updated successfully");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update purchase order"
      );
    },
  });
};

// =====================================================
// DELETE PURCHASE ORDER
// =====================================================
export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseOrderId: string) =>
      purchaseOrderApi.deletePurchaseOrder(purchaseOrderId),

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.stats() });

      toast.success(response.message || "Purchase order deleted");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete purchase order"
      );
    },
  });
};

// =====================================================
// BULK DELETE PURCHASE ORDERS 🔥
// =====================================================
export const useBulkDeletePurchaseOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      purchaseOrderApi.bulkDeletePurchaseOrders(ids),

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.stats() });

      toast.success(response.message || "Selected orders deleted");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete selected purchase orders"
      );
    },
  });
};

// =====================================================
// UPDATE APPROVAL STATUS
// =====================================================
export const useUpdateApprovalStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseOrderId,
      data,
    }: {
      purchaseOrderId: string;
      data: UpdateApprovalStatusPayload;
    }) => purchaseOrderApi.updateApprovalStatus(purchaseOrderId, data),

    onSuccess: (response, vars) => {
      queryClient.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(vars.purchaseOrderId),
      });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.stats() });

      toast.success("Approval updated");
    },

    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message || "Failed to update approval status"
      ),
  });
};

// =====================================================
// VENDOR ACKNOWLEDGEMENT
// =====================================================
export const useVendorAcknowledgment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseOrderId,
      data,
    }: {
      purchaseOrderId: string;
      data: VendorAcknowledgmentPayload;
    }) => purchaseOrderApi.acknowledgeByVendor(purchaseOrderId, data),

    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(vars.purchaseOrderId),
      });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      toast.success("Acknowledged by vendor");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to acknowledge purchase order"
      );
    },
  });
};

// =====================================================
// COMBINED HOOK FOR LIST PAGES
// =====================================================
export const usePurchaseOrdersList = (filters?: any) => {
  const query = useGetPurchaseOrders(filters);

  return {
    purchaseOrders: query.data?.result?.purchaseOrders || [],
    pagination: query.data?.result?.pagination,
    ...query,
  };
};
