import { create } from "zustand";
import { toast } from "sonner";
import { deliveryChallanApi } from "@/api/finance/deliveryChallanApi";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface DeliveryChallanStore {
  challans: any[];
  singleChallan: any | null;
  stats: any | null;
  previewNumber: any | null;
  searchResults: any[];
  loading: boolean;
  companyId: string | null;
  pagination: PaginationData | null;

  setCompanyId: (id: string) => void;
  createChallan: (data: any) => Promise<void>;
  fetchChallans: (page?: number, limit?: number) => Promise<void>;
  fetchChallanById: (id: string) => Promise<void>;
  deleteChallan: (id: string) => Promise<void>;
  updateChallan: (id: string, payload: any) => Promise<void>;
  updateChallanStatus: (id: string, status: string) => Promise<void>;
  duplicateChallan: (id: string) => Promise<void>;
  bulkAction: (action: string, ids: string[]) => Promise<void>;
  getChallanStats: (companyId: string, days: string) => Promise<any>;
  previewNumberChallan: () => Promise<void>;
  searchChallans: (companyId: string, params: any) => Promise<void>;
}

export const useDeliveryChallanStore = create<DeliveryChallanStore>(
  (set, get) => ({
    challans: [],
    singleChallan: null,
    stats: null,
    previewNumber: null,
    searchResults: [],
    loading: false,
    companyId: null,
    pagination: null,

    setCompanyId: (id: string) => set({ companyId: id }),

    /* -------------------- CREATE -------------------- */
    createChallan: async (data: any) => {
      const state = get();
      const { companyId } = state;
      if (!companyId) {
        toast.error("Company ID missing");
        return;
      }

      try {
        set({ loading: true });
       const res =  await deliveryChallanApi.createChallan(data, companyId);
    
        toast.success("Delivery Challan Created");
        await get().fetchChallans();
        return res ;
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed creating challan");
      } finally {
        set({ loading: false });
      }
    },

    /* -------------------- GET ALL -------------------- */
    fetchChallans: async (page = 1, limit = 10) => {
      const companyId = localStorage.getItem("currentCompanyId");
      if (!companyId) {
        toast.error("Company ID required");
        return;
      }

      try {
        set({ loading: true });
        const res = await deliveryChallanApi.getChallans(companyId);
        set({
          challans: res.data?.challans || res.data || [],
          pagination: res.data?.pagination || null,
        });
      } catch {
        toast.error("Failed loading challans");
      } finally {
        set({ loading: false });
      }
    },

    /* -------------------- GET BY ID -------------------- */
    fetchChallanById: async (id: string) => {
      const companyId = localStorage.getItem("currentCompanyId");
      if (!companyId) {
        toast.error("Company ID missing");
        return;
      }

      try {
        set({ loading: true });
        const res = await deliveryChallanApi.getChallanById(id, companyId);
        // API response structure: { success: true, message: "...", data: {...} }
        set({ singleChallan: res.data || res });
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to fetch challan"
        );
        console.error("Error fetching challan:", error);
      } finally {
        set({ loading: false });
      }
    },

    /* -------------------- DELETE -------------------- */
    deleteChallan: async (id: string) => {
      const companyId = localStorage.getItem("currentCompanyId");
      if (!companyId) {
        toast.error("Company ID missing");
        return;
      }

      try {
        await deliveryChallanApi.deleteChallan(id, companyId);
        toast.success("Challan deleted");
        await get().fetchChallans();
      } catch {
        toast.error("Failed deleting challan");
      }
    },

    /* -------------------- UPDATE -------------------- */
    updateChallan: async (id: string, payload: any) => {
      const companyId = localStorage.getItem("currentCompanyId");
      if (!companyId) {
        toast.error("Company ID missing");
        return;
      }

      try {
        await deliveryChallanApi.updateChallan(id, payload, companyId);
        toast.success("Challan updated");
        await get().fetchChallans();
      } catch {
        toast.error("Failed updating challan");
      }
    },

    /* -------------------- STATUS UPDATE -------------------- */
    updateChallanStatus: async (id: string, status: string) => {
      const companyId = localStorage.getItem("currentCompanyId");
      if (!companyId) {
        toast.error("Company ID missing");
        return;
      }

      try {
        await deliveryChallanApi.updateStatus(id, status, companyId);
        toast.success("Status updated");
        await get().fetchChallans();
      } catch {
        toast.error("Status update failed");
      }
    },

    /* -------------------- DUPLICATE -------------------- */
    duplicateChallan: async (id: string) => {
      const companyId = localStorage.getItem("currentCompanyId");
      if (!companyId) {
        toast.error("Company ID missing");
        return;
      }

      try {
        await deliveryChallanApi.duplicateChallan(id, companyId);
        toast.success("Challan duplicated");
        await get().fetchChallans();
      } catch {
        toast.error("Duplication failed");
      }
    },

    /* -------------------- BULK ACTION -------------------- */
    bulkAction: async (action: string, ids: string[]) => {
      const companyId = localStorage.getItem("currentCompanyId");
      if (!companyId) {
        toast.error("Company ID missing");
        return;
      }

      try {
        await deliveryChallanApi.bulkAction({ action, ids }, companyId);
        toast.success("Bulk action completed");
        await get().fetchChallans();
      } catch {
        toast.error("Bulk action failed");
      }
    },

    /* -------------------- GET STATS -------------------- */
    getChallanStats: async (companyId: string, days: string) => {
      if (!companyId) {
        toast.error("Company ID missing");
        return null;
      }

      try {
        const res = await deliveryChallanApi.getStats(companyId);
        return res.data;
      } catch {
        toast.error("Failed loading stats");
        return null;
      }
    },

    /* -------------------- PREVIEW CHALLAN NUMBER -------------------- */
    previewNumberChallan: async () => {
      const companyId = localStorage.getItem("currentCompanyId");
      if (!companyId) {
        toast.error("Company ID missing");
        return;
      }

      try {
        const res = await deliveryChallanApi.previewNumber(companyId);
        set({ previewNumber: res.data });
      } catch {
        toast.error("Failed to fetch preview");
      }
    },

    /* -------------------- SEARCH -------------------- */
    searchChallans: async (companyId: string, params: any) => {
      if (!companyId) {
        toast.error("Company ID missing");
        return;
      }

      try {
        const queryString = new URLSearchParams(params).toString();
        const res = await deliveryChallanApi.searchChallan(
          queryString,
          companyId
        );
        set({
          challans: res.data?.challans || res.data || [],
          pagination: res.data?.pagination || null,
        });
      } catch {
        toast.error("Search Failed");
      }
    },
  })
);
