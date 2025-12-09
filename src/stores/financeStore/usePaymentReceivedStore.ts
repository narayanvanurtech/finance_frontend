import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

import paymentReceivedApi, {
  PaymentReceived,
  CreatePaymentReceivedPayload,
  PaymentSearchParams,
  PaymentStatsResponse,
} from "@/api/finance/payment-receivedApi";

import { PaymentsMadeFormValues } from "@/components/finance/paymentReceived/PaymentReivedForm";

interface PaymentStore {
  payments: PaymentReceived[];
  stats: PaymentStatsResponse | null;
  loading: boolean;
  error: string | null;

  companyId: string | null;

  setCompanyId: (id: string) => void;

  fetchPayments: () => Promise<void>;
  searchPayments: (filters: PaymentSearchParams) => Promise<void>;
  loadPaymentStats: () => Promise<void>;

  createPayment: (values: PaymentsMadeFormValues) => Promise<PaymentReceived>;
  getPayment: (id: string) => Promise<PaymentReceived | null>;
  previewPayment: (id: string) => Promise<PaymentReceived | null>;
  updatePayment: (
    id: string,
    values: PaymentsMadeFormValues
  ) => Promise<PaymentReceived>;
  deletePayment: (id: string) => Promise<void>;
}

export const usePaymentReceivedStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      payments: [],
      stats: null,
      loading: false,
      error: null,
      companyId: null,

      setCompanyId: (id) => set({ companyId: id }),

      // =====================================================
      // 🔥 FETCH ALL PAYMENTS
      fetchPayments: async () => {
        const companyId = localStorage.getItem("currentCompanyId");
        if (!companyId) {
          toast.error("Company ID missing");
          return;
        }

        try {
          set({ loading: true });
          const res = await paymentReceivedApi.getAllPayments(companyId);
          set({ payments: res.data, loading: false });
        } catch (e) {
          set({ loading: false });
          toast.error("Failed to load payments");
        }
      },

      // =====================================================
      // 🔥 SEARCH WITH FILTERS — REAL API FILTER WITH CLIENT-SIDE FALLBACK
      searchPayments: async (filters) => {
        const companyId = localStorage.getItem("currentCompanyId");
        if (!companyId) {
          toast.error("Company ID missing");
          return;
        }

        console.log("🏪 Store searchPayments called with:", filters);

        try {
          set({ loading: true });

          // Try API search first
          try {
            console.log("📡 Calling API searchPayments...");
            const res = await paymentReceivedApi.searchPayments(
              companyId,
              filters
            );
            console.log("✅ API Response:", res);
            set({ payments: res.data, loading: false });
          } catch (apiError: any) {
            // If API doesn't support filtering, do client-side filtering
            console.log(
              "⚠️ API filtering not available, using client-side filtering",
              apiError?.message || apiError
            );
            const allPayments = await paymentReceivedApi.getAllPayments(
              companyId
            );

            // Apply client-side filters
            let filtered = allPayments.data;

            if (filters.search) {
              const searchLower = filters.search.toLowerCase().trim();
              filtered = filtered.filter((p: any) => {
                const clientName =
                  typeof p.clientId === "object"
                    ? p.clientId?.businessName?.toLowerCase() || ""
                    : "";
                const paymentNo = p.paymentNo?.toLowerCase() || "";
                const paymentType = p.paymentType?.toLowerCase() || "";
                return (
                  clientName.includes(searchLower) ||
                  paymentNo.includes(searchLower) ||
                  paymentType.includes(searchLower)
                );
              });
            }

            if (filters.status) {
              const statusLower = filters.status.toLowerCase();
              filtered = filtered.filter(
                (p: any) => p.status?.toLowerCase() === statusLower
              );
            }

            if (filters.paymentType) {
              const typeLower = filters.paymentType.toLowerCase();
              filtered = filtered.filter(
                (p: any) => p.paymentType?.toLowerCase() === typeLower
              );
            }

            if (filters.paymentMethod) {
              const methodLower = filters.paymentMethod.toLowerCase();
              filtered = filtered.filter((p: any) =>
                p.paymentRecords?.some(
                  (r: any) => r.paymentMethod?.toLowerCase() === methodLower
                )
              );
            }

            if (filters.minAmount !== undefined) {
              filtered = filtered.filter(
                (p: any) => (p.totalAmount || 0) >= filters.minAmount!
              );
            }

            if (filters.maxAmount !== undefined) {
              filtered = filtered.filter(
                (p: any) => (p.totalAmount || 0) <= filters.maxAmount!
              );
            }

            if (filters.dateFrom) {
              const fromDate = new Date(filters.dateFrom);
              filtered = filtered.filter(
                (p: any) => new Date(p.receiptDate) >= fromDate
              );
            }

            if (filters.dateTo) {
              const toDate = new Date(filters.dateTo);
              toDate.setHours(23, 59, 59, 999); // Include full day
              filtered = filtered.filter(
                (p: any) => new Date(p.receiptDate) <= toDate
              );
            }

            console.log(
              `🔧 Client-side filtered: ${filtered.length} payments (from ${allPayments.data.length} total)`
            );
            set({ payments: filtered, loading: false });
          }
        } catch (error) {
          console.error("❌ Search failed:", error);
          set({ loading: false });
          toast.error("Filter Search Failed");
        }
      },

      // =====================================================
      // 🔥 STATS LOAD — for Dashboard Cards
      loadPaymentStats: async () => {
        const companyId = localStorage.getItem("currentCompanyId");
        if (!companyId) {
          toast.error("Company ID missing");
          return;
        }

        try {
          console.log("Loading payment stats for company:", companyId);
          const stats = await paymentReceivedApi.getPaymentStats(companyId);
          console.log("Stats received:", stats);
          set({ stats });
        } catch (error) {
          console.error("Failed to load stats:", error);
          toast.error("Failed to load stats");
        }
      },

      // =====================================================
      // CREATE
      createPayment: async (values) => {
        try {
          const payload: CreatePaymentReceivedPayload = {
            clientId: values.clientId,
            receiptDate: values.paymentDate,
            paymentType: values.paymentType,
            paymentRecords: values.paymentRecords,
            allocations: values.allocations,
            attachments: values.attachments ?? [],
          };

          const res = await paymentReceivedApi.createPayment(payload);
          set((s) => ({ payments: [res.data, ...s.payments] }));
          toast.success("Payment Added");
          return res.data;
        } catch (e) {
          toast.error("Payment Create Failed");
          throw e;
        }
      },

      // =====================================================
      // GET ONE
      getPayment: async (id) => {
        try {
          const res = await paymentReceivedApi.getPaymentById(id);
          return res.data || null;
        } catch {
          toast.error("Payment Not Found");
          return null;
        }
      },

      previewPayment: async (id) => {
        try {
          const res = await paymentReceivedApi.previewPayment(id);
          return res.data || null;
        } catch {
          toast.error("Preview Load Failed");
          return null;
        }
      },

      // =====================================================
      // UPDATE
      updatePayment: async (id, values) => {
        try {
          const payload = {
            clientId: values.clientId,
            receiptDate: values.paymentDate,
            paymentType: values.paymentType,
            paymentRecords: values.paymentRecords,
            allocations: values.allocations,
            attachments: values.attachments ?? [],
          };

          const res = await paymentReceivedApi.updatePayment(id, payload);

          set((s) => ({
            payments: s.payments.map((p) => (p._id === id ? res.data : p)),
          }));

          toast.success("Payment Updated");
          return res.data;
        } catch (e) {
          toast.error("Update Failed");
          throw e;
        }
      },

      // =====================================================
      // DELETE
      deletePayment: async (id) => {
        const companyId = localStorage.getItem("currentCompanyId");
        if (!companyId) {
          toast.error("Company ID missing");
          return;
        }

        try {
          await paymentReceivedApi.deletePayment(id, companyId);
          set((s) => ({ payments: s.payments.filter((p) => p._id !== id) }));
          toast.success("Deleted Successfully");
        } catch {
          toast.error("Delete Failed");
        }
      },
    }),

    {
      name: "payment-received-storage",
      partialize: (s) => ({
        payments: s.payments,
        stats: s.stats,
        companyId: s.companyId,
      }),
    }
  )
);
