import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PerformaInvoiceFormValues } from "@/components/finance/performa-invoice/PerformaInvoiceForm";
import performaInvoiceApi, {
  PerformaInvoice,
  PerformaInvoiceQueryParams,
} from "@/api/finance/performa-invoiceApi";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { toast } from "sonner";

// Helper function to format address from nested structure
const formatAddress = (address: any): string => {
  if (!address) return "";
  
  // If address is already a string, return it
  if (typeof address === "string") {
    return address;
  }
  
  // If address is an object with nested structure
  if (typeof address === "object" && address.street) {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);
    return parts.join(", ");
  }
  
  return "";
};

// Helper function to extract clientDetails from clientId object
const extractClientDetails = (clientId: any, existingClientDetails?: any) => {
  // Helper to check if value is meaningful (not empty)
  const hasValue = (val: any) => val && val !== null && val !== undefined && val.toString().trim() !== "";
  
  // If clientId is object, extract from it
  if (clientId && typeof clientId === "object") {
    const extractedName = clientId.businessName || clientId.name || "";
    const extractedGstin = clientId.gstin || "";
    const extractedAddress = formatAddress(clientId.address) || "";
    const extractedPhone = clientId.phone || "";
    const extractedEmail = clientId.email || "";
    const extractedState = clientId.address?.state || "";
    
    console.log("🔧 extractClientDetails - clientId data:", {
      businessName: clientId.businessName,
      name: clientId.name,
      extractedName,
      existingClientDetails
    });
    
    // Use existingClientDetails if it has value, otherwise use clientId
    const result = {
      name: hasValue(existingClientDetails?.name) ? existingClientDetails.name : extractedName,
      gstin: hasValue(existingClientDetails?.gstin) ? existingClientDetails.gstin : extractedGstin,
      address: hasValue(existingClientDetails?.address) ? existingClientDetails.address : extractedAddress,
      contact: hasValue(existingClientDetails?.contact) ? existingClientDetails.contact : extractedPhone,
      email: hasValue(existingClientDetails?.email) ? existingClientDetails.email : extractedEmail,
      state: hasValue(existingClientDetails?.state) ? existingClientDetails.state : extractedState,
    };
    
    console.log("✅ extractClientDetails result:", result);
    return result;
  }
  
  // If clientId is not object, return existingClientDetails or empty
  return existingClientDetails || { name: "", gstin: "", address: "", contact: "", email: "", state: "" };
};

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface PerformaInvoiceStore {
  performaInvoices: PerformaInvoiceFormValues[];
  currentPerformaInvoice: PerformaInvoiceFormValues | null;
  pagination: PaginationData | null;
  createPerformaInvoice: (invoice: PerformaInvoiceFormValues) => Promise<void>;
  updatePerformaInvoice: (
    invoiceNumber: string,
    updated: Partial<PerformaInvoiceFormValues>
  ) => Promise<void>;
  removePerformaInvoice: (invoiceNumber: string) => Promise<void>;
  deletePerformaInvoice: (invoiceId: string) => Promise<void>;
  duplicatePerformaInvoice: (invoiceId: string) => Promise<void>;
  convertToInvoice: (
    invoiceId: string,
    data: {
      invoiceNumber: string;
      invoiceDate: string;
      dueDate: string;
      invoiceType: string;
    }
  ) => Promise<void>;
  bulkAction: (
    action: string,
    invoiceIds: string[],
    data?: any
  ) => Promise<void>;
  getPerformaInvoices: () => PerformaInvoiceFormValues[];
  fetchPerformaInvoices: (page?: number, limit?: number) => Promise<void>;
  searchPerformaInvoices: (params: PerformaInvoiceQueryParams) => Promise<void>;
  updatePerformaInvoiceStatus: (
    invoiceId: string,
    status: string
  ) => Promise<void>;
  fetchPerformaInvoiceById: (
    invoiceId: string
  ) => Promise<PerformaInvoiceFormValues | null>;
  getPerformaInvoiceStats: (period?: string) => Promise<any>;
  previewPerformaInvoiceNumber: () => Promise<string>;
}

