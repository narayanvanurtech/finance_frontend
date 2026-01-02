import axiosInstance from "@/utils/axios";

// ==================== Interfaces ====================

// Cess interface
export interface Cess {
  name: string;
  rate: number;
}

// Credit Note Item interface
export interface CreditNoteItem {
  itemId?: string;
  name: string;
  hsn?: string;
  unit?: string;
  quantity: number;
  rate: number;
  discount: number;
  discountType?: "flat" | "percentage";
  taxType?: "cgst_sgst" | "igst" | "none";
  taxRate?: number;
  reason: string;
  cess?: Cess[];
  amount?: number;
  taxAmount?: number;
}

// Client Snapshot interface
export interface ClientSnapshot {
  name: string;
  email: string;
  phone: string;
  gstin: string;
  address?: {
    country: string;
    state: string;
    city: string;
    postalCode: string;
    streetAddress: string;
  };
}

// Create Credit Note Payload
export interface CreateCreditNotePayload {
  clientId: string;
  invoiceId: string;
  creditNoteNumber: string;
  creditNoteDate: string;
  originalInvoiceNumber?: string;
  originalInvoiceDate?: string;
  placeOfSupply?: string;
  stateCode?: string;
  reason: string;
  creditType:
    | "quality_issue"
    | "quantity_shortage"
    | "damaged_goods"
    | "price_difference"
    | "return"
    | "refund"
    | "other";
  items: CreditNoteItem[];
  taxType?: "inclusive" | "exclusive" | "none";
  taxConfiguration?: "IGST" | "SGST_CGST";
  discountType?: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  showHSN?: boolean;
  showUnit?: boolean;
  showSignature?: boolean;
  priority?: "low" | "medium" | "high" | "urgent";
  terms?: string;
  notes?: string;
  attachments?: Array<{ url: string }>;
  clientSnapshot?: ClientSnapshot;
}

// Update Credit Note Payload
export interface UpdateCreditNotePayload {
  creditNoteNumber?: string;
  creditNoteDate?: string;
  originalInvoiceNumber?: string;
  originalInvoiceDate?: string;
  placeOfSupply?: string;
  stateCode?: string;
  reason?: string;
  creditType?:
    | "quality_issue"
    | "quantity_shortage"
    | "damaged_goods"
    | "price_difference"
    | "return"
    | "refund"
    | "other";
  items?: CreditNoteItem[];
  taxType?: "inclusive" | "exclusive" | "none";
  taxConfiguration?: "IGST" | "SGST_CGST";
  discountType?: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  showHSN?: boolean;
  showUnit?: boolean;
  showSignature?: boolean;
  priority?: "low" | "medium" | "high" | "urgent";
  terms?: string;
  notes?: string;
  status?: "draft" | "sent" | "acknowledged" | "disputed" | "resolved";
}

// Approve Credit Note Payload
export interface ApproveCreditNotePayload {
  approvalNotes?: string;
}

// Update Status Payload
export interface UpdateStatusPayload {
  status: "draft" | "sent" | "acknowledged" | "disputed" | "resolved";
  notes?: string;
}

// Resolve Credit Note Payload
export interface ResolveCreditNotePayload {
  resolutionStatus:
    | "pending"
    | "refund_processed"
    | "adjustment_made"
    | "credit_applied"
    | "disputed";
  adjustmentAmount?: number;
  resolutionNotes?: string;
  adjustmentMethod?: string;
  adjustmentReference?: string;
}

// Dispute Credit Note Payload
export interface DisputeCreditNotePayload {
  notes?: string;
}
// Populated Client interface (when clientId is populated)
export interface PopulatedClient {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  gstin?: string;
}

