import { create } from "zustand";
import quotationApi, {
  Quotation,
  CreateQuotationPayload,
  UpdateQuotationPayload,
  QuotationQueryParams,
  PaymentPhase,
  Cess,
  QuotationItem,
  ClientDetails,
  BusinessDetails,
} from "@/api/finance/quotationApi";
import { toast } from "sonner";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface QuotationStore {
  quotations: Quotation[];
  currentQuotation: Quotation | null;
  pagination: PaginationData | null;
  loading: boolean;
  error: string | null;

  fetchQuotations: (page?: number, limit?: number) => Promise<void>;
  fetchQuotationById: (id: string) => Promise<Quotation | null>;

  createQuotation: (data: CreateQuotationPayload) => Promise<Quotation>;
  updateQuotation: (
    id: string,
    updated: UpdateQuotationPayload
  ) => Promise<Quotation>;
  deleteQuotation: (id: string) => Promise<void>;

  previewQuotationNumber: () => Promise<string>;

  duplicateQuotation: (id: string) => Promise<Quotation>;
  updateQuotationStatus: (id: string, status: string) => Promise<Quotation>;

  convertToInvoice: (id: string, data?: any) => Promise<Quotation>;
  convertToProformaInvoice: (id: string, data?: any) => Promise<Quotation>;

  searchQuotations: (params: QuotationQueryParams) => Promise<void>;
  getQuotationStats: (period?: string) => Promise<any>;

  clearError: () => void;
}

