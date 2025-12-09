import { create } from "zustand";
import { persist } from "zustand/middleware";
import purchaseOrderApi from "@/api/finance/purchaseOrderApi";
import type { PurchaseOrderFormValues } from "@/components/finance/purchaseOrder/PurchaseOrderForm";
import type { 
  PurchaseOrder, 
  CreatePurchaseOrderPayload, 
  UpdatePurchaseOrderPayload,
  GetPurchaseOrdersFilters,
  UpdateApprovalStatusPayload 
} from "@/api/finance/purchaseOrderApi";

interface PurchaseOrderStore {
  // Local state
  purchaseOrders: PurchaseOrderFormValues[];
  
  // API state
  apiPurchaseOrders: PurchaseOrder[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPurchaseOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;

  // Local actions (for backward compatibility)
  createPurchaseOrder: (po: PurchaseOrderFormValues) => void;
  updatePurchaseOrder: (
    purchaseOrderNo: string,
    updated: Partial<PurchaseOrderFormValues>
  ) => void;
  removePurchaseOrder: (purchaseOrderNo: string) => void;
  getPurchaseOrders: () => PurchaseOrderFormValues[];

  // API actions
  fetchPurchaseOrders: (filters?: GetPurchaseOrdersFilters) => Promise<void>;
  fetchPurchaseOrderById: (id: string) => Promise<PurchaseOrder | null>;
  createPurchaseOrderApi: (data: CreatePurchaseOrderPayload) => Promise<PurchaseOrder | null>;
  updatePurchaseOrderApi: (id: string, data: UpdatePurchaseOrderPayload) => Promise<PurchaseOrder | null>;
  deletePurchaseOrderApi: (id: string) => Promise<boolean>;
  bulkDeletePurchaseOrdersApi: (ids: string[]) => Promise<boolean>;
  updateApprovalStatus: (id: string, approvalData: UpdateApprovalStatusPayload) => Promise<PurchaseOrder | null>;
  acknowledgeByVendor: (id: string, acknowledgmentData: { vendorComments?: string }) => Promise<PurchaseOrder | null>;
  addAttachment: (id: string, attachmentData: { url: string }) => Promise<PurchaseOrder | null>;
  removeAttachment: (id: string, attachmentIndex: number) => Promise<PurchaseOrder | null>;
  getPurchaseOrderStats: (startDate?: string, endDate?: string) => Promise<any>;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePurchaseOrderStore = create<PurchaseOrderStore>()(
  persist(
    (set, get) => ({
      // Initial state
      purchaseOrders: [],
      apiPurchaseOrders: [],
      loading: false,
      error: null,
      pagination: null,

      // Local actions (backward compatibility)
      createPurchaseOrder: (po) => {
        set((state) => ({ purchaseOrders: [...state.purchaseOrders, po] }));
      },
      updatePurchaseOrder: (purchaseOrderNo, updated) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.purchaseOrderNo === purchaseOrderNo ? { ...po, ...updated } : po
          ),
        })),
      removePurchaseOrder: (purchaseOrderNo) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.filter(
            (po) => po.purchaseOrderNo !== purchaseOrderNo
          ),
        })),
      getPurchaseOrders: () => get().purchaseOrders,

      // API actions
      fetchPurchaseOrders: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
          const response = await purchaseOrderApi.getAllPurchaseOrders(filters);
          set({ 
            apiPurchaseOrders: response.result.purchaseOrders,
            pagination: response.result.pagination,
            loading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch purchase orders';
          set({ error: errorMessage, loading: false });
        }
      },

      fetchPurchaseOrderById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await purchaseOrderApi.getPurchaseOrderById(id);
          set({ loading: false });
          return response.result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch purchase order';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      createPurchaseOrderApi: async (data: CreatePurchaseOrderPayload) => {
        set({ loading: true, error: null });
        try {
          const response = await purchaseOrderApi.createPurchaseOrder(data);
          const newPO = response.result;
          
          set((state) => ({ 
            apiPurchaseOrders: [newPO, ...state.apiPurchaseOrders],
            loading: false 
          }));
          
          return newPO;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create purchase order';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      updatePurchaseOrderApi: async (id: string, data: UpdatePurchaseOrderPayload) => {
        set({ loading: true, error: null });
        try {
          const response = await purchaseOrderApi.updatePurchaseOrder(id, data);
          const updatedPO = response.result;
          
          set((state) => ({
            apiPurchaseOrders: state.apiPurchaseOrders.map((po) =>
              po._id === id ? updatedPO : po
            ),
            loading: false
          }));
          
          return updatedPO;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update purchase order';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      deletePurchaseOrderApi: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await purchaseOrderApi.deletePurchaseOrder(id);
          
          set((state) => ({
            apiPurchaseOrders: state.apiPurchaseOrders.filter((po) => po._id !== id),
            loading: false
          }));
          
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete purchase order';
          set({ error: errorMessage, loading: false });
          return false;
        }
      },

      bulkDeletePurchaseOrdersApi: async (ids: string[]) => {
        set({ loading: true, error: null });
        try {
          const response = await purchaseOrderApi.bulkDeletePurchaseOrders(ids);
          
          set((state) => ({
            apiPurchaseOrders: state.apiPurchaseOrders.filter((po) => !ids.includes(po._id)),
            loading: false
          }));
          
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete purchase orders';
          set({ error: errorMessage, loading: false });
          return false;
        }
      },

      updateApprovalStatus: async (id: string, approvalData) => {
        set({ loading: true, error: null });
        try {
          const response = await purchaseOrderApi.updateApprovalStatus(id, approvalData);
          const updatedPO = response.result;
          
          set((state) => ({
            apiPurchaseOrders: state.apiPurchaseOrders.map((po) =>
              po._id === id ? updatedPO : po
            ),
            loading: false
          }));
          
          return updatedPO;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update approval status';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      acknowledgeByVendor: async (id: string, acknowledgmentData) => {
        set({ loading: true, error: null });
        try {
          const response = await purchaseOrderApi.acknowledgeByVendor(id, acknowledgmentData);
          const updatedPO = response.result;
          
          set((state) => ({
            apiPurchaseOrders: state.apiPurchaseOrders.map((po) =>
              po._id === id ? updatedPO : po
            ),
            loading: false
          }));
          
          return updatedPO;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to acknowledge purchase order';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      addAttachment: async (id: string, attachmentData) => {
        set({ loading: true, error: null });
        try {
          const response = await purchaseOrderApi.addAttachment(id, attachmentData);
          const updatedPO = response.result;
          
          set((state) => ({
            apiPurchaseOrders: state.apiPurchaseOrders.map((po) =>
              po._id === id ? updatedPO : po
            ),
            loading: false
          }));
          
          return updatedPO;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add attachment';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      removeAttachment: async (id: string, attachmentIndex: number) => {
        set({ loading: true, error: null });
        try {
          const response = await purchaseOrderApi.removeAttachment(id, attachmentIndex);
          const updatedPO = response.result;
          
          set((state) => ({
            apiPurchaseOrders: state.apiPurchaseOrders.map((po) =>
              po._id === id ? updatedPO : po
            ),
            loading: false
          }));
          
          return updatedPO;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove attachment';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      getPurchaseOrderStats: async (startDate?: string, endDate?: string) => {
        set({ loading: true, error: null });
        try {
          const response = await purchaseOrderApi.getPurchaseOrderStats(startDate, endDate);
          set({ loading: false });
          return response.result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch purchase order statistics';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      // Utility actions
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "purchaseOrder-storage",
      partialize: (state) => ({ 
        purchaseOrders: state.purchaseOrders,
        apiPurchaseOrders: state.apiPurchaseOrders 
      }),
    }
  )
); 