// Credit Note interface
export interface CreditNote {
  _id: string;
  companyId: string | { _id: string };
  clientId: string | PopulatedClient;
  invoiceId: string | { _id: string };
  creditNoteNumber: string;
  creditNoteDate: string;
  originalInvoiceNumber?: string;
  originalInvoiceDate?: string;
  placeOfSupply?: string;
  stateCode?: string;
  reason: string;
  creditType:
    | "quality_issue"
    | "quantity_shortage"
    | "damaged_goods"
    | "price_difference"
    | "return"
    | "refund"
    | "other";
  items: CreditNoteItem[];
  taxType?: "inclusive" | "exclusive" | "none";
  taxConfiguration?: "IGST" | "SGST_CGST";
  discountType?: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  showHSN?: boolean;
  showUnit?: boolean;
  showSignature?: boolean;
  priority?: "low" | "medium" | "high" | "urgent";
  terms?: string;
  notes?: string;
  attachments?: Array<{ url: string }>;
  status: "draft" | "sent" | "acknowledged" | "disputed" | "resolved";
  resolutionStatus?:
    | "pending"
    | "refund_processed"
    | "adjustment_made"
    | "credit_applied"
    | "disputed";
  adjustmentAmount?: number;
  clientSnapshot?: ClientSnapshot;
  // Computed/calculated fields
  subtotal?: number;
  totalTax?: number;
  totalCess?: number;
  grandTotal?: number;
  createdAt?: string;
  updatedAt?: string;
  lastModifiedAt?: string;
  __v?: number;
  id?: string;
}

// Query Parameters interface
export interface CreditNoteQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  clientId?: string;
  invoiceId?: string;
  status?: "draft" | "sent" | "acknowledged" | "disputed" | "resolved";
  resolutionStatus?:
    | "pending"
    | "refund_processed"
    | "adjustment_made"
    | "credit_applied"
    | "disputed";
  creditType?:
    | "quality_issue"
    | "quantity_shortage"
    | "damaged_goods"
    | "price_difference"
    | "return"
    | "refund"
    | "other";
  priority?: "low" | "medium" | "high" | "urgent";
  startDate?: string;
  endDate?: string;
  search?: string;
  populate?: string; // For populating referenced fields like clientId
}

// API Response interfaces
export interface CreditNoteResponse {
  success: boolean;
  message: string;
  data: CreditNote;
}

