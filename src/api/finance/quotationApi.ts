import axiosInstance from "../../utils/axios";
import axios from "../../utils/axios";

// Quotation Item interface based on the API structure
export interface QuotationItem {
  name: string;
  description?: string;
  hsn?: string;
  unit?: string;
  quantity: number;
  rate: number;
  discount: number;
  taxType?: "igst" | "cgst_sgst";
  taxRate?: number;
  amount?: number;
  igst?: number;
  sgst?: number;
  cgst?: number;
  itemId?: string;
}

// Client Details interface
export interface ClientDetails {
  name: string;
  gstin?: string;
  address?:
    | string
    | {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
  contact?: string;
  email?: string;
  igstn?: string;
  state?: string;
}

// Business Details interface
export interface BusinessDetails {
  name: string;
  gstin?: string;
  address?: string;
  contact?: string;
  email?: string;
}

// Payment Phase interface - Updated to match backend
export interface PaymentPhase {
  title: string;
  percentage: number;
  dueDate: string;
}

// Cess interface
export interface Cess {
  name: string;
  rate: number;
  showInInvoice: boolean;
}

// Quotation interface based on backend model
export interface Quotation {
  _id: string;
  companyId:
    | string
    | {
        _id: string;
      };
  quotationNumber: string;
  quotationTitle: string;
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
  taxType: "inclusive" | "exclusive";
  cessList?: Cess[];
  items: QuotationItem[];
  discountType: "flat" | "percentage";
  discountValue: number;
  shipping: number;
  roundOff: boolean;
  showHSN: boolean;
  showUnit: boolean;
  terms?: string;
  notes?: string;
  attachments: string[];
  signature:string;
  showSignature: boolean;
  phases: PaymentPhase[];
  status: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  totalTax?: number;
  totalCess?: number;
  grandTotal?: number;
  convertedToInvoice?: boolean;
  convertedToProformaInvoice?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  id?: string;
}

// Create quotation payload interface - Updated to match backend
export interface CreateQuotationPayload {
  companyId: string;
  quotationTitle: string;
  quotationNumber?: string;
  date: string;
  dueDate?: string;
  clientId: string;
  clientDetails?: ClientDetails;
  businessDetails?: BusinessDetails;
  taxType: "inclusive" | "exclusive";
  cessList?: Cess[];
  items: QuotationItem[];
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
  signature:string;
  phases?: PaymentPhase[];
  status?: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
}

// Update quotation payload interface - Updated to match backend
export interface UpdateQuotationPayload {
  quotationTitle?: string;
  date?: string;
  dueDate?: string;
  clientId?: string;
  clientDetails?: ClientDetails;
  businessDetails?: BusinessDetails;
  taxType?: "inclusive" | "exclusive";
  cessList?: Cess[];
  items?: QuotationItem[];
  discountType?: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  showHSN?: boolean;
  showUnit?: boolean;
  terms?: string;
  notes?: string;
  showSignature?: boolean;
  signature?:string;
  phases?: PaymentPhase[];
}

// API Response interfaces
export interface QuotationResponse {
  success: boolean;
  message: string;
  data: Quotation;
}

export interface QuotationsResponse {
  success: boolean;
  message: string;
  data: Quotation[];
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface QuotationStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalQuotations: number;
    statusBreakdown: Array<{
      _id: string;
      count: number;
      totalValue: number;
    }>;
    acceptanceRate: number;
    invoiceConversionRate: number;
    proformaConversionRate: number;
    period: string;
  };
}

export interface QuotationNumberResponse {
  success: boolean;
  message: string;
  data: {
    quotationNumber: string;
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface ConvertToInvoicePayload {
  invoiceTitle?: string;
  dueDate?: string;
  notes?: string;
  signature?:string;
  showSignature?:boolean;
}

export interface ConvertToProformaInvoicePayload {
  proformaInvoiceTitle?: string;
  dueDate?: string;
  notes?: string;
}

// Query parameters interface
export interface QuotationQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  convertedToInvoice?: boolean;
  search?: string;
}

// Helper function to clean and validate quotation ID
const cleanQuotationId = (id: string | undefined | null): string => {
  console.log("cleanQuotationId called with:", id, "Type:", typeof id);
  
  // Check for null, undefined, or empty - BEFORE any string conversion
  if (id === null || id === undefined) {
    console.error("cleanQuotationId: ID is null or undefined");
    throw new Error("Quotation ID is required");
  }
  
  // Convert to string and trim
  const idString = String(id).trim();
  console.log("cleanQuotationId: After String() conversion:", idString);
  
  // Check if it became "undefined" or "null" as strings (this happens when String(undefined) is called)
  if (idString === 'undefined' || idString === 'null' || idString === '' || idString === 'NaN') {
    console.error("cleanQuotationId: ID converted to invalid string:", idString);
    throw new Error(`Invalid quotation ID: ${idString}`);
  }
  
  // Validate MongoDB ObjectId format (24 hex characters)
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!objectIdPattern.test(idString)) {
    console.warn(`Warning: Quotation ID "${idString}" does not match MongoDB ObjectId format. Length: ${idString.length}`);
  }
  
