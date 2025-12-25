import { create } from "zustand";
import { persist } from "zustand/middleware";
import salesOrderApi, {
  SalesOrder,
  CreateSalesOrderPayload,
  UpdateSalesOrderPayload,
  SalesOrderQueryParams,
  Cess,
  SalesOrderItem,
  ClientDetails,
  BusinessDetails,
} from "@/api/finance/salesOrderApi";
import { toast } from "sonner";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface SalesOrderStore {
  salesOrders: SalesOrder[];
  currentSalesOrder: SalesOrder | null;
  pagination: PaginationData | null;
  loading: boolean;
  error: string | null;
  companyId: string | null;

  // Set company ID
  setCompanyId: (id: string) => void;

  // Draft auto-save - using any for flexibility with form data
  draftOrder: any | null;
  saveDraft: (draft: any) => void;
  clearDraft: () => void;
  getDraft: () => any | null;

  fetchSalesOrders: (page?: number, limit?: number) => Promise<void>;
  fetchSalesOrderById: (
    id: string,
    companyId: string
  ) => Promise<SalesOrder | null>;

  createSalesOrder: (
    data: CreateSalesOrderPayload,
    companyId: string
  ) => Promise<SalesOrder>;
  updateSalesOrder: (
    id: string,
    companyId: string,
    updated: UpdateSalesOrderPayload
  ) => Promise<SalesOrder>;
  deleteSalesOrder: (id: string, companyId: string) => Promise<void>;

  previewOrderNumber: (companyId: string) => Promise<string>;

  duplicateSalesOrder: (id: string) => Promise<SalesOrder>;
  updateSalesOrderStatus: (id: string, status: string) => Promise<SalesOrder>;

  searchSalesOrders: (
    companyId: string,
    params: SalesOrderQueryParams
  ) => Promise<void>;
  getSalesOrderStats: (companyId: string, period?: string) => Promise<any>;
  bulkAction: (action: string, orderIds: string[], data?: any) => Promise<void>;
  convertToInvoice: (orderId: string, data?: any) => Promise<SalesOrder>;

  clearError: () => void;
}

