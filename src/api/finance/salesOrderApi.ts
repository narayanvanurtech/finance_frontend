import axiosInstance from "../../utils/axios";
import { ConvertToInvoicePayload } from "./quotationApi";

// Sales Order Item interface
export interface SalesOrderItem {
  itemId?: string;
  name: string;
  description?: string;
  hsn?: string;
  unit?: string;
  quantity: number;
  rate: number;
  discount?: number;
  taxRate?: number; // Single tax rate instead of igst/sgst/cgst
  igst?: number;
  sgst?: number;
  cgst?: number;
  amount?: number;
}

// Shipping Address interface
export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
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
  name: string;
  rate: number;
  showInInvoice: boolean;
}

// Sales Order interface
export interface SalesOrder {
  _id: string;
  companyId: string | { _id: string };
  orderNumber: string;
  orderTitle: string;
  orderDate: string;
  deliveryDate?: string;
  clientId: string | { _id: string; email?: string; phone?: string };
  clientDetails?: ClientDetails;
  businessDetails?: BusinessDetails;
  createdBy?: {
    _id: string;
    email: string;
    name: string;
  };
  taxType: string;
  cessList?: Cess[];
  items: SalesOrderItem[];
  discountType: "flat" | "percent";
  discountValue: number;
  shipping: number;
  roundOff: boolean;
  showHSN: boolean;
  showUnit: boolean;
  terms?: string;
  notes?: string;
  attachments: string[];
  showSignature: boolean;
  status:
    | "draft"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  convertedToInvoice?: boolean;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  totalTax?: number;
  totalCess?: number;
  grandTotal?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  id?: string;
}

// Create sales order payload (matches backend API expectation)
export interface CreateSalesOrderPayload {
  clientId: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  items: SalesOrderItem[];
  shippingAddress?: ShippingAddress;
  terms?: string;
  notes?: string;
  status?:
    | "draft"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
}

// Update sales order payload
export interface UpdateSalesOrderPayload {
  orderTitle?: string;
  orderDate?: string;
  deliveryDate?: string;
  clientId?: string;
  clientDetails?: ClientDetails;
  businessDetails?: BusinessDetails;
  taxType?: string;
  cessList?: Cess[];
  items?: SalesOrderItem[];
  discountType?: "flat" | "percent";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  showHSN?: boolean;
  showUnit?: boolean;
  terms?: string;
  notes?: string;
  showSignature?: boolean;
}

// API Response interfaces
export interface SalesOrderResponse {
  success: boolean;
  message: string;
  data: SalesOrder;
}

export interface SalesOrdersResponse {
  success: boolean;
  message: string;
  data: SalesOrder[];
  pagination?: {
    page?: number;
    pages?: number;
    total?: number;
    limit?: number;
    // Backend also returns these field names
    currentPage?: number;
    totalPages?: number;
    totalCount?: number;
  };
}

export interface SalesOrderStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalOrders: number;
    draftOrders: number;
    confirmedOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalValue: number;
  };
}

