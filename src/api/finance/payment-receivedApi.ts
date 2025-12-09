import axiosInstance from "@/utils/axios";
import { Client } from "./clientApi";

export interface PaymentRecordItem {
  paymentMethod: string;
  depositedTo: string;
  amountReceived: number;
  tdsPercent?: number;
  tdsWithheldAmount?: number;
  transactionCharge?: number;
  referenceId?: string;
  notes?: string;
}

export interface AllocationItem {
  invoiceId: string;
  amount: number;
}

export interface PaymentReceived {
  _id: string;
  companyId: string;
  clientId: string | Client;
  receiptDate: string;
  paymentType: string;
  paymentRecords: PaymentRecordItem[];
  allocations: AllocationItem[];
  attachments?: string[];
  totalAmount: number;
  paymentNo?: string;
  createdAt?: string;
}

// --------------------------------------------------------
// PAYLOAD
export interface CreatePaymentReceivedPayload {
  clientId: string;
  receiptDate: string;
  paymentType: string;
  paymentRecords: PaymentRecordItem[];
  allocations: AllocationItem[];
  attachments?: string[];
}

export interface PaymentListResponse {
  success: boolean;
  data: PaymentReceived[];
}

export interface PaymentResponse {
  success: boolean;
  data: PaymentReceived;
}

// --------------------------------------------------------
// 🔥 STATS RESPONSE FROM BACKEND
export interface PaymentStatsBackendResponse {
  _id: null;
  totalReceipts: number;
  totalAdvancePayments: number;
  totalInvoicePayments: number;
  totalAmount: number;
  totalAdvanceAmount: number;
  totalReceiptAmount: number;
}

// 🔥 STATS RESPONSE FOR FRONTEND (normalized)
export interface PaymentStatsResponse {
  totalReceipts: number;
  totalAmount: number;

  totalInvoicePayments: number;
  totalReceiptAmount: number;

  totalAdvancePayments: number;
  totalAdvanceAmount: number;
}

// --------------------------------------------------------
// 🔥 FILTER SEARCH QUERY TYPES
export interface PaymentSearchParams {
  search?: string;
  status?: string;
  paymentType?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
}

// ========================================================
// API EXPORTS
const paymentReceivedApi = {
  // CREATE
  createPayment: async (
    payload: CreatePaymentReceivedPayload
  ): Promise<PaymentResponse> => {
    const res = await axiosInstance.post(
      `/api/v1/finance/sales/payment-receipts`,
      payload
    );
    return res.data;
  },

  // GET ALL
  getAllPayments: async (companyId: string): Promise<PaymentListResponse> => {
    const res = await axiosInstance.get(
      `/api/v1/finance/sales/payment-receipts?companyId=${companyId}`
    );
    return res.data;
  },

  // GET ONE
  getPaymentById: async (id: string): Promise<PaymentResponse> => {
    const res = await axiosInstance.get(
      `/api/v1/finance/sales/payment-receipts/${id}`
    );
    return res.data;
  },

  // PREVIEW (same endpoint)
  previewPayment: async (id: string): Promise<PaymentResponse> => {
    const res = await axiosInstance.get(
      `/api/v1/finance/sales/payment-receipts/${id}`
    );
    return res.data;
  },

  // UPDATE
  updatePayment: async (
    id: string,
    payload: CreatePaymentReceivedPayload
  ): Promise<PaymentResponse> => {
    const res = await axiosInstance.put(
      `/api/v1/finance/sales/payment-receipts/${id}`,
      payload
    );
    return res.data;
  },

  // DELETE
  deletePayment: async (id: string, companyId: string) => {
    const res = await axiosInstance.delete(
      `/api/v1/finance/sales/payment-receipts/${id}?companyId=${companyId}`
    );
    return res.data;
  },

  // **********************************************************************
  // 🔥 NEW — SEARCH API (filters)
  searchPayments: async (
    companyId: string,
    params: PaymentSearchParams
  ): Promise<PaymentListResponse> => {
    const queryParams = new URLSearchParams({ companyId });

    // Add each filter parameter if it exists
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.paymentType)
      queryParams.append("paymentType", params.paymentType);
    if (params.paymentMethod)
      queryParams.append("paymentMethod", params.paymentMethod);
    if (params.minAmount !== undefined)
      queryParams.append("minAmount", params.minAmount.toString());
    if (params.maxAmount !== undefined)
      queryParams.append("maxAmount", params.maxAmount.toString());
    if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params.dateTo) queryParams.append("dateTo", params.dateTo);

    // Try search endpoint first, fallback to main endpoint with filters
    try {
      const res = await axiosInstance.get(
        `/api/v1/finance/sales/payment-receipts/search?${queryParams.toString()}`
      );
      return res.data;
    } catch (error) {
      // If search endpoint doesn't exist, use main endpoint with filters
      const res = await axiosInstance.get(
        `/api/v1/finance/sales/payment-receipts?${queryParams.toString()}`
      );
      return res.data;
    }
  },

  // **********************************************************************
  // 🔥 NEW — PAYMENT STATS
  getPaymentStats: async (companyId: string): Promise<PaymentStatsResponse> => {
    const res = await axiosInstance.get(
      `/api/v1/finance/sales/payment-receipts/stats?companyId=${companyId}`
    );

    const backendData: PaymentStatsBackendResponse = res.data.data;

    // Map backend response to frontend format
    return {
      totalReceipts: backendData.totalReceipts || 0,
      totalAmount: backendData.totalAmount || 0,

      totalInvoicePayments: backendData.totalInvoicePayments || 0,
      totalReceiptAmount: backendData.totalReceiptAmount || 0,

      totalAdvancePayments: backendData.totalAdvancePayments || 0,
      totalAdvanceAmount: backendData.totalAdvanceAmount || 0,
    };
  },
};

export default paymentReceivedApi;
