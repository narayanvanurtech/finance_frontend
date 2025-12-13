import axios from "axios";
import axiosInstance from "../../utils/axios";

// Interfaces
interface PaymentRecord {
  paymentMethod: string;
  paidFrom: string;
  amountPaid: number;
  tdsPercent?: number;
  tdsDeductedAmount?: number;
  transactionCharge?: number;
  referenceId?: string;
  notes?: string;
}

interface Allocation {
  purchaseId: string;
  amount: number;
}

interface PayoutReceipt {
  _id: string;
  receiptNo: string;
  vendorId: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  receiptDate: string;
  paymentType: "Payment" | "Advance";
  paymentRecords: PaymentRecord[];
  allocations: Allocation[];
  totalAmount: number;
  purpose?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Request/Response Types
interface CreatePayoutReceiptPayload {
  vendorId: string;
  receiptDate: string;
  paymentType: "Payment" | "Advance";
  paymentRecords: PaymentRecord[];
  allocations: Allocation[];
  purpose?: string;
  internalNotes?: string;
}

interface UpdatePayoutReceiptPayload {
  purpose?: string;
  internalNotes?: string;
  paymentRecords?: PaymentRecord[];
}

interface SinglePayoutReceiptResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: PayoutReceipt;
}

interface GetPayoutReceiptsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    receipts: PayoutReceipt[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface PayoutReceiptStats {
  totalPayments: number;
  totalAmount: number;
  totalTdsDeducted: number;
  totalTransactionCharges: number;
  paymentMethodBreakdown: {
    method: string;
    count: number;
    amount: number;
  }[];
}

interface StatsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: PayoutReceiptStats;
}

interface GenerateReceiptNumberResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    receiptNo: string;
  };
}

interface GetPayoutReceiptsFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  vendorId?: string;
  paymentType?: "Payment" | "Advance";
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}

export interface DeleteResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    deletedCount: number;
  };
}

// API Functions
const paymentMadeApi = {
  // Create a new payout receipt
  createPayoutReceipt: async (
    data: CreatePayoutReceiptPayload
  ): Promise<SinglePayoutReceiptResponse> => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/finance/purchases/payout-receipts",
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error creating payout receipt");
    }
  },

  // Get all payout receipts with filters
  getAllPayoutReceipts: async (
    filters: GetPayoutReceiptsFilters = {}
  ): Promise<GetPayoutReceiptsResponse> => {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters.search) params.append("search", filters.search);
      if (filters.vendorId) params.append("vendorId", filters.vendorId);
      if (filters.paymentType)
        params.append("paymentType", filters.paymentType);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.paymentMethod)
        params.append("paymentMethod", filters.paymentMethod);

      const response = await axiosInstance.get(
        `/api/v1/finance/purchases/payout-receipts?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching payout receipts");
    }
  },

  // Get single payout receipt by ID
  getPayoutReceiptById: async (
    receiptId: string
  ): Promise<SinglePayoutReceiptResponse> => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/finance/purchases/payout-receipts/${receiptId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching payout receipt");
    }
  },

  // Update payout receipt
  updatePayoutReceipt: async (
    receiptId: string,
    data: UpdatePayoutReceiptPayload
  ): Promise<SinglePayoutReceiptResponse> => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/finance/purchases/payout-receipts/${receiptId}`,
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error updating payout receipt");
    }
  },

  // Delete payout receipt
  deletePayoutReceipt: async (receiptId: string): Promise<DeleteResponse> => {
    try {
      const response = await axiosInstance.delete(
        `/api/v1/finance/purchases/payout-receipts/${receiptId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error deleting payout receipt");
    }
  },

  // Get payout receipt statistics
  getPayoutReceiptStats: async (filters?: {
    startDate?: string;
    endDate?: string;
    vendorId?: string;
  }): Promise<StatsResponse> => {
    try {
      const params = new URLSearchParams();

      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.vendorId) params.append("vendorId", filters.vendorId);

      const response = await axiosInstance.get(
        `/api/v1/finance/purchases/payout-receipts/stats?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching payout receipt statistics");
    }
  },

  // Generate receipt number
  generateReceiptNumber: async (): Promise<GenerateReceiptNumberResponse> => {
    try {
      const response = await axiosInstance.get(
        "/api/v1/finance/purchases/payout-receipts/generate-number"
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error generating receipt number");
    }
  },

  // Search payout receipts
  searchPayoutReceipts: async (
    searchTerm: string
  ): Promise<GetPayoutReceiptsResponse> => {
    try {
      const params = new URLSearchParams();
      params.append("search", searchTerm);
      params.append("limit", "50");

      const response = await axiosInstance.get(
        `/api/v1/finance/purchases/payout-receipts?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error searching payout receipts");
    }
  },
};

export default paymentMadeApi;

// Export types for use in other files
export type {
  PaymentRecord,
  Allocation,
  PayoutReceipt,
  CreatePayoutReceiptPayload,
  UpdatePayoutReceiptPayload,
  SinglePayoutReceiptResponse,
  GetPayoutReceiptsResponse,
  PayoutReceiptStats,
  StatsResponse,
  GenerateReceiptNumberResponse,
  GetPayoutReceiptsFilters,
};
