import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import creditNoteApi, {
  CreditNote,
  CreditNoteResponse,
  CreditNotesResponse,
  CreditNoteStatsResponse,
  DeleteResponse,
  CreateCreditNotePayload,
  UpdateCreditNotePayload,
  ApproveCreditNotePayload,
  UpdateStatusPayload,
  ResolveCreditNotePayload,
  DisputeCreditNotePayload,
  CreditNoteQueryParams,
} from "../service/creditNoteApi";

// ==================== Query Keys Factory ====================
export const creditNoteQueryKeys = {
  all: ["creditNotes"] as const,
  lists: () => [...creditNoteQueryKeys.all, "list"] as const,
  list: (filters?: CreditNoteQueryParams) =>
    [...creditNoteQueryKeys.lists(), { filters }] as const,
  details: () => [...creditNoteQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...creditNoteQueryKeys.details(), id] as const,
  stats: () => [...creditNoteQueryKeys.all, "stats"] as const,
  byInvoice: (invoiceId: string) =>
    [...creditNoteQueryKeys.all, "byInvoice", invoiceId] as const,
  byClient: (clientId: string) =>
    [...creditNoteQueryKeys.all, "byClient", clientId] as const,
};

// ==================== Query Hooks ====================

/**
 * Hook to fetch all credit notes with optional filters
 * @example
 * const { data, isLoading, error, refetch } = useGetAllCreditNotes({ page: 1, limit: 10 });
 */
export const useGetAllCreditNotes = (
  params?: CreditNoteQueryParams,
  options?: UseQueryOptions<CreditNotesResponse, Error>
) => {
  return useQuery<CreditNotesResponse, Error>({
    queryKey: creditNoteQueryKeys.list(params),
    queryFn: () => creditNoteApi.getAllCreditNotes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    ...options,
  });
};

/**
 * Hook to fetch credit note statistics
 * @example
 * const { data, isLoading, error } = useGetCreditNoteStats();
 */
