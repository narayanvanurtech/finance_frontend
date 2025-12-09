import axiosInstance from "../../utils/axios";
import axios from "../../utils/axios";

// Invoice Item interface based on the API structure
export interface InvoiceItem {
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

// Invoice interface based on backend model
export interface Invoice {
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
  performaInvoiceId?: string | null;
  convertedFromProformaInvoice?: boolean;
  taxType: "inclusive" | "exclusive";
  cessList?: Cess[];
  items: InvoiceItem[];
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
  status:
    | "draft"
    | "sent"
    | "accepted"
    | "rejected"
    | "expired"
    | "converted"
    | "paid";
  paymentStatus: "pending" | "partial" | "paid" | "overdue";
  totalPaid: number;
  subtotal?: number;
  totalTax?: number;
  totalCess?: number;
  grandTotal?: number;
  isOverdue?: boolean;
  balanceAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  id?: string;
}

// Create invoice payload interface
export interface CreateInvoicePayload {
  companyId: string;
  invoiceTitle: string;
  invoiceNumber?: string;
  date: string;
  dueDate?: string;
  clientId: string;
  clientDetails?: ClientDetails;
  businessDetails?: BusinessDetails;
  taxType: "inclusive" | "exclusive";
  cessList?: Cess[];
  items: InvoiceItem[];
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
  status?:
    | "draft"
    | "sent"
    | "accepted"
    | "rejected"
    | "expired"
    | "converted"
    | "paid";
}

// Update invoice payload interface
export interface UpdateInvoicePayload {
  invoiceTitle?: string;
  date?: string;
  dueDate?: string;
  clientId?: string;
  clientDetails?: ClientDetails;
  businessDetails?: BusinessDetails;
  taxType?: "inclusive" | "exclusive";
  cessList?: Cess[];
  items?: InvoiceItem[];
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
  status?:
    | "draft"
    | "sent"
    | "accepted"
    | "rejected"
    | "expired"
    | "converted"
    | "paid";
}

// API Response interfaces
export interface InvoiceResponse {
  success: boolean;
  message: string;
  data: Invoice;
}

export interface InvoicesResponse {
  success: boolean;
  message: string;
  data: Invoice[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface InvoiceStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalInvoices: number;
    draftInvoices: number;
    sentInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    totalValue: number;
    totalRevenue: number;
    averageInvoiceValue: number;
  };
}

export interface InvoiceNumberResponse {
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
export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  search?: string;
}

const invoiceApi = {
  // Preview invoice number
  previewInvoiceNumber: async (): Promise<InvoiceNumberResponse> => {
    try {
      const response = await axiosInstance.get<InvoiceNumberResponse>(
        "/api/v1/finance/sales/invoices/preview-number"
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new invoice
  createInvoice: async (
    invoiceData: CreateInvoicePayload
  ): Promise<InvoiceResponse> => {
    try {
      const response = await axiosInstance.post<InvoiceResponse>(
        "/api/v1/finance/sales/invoices/create",
        invoiceData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all invoices with filters
  getAllInvoices: async (
    params?: InvoiceQueryParams
  ): Promise<InvoicesResponse> => {
    try {
      const queryString = params
        ? new URLSearchParams(
            Object.entries(params)
              .filter(([_, value]) => value !== undefined && value !== "")
              .map(([key, value]) => [key, String(value)])
          ).toString()
        : "";

      const response = await axiosInstance.get<InvoicesResponse>(
        `/api/v1/finance/sales/invoices${queryString ? `?${queryString}` : ""}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId: string): Promise<InvoiceResponse> => {
    try {
      const response = await axiosInstance.get<InvoiceResponse>(
        `/api/v1/finance/sales/invoices/${invoiceId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update invoice
  updateInvoice: async (
    invoiceId: string,
    invoiceData: UpdateInvoicePayload
  ): Promise<InvoiceResponse> => {
    try {
      const response = await axiosInstance.put<InvoiceResponse>(
        `/api/v1/finance/sales/invoices/${invoiceId}`,
        invoiceData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update payment status
  updatePaymentStatus: async (
    invoiceId: string,
    paymentStatus: string,
    amount?: number
  ): Promise<InvoiceResponse> => {
    try {
      const response = await axios.patch<InvoiceResponse>(
        `/finance/sales/invoices/${invoiceId}/payment-status`,
        { paymentStatus, amount }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete invoice
  deleteInvoice: async (invoiceId: string): Promise<DeleteResponse> => {
    try {
      const response = await axiosInstance.delete<DeleteResponse>(
        `/api/v1/finance/sales/invoices/${invoiceId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Duplicate invoice
  duplicateInvoice: async (invoiceId: string): Promise<InvoiceResponse> => {
    try {
      const response = await axiosInstance.post<InvoiceResponse>(
        `/api/v1/finance/sales/invoices/${invoiceId}/duplicate`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update invoice status (SEND, ACCEPT, etc.)
  updateInvoiceStatus: async (
    invoiceId: string,
    status: string
  ): Promise<InvoiceResponse> => {
    try {
      const response = await axiosInstance.patch<InvoiceResponse>(
        `/api/v1/finance/sales/invoices/${invoiceId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Record payment
  recordPayment: async (
    invoiceId: string,
    amount: number,
    paymentMethod?: string
  ): Promise<InvoiceResponse> => {
    try {
      const response = await axios.post<InvoiceResponse>(
        `/finance/sales/invoices/${invoiceId}/record-payment`,
        { amount, paymentMethod }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send invoice
  sendInvoice: async (
    invoiceId: string,
    email?: string
  ): Promise<InvoiceResponse> => {
    try {
      const response = await axios.post<InvoiceResponse>(
        `/finance/sales/invoices/${invoiceId}/send`,
        { email }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Accept invoice
  acceptInvoice: async (invoiceId: string): Promise<InvoiceResponse> => {
    try {
      const response = await axiosInstance.post<InvoiceResponse>(
        `/api/v1/finance/sales/invoices/${invoiceId}/accept`,
        {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reject invoice
  rejectInvoice: async (invoiceId: string): Promise<InvoiceResponse> => {
    try {
      const response = await axiosInstance.post<InvoiceResponse>(
        `/api/v1/finance/sales/invoices/${invoiceId}/reject`,
        {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Advanced search
  searchInvoices: async (
    params: InvoiceQueryParams
  ): Promise<InvoicesResponse> => {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== "")
          .map(([key, value]) => [key, String(value)])
      ).toString();

      const response = await axiosInstance.get<InvoicesResponse>(
        `/api/v1/finance/sales/invoices/search?${queryString}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get invoice statistics
  getInvoiceStats: async (
    period: string = "30"
  ): Promise<InvoiceStatsResponse> => {
    try {
      const response = await axiosInstance.get<InvoiceStatsResponse>(
        `/api/v1/finance/sales/invoices/stats?period=${period}`
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
        "/api/v1/finance/sales/invoices/bulk-action",
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

export default invoiceApi;