export const usePerformaInvoiceStore = create<PerformaInvoiceStore>()(
  persist(
    (set, get) => ({
      performaInvoices: [],
      currentPerformaInvoice: null,
      pagination: null,
      createPerformaInvoice: async (invoice) => {
        try {
          const user = useAuthStore.getState().user;
          const companyId = user?.companyId;

          if (!companyId) {
            throw new Error("Company ID not found");
          }

          // Validate that clientId is provided
          if (!invoice.clientId) {
            throw new Error("Client ID is required");
          }

          // Validate performaInvoiceTitle
          if (
            !invoice.performaInvoiceTitle ||
            invoice.performaInvoiceTitle.trim() === ""
          ) {
            throw new Error("Performa Invoice Title is required");
          }

          // Validate items
          if (!invoice.items || invoice.items.length === 0) {
            throw new Error("At least one item is required");
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
            performaInvoiceTitle: invoice.performaInvoiceTitle,
            invoiceNumber: invoice.performaInvoiceNumber,
            date: invoice.date,
            dueDate: invoice.dueDate,
            clientId:
              typeof invoice.clientId === "string"
                ? invoice.clientId
                : (invoice.clientId as any)?._id || "",
            clientDetails: invoice.clientDetails || {},
            businessDetails: invoice.businessDetails || {},
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
            phases: invoice.phases || [],
          };

          // Make API call
          const response = await performaInvoiceApi.createPerformaInvoice(
            payload
          );

          // Backend returns success: 1 (number) instead of true (boolean)
          if (
            (response.success as any) === true ||
            (response.success as any) === 1
          ) {
            // Map the API response to form values structure (same as fetchPerformaInvoices)
            const mappedInvoice: PerformaInvoiceFormValues = {
              _id: response.data?._id,
              type: "performa" as const,
              performaInvoiceTitle:
                (response.data as any)?.performaInvoiceTitle ||
                (response.data as any)?.invoiceTitle ||
                "",
              invoiceTitle:
                (response.data as any)?.performaInvoiceTitle ||
                (response.data as any)?.invoiceTitle ||
                "",
              performaInvoiceNumber:
                (response.data as any)?.performaInvoiceNumber ||
                (response.data as any)?.invoiceNumber ||
                "",
              invoiceNumber:
                (response.data as any)?.performaInvoiceNumber ||
                (response.data as any)?.invoiceNumber ||
                "",
              date: (response.data as any)?.date || "",
              dueDate: (response.data as any)?.dueDate || "",
              clientId: (response.data as any)?.clientId || "",
              clientDetails: extractClientDetails(
                (response.data as any)?.clientId,
                (response.data as any)?.clientDetails
              ),
              businessDetails: (response.data as any)?.businessDetails || {
                name: "",
                gstin: "",
                address: "",
                contact: "",
                email: "",
              },
              taxType: (response.data as any)?.taxType || "exclusive",
              items: (response.data as any)?.items || [],
              discountType:
                (response.data as any)?.discountType || "percentage",
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

            // Add new performa invoice to the beginning of the list
            set((state) => ({
              performaInvoices: [mappedInvoice, ...state.performaInvoices],
            }));

            toast.success("Performa Invoice created successfully");
          } else {
            throw new Error(
              response.message || "Failed to create performa invoice"
            );
          }
        } catch (error: any) {
          console.error("Error creating performa invoice:", error);
          const msg =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to create performa invoice";
          toast.error(msg);
          throw error;
        }
      },
      updatePerformaInvoice: async (invoiceNumber, updated) => {
        try {
          // Find the invoice using performaInvoiceNumber
          const PerformaInvoiceToUpdate = get().performaInvoices.find(
            (inv) => inv.performaInvoiceNumber === invoiceNumber
          );
          console.log("🔍 Finding invoice with number:", invoiceNumber);
          console.log("📋 Available invoices:", get().performaInvoices);
          console.log("✅ Found invoice:", PerformaInvoiceToUpdate);

          if (!PerformaInvoiceToUpdate) {
            throw new Error("Performa-Invoice not found in store");
          }

          // Get the invoice ID (_id from backend)
          const performaInvoiceId = (PerformaInvoiceToUpdate as any)._id;
          if (!performaInvoiceId) {
            throw new Error("Performa-Invoice ID not found");
          }

          const user = useAuthStore.getState().user;
          const companyId = user?.companyId;

          // Transform the form data to API format
          const apiPayload: any = {};

          // Handle performaInvoiceTitle - send as performaInvoiceTitle to match backend expectations
          if (updated.performaInvoiceTitle !== undefined) {
            apiPayload.performaInvoiceTitle = updated.performaInvoiceTitle;
          }

          if (updated.date !== undefined) apiPayload.date = updated.date;
          if (updated.dueDate !== undefined)
            apiPayload.dueDate = updated.dueDate;

          // Handle clientId - extract string if it's an object
          if (updated.clientId !== undefined) {
            apiPayload.clientId =
              typeof updated.clientId === "string"
                ? updated.clientId
                : (updated.clientId as any)?._id || "";
          }

          if (updated.clientDetails !== undefined)
            apiPayload.clientDetails = updated.clientDetails;
          if (updated.businessDetails !== undefined)
            apiPayload.businessDetails = updated.businessDetails;

          // Transform taxType properly
          if (updated.taxType !== undefined) {
            let taxTypeValue: "inclusive" | "exclusive" = "exclusive";
            if (updated.taxType.toLowerCase().includes("inclusive")) {
              taxTypeValue = "inclusive";
            }
            apiPayload.taxType = taxTypeValue;
          }

          if (updated.cessList !== undefined)
            apiPayload.cessList = updated.cessList;
          if (updated.discountType !== undefined)
            apiPayload.discountType = updated.discountType;
          if (updated.discountValue !== undefined)
            apiPayload.discountValue = updated.discountValue;
          if (updated.shipping !== undefined)
            apiPayload.shipping = updated.shipping;
          if (updated.roundOff !== undefined)
            apiPayload.roundOff = updated.roundOff;
          if (updated.showHSN !== undefined)
            apiPayload.showHSN = updated.showHSN;
          if (updated.showUnit !== undefined)
            apiPayload.showUnit = updated.showUnit;
          if (updated.terms !== undefined) apiPayload.terms = updated.terms;
          if (updated.notes !== undefined) apiPayload.notes = updated.notes;
          if (updated.showSignature !== undefined)
            apiPayload.showSignature = updated.showSignature;

          // Transform items properly with all required fields
          if (updated.items !== undefined) {
            // Determine item tax type from the taxType field
            const itemTaxType = (
              updated.taxType ||
              PerformaInvoiceToUpdate.taxType ||
              ""
            )
              .toLowerCase()
              .includes("igst")
              ? "igst"
              : "cgst_sgst";

            apiPayload.items = updated.items.map((item: any) => ({
              name: item.name,
              description: item.description || "",
              hsn: item.hsn || "",
              unit: item.unit || "pcs",
              quantity: item.qty || item.quantity || 1,
              rate: item.rate || 0,
              discount: item.discount || 0,
              discountType: item.discountType || ("flat" as const),
              taxType: item.taxType || (itemTaxType as "igst" | "cgst_sgst"),
              taxRate: item.taxRate || 18,
            }));
          }

          console.log("📤 Sending to API:", {
            id: performaInvoiceId,
            companyId: companyId,
            payload: apiPayload,
          });

          // Update in API with the correct invoice ID and companyId
          await performaInvoiceApi.updatePerformaInvoice(
            performaInvoiceId,
            apiPayload,
            companyId
          );

          // Update local state after successful API call
          set((state) => ({
            performaInvoices: state.performaInvoices.map((inv) =>
              inv.performaInvoiceNumber === invoiceNumber
                ? { ...inv, ...updated }
                : inv
            ),
          }));
          console.log(
            "� updatePerformaInvoice CALLED. Updated invoices:",
            get().performaInvoices
          );

          toast.success("Performa Invoice updated successfully");
        } catch (error: any) {
          console.error("❌ Error updating performa invoice:", error);
          const msg =
            error?.response?.data?.message ||
            "Failed to update performa invoice";
          toast.error(msg);
          throw error;
        }
      },
      removePerformaInvoice: async (invoiceNumber) => {
        try {
          // Find the invoice to get its ID
          const invoiceToDelete = get().performaInvoices.find(
            (inv: any) => inv.invoiceNumber === invoiceNumber
          );

          if (!invoiceToDelete) {
            throw new Error("Performa Invoice not found");
          }

          // Delete from API (would need the invoice ID from backend)
          // For now, just update local state
          set((state) => ({
            performaInvoices: state.performaInvoices.filter(
              (inv: any) => inv.invoiceNumber !== invoiceNumber
            ),
          }));
        } catch (error) {
          console.error("Error removing performa invoice:", error);
          throw error;
        }
      },

      updatePerformaInvoiceStatus: async (
        invoiceId: string,
        status: string
      ) => {
        try {
          console.log(
            "🔄 Updating performa invoice status...",
            invoiceId,
            status
          );

          const user = useAuthStore.getState().user;
          const companyId = user?.companyId;

          const response = await performaInvoiceApi.updatePerformaInvoiceStatus(
            invoiceId,
            status,
            companyId
          );

          if (response.success && response.data) {
            const invoice = response.data as any; // Use 'as any' to handle API response flexibility

            // Map the updated invoice to form values structure
            const mappedInvoice = {
              _id: invoice._id,
              type: "performa" as const,
              performaInvoiceTitle:
                invoice.performaInvoiceTitle || invoice.invoiceTitle || "",
              invoiceTitle:
                invoice.performaInvoiceTitle || invoice.invoiceTitle || "",
              performaInvoiceNumber:
                invoice.performaInvoiceNumber || invoice.invoiceNumber || "",
              invoiceNumber:
                invoice.performaInvoiceNumber || invoice.invoiceNumber || "",
              date: invoice.date || "",
              dueDate: invoice.dueDate || "",
              validUntil: invoice.validUntil || "",
              clientId: invoice.clientId || "",
              clientDetails: extractClientDetails(
                invoice.clientId,
                invoice.clientDetails
              ),
              businessDetails: invoice.businessDetails || {
                name: "",
                gstin: "",
                address: "",
                contact: "",
                email: "",
              },
              taxType: invoice.taxType || "exclusive",
              items: invoice.items || [],
              discountType: invoice.discountType || "percentage",
              discountValue: invoice.discountValue || 0,
              shipping: invoice.shipping || 0,
              roundOff: invoice.roundOff || false,
              showHSN: invoice.showHSN || false,
              showUnit: invoice.showUnit || false,
              terms: invoice.terms || "",
              notes: invoice.notes || "",
              attachments: invoice.attachments || [],
              showSignature: invoice.showSignature || false,
              cessList: invoice.cessList || [],
              phases: invoice.phases || [],
              status: invoice.status || "draft",
              quotationId: invoice.quotationId,
              convertedFromQuotation: invoice.convertedFromQuotation || false,
              subtotal: invoice.subtotal || 0,
              totalTax: invoice.totalTax || 0,
              totalCess: invoice.totalCess || 0,
              grandTotal: invoice.grandTotal || 0,
              createdAt: invoice.createdAt,
              updatedAt: invoice.updatedAt,
            };

            // Update local state with properly mapped invoice
            set((state) => ({
              performaInvoices: state.performaInvoices.map((inv: any) =>
                inv._id === invoiceId ? mappedInvoice : inv
              ) as any,
            }));

            console.log("✅ Status updated:", status);
            toast.success("Status updated");
          } else {
            throw new Error(response.message || "Failed to update status");
          }
        } catch (error: any) {
          console.error("❌ Error updating performa invoice status:", error);
          const msg =
            error?.response?.data?.message || "Failed to update status";
          toast.error(msg);
          throw error;
        }
      },

      deletePerformaInvoice: async (invoiceId) => {
        try {
          console.log("🔍 Deleting performa invoice...", invoiceId);

          const user = useAuthStore.getState().user;
          const companyId = user?.companyId;

          // Find the invoice to get quotationId before deletion
          const invoiceToDelete = get().performaInvoices.find(
            (inv: any) => inv._id === invoiceId
          );
          const quotationId = invoiceToDelete?.quotationId;

          const response = await performaInvoiceApi.deletePerformaInvoice(
            invoiceId,
            companyId
          );
          console.log("📦 Delete API Response:", response);

          if (response.success) {
            console.log("✅ Performa Invoice deleted");

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
                // Don't throw error, performa invoice is already deleted
              }
            }

            // Remove from local state immediately
            set((state) => ({
              performaInvoices: state.performaInvoices.filter(
                (inv: any) => inv._id !== invoiceId
              ),
            }));
            console.log(
              "🟢 deletePerformaInvoice CALLED. Updated invoices:",
              get().performaInvoices
            );

            toast.success("Performa Invoice deleted successfully");

            // Refresh from backend after a small delay to avoid race conditions
            setTimeout(() => {
              console.log("🔄 Refreshing performa invoices after delete...");
              get()
                .fetchPerformaInvoices()
                .catch((err) => {
                  console.error(
                    "⚠️ Failed to refresh performa invoices after delete:",
                    err
                  );
                });
            }, 300);
          } else {
            throw new Error(
              `API Error: ${
                response.message || "Failed to delete performa invoice"
              }`
            );
          }
        } catch (error: any) {
          console.error("❌ Error deleting performa invoice:", error);
          const msg =
            error?.response?.data?.message ||
            "Failed to delete performa invoice";
          toast.error(msg);
          throw error;
        }
      },
      getPerformaInvoices: () => get().performaInvoices,
      fetchPerformaInvoices: async (page = 1, limit = 10) => {
        try {
          const user = useAuthStore.getState().user;
          const companyId = user?.companyId;

          if (!companyId) {
            throw new Error(
              "Company ID is required to fetch performa invoices"
            );
          }

          console.log("🔍 Fetching performa invoices from API...", {
            page,
            limit,
            companyId,
          });
          const response = await performaInvoiceApi.getAllPerformaInvoices({
            page,
            limit,
            companyId,
          });
          console.log("📦 API Response:", response);

          if (response.success && response.data) {
            console.log("✅ Data received:", response.data);
            console.log("📄 Pagination:", response.pagination);

            // Map API data to form values structure
            const mappedData = response.data.map((invoice: any) => ({
              _id: invoice._id,
              type: "performa" as const,
              // Map both field names - API returns invoiceTitle/invoiceNumber
              // Set both performaInvoiceTitle and invoiceTitle for compatibility
              performaInvoiceTitle:
                invoice.performaInvoiceTitle || invoice.invoiceTitle || "",
              invoiceTitle:
                invoice.performaInvoiceTitle || invoice.invoiceTitle || "",
              performaInvoiceNumber:
                invoice.performaInvoiceNumber || invoice.invoiceNumber || "",
              invoiceNumber:
                invoice.performaInvoiceNumber || invoice.invoiceNumber || "",
              date: invoice.date || "",
              dueDate: invoice.dueDate || "",
              validUntil: invoice.validUntil || "",
              // Keep clientId as object to preserve client data for display
              clientId: invoice.clientId || "",
              clientDetails: extractClientDetails(
                invoice.clientId,
                invoice.clientDetails
              ),
              businessDetails: invoice.businessDetails || {
                name: "",
                gstin: "",
                address: "",
                contact: "",
                email: "",
              },
              taxType: invoice.taxType || "exclusive",
              items: invoice.items || [],
              discountType: invoice.discountType || "percentage",
              discountValue: invoice.discountValue || 0,
              shipping: invoice.shipping || 0,
              roundOff: invoice.roundOff || false,
              showHSN: invoice.showHSN || false,
              showUnit: invoice.showUnit || false,
              terms: invoice.terms || "",
              notes: invoice.notes || "",
              attachments: invoice.attachments || [],
              showSignature: invoice.showSignature || false,
              cessList: invoice.cessList || [],
              phases: invoice.phases || [],
              status: invoice.status || "draft",
              quotationId: invoice.quotationId,
              convertedFromQuotation: invoice.convertedFromQuotation || false,
              subtotal: invoice.subtotal || 0,
              totalTax: invoice.totalTax || 0,
              totalCess: invoice.totalCess || 0,
              grandTotal: invoice.grandTotal || 0,
              createdAt: invoice.createdAt,
              updatedAt: invoice.updatedAt,
            }));

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
              performaInvoices: mappedData,
              pagination: paginationData,
            });
            console.log(
              "🟢 fetchPerformaInvoices CALLED. Performa Invoices fetched:",
              mappedData
            );
          } else {
            console.warn("⚠️ API returned success=false or no data:", response);
            throw new Error(
              `API Error: ${response.message || "No data returned"}`
            );
          }
        } catch (error) {
          console.error("❌ Error fetching performa invoices:", error);
          throw error;
        }
      },
      searchPerformaInvoices: async (params: PerformaInvoiceQueryParams) => {
        try {
          console.log("🔍 Searching performa invoices with params...", params);

          const user = useAuthStore.getState().user;
          const companyId = user?.companyId;

          if (!companyId) {
            throw new Error(
              "Company ID is required to search performa invoices"
            );
          }

          // Add companyId to params
          const searchParams = { ...params, companyId };

          const response = await performaInvoiceApi.searchPerformaInvoices(
            searchParams
          );
          console.log("📦 Search API Response:", response);

          if (response.success && response.data) {
            console.log("✅ Search results received:", response.data);
            console.log("📄 Pagination:", response.pagination);

            // Map API data to form values structure (same as fetchPerformaInvoices)
            const mappedData = response.data.map((invoice: any) => ({
              _id: invoice._id,
              type: "performa" as const,
              performaInvoiceTitle:
                invoice.performaInvoiceTitle || invoice.invoiceTitle || "",
              invoiceTitle:
                invoice.performaInvoiceTitle || invoice.invoiceTitle || "",
              performaInvoiceNumber:
                invoice.performaInvoiceNumber || invoice.invoiceNumber || "",
              invoiceNumber:
                invoice.performaInvoiceNumber || invoice.invoiceNumber || "",
              date: invoice.date || "",
              dueDate: invoice.dueDate || "",
              validUntil: invoice.validUntil || "",
              clientId: invoice.clientId || "",
              clientDetails: extractClientDetails(
                invoice.clientId,
                invoice.clientDetails
              ),
              businessDetails: invoice.businessDetails || {
                name: "",
                gstin: "",
                address: "",
                contact: "",
                email: "",
              },
              taxType: invoice.taxType || "exclusive",
              items: invoice.items || [],
              discountType: invoice.discountType || "percentage",
              discountValue: invoice.discountValue || 0,
              shipping: invoice.shipping || 0,
              roundOff: invoice.roundOff || false,
              showHSN: invoice.showHSN || false,
              showUnit: invoice.showUnit || false,
              terms: invoice.terms || "",
              notes: invoice.notes || "",
              attachments: invoice.attachments || [],
              showSignature: invoice.showSignature || false,
              cessList: invoice.cessList || [],
              phases: invoice.phases || [],
              status: invoice.status || "draft",
              quotationId: invoice.quotationId,
              convertedFromQuotation: invoice.convertedFromQuotation || false,
              subtotal: invoice.subtotal || 0,
              totalTax: invoice.totalTax || 0,
              totalCess: invoice.totalCess || 0,
              grandTotal: invoice.grandTotal || 0,
              createdAt: invoice.createdAt,
              updatedAt: invoice.updatedAt,
            }));

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
              performaInvoices: mappedData,
              pagination: paginationData,
            });
            console.log(
              "🟢 searchPerformaInvoices CALLED. Search results:",
              mappedData
            );
          } else {
            console.warn("⚠️ API returned success=false or no data:", response);
            throw new Error(
              `API Error: ${response.message || "No data returned"}`
            );
          }
        } catch (error) {
          console.error("❌ Error searching performa invoices:", error);
          throw error;
        }
      },
      fetchPerformaInvoiceById: async (invoiceId) => {
        try {
          console.log("🔍 Fetching performa invoice by ID...", invoiceId);
          const user = useAuthStore.getState().user;
          const companyId = user?.companyId;

          const response = await performaInvoiceApi.getPerformaInvoiceById(
            invoiceId,
            companyId
          );
          console.log("📦 API Response:", response);

          if (response.success && response.data) {
            console.log("✅ Performa Invoice received:", response.data);
            const invoiceData = response.data as any;

            // Extract clientId properly - handle both string and object formats
            let extractedClientId = "";
            if (typeof invoiceData.clientId === "string") {
              extractedClientId = invoiceData.clientId;
            } else if (
              invoiceData.clientId &&
              typeof invoiceData.clientId === "object"
            ) {
              extractedClientId =
                invoiceData.clientId._id || invoiceData.clientId.id || "";
            }

            // Check if businessDetails from API is empty/invalid
            const hasValidBusinessDetails =
              invoiceData.businessDetails &&
              (invoiceData.businessDetails.name ||
                invoiceData.businessDetails.gstin ||
                invoiceData.businessDetails.address);

            // Get business details from store as fallback
            const businessStoreDetails = useBussinessStore.getState().details;
            const fallbackBusinessDetails = businessStoreDetails
              ? {
                  name: businessStoreDetails.businessName || "",
                  gstin: businessStoreDetails.gstNumber || "",
                  address: businessStoreDetails.website || "",
                  contact: businessStoreDetails.phone || "",
                  email: "",
                }
              : {
                  name: "",
                  gstin: "",
                  address: "",
                  contact: "",
                  email: "",
                };

            // Map API fields to form fields - API uses invoiceNumber/invoiceTitle
            // but form expects performaInvoiceNumber/performaInvoiceTitle

            // Determine taxConfiguration from items (IGST vs SGST_CGST)
            const determineTaxConfiguration = (): "IGST" | "SGST_CGST" => {
              if (invoiceData.items && invoiceData.items.length > 0) {
                const firstItem = invoiceData.items[0];
                if (firstItem.taxType === "igst" || firstItem.igstAmount) {
                  return "IGST";
                }
              }
              return "SGST_CGST";
            };

            const mappedData = {
              ...invoiceData,
              performaInvoiceNumber:
                invoiceData.invoiceNumber || invoiceData.performaInvoiceNumber,
              performaInvoiceTitle:
                invoiceData.invoiceTitle || invoiceData.performaInvoiceTitle,
              clientId: extractedClientId,
              clientDetails: extractClientDetails(
                invoiceData.clientId,
                invoiceData.clientDetails
              ),
              businessDetails: hasValidBusinessDetails
                ? invoiceData.businessDetails
                : fallbackBusinessDetails,
              taxType: determineTaxConfiguration(),
              items: (invoiceData.items || []).map((item: any) => ({
                ...item,
                qty: item.quantity || item.qty || 1,
              })),
            };

            set({ currentPerformaInvoice: mappedData });
            console.log(
              "🟢 fetchPerformaInvoiceById CALLED. Mapped invoice:",
              mappedData
            );
            return mappedData;
          } else {
            console.warn("⚠️ API returned success=false or no data:", response);
            throw new Error(
              `API Error: ${response.message || "No data returned"}`
            );
          }
        } catch (error) {
          console.error("❌ Error fetching performa invoice by ID:", error);
          throw error;
        }
      },

      // ===========================
      // Get Performa Invoice Stats
      // ===========================
      getPerformaInvoiceStats: async (period = "30") => {
        try {
          const user = useAuthStore.getState().user;
          const companyId = user?.companyId;

          if (!companyId) {
            throw new Error("Company ID not found");
          }

          console.log("🔍 Fetching performa invoice stats...", {
            companyId,
            period,
          });
          const response = await performaInvoiceApi.getPerformaInvoiceStats(
            companyId,
            period
          );
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
          console.error("❌ Error fetching performa invoice stats:", error);
          const msg =
            error?.response?.data?.message ||
            "Failed to fetch performa invoice stats";
          toast.error(msg);
          throw error;
        }
      },

      // ===========================
      // Preview Performa Invoice Number
      // ===========================
      previewPerformaInvoiceNumber: async () => {
        try {
          const res = await performaInvoiceApi.previewPerformaInvoiceNumber();
          return res.data.invoiceNumber;
        } catch (error: any) {
          const msg =
            error?.response?.data?.message || "Failed to generate number";
          toast.error(msg);
          throw error;
        }
      },

      // ===========================
      // Duplicate Performa Invoice
      // ===========================
      duplicatePerformaInvoice: async (invoiceId: string) => {
        try {
          const user = useAuthStore.getState().user;
          const companyId = user?.companyId;
          if (!companyId) throw new Error("Company ID not found");
          const response = await performaInvoiceApi.duplicatePerformaInvoice(
            invoiceId,
            companyId
          );
          if (response.success && response.data) {
            await get().fetchPerformaInvoices();
            toast.success("Performa Invoice duplicated successfully");
          } else {
            throw new Error(
              `API Error: ${
                response.message || "Failed to duplicate performa invoice"
              }`
            );
          }
        } catch (error: any) {
          console.error("❌ Error duplicating performa invoice:", error);
          const msg =
            error?.response?.data?.message ||
            "Failed to duplicate performa invoice";
          toast.error(msg);
          throw error;
        }
      },

      convertToInvoice: async (
        invoiceId: string,
        data: {
          invoiceNumber: string;
          invoiceDate: string;
          dueDate: string;
          invoiceType: string;
        }
      ) => {
        try {
          const user = useAuthStore.getState().user;
          const companyId = user?.companyId;

          if (!companyId) {
            throw new Error("Company ID not found");
          }

          const response = await performaInvoiceApi.convertToInvoice(
            invoiceId,
            data,
            companyId
          );
          if (response.success) {
            // Update the status to "converted" after successful conversion
            await performaInvoiceApi.updatePerformaInvoiceStatus(
              invoiceId,
              "converted",
              companyId
            );

            // Fetch the updated list
            await get().fetchPerformaInvoices();
            toast.success("Performa Invoice converted to Invoice successfully");
          } else {
            throw new Error(
              `API Error: ${response.message || "Failed to convert to invoice"}`
            );
          }
        } catch (error: any) {
          console.error("❌ Error converting performa invoice:", error);
          const msg =
            error?.response?.data?.message ||
            "Failed to convert performa invoice to invoice";
          toast.error(msg);
          throw error;
        }
      },

      // ===========================
      // Bulk Action
      // ===========================
      bulkAction: async (action: string, invoiceIds: string[], data?: any) => {
        try {
          console.log("🔍 Performing bulk action...", action, invoiceIds);
          const response = await performaInvoiceApi.bulkAction(
            action,
            invoiceIds,
            data
          );
          console.log("📦 Bulk Action API Response:", response);

          if (response.success) {
            console.log("✅ Bulk action completed");
            // Refresh the list after bulk action
            await get().fetchPerformaInvoices();
            toast.success(`Bulk ${action} completed successfully`);
          } else {
            throw new Error(
              `API Error: ${response.message || "Bulk action failed"}`
            );
          }
        } catch (error: any) {
          console.error("❌ Error performing bulk action:", error);
          const msg = error?.response?.data?.message || "Bulk action failed";
          toast.error(msg);
          throw error;
        }
      },
    }),

    {
      name: "performa-invoice-storage",
      partialize: (state) => ({ performaInvoices: state.performaInvoices }),
    }
  )
);
