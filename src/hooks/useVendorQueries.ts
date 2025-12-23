import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import vendorApi, {
  CreateVendorPayload,
  UpdateVendorPayload,
  GetVendorsFilters,
} from "@/api/finance/vendorApi";

// Query keys
export const vendorKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorKeys.all, "list"] as const,
  list: (filters?: GetVendorsFilters) =>
    [...vendorKeys.lists(), filters] as const,
  details: () => [...vendorKeys.all, "detail"] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
  search: (searchTerm: string) =>
    [...vendorKeys.all, "search", searchTerm] as const,
  withPurchases: (page?: number, limit?: number) =>
    [...vendorKeys.all, "withPurchases", page, limit] as const,
};

// ===========================
// QUERY HOOKS
// ===========================

/**
 * Hook to fetch all vendors with optional filters and pagination
 */
export const useGetVendors = (filters?: GetVendorsFilters) => {
  return useQuery({
    queryKey: vendorKeys.list(filters),
    queryFn: async () => {
      try {
        const response = await vendorApi.getAllVendors(filters);
        return response;
      } catch (error) {
        console.error("❌ Error fetching vendors:", error);
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
 * Hook to fetch a single vendor by ID
 */
export const useGetVendorById = (vendorId: string, enabled = true) => {
  return useQuery({
    queryKey: vendorKeys.detail(vendorId),
    queryFn: () => vendorApi.getVendorById(vendorId),
    enabled: !!vendorId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to search vendors
 */
export const useSearchVendors = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: vendorKeys.search(searchTerm),
    queryFn: () => vendorApi.searchVendors(searchTerm),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to fetch vendors with their purchase statistics and recent purchases
 */
export const useGetVendorsWithPurchases = (
  page: number = 1,
  limit: number = 10,
  enabled = true
) => {
  return useQuery({
    queryKey: vendorKeys.withPurchases(page, limit),
    queryFn: async () => {
      try {
        const response = await vendorApi.getVendorsWithPurchases(page, limit);
        return response;
      } catch (error) {
        console.error("❌ Error fetching vendors with purchases:", error);
        throw error;
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
  });
};

// ===========================
// MUTATION HOOKS
// ===========================

/**
 * Hook to create a new vendor
 */
export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVendorPayload) => vendorApi.createVendor(data),
    onSuccess: (response) => {
      // Invalidate and refetch vendor lists
      queryClient.invalidateQueries({
        queryKey: vendorKeys.lists(),
      });
      toast.success(response.message || "Vendor created successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create vendor";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to update an existing vendor
 */
export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorId,
      data,
    }: {
      vendorId: string;
      data: UpdateVendorPayload;
    }) => vendorApi.updateVendor(vendorId, data),
    onSuccess: (response, variables) => {
      // Invalidate specific vendor detail
      queryClient.invalidateQueries({
        queryKey: vendorKeys.detail(variables.vendorId),
      });
      // Invalidate vendor lists
      queryClient.invalidateQueries({
        queryKey: vendorKeys.lists(),
      });
      // toast.success(response.message || "Vendor updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update vendor";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to delete a vendor
 */
export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorId: string) => vendorApi.deleteVendor(vendorId),
    onSuccess: (response) => {
      // Invalidate vendor lists
      queryClient.invalidateQueries({
        queryKey: vendorKeys.lists(),
      });
      toast.success(response.message || "Vendor deleted successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete vendor";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to bulk delete vendors
 */
export const useBulkDeleteVendors = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorIds: string[]) => vendorApi.bulkDeleteVendors(vendorIds),
    onSuccess: (response) => {
      // Invalidate vendor lists
      queryClient.invalidateQueries({
        queryKey: vendorKeys.lists(),
      });
      toast.success(
        response.message ||
          `${response.result.deletedCount} vendor(s) deleted successfully`
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete vendors";
      toast.error(errorMessage);
    },
  });
};
