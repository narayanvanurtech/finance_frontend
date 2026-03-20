import axiosInstance from "../../utils/axios";

// -----------------------------------------------------
//                    INTERFACES
// -----------------------------------------------------

export interface DebitNoteItem {
  itemId?: string;
  name: string;
  description?: string;
  hsn?: string;
  unit?: string;
  quantity: number;
  rate: number;
  discount?: number;
  discountType?: "flat" | "percentage";
  taxType?: "igst" | "cgst_sgst";
  taxRate?: number;
  amount?: number;
  taxAmount?: number;
  igstAmount?: number;
  sgstAmount?: number;
  cgstAmount?: number;
  reason?: string;
}

export interface VendorDetails {
  name: string;
  gstin?: string;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
}

export interface BusinessDetails {
  name: string;
  gstin?: string;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
}

export interface CreateDebitNotePayload {
  vendorId: string;
  purchaseId?: string;
  debitNoteDate: string;
  originalBillNumber: string;
  originalBillDate: string;
  reason: string;
  debitType?:
    | "quality_issue"
    | "price_difference"
    | "excess_billing"
    | "return"
    | "other";
  priority?: "low" | "medium" | "high" | "urgent";
  taxType: "inclusive" | "exclusive";
  discountType: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  showHSN?: boolean;
  showUnit?: boolean;
  signature?:string;
  showSignature?: boolean;
  items: DebitNoteItem[];
  terms?: string;
  notes?: string;
}

export interface UpdateDebitNotePayload {
  vendorId?: string;
  purchaseId?: string;
  debitNoteDate?: string;
  originalBillNumber?: string;
  originalBillDate?: string;
  reason?: string;
  debitType?:
    | "quality_issue"
    | "price_difference"
    | "excess_billing"
    | "return"
    | "other";
  priority?: "low" | "medium" | "high" | "urgent";
  taxType?: "inclusive" | "exclusive";
  discountType?: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  showHSN?: boolean;
  showUnit?: boolean;
  signature?:string;
  showSignature?: boolean;
  items?: DebitNoteItem[];
  terms?: string;
  notes?: string;
  vendorDetails?: VendorDetails;
  businessDetails?: BusinessDetails;
}

export interface ApproveDebitNotePayload {
  notes?: string;
}

export interface ResolveDebitNotePayload {
  resolutionType: "credit_note_received" | "refund_received" | "adjustment_made" | "other";
  amount: number;
  notes?: string;
}

export interface DisputeDebitNotePayload {
  notes: string;
}