export interface CreditNotesResponse {
  success: boolean;
  message: string;
  data: CreditNote[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreditNoteStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalCreditNotes: number;
    draftCreditNotes: number;
    sentCreditNotes: number;
    acknowledgedCreditNotes: number;
    resolvedCreditNotes: number;
    disputedCreditNotes: number;
    totalValue: number;
    averageCreditNoteValue: number;
    statusBreakdown?: Array<{
      status: string;
      count: number;
      percentage?: number;
    }>;
    [key: string]: any;
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

// ==================== Helper Functions ====================

/**
 * Calculate totals from credit note items
 */
const calculateCreditNoteTotals = (creditNote: any): CreditNote => {
  const items = creditNote.items || [];
  const taxType = creditNote.taxType || "exclusive";
  const discountValue = creditNote.discountValue || 0;
  const discountType = creditNote.discountType || "flat";
  const shipping = creditNote.shipping || 0;

  let subtotal = 0;
  let totalTax = 0;
  let totalCess = 0;

  // Calculate item-level amounts and taxes
  items.forEach((item: any) => {
    // Calculate base amount (quantity * rate)
    const baseAmount = (item.quantity || 0) * (item.rate || 0);

    // Apply item-level discount
    let itemDiscount = 0;
    if (item.discountType === "percentage") {
      itemDiscount = baseAmount * ((item.discount || 0) / 100);
    } else {
      itemDiscount = item.discount || 0;
    }

    const itemAmount = baseAmount - itemDiscount;

    // Use pre-calculated amount if available, otherwise use calculated
    const finalItemAmount = item.amount || itemAmount;
    subtotal += finalItemAmount;

    // Calculate tax amount
    let itemTax = 0;
    if (item.taxRate && item.taxRate > 0) {
      if (item.taxType === "cgst_sgst") {
        // For CGST+SGST, tax is split equally
        itemTax = (item.cgstAmount || 0) + (item.sgstAmount || 0);
        if (!itemTax) {
          itemTax = finalItemAmount * (item.taxRate / 100);
        }
      } else if (item.taxType === "igst") {
        itemTax = item.igstAmount || 0;
        if (!itemTax) {
          itemTax = finalItemAmount * (item.taxRate / 100);
        }
      }
    }

    // Use pre-calculated tax if available
    totalTax += item.taxAmount || itemTax;

    // Calculate cess
    if (item.cess && Array.isArray(item.cess)) {
      item.cess.forEach((c: any) => {
        totalCess += finalItemAmount * ((c.rate || 0) / 100);
      });
    }
  });

  // Apply document-level discount
  let documentDiscount = 0;
  if (discountType === "percentage") {
    documentDiscount = subtotal * (discountValue / 100);
  } else {
    documentDiscount = discountValue;
  }

  const subtotalAfterDiscount = subtotal - documentDiscount;

  // Calculate grand total based on tax type
  let grandTotal = 0;
  if (taxType === "inclusive") {
    // Tax is already included in the item prices
    grandTotal = subtotalAfterDiscount + totalCess + shipping;
  } else {
    // Tax is exclusive (added on top)
    grandTotal = subtotalAfterDiscount + totalTax + totalCess + shipping;
  }

  // Apply rounding if enabled
  if (creditNote.roundOff) {
    grandTotal = Math.round(grandTotal);
  }

  return {
    ...creditNote,
    subtotal,
    totalTax,
    totalCess,
    grandTotal,
  };
};

// ==================== API Functions ====================

const creditNoteApi = {
  // 1. Create a new credit note
  createCreditNote: async (
    creditNoteData: CreateCreditNotePayload
  ): Promise<CreditNoteResponse> => {
    try {
      const response = await axiosInstance.post<any>(
        "/api/v1/finance/sales/credit-notes/",
        creditNoteData
      );
      // Transform API response: result -> data to match CreditNoteResponse interface
      if (response.data && response.data.result && !response.data.data) {
        return {
          success: response.data.success ?? true,
          message: response.data.message ?? "",
          data: response.data.result,
        };
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 2. Get all credit notes with filters
  getAllCreditNotes: async (
    params?: CreditNoteQueryParams
  ): Promise<CreditNotesResponse> => {
    try {
      const queryString = params
        ? new URLSearchParams(
            Object.entries(params)
              .filter(([_, value]) => value !== undefined && value !== "")
              .map(([key, value]) => [key, String(value)])
          ).toString()
        : "";

      const response = await axiosInstance.get<any>(
        `/api/v1/finance/sales/credit-notes/${
          queryString ? `?${queryString}` : ""
        }`
      );

      // Transform API response: result.creditNotes -> data to match CreditNotesResponse interface
      if (response.data && response.data.result && !response.data.data) {
        const result = response.data.result;
        const creditNotes = Array.isArray(result.creditNotes)
          ? result.creditNotes
          : Array.isArray(result)
          ? result
          : [];

        // Calculate totals for each credit note
        const creditNotesWithTotals = creditNotes.map(
          calculateCreditNoteTotals
        );

        return {
          success: response.data.success ?? true,
          message: response.data.message ?? "",
          data: creditNotesWithTotals,
          pagination: result.pagination || response.data.pagination,
        };
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. Get credit note statistics
  getCreditNoteStats: async (): Promise<CreditNoteStatsResponse> => {
    try {
      const response = await axiosInstance.get<any>(
        "/api/v1/finance/sales/credit-notes/stats"
      );

      // Transform API response: result -> data to match CreditNoteStatsResponse interface
      if (response.data && response.data.result && !response.data.data) {
        // The API returns an array like: [{ "_id": "draft", "count": 7 }, ...]
        // We need to transform it to the expected format
        const statsArray: Array<{ _id: string; count: number }> = Array.isArray(
          response.data.result
        )
          ? response.data.result
          : [];

        // Transform array items to have 'status' instead of '_id'
        const statusBreakdown = statsArray.map(
          (item: { _id: string; count: number }) => ({
            status: item._id,
            count: item.count,
            percentage: 0, // Calculate if needed
          })
        );

        const stats = {
          totalCreditNotes: statsArray.reduce(
            (sum: number, item: { _id: string; count: number }) =>
              sum + (item.count || 0),
            0
          ),
          draftCreditNotes:
            statsArray.find(
              (item: { _id: string; count: number }) => item._id === "draft"
            )?.count || 0,
          sentCreditNotes:
            statsArray.find(
              (item: { _id: string; count: number }) => item._id === "sent"
            )?.count || 0,
          acknowledgedCreditNotes:
            statsArray.find(
              (item: { _id: string; count: number }) =>
                item._id === "acknowledged"
            )?.count || 0,
          resolvedCreditNotes:
            statsArray.find(
              (item: { _id: string; count: number }) => item._id === "resolved"
            )?.count || 0,
          disputedCreditNotes:
            statsArray.find(
              (item: { _id: string; count: number }) => item._id === "disputed"
            )?.count || 0,
          totalValue: 0, // Not provided by API
          averageCreditNoteValue: 0, // Not provided by API
          statusBreakdown, // Transformed array with 'status' field
        };

        return {
          success: response.data.success ?? true,
          message: response.data.message ?? "",
          data: stats,
        };
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 4. Get credit notes by invoice
  getCreditNotesByInvoice: async (
    invoiceId: string
  ): Promise<CreditNotesResponse> => {
    try {
      const response = await axiosInstance.get<CreditNotesResponse>(
        `/api/v1/finance/sales/credit-notes/invoice/${invoiceId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 5. Get credit notes by client
  getCreditNotesByClient: async (
    clientId: string
  ): Promise<CreditNotesResponse> => {
    try {
      const response = await axiosInstance.get<CreditNotesResponse>(
        `/api/v1/finance/sales/credit-notes/client/${clientId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 6. Get credit note by ID
  getCreditNoteById: async (
    creditNoteId: string
  ): Promise<CreditNoteResponse> => {
    try {
      const response = await axiosInstance.get<any>(
        `/api/v1/finance/sales/credit-notes/${creditNoteId}`
      );

      // Transform API response: result -> data to match CreditNoteResponse interface
      if (response.data && response.data.result && !response.data.data) {
        const creditNoteWithTotals = calculateCreditNoteTotals(
          response.data.result
        );
        return {
          success: response.data.success ?? true,
          message: response.data.message ?? "",
          data: creditNoteWithTotals,
        };
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 7. Update credit note
  updateCreditNote: async (
    creditNoteId: string,
    creditNoteData: UpdateCreditNotePayload
  ): Promise<CreditNoteResponse> => {
    try {
      const response = await axiosInstance.put<CreditNoteResponse>(
        `/api/v1/finance/sales/credit-notes/${creditNoteId}`,
        creditNoteData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 8. Delete credit note
  deleteCreditNote: async (creditNoteId: string): Promise<DeleteResponse> => {
    try {
      const response = await axiosInstance.delete<DeleteResponse>(
        `/api/v1/finance/sales/credit-notes/${creditNoteId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 9. Approve credit note
  approveCreditNote: async (
    creditNoteId: string,
    payload?: ApproveCreditNotePayload
  ): Promise<CreditNoteResponse> => {
    try {
      const response = await axiosInstance.patch<CreditNoteResponse>(
        `/api/v1/finance/sales/credit-notes/${creditNoteId}/approve`,
        payload || {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 10. Update credit note status
  updateCreditNoteStatus: async (
    creditNoteId: string,
    payload: UpdateStatusPayload
  ): Promise<CreditNoteResponse> => {
    try {
      const response = await axiosInstance.patch<CreditNoteResponse>(
        `/api/v1/finance/sales/credit-notes/${creditNoteId}/status`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 11. Resolve credit note
  resolveCreditNote: async (
    creditNoteId: string,
    payload: ResolveCreditNotePayload
  ): Promise<CreditNoteResponse> => {
    try {
      const response = await axiosInstance.patch<CreditNoteResponse>(
        `/api/v1/finance/sales/credit-notes/${creditNoteId}/resolve`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 12. Dispute credit note
  disputeCreditNote: async (
    creditNoteId: string,
    payload?: DisputeCreditNotePayload
  ): Promise<CreditNoteResponse> => {
    try {
      const response = await axiosInstance.patch<CreditNoteResponse>(
        `/api/v1/finance/sales/credit-notes/${creditNoteId}/dispute`,
        payload || {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default creditNoteApi;