export const useSalesOrderStore = create<SalesOrderStore>()(
  persist(
    (set, get) => ({
      salesOrders: [],
      currentSalesOrder: null,
      pagination: null,
      loading: false,
      error: null,
      companyId: null,

      // ===========================
      // Set Company ID
      // ===========================
      setCompanyId: (id) => {
        set({ companyId: id });
      },

      // ===========================
      // Draft Auto-Save
      // ===========================
      draftOrder: null,

      saveDraft: (draft) => {
        set({ draftOrder: draft });
      },

      clearDraft: () => {
        set({ draftOrder: null });
      },

      getDraft: () => {
        return get().draftOrder;
      },

      // ===========================
      // Fetch All Sales Orders
      // ===========================
      fetchSalesOrders: async (page = 1, limit = 10) => {
        const state = get();
        if (!state.companyId) {
          toast.error("Company ID is required");
          return;
        }

        set({ loading: true, error: null });
        try {
          console.log(
            "🔵 Fetching sales orders for companyId:",
            state.companyId
          );

          const res = await salesOrderApi.getAllSalesOrders(state.companyId, {
            page,
            limit,
          });

          const paginationData = res.pagination
            ? {
                total: res.pagination.totalCount || res.pagination.total || 0,
                page: res.pagination.currentPage || res.pagination.page || 1,
                limit: limit,
                pages: res.pagination.totalPages || res.pagination.pages || 1,
              }
            : null;

          set({
            salesOrders: res.data,
            pagination: paginationData,
            loading: false,
          });

          console.log(
            "✅ Store Updated - Sales Orders Count:",
            res.data?.length
          );
        } catch (error: any) {
          console.error("❌ Fetch Error:", error);
          console.error("❌ Error Response:", error.response?.data);

          const msg =
            error?.response?.data?.message || "Failed to fetch sales orders";
          set({ error: msg, loading: false });
          toast.error(msg);
        }
      },

      // ===========================
      // Fetch One Sales Order
      // ===========================
      fetchSalesOrderById: async (id, companyId) => {
        set({ loading: true, error: null });
        try {
          const res = await salesOrderApi.getSalesOrderById(id, companyId);
          set({ currentSalesOrder: res.data, loading: false });
          return res.data;
        } catch (error: any) {
          const msg =
            error?.response?.data?.message || "Failed to fetch sales order";
          set({ error: msg, loading: false });
          toast.error(msg);
          return null;
        }
      },

      // ===========================
      // Create
      // ===========================
      createSalesOrder: async (data, companyId) => {
        set({ loading: true, error: null });
        try {
          console.log("🔵 Creating sales order with companyId:", companyId);
          console.log("🔵 Payload:", data);

          const res = await salesOrderApi.createSalesOrder(data, companyId);

          console.log("✅ API Response:", res);
          console.log("✅ Created Order:", res.data);

          // Add new sales order to store list
          set((state) => ({
            salesOrders: [res.data, ...state.salesOrders],
            loading: false,
          }));

          toast.success("Sales Order created successfully");
          return res.data;
        } catch (error: any) {
          console.error("❌ Create Error:", error);
          console.error("❌ Error Response:", error.response?.data);

          const msg =
            error?.response?.data?.message || "Failed to create sales order";
          set({ error: msg, loading: false });
          toast.error(msg);
          throw error;
        }
      },

      // ===========================
      // Update
      // ===========================
      updateSalesOrder: async (id, companyId, updated) => {
        set({ loading: true, error: null });
        try {
          const res = await salesOrderApi.updateSalesOrder(
            id,
            companyId,
            updated
          );

          set((state) => ({
            salesOrders: state.salesOrders.map((order) =>
              order._id === id ? res.data : order
            ),
            currentSalesOrder:
              state.currentSalesOrder?._id === id
                ? res.data
                : state.currentSalesOrder,
            loading: false,
          }));

          toast.success("Sales Order updated successfully");
          return res.data;
        } catch (error: any) {
          const msg =
            error?.response?.data?.message || "Failed to update sales order";
          set({ error: msg, loading: false });
          toast.error(msg);
          throw error;
        }
      },

      // ===========================
      // Delete
      // ===========================
      deleteSalesOrder: async (id, companyId) => {
        set({ loading: true, error: null });
        try {
          await salesOrderApi.deleteSalesOrder(id, companyId);

          set((state) => ({
            salesOrders: state.salesOrders.filter((order) => order._id !== id),
            currentSalesOrder:
              state.currentSalesOrder?._id === id
                ? null
                : state.currentSalesOrder,
            loading: false,
          }));

          toast.success("Sales Order deleted");
        } catch (error: any) {
          const msg =
            error?.response?.data?.message || "Failed to delete sales order";
          set({ error: msg, loading: false });
          toast.error(msg);
          throw error;
        }
      },

      // ===========================
      // Preview Number
      // ===========================
      previewOrderNumber: async (companyId: string) => {
        try {
          const res = await salesOrderApi.previewOrderNumber(companyId);
          return res.data.orderNumber;
        } catch (error: any) {
          const msg =
            error?.response?.data?.message || "Failed to generate number";
          toast.error(msg);
          throw error;
        }
      },

      // ===========================
      // Duplicate
      // ===========================
      duplicateSalesOrder: async (id) => {
        const state = get();
        if (!state.companyId) {
          toast.error("Company ID is required");
          throw new Error("Company ID is required");
        }

        set({ loading: true, error: null });
        try {
          const res = await salesOrderApi.duplicateSalesOrder(
            id,
            state.companyId
          );

          // Refresh the list to include the new duplicated order
          const currentState = get();
          if (currentState.pagination) {
            await get().fetchSalesOrders(1, currentState.pagination.limit);
          } else {
            await get().fetchSalesOrders();
          }

          toast.success("Sales Order duplicated successfully");
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
      updateSalesOrderStatus: async (orderId, status) => {
        set({ loading: true, error: null });
        try {
          const state = get();

          const companyId = state?.companyId;

          if (!companyId) {
            toast.error("Company ID is required");
            throw new Error("Company ID is required");
          }

          const res = await salesOrderApi.updateSalesOrderStatus(
            orderId,
            companyId,
            status
          );

          set((state) => ({
            salesOrders: state.salesOrders.map((order) =>
              order._id === orderId ? res.data : order
            ),
            currentSalesOrder:
              state.currentSalesOrder?._id === orderId
                ? res.data
                : state.currentSalesOrder,
            loading: false,
          }));

          toast.success("Status updated");
          return res.data;
        } catch (error: any) {
          const msg =
            error?.response?.data?.message || "Failed to update status";
          set({ error: msg, loading: false });
          toast.error(msg);
          throw error;
        }
      },

      // ===========================
      // Search
      // ===========================
      searchSalesOrders: async (companyId, params) => {
        set({ loading: true, error: null });
        try {
          const res = await salesOrderApi.searchSalesOrders(companyId, params);

          const paginationData = res.pagination
            ? {
                total: res.pagination.total ?? 0,
                page: res.pagination.page ?? 1,
                limit: res.pagination.limit ?? 10,
                pages: res.pagination.pages ?? 0,
              }
            : null;

          set({
            salesOrders: res.data,
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
      getSalesOrderStats: async (companyId, period = "30") => {
        try {
          const res = await salesOrderApi.getSalesOrderStats(companyId, period);
          return res.data;
        } catch (error: any) {
          const msg =
            error?.response?.data?.message || "Failed to fetch statistics";
          toast.error(msg);
          throw error;
        }
      },

      convertToInvoice: async (
        orderId: string,
        data?: any
      ): Promise<SalesOrder> => {
        const state = get();

        const companyId = state?.companyId;

        if (!companyId) {
          toast.error("Company ID is required");
          throw new Error("Company ID is required");
        }

        set({ loading: true, error: null });
        try {
          console.log("store.convertToInvoice ->", {
            orderId,
            companyId,
            data,
          });
          const res = await salesOrderApi.convertToInvoice(
            orderId,
            companyId,
            data
          );
          console.log("store.convertToInvoice <- res:", res);

          // Update the local state to reflect the conversion
          set((state) => ({
            salesOrders: state.salesOrders.map((order) =>
              order._id === orderId
                ? { ...order, convertedToInvoice: true }
                : order
            ),
            currentSalesOrder:
              state.currentSalesOrder?._id === orderId
                ? { ...state.currentSalesOrder, convertedToInvoice: true }
                : state.currentSalesOrder,
            loading: false,
          }));

          toast.success("Successfully converted to invoice");

          // Refresh invoices store so the newly created invoice appears in invoices section
          try {
            const { useInvoiceStore } = await import("./useInvoiceStore");
            const invoiceStore = useInvoiceStore.getState();
            // Fetch latest invoices (page 1 with default limit)
            await invoiceStore.fetchInvoices();
            console.log("🔄 Invoices refreshed after conversion");
          } catch (err) {
            console.error(
              "Failed to refresh invoice store after conversion:",
              err
            );
          }

          return res.data;
        } catch (error: any) {
          const msg =
            error?.response?.data?.message || "Failed to convert to invoice";
          set({ error: msg, loading: false });
          toast.error(msg);
          throw error;
        }
      },

      // ===========================
      // Bulk Action
      // ===========================
      bulkAction: async (action, orderIds, data) => {
        const state = get();
        if (!state.companyId) {
          toast.error("Company ID is required");
          throw new Error("Company ID is required");
        }

        set({ loading: true, error: null });
        try {
          // Debug log to verify selections sent to backend
          console.log("Bulk action invoked", {
            action,
            orderIds,
            companyId: state.companyId,
            data,
          });

          // Pass companyId to API so backend can route correctly
          await salesOrderApi.bulkAction(
            action,
            orderIds,
            state.companyId,
            data
          );

          if (action === "delete") {
            // Remove deleted orders from the store
            set((state) => ({
              salesOrders: state.salesOrders.filter(
                (order) => !orderIds.includes(order._id)
              ),
              loading: false,
            }));
          } else {
            // Refresh the list for other actions
            const currentState = get();
            if (currentState.pagination) {
              await get().fetchSalesOrders(
                currentState.pagination.page,
                currentState.pagination.limit
              );
            } else {
              await get().fetchSalesOrders();
            }
          }

          toast.success(`Bulk ${action} completed successfully`);
        } catch (error: any) {
          const msg = error?.response?.data?.message || `Bulk ${action} failed`;
          set({ error: msg, loading: false });
          toast.error(msg);
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "sales-order-storage",
      partialize: (state) => ({
        // Don't persist salesOrders - always fetch fresh from API
        draftOrder: state.draftOrder,
        companyId: state.companyId,
      }),
    }
  )
);