export const useGetCreditNoteStats = (
  options?: UseQueryOptions<CreditNoteStatsResponse, Error>
) => {
  return useQuery<CreditNoteStatsResponse, Error>({
    queryKey: creditNoteQueryKeys.stats(),
    queryFn: () => creditNoteApi.getCreditNoteStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

/**
 * Hook to fetch a single credit note by ID
 * @example
 * const { data, isLoading, error } = useGetCreditNoteById(creditNoteId);
 */
export const useGetCreditNoteById = (
  creditNoteId: string,
  options?: UseQueryOptions<CreditNoteResponse, Error>
) => {
  return useQuery<CreditNoteResponse, Error>({
    queryKey: creditNoteQueryKeys.detail(creditNoteId),
    queryFn: () => creditNoteApi.getCreditNoteById(creditNoteId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!creditNoteId,
    ...options,
  });
};

/**
 * Hook to fetch credit notes by invoice ID
 * @example
 * const { data, isLoading, error } = useGetCreditNotesByInvoice(invoiceId);
 */
export const useGetCreditNotesByInvoice = (
  invoiceId: string,
  options?: UseQueryOptions<CreditNotesResponse, Error>
) => {
  return useQuery<CreditNotesResponse, Error>({
    queryKey: creditNoteQueryKeys.byInvoice(invoiceId),
    queryFn: () => creditNoteApi.getCreditNotesByInvoice(invoiceId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!invoiceId,
    ...options,
  });
};

/**
 * Hook to fetch credit notes by client ID
 * @example
 * const { data, isLoading, error } = useGetCreditNotesByClient(clientId);
 */
export const useGetCreditNotesByClient = (
  clientId: string,
  options?: UseQueryOptions<CreditNotesResponse, Error>
) => {
  return useQuery<CreditNotesResponse, Error>({
    queryKey: creditNoteQueryKeys.byClient(clientId),
    queryFn: () => creditNoteApi.getCreditNotesByClient(clientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!clientId,
    ...options,
  });
};

// ==================== Mutation Hooks ====================

/**
 * Hook to create a new credit note
 * @example
 * const createMutation = useCreateCreditNote();
 * await createMutation.mutateAsync(creditNoteData);
 */
export const useCreateCreditNote = (
  options?: UseMutationOptions<CreditNoteResponse, Error, CreateCreditNotePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation<CreditNoteResponse, Error, CreateCreditNotePayload>({
    mutationFn: (data: CreateCreditNotePayload) =>
      creditNoteApi.createCreditNote(data),
    onSuccess: (data: CreditNoteResponse) => {
      // Invalidate lists to refetch
      queryClient.invalidateQueries({
        queryKey: creditNoteQueryKeys.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: creditNoteQueryKeys.stats(),
      });
      // Invalidate by invoice
      if (data.data.invoiceId) {
        const invoiceId =
          typeof data.data.invoiceId === "string"
            ? data.data.invoiceId
            : (data.data.invoiceId as any)._id;
        queryClient.invalidateQueries({
          queryKey: creditNoteQueryKeys.byInvoice(invoiceId),
        });
      }
      // Invalidate by client
      if (data.data.clientId) {
        const clientId =
          typeof data.data.clientId === "string"
            ? data.data.clientId
            : (data.data.clientId as any)._id;
        queryClient.invalidateQueries({
          queryKey: creditNoteQueryKeys.byClient(clientId),
        });
      }
    },
    ...options,
  });
};

/**
 * Hook to update a credit note
 * @example
 * const updateMutation = useUpdateCreditNote(creditNoteId);
 * await updateMutation.mutateAsync(updateData);
 */
export const useUpdateCreditNote = (
  creditNoteId: string,
  options?: UseMutationOptions<CreditNoteResponse, Error, UpdateCreditNotePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation<CreditNoteResponse, Error, UpdateCreditNotePayload>({
    mutationFn: (data: UpdateCreditNotePayload) =>
      creditNoteApi.updateCreditNote(creditNoteId, data),
    onSuccess: (data: CreditNoteResponse) => {
      // Update the specific detail
      queryClient.setQueryData(
        creditNoteQueryKeys.detail(creditNoteId),
        data
      );
      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: creditNoteQueryKeys.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: creditNoteQueryKeys.stats(),
      });
    },
    ...options,
  });
};

/**
 * Hook to delete a credit note
 * @example
 * const deleteMutation = useDeleteCreditNote();
 * await deleteMutation.mutateAsync(creditNoteId);
 */
export const useDeleteCreditNote = (
  options?: UseMutationOptions<DeleteResponse, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteResponse, Error, string>({
    mutationFn: (creditNoteId: string) =>
      creditNoteApi.deleteCreditNote(creditNoteId),
    onSuccess: () => {
      // Invalidate all credit note queries
      queryClient.invalidateQueries({
        queryKey: creditNoteQueryKeys.all,
      });
    },
    ...options,
  });
};

/**
 * Hook to approve a credit note
 * @example
 * const approveMutation = useApproveCreditNote(creditNoteId);
 * await approveMutation.mutateAsync({ approvalNotes: "Approved" });
 */
export const useApproveCreditNote = (
  creditNoteId: string,
  options?: UseMutationOptions<
    CreditNoteResponse,
    Error,
    ApproveCreditNotePayload | undefined
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreditNoteResponse,
    Error,
    ApproveCreditNotePayload | undefined
  >({
    mutationFn: (payload: ApproveCreditNotePayload | undefined) =>
      creditNoteApi.approveCreditNote(creditNoteId, payload),
    onSuccess: (data: CreditNoteResponse) => {
      queryClient.setQueryData(
        creditNoteQueryKeys.detail(creditNoteId),
        data
      );
      queryClient.invalidateQueries({
        queryKey: creditNoteQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: creditNoteQueryKeys.stats(),
      });
    },
    ...options,
  });
};

/**
 * Hook to update credit note status
 * @example
 * const statusMutation = useUpdateCreditNoteStatus(creditNoteId);
 * await statusMutation.mutateAsync({ status: "sent", notes: "..." });
 */
export const useUpdateCreditNoteStatus = (
  creditNoteId: string,
  options?: UseMutationOptions<CreditNoteResponse, Error, UpdateStatusPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation<CreditNoteResponse, Error, UpdateStatusPayload>({
    mutationFn: (payload: UpdateStatusPayload) =>
      creditNoteApi.updateCreditNoteStatus(creditNoteId, payload),
    onSuccess: (data: CreditNoteResponse) => {
      queryClient.setQueryData(
        creditNoteQueryKeys.detail(creditNoteId),
        data
      );
      queryClient.invalidateQueries({
        queryKey: creditNoteQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: creditNoteQueryKeys.stats(),
      });
    },
    ...options,
  });
};

/**
 * Hook to resolve a credit note
 * @example
 * const resolveMutation = useResolveCreditNote(creditNoteId);
 * await resolveMutation.mutateAsync({ resolutionStatus: "refund_processed" });
 */
export const useResolveCreditNote = (
  creditNoteId: string,
  options?: UseMutationOptions<CreditNoteResponse, Error, ResolveCreditNotePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation<CreditNoteResponse, Error, ResolveCreditNotePayload>({
    mutationFn: (payload: ResolveCreditNotePayload) =>
      creditNoteApi.resolveCreditNote(creditNoteId, payload),
    onSuccess: (data: CreditNoteResponse) => {
      queryClient.setQueryData(
        creditNoteQueryKeys.detail(creditNoteId),
        data
      );
      queryClient.invalidateQueries({
        queryKey: creditNoteQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: creditNoteQueryKeys.stats(),
      });
    },
    ...options,
  });
};

/**
 * Hook to dispute a credit note
 * @example
 * const disputeMutation = useDisputeCreditNote(creditNoteId);
 * await disputeMutation.mutateAsync({ notes: "..." });
 */
export const useDisputeCreditNote = (
  creditNoteId: string,
  options?: UseMutationOptions<
    CreditNoteResponse,
    Error,
    DisputeCreditNotePayload | undefined
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreditNoteResponse,
    Error,
    DisputeCreditNotePayload | undefined
  >({
    mutationFn: (payload: DisputeCreditNotePayload | undefined) =>
      creditNoteApi.disputeCreditNote(creditNoteId, payload),
    onSuccess: (data: CreditNoteResponse) => {
      queryClient.setQueryData(
        creditNoteQueryKeys.detail(creditNoteId),
        data
      );
      queryClient.invalidateQueries({
        queryKey: creditNoteQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: creditNoteQueryKeys.stats(),
      });
    },
    ...options,
  });
};
