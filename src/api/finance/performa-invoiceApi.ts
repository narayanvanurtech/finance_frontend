import axiosInstance from "../../utils/axios";
import axios from "../../utils/axios";

// Performa Invoice Item interface based on the API structure
export interface PerformaInvoiceItem {
  name: string;
  description?: string;
  hsn?: string;
  unit?: string;
  quantity: number;
  rate: number;
  discount: number;
  discountType?: "flat" | "percentage";
  taxType?: "igst" | "cgst_sgst";
  taxRate?: number;
  amount?: number;
  taxAmount?: number;
  igstAmount?: number;
  sgstAmount?: number;
  cgstAmount?: number;
  cess?: any[];
  itemId?: string;
}

// Client Details interface
export interface ClientDetails {
  name: string;
  gstin?: string;
  address?: string;
  contact?: string;
  email?: string;
}

// Business Details interface
export interface BusinessDetails {
  name: string;
  gstin?: string;
  address?: string;
  contact?: string;
  email?: string;
}

// Cess interface
export interface Cess {
  type?: string;
  name: string;
  value?: string | number;
  rate?: number;
  showInInvoice: boolean;
}

// Performa Invoice interface based on backend model
export interface PerformaInvoice {
  _id: string;
  companyId:
    | string
    | {
        _id: string;
      };
  invoiceNumber: string;
  invoiceTitle: string;
  date: string;
  dueDate?: string;
  clientId:
    | string
    | {
        _id: string;
        email?: string;
        phone?: string;
        id?: string;
        businessName?: string;
        address?: {
          street?: string;
          city?: string;
          state?: string;
          postalCode?: string;
          country?: string;
        };
      };
  clientDetails?: ClientDetails;
  businessDetails?: BusinessDetails;
  createdBy?: {
    _id: string;
    email: string;
    name: string;
  };
  quotationId?: string | null;
  convertedFromQuotation?: boolean;
  taxType: "inclusive" | "exclusive";
  cessList?: Cess[];
  items: PerformaInvoiceItem[];
  discountType: "flat" | "percentage";
  discountValue: number;
  shipping: number;
  roundOff: boolean;
  showHSN: boolean;
  showUnit: boolean;
  terms?: string;
  notes?: string;
  attachments: string[];
  showSignature: boolean;
  phases: any[];
  status: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
  convertedToInvoice?: boolean;
  subtotal?: number;
  totalTax?: number;
  totalCess?: number;
  grandTotal?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  id?: string;
}

// Create performa invoice payload interface
export interface CreatePerformaInvoicePayload {
  companyId: string;
  performaInvoiceTitle: string;
  invoiceNumber?: string;
  date: string;
  dueDate?: string;
  clientId: string;
  clientDetails?: ClientDetails;
  businessDetails?: BusinessDetails;
  taxType: "inclusive" | "exclusive";
  cessList?: Cess[];
  items: PerformaInvoiceItem[];
  discountType: "flat" | "percentage";
  discountValue: number;
  shipping: number;
  roundOff: boolean;
  showHSN: boolean;
  showUnit: boolean;
  terms?: string;
  notes?: string;
  attachments?: File[];
  showSignature: boolean;
  phases?: any[];
  status?: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
}

// Update performa invoice payload interface
export interface UpdatePerformaInvoicePayload {
  performaInvoiceTitle?: string;
  invoiceTitle?: string; // Keep for backward compatibility
  date?: string;
  dueDate?: string;
  clientId?: string;
  clientDetails?: ClientDetails;
  businessDetails?: BusinessDetails;
  taxType?: "inclusive" | "exclusive";
  cessList?: Cess[];
  items?: PerformaInvoiceItem[];
  discountType?: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  showHSN?: boolean;
  showUnit?: boolean;
  terms?: string;
  notes?: string;
  showSignature?: boolean;
  phases?: any[];
  status?: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
}

// API Response interfaces
export interface PerformaInvoiceResponse {
  success: boolean;
  message: string;
  data: PerformaInvoice;
}

export interface PerformaInvoicesResponse {
  success: boolean;
  message: string;
  data: PerformaInvoice[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface PerformaInvoiceStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalPerformaInvoices: number;
    statusBreakdown: Array<{
      _id: string;
      count: number;
      totalValue: number;
    }>;
    acceptanceRate: number;
    conversionRate: number;
    paymentRate: number;
    totalPaymentReceived: number;
    period: string;
  };
}

