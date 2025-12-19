import axios from "axios";
import axiosInstance from "../../utils/axios";

interface Company {
  _id: string;
  companyName: string;
}

interface Vendor {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  gstin?: string;
  address?: any;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Item {
  itemId?: string;
  name: string;
  hsn?: string;
  unit: string;
  quantity: number;
  rate: number;
  discount?: number;
  discountType?: "flat" | "percentage";
  taxType?: "cgst_sgst" | "igst" | "nil";
  taxRate?: number;
  cess?: Array<{
    name: string;
    rate: number;
  }>;
}

interface Phase {
  title: string;
  percentage: number;
  dueDate: string;
}

interface Purchase {
  _id: string;
  companyId: Company;
  purchaseNumber?: string;
  billNumber: string;
  vendorId: Vendor;
  billDate: string;
  taxType: "inclusive" | "exclusive";
  discountType: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff: boolean;
  showHSN: boolean;
  showUnit: boolean;
  showSignature: boolean;
  purchaseType: "goods" | "services";
  priority: "low" | "medium" | "high";
  items: Item[];
  phases?: Phase[];
  terms?: string;
  notes?: string;
  paymentStatus?: "pending" | "partial" | "paid";
  paidAmount?: number;
  totalAmount?: number;
  grandTotal?: number;
  createdBy: User;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreatePurchasePayload {
  vendorId: string;
  billDate: string;
  taxType?: "inclusive" | "exclusive";
  discountType?: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  showHSN?: boolean;
  showUnit?: boolean;
  showSignature?: boolean;
  purchaseType?: "goods" | "services";
  priority?: "low" | "medium" | "high";
  items: Item[];
  phases?: Phase[];
  terms?: string;
  notes?: string;
}

interface UpdatePurchasePayload {
  vendorId?: string;
  billDate?: string;
  taxType?: "inclusive" | "exclusive";
  discountType?: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  showHSN?: boolean;
  showUnit?: boolean;
  showSignature?: boolean;
  purchaseType?: "goods" | "services";
  priority?: "low" | "medium" | "high";
  items?: Item[];
  phases?: Phase[];
  terms?: string;
  notes?: string;
}

interface UpdatePaymentStatusPayload {
  paymentStatus: "pending" | "partial" | "paid";
  paidAmount?: number;
}

interface UpdateDeliveryStatusPayload {
  items: Array<{
    itemId?: string;
    _id?: string;
    receivedQuantity: number;
  }>;
}

interface AddAttachmentPayload {
  url?: string;
  file?: File;
}

interface GetPurchasesFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  purchaseType?: string;
  priority?: string;
  vendorId?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface GetPurchasesResponse {
  success: boolean;
  message: string;
  data: Purchase[];
  pagination: PaginationInfo;
}

interface SinglePurchaseResponse {
  success: boolean;
  message: string;
  data: Purchase;
}

interface DeleteResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

interface BulkDeleteResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    deletedCount: number;
    skippedCount: number;
  };
}

interface PurchaseStats {
  totalPurchases: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  averageOrderValue: number;
  purchasesByStatus: {
    pending: number;
    partial: number;
    paid: number;
  };
  purchasesByPriority: {
    low: number;
    medium: number;
    high: number;
  };
  purchasesByType: {
    goods: number;
    services: number;
  };
}

interface PurchaseStatsResponse {
  success: boolean;
  message: string;
  data: PurchaseStats;
}

interface PendingPurchase {
  _id: string;
  purchaseNumber?: string;
  billNumber: string;
  vendorId: Vendor;
  billDate: string;
  totalAmount: number;
  paidAmount: number;
  priority: "low" | "medium" | "high";
  daysOverdue?: number;
}

interface PendingPurchasesResponse {
  success: boolean;
  message: string;
  data: PendingPurchase[];
}

