import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InvoiceFormValues } from "@/components/finance/invoice/InvoiceForm";
import invoiceApi, { InvoiceQueryParams } from "@/api/finance/invoiceApi";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { toast } from "sonner";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface InvoiceStore {
  invoices: InvoiceFormValues[];
  currentInvoice: InvoiceFormValues | null;
  pagination: PaginationData | null;
  createInvoice: (invoice: InvoiceFormValues) => Promise<void>;
  updateInvoice: (
    invoiceId: string,
    updated: Partial<InvoiceFormValues>
  ) => Promise<void>;
  removeInvoice: (invoiceNumber: string) => Promise<void>;
  deleteInvoice: (invoiceId: string) => Promise<void>;
  getInvoices: () => InvoiceFormValues[];
  fetchInvoices: (page?: number, limit?: number) => Promise<void>;
  searchInvoices: (params: InvoiceQueryParams) => Promise<void>;
  updateInvoiceStatus: (invoiceId: string, status: string) => Promise<void>;
  fetchInvoiceById: (invoiceId: string) => Promise<InvoiceFormValues | null>;
  duplicateInvoice: (invoiceId: string) => Promise<InvoiceFormValues>;
  bulkAction: (
    action: string,
    invoiceIds: string[],
    data?: any
  ) => Promise<void>;
  getInvoiceStats: (period?: string) => Promise<any>;
}

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      invoices: [],
      currentInvoice: null,
      pagination: null,
      createInvoice: async (invoice) => {
        try {
          const user = useAuthStore.getState().user;
          const companyId = user?.companyId;
          if (!companyId) {
            throw new Error("Company ID not found");
          }
          console.log("company debugg", user);

          // Validate that clientId is provided
          if (!invoice.clientId) {
            throw new Error("Client ID is required");
          }

          // Determine tax type based on the value
          let taxTypeValue: "inclusive" | "exclusive" = "exclusive";
          if (invoice.taxType.toLowerCase().includes("inclusive")) {
            taxTypeValue = "inclusive";
          }

          // Determine item tax type
          const itemTaxType = invoice.taxType.toLowerCase().includes("igst")
            ? "igst"
            : "cgst_sgst";

          // Transform form values to API payload
          const payload = {
            companyId,
            invoiceTitle: invoice.invoiceTitle,
            invoiceNumber: invoice.invoiceNumber,
            date: invoice.date,
            dueDate: invoice.dueDate,
            clientId: invoice.clientId,
            clientDetails: invoice.clientDetails,
            businessDetails: invoice.businessDetails,
            taxType: taxTypeValue,
            cessList: invoice.cessList || [],
            items: invoice.items.map((item: any) => ({
              name: item.name,
              description: item.description || "",
              hsn: item.hsn || "",
              unit: item.unit || "pcs",
              quantity: item.qty || 1,
              rate: item.rate || 0,
              discount: item.discount || 0,
              discountType: "flat" as const,
              taxType: itemTaxType as "igst" | "cgst_sgst",
              taxRate: 18,
            })),
            discountType: (invoice.discountType || "flat") as
              | "flat"
              | "percentage",
            discountValue: invoice.discountValue || 0,
            shipping: invoice.shipping || 0,
            roundOff: invoice.roundOff || false,
            showHSN: invoice.showHSN || false,
            showUnit: invoice.showUnit || false,
            terms: invoice.terms || "",
            notes: invoice.notes || "",
            attachments: invoice.attachments || [],
            showSignature: invoice.showSignature || false,
          };

          // Make API call
          const response = await invoiceApi.createInvoice(payload);

          // Map the API response to form values structure (ensure we have all needed fields)
          const mappedInvoice: InvoiceFormValues = {
            _id: (response.data as any)?._id || (response as any)?._id,
            type: "invoice" as const,
            invoiceTitle: (response.data as any)?.invoiceTitle || "",
            invoiceNumber: (response.data as any)?.invoiceNumber || "",
            date: (response.data as any)?.date || "",
            dueDate: (response.data as any)?.dueDate || "",
            clientId: (response.data as any)?.clientId || "",
            clientDetails: (response.data as any)?.clientDetails || {
              name: "",
              gstin: "",
              address: "",
              contact: "",
              email: "",
            },
            businessDetails: (response.data as any)?.businessDetails || {
              name: "",
              gstin: "",
              address: "",
              contact: "",
              email: "",
            },
            taxType: (response.data as any)?.taxType || "exclusive",
            items: (response.data as any)?.items || [],
            discountType: (response.data as any)?.discountType || "flat",
            discountValue: (response.data as any)?.discountValue || 0,
            shipping: (response.data as any)?.shipping || 0,
            roundOff: (response.data as any)?.roundOff || false,
            showHSN: (response.data as any)?.showHSN || false,
            showUnit: (response.data as any)?.showUnit || false,
            terms: (response.data as any)?.terms || "",
            notes: (response.data as any)?.notes || "",
            attachments: (response.data as any)?.attachments || [],
            showSignature: (response.data as any)?.showSignature || false,
            cessList: (response.data as any)?.cessList || [],
            phases: (response.data as any)?.phases || [],
          };

          // Add new invoice to the beginning of the list
          set((state) => ({
            invoices: [mappedInvoice, ...state.invoices],
          }));

          console.log(
            "🟢 createInvoice CALLED. Updated invoices:",
            get().invoices
          );

          // Don't show toast here - let the calling component handle it
        } catch (error: any) {
          console.error("Error creating invoice:", error);
          // Don't show toast here - let the calling component handle it
          throw error;
        }
      },
      updateInvoice: async (invoiceId, updated) => {
        try {
          // Update in API with the invoice ID
          await invoiceApi.updateInvoice(invoiceId, updated as any);

          // Update local state after successful API call
          set((state) => ({
            invoices: state.invoices.map((inv) =>
              (inv as any)._id === invoiceId ? { ...inv, ...updated } : inv
            ),
          }));
          console.log(
            "🟢 updateInvoice CALLED. Updated invoices:",
            get().invoices
          );

          // Don't show toast here - let the calling component handle it
        } catch (error: any) {
          console.error("Error updating invoice:", error);
          // Don't show toast here - let the calling component handle it
          throw error;
        }
      },
      removeInvoice: async (invoiceNumber) => {
        try {
          // Find the invoice to get its ID
          const invoiceToDelete = get().invoices.find(
            (inv) => inv.invoiceNumber === invoiceNumber
          );

          if (!invoiceToDelete) {
            throw new Error("Invoice not found");
          }

          // Delete from API (would need the invoice ID from backend)
          // For now, just update local state
          set((state) => ({
            invoices: state.invoices.filter(
              (inv) => inv.invoiceNumber !== invoiceNumber
            ),
          }));
          console.log(
            "🟢 removeInvoice CALLED. Updated invoices:",
            get().invoices
          );
        } catch (error) {
          console.error("Error removing invoice:", error);
          throw error;
        }
      },

      updateInvoiceStatus: async (invoiceId: string, status: string) => {
        try {
          console.log("🔄 Updating invoice status...", invoiceId, status);

          const response = await invoiceApi.updateInvoiceStatus(
            invoiceId,
            status
          );

          if (response.success && response.data) {
            // Update local state
            set((state) => ({
              invoices: state.invoices.map((inv: any) =>
                inv._id === invoiceId ? response.data : inv
              ),
            }));

            console.log("✅ Status updated:", status);
            toast.success("Status updated");
          } else {
            throw new Error(response.message || "Failed to update status");
          }
        } catch (error: any) {
          console.error("❌ Error updating invoice status:", error);
          const msg =
            error?.response?.data?.message || "Failed to update status";
          toast.error(msg);
          throw error;
        }
      },

      deleteInvoice: async (invoiceId) => {
        try {
          console.log("🔍 Deleting invoice...", invoiceId);

          // Find the invoice to get quotationId before deletion
          const invoiceToDelete = get().invoices.find(
            (inv: any) => inv._id === invoiceId
          );
          const quotationId = (invoiceToDelete as any)?.quotationId;

          const response = await invoiceApi.deleteInvoice(invoiceId);
          console.log("📦 Delete API Response:", response);

          if (response.success) {
            console.log("✅ Invoice deleted");

            // If this was converted from a quotation, refresh quotations
            if (quotationId) {
              console.log(
                "🔄 Refreshing quotations to update conversion status..."
              );
              try {
                const { useQuotationStore } = await import(
                  "./useQuotationStore"
                );
                const quotationStore = useQuotationStore.getState();

                // Refresh quotations to get updated data from backend
                await quotationStore.fetchQuotations();

                console.log("✅ Quotations refreshed successfully");
              } catch (err) {
                console.error("⚠️ Failed to refresh quotations:", err);
                // Don't throw error, invoice is already deleted
              }
            }

            // Remove from local state immediately
            set((state) => ({
              invoices: state.invoices.filter(
                (inv) => (inv as any)._id !== invoiceId
              ),
            }));
            console.log(
              "🟢 deleteInvoice CALLED. Updated invoices:",
              get().invoices
            );

            toast.success("Invoice deleted successfully");

            // Refresh from backend after a small delay to avoid race conditions
            setTimeout(() => {
              console.log("🔄 Refreshing invoices after delete...");
              get()
                .fetchInvoices()
                .catch((err) => {
                  console.error(
                    "⚠️ Failed to refresh invoices after delete:",
                    err
                  );
                });
            }, 300);
          } else {
            throw new Error(
              `API Error: ${response.message || "Failed to delete invoice"}`
            );
          }
        } catch (error: any) {
          console.error("❌ Error deleting invoice:", error);
          const msg =
            error?.response?.data?.message || "Failed to delete invoice";
          toast.error(msg);
          throw error;
        }
      },
      getInvoices: () => get().invoices,
      fetchInvoices: async (page = 1, limit = 10) => {
        try {
          console.log("🔍 Fetching invoices from API...", { page, limit });
          const response = await invoiceApi.getAllInvoices({ page, limit });
          console.log("📦 API Response:", response);

          if (response.success && response.data) {
            console.log("✅ Data received:", response.data);
            console.log("📄 Pagination:", response.pagination);

            // Map API pagination to store pagination format
            const paginationData = response.pagination
              ? {
                  total: response.pagination.total,
                  page: response.pagination.page,
                  limit: response.pagination.limit,
                  pages: response.pagination.pages,
                }
              : null;

            set({
              invoices: response.data as any,
              pagination: paginationData,
            });
            console.log(
              "🟢 fetchInvoices CALLED. Invoices fetched:",
              response.data
            );
          } else {
            console.warn("⚠️ API returned success=false or no data:", response);
            throw new Error(
              `API Error: ${response.message || "No data returned"}`
            );
          }
        } catch (error) {
          console.error("❌ Error fetching invoices:", error);
          throw error;
        }
      },
      searchInvoices: async (params: InvoiceQueryParams) => {
        try {
          console.log("🔍 Searching invoices with params...", params);
          const response = await invoiceApi.searchInvoices(params);
          console.log("📦 Search API Response:", response);

          if (response.success && response.data) {
            console.log("✅ Search results received:", response.data);
            console.log("📄 Pagination:", response.pagination);

            // Map API pagination to store pagination format
            const paginationData = response.pagination
              ? {
                  total: response.pagination.total,
                  page: response.pagination.page,
                  limit: response.pagination.limit,
                  pages: response.pagination.pages,
                }
              : null;

            set({
              invoices: response.data as any,
              pagination: paginationData,
            });
            console.log(
              "🟢 searchInvoices CALLED. Search results:",
              response.data
            );
          } else {
            console.warn("⚠️ API returned success=false or no data:", response);
            throw new Error(
              `API Error: ${response.message || "No data returned"}`
            );
          }
        } catch (error) {
          console.error("❌ Error searching invoices:", error);
          throw error;
        }
      },
      fetchInvoiceById: async (invoiceId) => {
        try {
          console.log("🔍 Fetching invoice by ID...", invoiceId);
          const response = await invoiceApi.getInvoiceById(invoiceId);
          console.log("📦 API Response:", response);

          if (response.success && response.data) {
            console.log("✅ Invoice received:", response.data);
            const invoiceData = response.data as any;
            set({ currentInvoice: invoiceData });
            console.log(
              "🟢 fetchInvoiceById CALLED. Current invoice set:",
              invoiceData
            );
            return invoiceData;
          } else {
            console.warn("⚠️ API returned success=false or no data:", response);
            throw new Error(
              `API Error: ${response.message || "No data returned"}`
            );
          }
        } catch (error) {
          console.error("❌ Error fetching invoice by ID:", error);
          throw error;
        }
      },
      duplicateInvoice: async (invoiceId) => {
        try {
          console.log("🔍 Duplicating invoice...", invoiceId);
          const response = await invoiceApi.duplicateInvoice(invoiceId);
          console.log("📦 Duplicate API Response:", response);

          if (response.success && response.data) {
            console.log("✅ Invoice duplicated:", response.data);

            toast.success("Invoice duplicated successfully");

            // Fetch all invoices to get live data from backend
            await get().fetchInvoices();

            return response.data as any;
          } else {
            console.warn("⚠️ API returned success=false or no data:", response);
            throw new Error(
              `API Error: ${response.message || "No data returned"}`
            );
          }
        } catch (error: any) {
          console.error("❌ Error duplicating invoice:", error);
          const msg =
            error?.response?.data?.message || "Failed to duplicate invoice";
          toast.error(msg);
          throw error;
        }
      },

      // ===========================
      // Bulk Actions
      // ===========================
      bulkAction: async (action, invoiceIds, data) => {
        try {
          console.log("🔍 Performing bulk action...", action, invoiceIds);
          const response = await invoiceApi.bulkAction(
            action,
            invoiceIds,
            data
          );
          console.log("📦 Bulk action API Response:", response);

          if (response.success) {
            console.log("✅ Bulk action completed:", action);
            toast.success(`Bulk action "${action}" completed successfully`);

            // Refresh invoices after bulk action
            await get().fetchInvoices();
          } else {
            throw new Error(
              `API Error: ${response.message || "Bulk action failed"}`
            );
          }
        } catch (error: any) {
          console.error("❌ Error performing bulk action:", error);
          const msg =
            error?.response?.data?.message || "Failed to perform bulk action";
          toast.error(msg);
          throw error;
        }
      },

      // ===========================
      // Get Invoice Stats
      // ===========================
      getInvoiceStats: async (period = "30") => {
        try {
          console.log("🔍 Fetching invoice stats...", period);
          const response = await invoiceApi.getInvoiceStats(period);
          console.log("📦 Stats API Response:", response);

          if (response.success && response.data) {
            console.log("✅ Stats received:", response.data);
            return response.data;
          } else {
            console.warn("⚠️ API returned success=false or no data:", response);
            throw new Error(
              `API Error: ${response.message || "No data returned"}`
            );
          }
        } catch (error: any) {
          console.error("❌ Error fetching invoice stats:", error);
          const msg =
            error?.response?.data?.message || "Failed to fetch invoice stats";
          toast.error(msg);
          throw error;
        }
      },
    }),

    {
      name: "invoice-storage",
      partialize: (state) => ({ invoices: state.invoices }),
    }
  )
);