  // Return the trimmed ID without encoding, as MongoDB ObjectIds are URL-safe
  return idString;
};

const quotationApi = {
  // Preview quotation number
  previewQuotationNumber: async (): Promise<QuotationNumberResponse> => {
    try {
      const response = await axiosInstance.get<QuotationNumberResponse>(
        "/api/v1/finance/sales/quotations/preview-number",
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new quotation
  createQuotation: async (
    quotationData: CreateQuotationPayload
  ): Promise<QuotationResponse> => {
    try {
      const response = await axiosInstance.post<QuotationResponse>(
        "/api/v1/finance/sales/quotations",
        quotationData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all quotations with filters
  getAllQuotations: async (
    params?: QuotationQueryParams
  ): Promise<QuotationsResponse> => {
    try {
      const queryString = params
        ? new URLSearchParams(
            Object.entries(params)
              .filter(([_, value]) => value !== undefined && value !== "")
              .map(([key, value]) => [key, String(value)])
          ).toString()
        : "";

      const response = await axiosInstance.get<QuotationsResponse>(
        `/api/v1/finance/sales/quotations${
          queryString ? `?${queryString}` : ""
        }`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get quotation by ID
  getQuotationById: async (quotationId: string): Promise<QuotationResponse> => {
    try {
      const cleanId = cleanQuotationId(quotationId);
      const response = await axiosInstance.get<QuotationResponse>(
        `/api/v1/finance/sales/quotations/${cleanId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update quotation
  updateQuotation: async (
    quotationId: string,
    quotationData: UpdateQuotationPayload
  ): Promise<QuotationResponse> => {
    try {
      const cleanId = cleanQuotationId(quotationId);
      const response = await axiosInstance.put<QuotationResponse>(
        `/api/v1/finance/sales/quotations/${cleanId}`,
        quotationData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update quotation status
  updateQuotationStatus: async (
    quotationId: string,
    status: string
  ): Promise<QuotationResponse> => {
    try {
      const cleanId = cleanQuotationId(quotationId);
      const response = await axiosInstance.patch<QuotationResponse>(
        `/api/v1/finance/sales/quotations/${cleanId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete quotation
  deleteQuotation: async (quotationId: string): Promise<DeleteResponse> => {
    try {
      const cleanId = cleanQuotationId(quotationId);
      console.log("Deleting quotation with ID:", cleanId, "Length:", cleanId.length);
      const response = await axiosInstance.delete<DeleteResponse>(
        `/api/v1/finance/sales/quotations/${cleanId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Delete quotation error - ID:", quotationId, "Error:", error?.response?.data);
      throw error;
    }
  },

  // Duplicate quotation
  duplicateQuotation: async (
    quotationId: string
  ): Promise<QuotationResponse> => {
    try {
      const cleanId = cleanQuotationId(quotationId);
      const response = await axiosInstance.post<QuotationResponse>(
        `/api/v1/finance/sales/quotations/${cleanId}/duplicate`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Convert quotation to invoice
  convertToInvoice: async (
    quotationId: string,
    data?: ConvertToInvoicePayload
  ): Promise<QuotationResponse> => {
    try {
      const cleanId = cleanQuotationId(quotationId);
      const response = await axiosInstance.post<QuotationResponse>(
        `/api/v1/finance/sales/quotations/${cleanId}/convert-to-invoice`,
        data || {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Convert quotation to proforma invoice
  convertToProformaInvoice: async (
    quotationId: string,
    data?: ConvertToProformaInvoicePayload
  ): Promise<QuotationResponse> => {
    try {
      const cleanId = cleanQuotationId(quotationId);
      const response = await axiosInstance.post<QuotationResponse>(
        `/api/v1/finance/sales/quotations/${cleanId}/convert-to-proforma-invoice`,
        data || {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Advanced search
  searchQuotations: async (
    params: QuotationQueryParams
  ): Promise<QuotationsResponse> => {
    try {
      return await quotationApi.getAllQuotations(params);
    } catch (error) {
      throw error;
    }
  },

  // Get quotation statistics
  getQuotationStats: async (
    period: string = "30"
  ): Promise<QuotationStatsResponse> => {
    try {
      const response = await axiosInstance.get<QuotationStatsResponse>(
        `/api/v1/finance/sales/quotations/stats?period=${period}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk actions
  bulkAction: async (
    action: string,
    quotationIds: string[],
    data?: any
  ): Promise<DeleteResponse> => {
    try {
      const response = await axios.post<DeleteResponse>(
        "/api/v1/finance/sales/quotations/bulk-action",
        {
          action,
          quotationIds,
          ...data,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default quotationApi;