interface PurchaseSummary {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totalPurchases: number;
  totalAmount: number;
  averageOrderValue: number;
  pendingAmount: number;
  paidAmount: number;
  dailyBreakdown?: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

interface PurchaseSummaryResponse {
  success: boolean;
  message: string;
  data: PurchaseSummary;
}

interface UpdatePriorityPayload {
  priority: "low" | "medium" | "high";
}

interface DuplicatePurchasePayload {
  billDate?: string;
  vendorId?: string;
}

interface RemoveAttachmentResponse {
  success: boolean;
  message: string;
  data: Purchase;
}

const purchaseExpenseApi = {
  // Create a new purchase/expense
  createPurchase: async (
    purchaseData: CreatePurchasePayload
  ): Promise<SinglePurchaseResponse> => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/finance/purchases/purchase",
        purchaseData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error creating purchase");
    }
  },

  // Get all purchases with optional filters and pagination
  getAllPurchases: async (
    filters: GetPurchasesFilters = {}
  ): Promise<GetPurchasesResponse> => {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters.purchaseType)
        params.append("purchaseType", filters.purchaseType);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.vendorId) params.append("vendorId", filters.vendorId);
      if (filters.paymentStatus)
        params.append("paymentStatus", filters.paymentStatus);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.search) params.append("search", filters.search);

      const queryString = params.toString();
      const url = queryString
        ? `/api/v1/finance/purchases/purchase?${queryString}`
        : "/api/v1/finance/purchases/purchase";

      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching purchases");
    }
  },

  // Advanced search for purchases
  searchPurchases: async (
    filters: GetPurchasesFilters = {}
  ): Promise<GetPurchasesResponse> => {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters.purchaseType)
        params.append("purchaseType", filters.purchaseType);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.vendorId) params.append("vendorId", filters.vendorId);
      if (filters.paymentStatus)
        params.append("paymentStatus", filters.paymentStatus);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.search) params.append("search", filters.search);

      const queryString = params.toString();
      const url = queryString
        ? `/api/v1/finance/purchases/purchase/search?${queryString}`
        : "/api/v1/finance/purchases/purchase/search";

      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error searching purchases");
    }
  },

  // Get purchase statistics
  getPurchaseStats: async (): Promise<PurchaseStatsResponse> => {
    try {
      const response = await axiosInstance.get(
        "/api/v1/finance/purchases/purchase/stats"
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching purchase statistics");
    }
  },

  // Get pending purchases
  getPendingPurchases: async (): Promise<PendingPurchasesResponse> => {
    try {
      const response = await axiosInstance.get(
        "/api/v1/finance/purchases/purchase/pending"
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching pending purchases");
    }
  },

  // Get purchases summary for date range
  getPurchasesSummary: async (
    startDate: string,
    endDate: string
  ): Promise<PurchaseSummaryResponse> => {
    try {
      const params = new URLSearchParams();
      params.append("startDate", startDate);
      params.append("endDate", endDate);

      const response = await axiosInstance.get(
        `/api/v1/finance/purchases/purchase/summary?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching purchases summary");
    }
  },

  // Get purchases by vendor
  getPurchasesByVendor: async (
    vendorId: string,
    filters: GetPurchasesFilters = {}
  ): Promise<GetPurchasesResponse> => {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters.purchaseType)
        params.append("purchaseType", filters.purchaseType);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.paymentStatus)
        params.append("paymentStatus", filters.paymentStatus);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.search) params.append("search", filters.search);

      const queryString = params.toString();
      const url = queryString
        ? `/api/v1/finance/purchases/purchase/vendor/${vendorId}?${queryString}`
        : `/api/v1/finance/purchases/purchase/vendor/${vendorId}`;

      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching vendor purchases");
    }
  },

  // Get purchase by ID
  getPurchaseById: async (
    purchaseId: string
  ): Promise<SinglePurchaseResponse> => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/finance/purchases/purchase/${purchaseId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching purchase");
    }
  },

  // Update an existing purchase
  updatePurchase: async (
    purchaseId: string,
    purchaseData: UpdatePurchasePayload
  ): Promise<SinglePurchaseResponse> => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/finance/purchases/purchase/${purchaseId}`,
        purchaseData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error updating purchase");
    }
  },

  // Update payment status
  updatePaymentStatus: async (
    purchaseId: string,
    paymentData: UpdatePaymentStatusPayload
  ): Promise<SinglePurchaseResponse> => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/finance/purchases/purchase/${purchaseId}/payment-status`,
        paymentData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error updating payment status");
    }
  },

  // Update delivery status
  updateDeliveryStatus: async (
    purchaseId: string,
    deliveryData: UpdateDeliveryStatusPayload
  ): Promise<SinglePurchaseResponse> => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/finance/purchases/purchase/${purchaseId}/delivery-status`,
        deliveryData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error updating delivery status");
    }
  },

  // Update purchase priority
  updatePurchasePriority: async (
    purchaseId: string,
    priorityData: UpdatePriorityPayload
  ): Promise<SinglePurchaseResponse> => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/finance/purchases/purchase/${purchaseId}/priority`,
        priorityData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error updating purchase priority");
    }
  },

  // Duplicate a purchase
  duplicatePurchase: async (
    purchaseId: string,
    duplicateData?: DuplicatePurchasePayload
  ): Promise<SinglePurchaseResponse> => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/finance/purchases/purchase/${purchaseId}/duplicate`,
        duplicateData || {}
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error duplicating purchase");
    }
  },

  // Add attachment to purchase
  addAttachment: async (
    purchaseId: string,
    attachmentData: AddAttachmentPayload
  ): Promise<SinglePurchaseResponse> => {
    try {
      let payload;
      let headers = {};

      // If file is provided, use FormData
      if (attachmentData.file) {
        const formData = new FormData();
        formData.append("file", attachmentData.file);
        payload = formData;
        headers = {
          "Content-Type": "multipart/form-data",
        };
      } else {
        // Otherwise send URL
        payload = { url: attachmentData.url };
      }

      const response = await axiosInstance.post(
        `/api/v1/finance/purchases/purchase/${purchaseId}/attachments`,
        payload,
        { headers }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error adding attachment");
    }
  },

  // Remove attachment from purchase
  removeAttachment: async (
    purchaseId: string,
    attachmentIndex: number
  ): Promise<RemoveAttachmentResponse> => {
    try {
      const response = await axiosInstance.delete(
        `/api/v1/finance/purchases/purchase/${purchaseId}/attachments/${attachmentIndex}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error removing attachment");
    }
  },

  // Delete a purchase
  deletePurchase: async (purchaseId: string): Promise<DeleteResponse> => {
    try {
      const response = await axiosInstance.delete(
        `/api/v1/finance/purchases/purchase/${purchaseId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error deleting purchase");
    }
  },

  // Bulk delete purchases
  bulkDeletePurchases: async (
    purchaseIds: string[]
  ): Promise<BulkDeleteResponse> => {
    try {
      const response = await axiosInstance.delete(
        "/api/v1/finance/purchases/purchase/bulk-delete",
        {
          data: { purchaseIds },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error deleting purchases");
    }
  },
};

export default purchaseExpenseApi;

// Export types for use in other files
export type {
  Purchase,
  CreatePurchasePayload,
  UpdatePurchasePayload,
  UpdatePaymentStatusPayload,
  UpdateDeliveryStatusPayload,
  AddAttachmentPayload,
  GetPurchasesFilters,
  GetPurchasesResponse,
  SinglePurchaseResponse,
  Item,
  Phase,
  Vendor,
  DeleteResponse,
  BulkDeleteResponse,
  PurchaseStats,
  PurchaseStatsResponse,
  PendingPurchase,
  PendingPurchasesResponse,
  PurchaseSummary,
  PurchaseSummaryResponse,
  UpdatePriorityPayload,
  DuplicatePurchasePayload,
  RemoveAttachmentResponse,
};