export interface SalesOrderNumberResponse {
  success: boolean;
  message: string;
  data: {
    orderNumber: string;
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

// Query parameters interface
export interface SalesOrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  search?: string;
}

const salesOrderApi = {
  // Preview order number
  previewOrderNumber: async (
    companyId: string
  ): Promise<SalesOrderNumberResponse> => {
    try {
      const response = await axiosInstance.get<SalesOrderNumberResponse>(
        `/api/v1/finance/sales/sales-orders/preview-number/${companyId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new sales order
  createSalesOrder: async (
    orderData: CreateSalesOrderPayload,
    companyId: string
  ): Promise<SalesOrderResponse> => {
    try {
      const response = await axiosInstance.post<SalesOrderResponse>(
        `/api/v1/finance/sales/sales-orders/create?companyId=${companyId}`,
        orderData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all sales orders with filters
  getAllSalesOrders: async (
    companyId: string,
    params?: SalesOrderQueryParams
  ): Promise<SalesOrdersResponse> => {
    try {
      const queryString = params
        ? new URLSearchParams(
            Object.entries(params)
              .filter(([_, value]) => value !== undefined && value !== "")
              .map(([key, value]) => [key, String(value)])
          ).toString()
        : "";

      const url = queryString
        ? `/api/v1/finance/sales/sales-orders/getAll?${queryString}`
        : `/api/v1/finance/sales/sales-orders/getAll`;

      const response = await axiosInstance.get<SalesOrdersResponse>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sales order by ID
  getSalesOrderById: async (
    orderId: string,
    companyId: string
  ): Promise<SalesOrderResponse> => {
    try {
      const response = await axiosInstance.get<SalesOrderResponse>(
        `/api/v1/finance/sales/sales-orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update sales order
  updateSalesOrder: async (
    orderId: string,
    companyId: string,
    orderData: UpdateSalesOrderPayload
  ): Promise<SalesOrderResponse> => {
    try {
      const response = await axiosInstance.put<SalesOrderResponse>(
        `/api/v1/finance/sales/sales-orders/${orderId}`,
        orderData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Convert sales order to invoice
  convertToInvoice: async (
    orderId: string,
    companyId?: string,
    data?: ConvertToInvoicePayload
  ): Promise<SalesOrderResponse> => {
    try {
      // Build URL with companyId as query parameter (not path parameter)
      const baseUrl = `/api/v1/finance/sales/sales-orders/${orderId}/convert-to-invoice`;
      const url = companyId ? `${baseUrl}?companyId=${companyId}` : baseUrl;

      console.log(
        "salesOrderApi.convertToInvoice -> POST",
        url,
        "payload:",
        data || {}
      );
      const response = await axiosInstance.post<SalesOrderResponse>(
        url,
        data || {}
      );
      console.log(
        "salesOrderApi.convertToInvoice <- response:",
        response?.data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // // Convert quotation to proforma invoice
  // convertToProformaInvoice: async (
  //   quotationId: string,
  //   data?: ConvertToProformaInvoicePayload
  // ): Promise<QuotationResponse> => {
  //   try {
  //     const response = await axiosInstance.post<QuotationResponse>(
  //       `/api/v1/finance/sales/quotations/${quotationId}/convert-to-proforma-invoice`,
  //       data || {}
  //     );
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  // Update sales order status
  updateSalesOrderStatus: async (
    orderId: string,
    companyId: string,
    status: string
  ): Promise<SalesOrderResponse> => {
    try {
      const response = await axiosInstance.patch<SalesOrderResponse>(
        `/api/v1/finance/sales/sales-orders/${orderId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete sales order
  deleteSalesOrder: async (
    orderId: string,
    companyId: string
  ): Promise<DeleteResponse> => {
    try {
      const response = await axiosInstance.delete<DeleteResponse>(
        `/api/v1/finance/sales/sales-orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Duplicate sales order
  duplicateSalesOrder: async (
    orderId: string,
    companyId: string
  ): Promise<SalesOrderResponse> => {
    try {
      const response = await axiosInstance.post<SalesOrderResponse>(
        `/api/v1/finance/sales/sales-orders/${orderId}/duplicate`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Advanced search
  searchSalesOrders: async (
    companyId: string,
    params: SalesOrderQueryParams
  ): Promise<SalesOrdersResponse> => {
    try {
      return await salesOrderApi.getAllSalesOrders(companyId, params);
    } catch (error) {
      throw error;
    }
  },

  // Get sales order statistics
  getSalesOrderStats: async (
    companyId: string,
    period: string = "30"
  ): Promise<SalesOrderStatsResponse> => {
    try {
      const response = await axiosInstance.get<SalesOrderStatsResponse>(
        `/api/v1/finance/sales/sales-orders/stats?period=${period}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk actions
  bulkAction: async (
    action: string,
    orderIds: string[],
    companyId?: string,
    data?: any
  ): Promise<DeleteResponse> => {
    try {
      const payload = {
        action,
        orderIds,
        salesOrderIds: orderIds,
        ids: orderIds,
        ...data,
      };

      const response = await axiosInstance.post<DeleteResponse>(
        "/api/v1/finance/sales/sales-orders/bulk-action",
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default salesOrderApi;
