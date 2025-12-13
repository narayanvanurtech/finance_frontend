import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import debitNotesApi, {
  CreateDebitNotePayload,
  UpdateDebitNotePayload,
} from "@/api/finance/debitNotesApi";

// Query Keys
export const debitNoteKeys = {
  all: ["debitNotes"] as const,
  lists: () => [...debitNoteKeys.all, "list"] as const,
  list: (filters?: any) => [...debitNoteKeys.lists(), filters] as const,
  details: () => [...debitNoteKeys.all, "detail"] as const,
  detail: (id: string) => [...debitNoteKeys.details(), id] as const,
  stats: () => [...debitNoteKeys.all, "stats"] as const,
  search: (query: any) => [...debitNoteKeys.all, "search", query] as const,
  bulkDelete: () => [...debitNoteKeys.all, "bulkDelete"] as const,
};

// =====================================================
// GET ALL DEBIT NOTES
// =====================================================
export const useGetDebitNotes = (filters?: any) => {
  return useQuery({
    queryKey: debitNoteKeys.list(filters),
    queryFn: () => {
      console.log("🔥 Query function called with filters:", filters);
      return debitNotesApi.getAllDebitNotes(filters);
    },
    staleTime: 0,
    gcTime: 0, // Previously cacheTime
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

// =====================================================
// GET SINGLE DEBIT NOTE BY ID
// =====================================================
export const useGetDebitNoteById = (debitNoteId: string) => {
  return useQuery({
    queryKey: debitNoteKeys.detail(debitNoteId),
    queryFn: () => debitNotesApi.getDebitNoteById(debitNoteId),
    enabled: !!debitNoteId,
  });
};

// =====================================================
// GET DEBIT NOTE STATS
// =====================================================
export const useGetDebitNoteStats = () => {
  return useQuery({
    queryKey: debitNoteKeys.stats(),
    queryFn: () => debitNotesApi.getDebitNoteStats(),
    staleTime: 1000 * 60 * 10,
  });
};

// =====================================================
// SEARCH DEBIT NOTES 🔥
// =====================================================
export const useSearchDebitNotes = (
  filters?: {
    search?: string;
    debitType?: string;
    priority?: string;
    vendorId?: string;
    status?: string;
    page?: number;
    limit?: number;
  },
  enabled: boolean = true
) => {
  const hasSearchTerm = !!(filters?.search && filters.search.trim().length > 0);

  return useQuery({
    queryKey: debitNoteKeys.search(filters),
    queryFn: () => {
      // Double check before making API call
      if (!hasSearchTerm) {
        throw new Error("Search term is required");
      }
      return debitNotesApi.searchDebitNotes(filters!);
    },
    enabled: enabled && hasSearchTerm,
    staleTime: 0,
    retry: false, // Don't retry on error
  });
};

// =====================================================
// CREATE DEBIT NOTE
// =====================================================
export const useCreateDebitNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDebitNotePayload) =>
      debitNotesApi.createDebitNote(data),

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: debitNoteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debitNoteKeys.stats() });

      toast.success(response.message || "Debit note created successfully");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create debit note"
      );
    },
  });
};

// =====================================================
// UPDATE DEBIT NOTE
// =====================================================
export const useUpdateDebitNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      debitNoteId,
      data,
    }: {
      debitNoteId: string;
      data: UpdateDebitNotePayload;
    }) => debitNotesApi.updateDebitNote(debitNoteId, data),

    onSuccess: (response, vars) => {
      queryClient.invalidateQueries({
        queryKey: debitNoteKeys.detail(vars.debitNoteId),
      });
      queryClient.invalidateQueries({ queryKey: debitNoteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debitNoteKeys.stats() });

      toast.success(response.message || "Debit note updated successfully");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update debit note"
      );
    },
  });
};

// =====================================================
// DELETE DEBIT NOTE
// =====================================================
export const useDeleteDebitNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (debitNoteId: string) =>
      debitNotesApi.deleteDebitNote(debitNoteId),

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: debitNoteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debitNoteKeys.stats() });

      toast.success(response.message || "Debit note deleted successfully");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete debit note"
      );
    },
  });
};

// =====================================================
// BULK DELETE DEBIT NOTES 🔥
// =====================================================
export const useBulkDeleteDebitNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => debitNotesApi.bulkDeleteDebitNotes(ids),

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: debitNoteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debitNoteKeys.stats() });

      toast.success(
        response.message || "Selected debit notes deleted successfully"
      );
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete selected debit notes"
      );
    },
  });
};

// =====================================================
// COMBINED HOOK FOR LIST PAGES
// =====================================================
export const useDebitNotesList = (filters?: any) => {
  const query = useGetDebitNotes(filters);

  return {
    debitNotes: query.data?.result?.debitNotes || [],
    pagination: query.data?.result?.pagination,
    ...query,
  };
};
