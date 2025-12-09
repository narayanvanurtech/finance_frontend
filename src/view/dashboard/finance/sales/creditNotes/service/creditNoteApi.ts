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
  discountType?: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
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
}

// Dispute Credit Note Payload
export interface DisputeCreditNotePayload {
  notes?: string;
}

// Credit Note interface
export interface CreditNote {
  _id: string;
  companyId: string | { _id: string };
  clientId: string | { _id: string };
  invoiceId: string | { _id: string };
  creditNoteNumber: string;
  creditNoteDate: string;
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
  taxType: "inclusive" | "exclusive" | "none";
  discountType: "flat" | "percentage";
  discountValue: number;
  shipping: number;
  roundOff: boolean;
  showHSN: boolean;
  showUnit: boolean;
  showSignature: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  terms?: string;
  notes?: string;
  attachments: Array<{ url: string }>;
  status: "draft" | "sent" | "acknowledged" | "disputed" | "resolved";
  resolutionStatus?:
    | "pending"
    | "refund_processed"
    | "adjustment_made"
    | "credit_applied"
    | "disputed";
  adjustmentAmount?: number;
  clientSnapshot?: ClientSnapshot;
  subtotal?: number;
  totalTax?: number;
  totalCess?: number;
  grandTotal?: number;
  createdAt?: string;
  updatedAt?: string;
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
    [key: string]: any;
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

const creditNoteApi = {
  // 1. Create a new credit note
  createCreditNote: async (
    creditNoteData: CreateCreditNotePayload
  ): Promise<CreditNoteResponse> => {
    try {
      const response = await axiosInstance.post<CreditNoteResponse>(
        "/api/v1/finance/sales/credit-notes/",
        creditNoteData
      );
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

      const response = await axiosInstance.get<CreditNotesResponse>(
        `/api/v1/finance/sales/credit-notes/${queryString ? `?${queryString}` : ""}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. Get credit note statistics
  getCreditNoteStats: async (): Promise<CreditNoteStatsResponse> => {
    try {
      const response = await axiosInstance.get<CreditNoteStatsResponse>(
        "/api/v1/finance/sales/credit-notes/stats"
      );
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
      const response = await axiosInstance.get<CreditNoteResponse>(
        `/api/v1/finance/sales/credit-notes/${creditNoteId}`
      );
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