export interface DebitNote {
  _id: string;
  companyId: any;
  vendorId: any;
  purchaseId?: any;
  debitNoteNumber: string;
  debitNoteDate: string;
  originalBillNumber: string;
  originalBillDate: string;
  reason: string;
  debitType:
    | "quality_issue"
    | "price_difference"
    | "excess_billing"
    | "return"
    | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status?: "draft" | "sent" | "applied" | "cancelled";
  vendorDetails?: VendorDetails;
  vendorSnapshot?: VendorDetails;
  businessDetails?: BusinessDetails;
  items: DebitNoteItem[];
  taxType: "inclusive" | "exclusive";
  discountType: "flat" | "percentage";
  discountValue: number;
  shipping: number;
  roundOff: boolean;
  showHSN: boolean;
  showUnit: boolean;
  signature:string;
  showSignature: boolean;
  terms?: string;
  notes?: string;
  attachments?: string[];
  subtotal?: number;
  totalTax?: number;
  grandTotal?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DebitNoteResponse {
  success: boolean;
  message: string;
  data: DebitNote;
}

export interface DebitNotesResponse {
  success: boolean;
  message: string;
  data: DebitNote[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// -----------------------------------------------------
//                    API FUNCTIONS
// -----------------------------------------------------

/**
 * Create a new debit note
 * POST /api/v1/finance/purchases/debit-notes
 */
export const createDebitNote = async (
  data: CreateDebitNotePayload
): Promise<DebitNoteResponse> => {
  const res = await axiosInstance.post(
    "/api/v1/finance/purchases/debit-notes/create",
    data
  );
  return res.data;
};

/**
 * Get all debit notes with pagination and filters
 * GET /api/v1/finance/purchases/debit-notes?page=1&limit=10
 */
export const getAllDebitNotes = async (
  params?: any
): Promise<DebitNotesResponse> => {
  console.log("🔍 getAllDebitNotes called with params:", params);
  const res = await axiosInstance.get("/api/v1/finance/purchases/debit-notes", {
    params,
  });
  console.log("✅ getAllDebitNotes response:", res.data);
  return res.data;
};

/**
 * Get a single debit note by ID
 * GET /api/v1/finance/purchases/debit-notes/:id
 */
export const getDebitNoteById = async (
  id: string
): Promise<DebitNoteResponse> => {
  const res = await axiosInstance.get(
    `/api/v1/finance/purchases/debit-notes/${id}`
  );
  return res.data;
};

/**
 * Update a debit note
 * PUT /api/v1/finance/purchases/debit-notes/:id
 */
export const updateDebitNote = async (
  id: string,
  data: UpdateDebitNotePayload
): Promise<DebitNoteResponse> => {
  const res = await axiosInstance.put(
    `/api/v1/finance/purchases/debit-notes/${id}`,
    data
  );
  return res.data;
};

/**
 * Delete a debit note
 * DELETE /api/v1/finance/purchases/debit-notes/:id
 */
export const deleteDebitNote = async (id: string) => {
  const res = await axiosInstance.delete(
    `/api/v1/finance/purchases/debit-notes/${id}`
  );
  return res.data;
};

/**
 * Get debit note statistics
 * GET /api/v1/finance/purchases/debit-notes/stats
 */
export const getDebitNoteStats = async () => {
  const res = await axiosInstance.get(
    "/api/v1/finance/purchases/debit-notes/stats"
  );
  return res.data;
};

/**
 * Search debit notes
 * GET /api/v1/finance/purchases/debit-notes/search
 */
export const searchDebitNotes = async (query: any) => {
  if (!query.search || query.search.trim().length === 0) {
    throw new Error("Search term is required");
  }

  const res = await axiosInstance.get(
    "/api/v1/finance/purchases/debit-notes/search",
    { params: { search: query.search.trim(), ...query } }
  );
  return res.data;
};

/**
 * Bulk delete debit notes
 * DELETE /api/v1/finance/purchases/debit-notes/bulk
 */
export const bulkDeleteDebitNotes = async (ids: string[]) => {
  const res = await axiosInstance.delete(
    "/api/v1/finance/purchases/debit-notes/bulk",
    {
      data: { debitNoteIds: ids },
    }
  );
  return res.data;
};

/**
 * Approve a debit note
 * PATCH /api/v1/finance/purchases/debit-notes/:id/approve?companyId=xxx
 */
export const approveDebitNote = async (
  id: string,
  data: ApproveDebitNotePayload,
  companyId?: string
): Promise<DebitNoteResponse> => {
  const res = await axiosInstance.patch(
    `/api/v1/finance/purchases/debit-notes/${id}/approve`,
    data,
    {
      params: companyId ? { companyId } : undefined,
    }
  );
  return res.data;
};

/**
 * Resolve a debit note
 * PATCH /api/v1/finance/purchases/debit-notes/:id/resolve?companyId=xxx
 */
export const resolveDebitNote = async (
  id: string,
  data: ResolveDebitNotePayload,
  companyId?: string
): Promise<DebitNoteResponse> => {
  const res = await axiosInstance.patch(
    `/api/v1/finance/purchases/debit-notes/${id}/resolve`,
    data,
    {
      params: companyId ? { companyId } : undefined,
    }
  );
  return res.data;
};

/**
 * Dispute a debit note
 * PATCH /api/v1/finance/purchases/debit-notes/:id/dispute?companyId=xxx
 */
export const disputeDebitNote = async (
  id: string,
  data: DisputeDebitNotePayload,
  companyId?: string
): Promise<DebitNoteResponse> => {
  const res = await axiosInstance.patch(
    `/api/v1/finance/purchases/debit-notes/${id}/dispute`,
    data,
    {
      params: companyId ? { companyId } : undefined,
    }
  );
  return res.data;
};

/**
 * Duplicate a debit note
 * POST /api/v1/finance/purchases/debit-notes/:id/duplicate?companyId=xxx
 */
export const duplicateDebitNote = async (
  id: string,
  companyId?: string
): Promise<DebitNoteResponse> => {
  const res = await axiosInstance.post(
    `/api/v1/finance/purchases/debit-notes/${id}/duplicate`,
    {},
    {
      params: companyId ? { companyId } : undefined,
    }
  );
  return res.data;
};

// EXPORT DEFAULT
export default {
  createDebitNote,
  getAllDebitNotes,
  getDebitNoteById,
  updateDebitNote,
  deleteDebitNote,
  getDebitNoteStats,
  searchDebitNotes,
  bulkDeleteDebitNotes,
  approveDebitNote,
  resolveDebitNote,
  disputeDebitNote,
  duplicateDebitNote,
};