export interface PerformaInvoiceNumberResponse {
  success: boolean;
  message: string;
  data: {
    invoiceNumber: string;
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

// Query parameters interface
export interface PerformaInvoiceQueryParams {
  page?: number;
  limit?: number;
  companyId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  search?: string;
}

const performaInvoiceApi = {
  // Preview performa invoice number
  previewPerformaInvoiceNumber:
    async (): Promise<PerformaInvoiceNumberResponse> => {
      try {
        const response = await axiosInstance.get<PerformaInvoiceNumberResponse>(
          "/api/v1/finance/sales/performa-invoices/preview-number"
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },

  // Create a new performa invoice
  createPerformaInvoice: async (
    invoiceData: CreatePerformaInvoicePayload
  ): Promise<PerformaInvoiceResponse> => {
    try {
      const response = await axiosInstance.post<PerformaInvoiceResponse>(
        "/api/v1/finance/sales/performa-invoices/create",
        invoiceData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all performa invoices with filters
  getAllPerformaInvoices: async (
    params?: PerformaInvoiceQueryParams
  ): Promise<PerformaInvoicesResponse> => {
    try {
      const queryString = params
        ? new URLSearchParams(
            Object.entries(params)
              .filter(([_, value]) => value !== undefined && value !== "")
              .map(([key, value]) => [key, String(value)])
          ).toString()
        : "";

      // Some backends expose the list under `/performa-invoices/getAll`.
      // Try the conventional `/performa-invoices/getAll` path which exists on this backend.
      const url = `/api/v1/finance/sales/performa-invoices/getAll${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axiosInstance.get<PerformaInvoicesResponse>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get performa invoice by ID
  getPerformaInvoiceById: async (
    invoiceId: string,
    companyId?: string
  ): Promise<PerformaInvoiceResponse> => {
    try {
      const url = companyId
        ? `/api/v1/finance/sales/performa-invoices/getById/${invoiceId}?companyId=${companyId}`
        : `/api/v1/finance/sales/performa-invoices/getById/${invoiceId}`;

      const response = await axiosInstance.get<PerformaInvoiceResponse>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update performa invoice
  updatePerformaInvoice: async (
    invoiceId: string,
    invoiceData: UpdatePerformaInvoicePayload,
    companyId?: string
  ): Promise<PerformaInvoiceResponse> => {
    try {
      const response = await axiosInstance.put<PerformaInvoiceResponse>(
        `/api/v1/finance/sales/performa-invoices/update/${invoiceId}?companyId=${companyId}`,
        invoiceData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete performa invoice
  deletePerformaInvoice: async (
    invoiceId: string,
    companyId?: string
  ): Promise<DeleteResponse> => {
    try {
      const url = companyId
        ? `/api/v1/finance/sales/performa-invoices/delete/${invoiceId}?companyId=${companyId}`
        : `/api/v1/finance/sales/performa-invoices/delete/${invoiceId}`;

      const response = await axiosInstance.delete<DeleteResponse>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Duplicate performa invoice
  duplicatePerformaInvoice: async (
    invoiceId: string,
    companyId: string
  ): Promise<PerformaInvoiceResponse> => {
    try {
      const response = await axiosInstance.post<PerformaInvoiceResponse>(
        `/api/v1/finance/sales/performa-invoices/${invoiceId}/duplicate?companyId=${companyId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update performa invoice status (SEND, ACCEPT, etc.)
  updatePerformaInvoiceStatus: async (
    invoiceId: string,
    status: string,
    companyId?: string
  ): Promise<PerformaInvoiceResponse> => {
    try {
      const url = companyId
        ? `/api/v1/finance/sales/performa-invoices/change/${invoiceId}/status?companyId=${companyId}`
        : `/api/v1/finance/sales/performa-invoices/change/${invoiceId}/status`;

      const response = await axiosInstance.patch<PerformaInvoiceResponse>(url, {
        status,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Accept performa invoice
  acceptPerformaInvoice: async (
    invoiceId: string
  ): Promise<PerformaInvoiceResponse> => {
    try {
      const response = await axiosInstance.post<PerformaInvoiceResponse>(
        `/api/v1/finance/sales/performa-invoices/${invoiceId}/accept`,
        {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reject performa invoice
  rejectPerformaInvoice: async (
    invoiceId: string
  ): Promise<PerformaInvoiceResponse> => {
    try {
      const response = await axiosInstance.post<PerformaInvoiceResponse>(
        `/api/v1/finance/sales/performa-invoices/${invoiceId}/reject`,
        {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Convert performa invoice to regular invoice
  convertToInvoice: async (
    invoiceId: string,
    data: {
      invoiceNumber: string;
      invoiceDate: string;
      dueDate: string;
      invoiceType: string;
    },
    companyId: string
  ): Promise<PerformaInvoiceResponse> => {
    try {
      const response = await axiosInstance.post<PerformaInvoiceResponse>(
        `/api/v1/finance/sales/performa-invoices/${invoiceId}/duplicate?companyId=${companyId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Advanced search
  searchPerformaInvoices: async (
    params: PerformaInvoiceQueryParams
  ): Promise<PerformaInvoicesResponse> => {
    try {
      // Use the same getAllPerformaInvoices endpoint with filters
      // Just like invoice API - filters work on the main endpoint
      return await performaInvoiceApi.getAllPerformaInvoices(params);
    } catch (error) {
      throw error;
    }
  },

  // Get performa invoice statistics
  getPerformaInvoiceStats: async (
    companyId: string,
    period: string = "30"
  ): Promise<PerformaInvoiceStatsResponse> => {
    try {
      const response = await axiosInstance.get<PerformaInvoiceStatsResponse>(
        `/api/v1/finance/sales/performa-invoices/stats?companyId=${companyId}&period=${period}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk actions
  bulkAction: async (
    action: string,
    invoiceIds: string[],
    data?: any
  ): Promise<DeleteResponse> => {
    try {
      const response = await axiosInstance.post<DeleteResponse>(
        "/api/v1/finance/sales/performa-invoices/bulk-action",
        {
          action,
          invoiceIds,
          ...data,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default performaInvoiceApi;