export const useQuotationStore = create<QuotationStore>()((set, get) => ({
  quotations: [],
  currentQuotation: null,
  pagination: null,
  loading: false,
  error: null,

  // ===========================
  // Fetch All Quotations
  // ===========================
  fetchQuotations: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const res = await quotationApi.getAllQuotations({ page, limit });

      // API directly returns total, page, limit, pages (not totalItems, currentPage, totalPages)
      const paginationData = res.pagination
        ? {
            total: res.pagination.total,
            page: res.pagination.page,
            limit: res.pagination.limit,
            pages: res.pagination.pages,
          }
        : null;

      set({
        quotations: res.data,
        pagination: paginationData,
        loading: false,
      });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Failed to fetch quotations";
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  // ===========================
  // Fetch One Quotation
  // ===========================
  fetchQuotationById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await quotationApi.getQuotationById(id);
      set({ currentQuotation: res.data, loading: false });
      return res.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to fetch quotation";
      set({ error: msg, loading: false });
      toast.error(msg);
      return null;
    }
  },

  // ===========================
  // Create
  // ===========================
  createQuotation: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await quotationApi.createQuotation(data);
      set((state) => ({
        quotations: [res.data, ...state.quotations],
        loading: false,
      }));

      toast.success("Quotation created successfully");
      return res.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Failed to create quotation";
      set({ error: msg, loading: false });
      toast.error(msg);
      throw error;
    }
  },

  // ===========================
  // Update
  // ===========================
  updateQuotation: async (id, updated) => {
    set({ loading: true, error: null });
    try {
      const res = await quotationApi.updateQuotation(id, updated);

      set((state) => ({
        quotations: state.quotations.map((q) => (q._id === id ? res.data : q)),
        currentQuotation:
          state.currentQuotation?._id === id
            ? res.data
            : state.currentQuotation,
        loading: false,
      }));

      toast.success("Quotation updated successfully");
      return res.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Failed to update quotation";
      set({ error: msg, loading: false });
      toast.error(msg);
      throw error;
    }
  },

  // ===========================
  // Delete
  // ===========================
  deleteQuotation: async (id) => {
    set({ loading: true, error: null });
    try {
      await quotationApi.deleteQuotation(id);

      set((state) => ({
        quotations: state.quotations.filter((q) => q._id !== id),
        currentQuotation:
          state.currentQuotation?._id === id ? null : state.currentQuotation,
        loading: false,
      }));

      toast.success("Quotation deleted");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Failed to delete quotation";
      set({ error: msg, loading: false });
      toast.error(msg);
      throw error;
    }
  },

  // ===========================
  // Preview Number
  // ===========================
  previewQuotationNumber: async () => {
    try {
      const res = await quotationApi.previewQuotationNumber();
      console.log("Preview Quotation",res.data)
      return res.data.quotationNumber;
    } catch (error: any) {
      // const msg = error?.response?.data?.message || "Failed to generate number";
      // toast.error(msg);

      throw error;
    }
  },

  // ===========================
  // Duplicate
  // ===========================
  duplicateQuotation: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await quotationApi.duplicateQuotation(id);

      // Refresh the list to include the new duplicated quotation
      // This is important for pagination to work correctly
      const currentState = get();
      if (currentState.pagination) {
        // If we have pagination, refetch with page 1 and current limit
        await get().fetchQuotations(1, currentState.pagination.limit);
      } else {
        // If no pagination, just refetch all
        await get().fetchQuotations();
      }

      toast.success("Quotation duplicated successfully");
      return res.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to duplicate";
      set({ error: msg, loading: false });
      toast.error(msg);
      throw error;
    }
  },

  // ===========================
  // Status Update
  // ===========================
  updateQuotationStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const res = await quotationApi.updateQuotationStatus(id, status);

      // Ensure we have valid response data
      if (!res?.data) {
        throw new Error("Invalid response from server");
      }

      // Update quotations array - handle both _id and id
      set((state) => ({
        quotations: state.quotations.map((q) => {
          const quotationId = q._id || q.id;
          if (quotationId === id) {
            // Merge the updated data with the existing quotation to preserve all fields
            return { ...q, ...res.data, status: res.data.status || status };
          }
          return q;
        }),
        // Also update currentQuotation if it matches
        currentQuotation:
          (state.currentQuotation?._id === id ||
            state.currentQuotation?.id === id)
            ? { ...state.currentQuotation, ...res.data, status: res.data.status || status }
            : state.currentQuotation,
        loading: false,
      }));

      toast.success("Status updated");
      return res.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to update status";
      set({ error: msg, loading: false });
      toast.error(msg);
      throw error;
    }
  },

  // ===========================
  // Convert to invoice / proforma
  // ===========================
  convertToInvoice: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await quotationApi.convertToInvoice(id, data);

      set((state) => ({
        quotations: state.quotations.map((q) =>
          q._id === id ? { ...q, convertedToInvoice: true, status: "converted" } : q
        ),
        loading: false,
      }));

      toast.success("Converted to Invoice");
      return res.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Conversion failed";
      set({ error: msg, loading: false });
      toast.error(msg);
      throw error;
    }
  },

  convertToProformaInvoice: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await quotationApi.convertToProformaInvoice(id, data);

      set((state) => ({
        quotations: state.quotations.map((q) =>
          q._id === id ? { ...q, convertedToProformaInvoice: true, status: "converted" } : q
        ),
        loading: false,
      }));

      toast.success("Converted to Proforma Invoice");
      return res.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Conversion failed";
      set({ error: msg, loading: false });
      toast.error(msg);
      throw error;
    }
  },

  // ===========================
  // Search
  // ===========================
  searchQuotations: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await quotationApi.searchQuotations(params);

      // API directly returns total, page, limit, pages
      const paginationData = res.pagination
        ? {
            total: res.pagination.total,
            page: res.pagination.page,
            limit: res.pagination.limit,
            pages: res.pagination.pages,
          }
        : null;

      set({
        quotations: res.data,
        pagination: paginationData,
        loading: false,
      });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Search failed";
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  // ===========================
  // Get Statistics
  // ===========================
  getQuotationStats: async (period = "30") => {
    try {
      const res = await quotationApi.getQuotationStats(period);
      return res.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Failed to fetch statistics";
      toast.error(msg);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
