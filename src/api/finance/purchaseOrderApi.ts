import axios from 'axios';
import axiosInstance from '../../utils/axios';

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
  deliveredQuantity?: number;
  remainingQuantity?: number;
}

interface Attachment {
  url: string;
  uploadedAt: Date;
}

interface PurchaseOrder {
  _id: string;
  companyId: Company;
  purchaseOrderNumber: string;
  vendorId: Vendor;
  purchaseOrderDate: string;
  expectedDeliveryDate?: string;
  status: "draft" | "sent" | "acknowledged" | "partial_delivery" | "complete" | "cancelled";
  priority: "low" | "medium" | "high";
  approvalStatus: "pending" | "approved" | "rejected" | "revision_required";
  approvedBy?: User;
  approvedAt?: Date;
  rejectionReason?: string;
  vendorAcknowledgedAt?: Date;
  vendorComments?: string;
  taxType: "inclusive" | "exclusive";
  discountType: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff: boolean;
  items: Item[];
  terms?: string;
  notes?: string;
  attachments?: Attachment[];
  createdBy: User;
  vendorSnapshot: any;
  linkedPurchaseIds?: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreatePurchaseOrderPayload {
  vendorId: string;
  purchaseOrderDate: string;
  expectedDeliveryDate?: string;
  status?: "draft" | "sent";
  priority?: "low" | "medium" | "high";
  taxType?: "inclusive" | "exclusive";
  discountType?: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  items: Item[];
  terms?: string;
  notes?: string;
}

interface UpdatePurchaseOrderPayload {
  vendorId?: string;
  purchaseOrderDate?: string;
  expectedDeliveryDate?: string;
  status?: "draft" | "sent" | "acknowledged" | "partial_delivery" | "complete" | "cancelled";
  priority?: "low" | "medium" | "high";
  taxType?: "inclusive" | "exclusive";
  discountType?: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  items?: Item[];
  terms?: string;
  notes?: string;
}

interface GetPurchaseOrdersFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  priority?: string;
  vendorId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalPurchaseOrders: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface GetPurchaseOrdersResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    purchaseOrders: PurchaseOrder[];
    pagination: PaginationInfo;
  };
}

interface SinglePurchaseOrderResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: PurchaseOrder;
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

interface UpdateApprovalStatusPayload {
  approvalStatus: "pending" | "approved" | "rejected" | "revision_required";
  rejectionReason?: string;
}

interface AcknowledgeByVendorPayload {
  vendorComments?: string;
}

interface AddAttachmentPayload {
  url: string;
}

interface PurchaseOrderStatsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    totalPOs: number;
    draftPOs: number;
    sentPOs: number;
    acknowledgedPOs: number;
    completePOs: number;
    totalValue: number;
    avgOrderValue: number;
  };
}

const purchaseOrderApi = {
  // Create a new purchase order
  createPurchaseOrder: async (purchaseOrderData: CreatePurchaseOrderPayload): Promise<SinglePurchaseOrderResponse> => {
    try {
      const response = await axiosInstance.post('/api/v1/finance/purchases/purchase-orders/createPurchaseOrder', purchaseOrderData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error creating purchase order');
    }
  },

  // Get all purchase orders with optional filters and pagination
  getAllPurchaseOrders: async (filters: GetPurchaseOrdersFilters = {}): Promise<GetPurchaseOrdersResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.vendorId) params.append('vendorId', filters.vendorId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);

      const response = await axiosInstance.get(`/api/v1/finance/purchases/purchase-orders/getAllPurchaseOrders?${params.toString()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error fetching purchase orders');
    }
  },

  // Get purchase order by ID
  getPurchaseOrderById: async (purchaseOrderId: string): Promise<SinglePurchaseOrderResponse> => {
    try {
      const response = await axiosInstance.get(`/api/v1/finance/purchases/purchase-orders/purchaseOrderDetails/${purchaseOrderId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error fetching purchase order');
    }
  },

  // Update an existing purchase order
  updatePurchaseOrder: async (purchaseOrderId: string, purchaseOrderData: UpdatePurchaseOrderPayload): Promise<SinglePurchaseOrderResponse> => {
    try {
      const response = await axiosInstance.put(`/api/v1/finance/purchases/purchase-orders/updatePurchaseOrderDetails/${purchaseOrderId}`, purchaseOrderData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error updating purchase order');
    }
  },

  // Delete a purchase order
  deletePurchaseOrder: async (purchaseOrderId: string): Promise<DeleteResponse> => {
    try {
      const response = await axiosInstance.delete(`/api/v1/finance/purchases/purchase-orders/deletePurchaseOrder/${purchaseOrderId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error deleting purchase order');
    }
  },

  // Bulk delete purchase orders
  bulkDeletePurchaseOrders: async (purchaseOrderIds: string[]): Promise<BulkDeleteResponse> => {
    try {
      const response = await axiosInstance.delete('/api/v1/finance/purchases/purchase-orders/bulkDeletePurchaseOrders', {
        data: { purchaseOrderIds }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error deleting purchase orders');
    }
  },

  // Update approval status
  updateApprovalStatus: async (purchaseOrderId: string, approvalData: UpdateApprovalStatusPayload): Promise<SinglePurchaseOrderResponse> => {
    try {
      const response = await axiosInstance.patch(`/api/v1/finance/purchases/purchase-orders/updateApprovalStatus/${purchaseOrderId}`, approvalData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error updating approval status');
    }
  },

  // Acknowledge by vendor
  acknowledgeByVendor: async (purchaseOrderId: string, acknowledgmentData: AcknowledgeByVendorPayload): Promise<SinglePurchaseOrderResponse> => {
    try {
      const response = await axiosInstance.patch(`/api/v1/finance/purchases/purchase-orders/acknowledgeByVendor/${purchaseOrderId}`, acknowledgmentData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error acknowledging purchase order');
    }
  },

  // Add attachment
  addAttachment: async (purchaseOrderId: string, attachmentData: AddAttachmentPayload): Promise<SinglePurchaseOrderResponse> => {
    try {
      const response = await axiosInstance.post(`/api/v1/finance/purchases/purchase-orders/addAttachment/${purchaseOrderId}`, attachmentData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error adding attachment');
    }
  },

  // Remove attachment
  removeAttachment: async (purchaseOrderId: string, attachmentIndex: number): Promise<SinglePurchaseOrderResponse> => {
    try {
      const response = await axiosInstance.delete(`/api/v1/finance/purchases/purchase-orders/removeAttachment/${purchaseOrderId}/${attachmentIndex}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error removing attachment');
    }
  },

  // Get purchase order statistics
  getPurchaseOrderStats: async (startDate?: string, endDate?: string): Promise<PurchaseOrderStatsResponse> => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await axiosInstance.get(`/api/v1/finance/purchases/purchase-orders/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error('Error fetching purchase order statistics');
    }
  },
};

export default purchaseOrderApi;
export type {
  PurchaseOrder,
  CreatePurchaseOrderPayload,
  UpdatePurchaseOrderPayload,
  GetPurchaseOrdersFilters,
  GetPurchaseOrdersResponse,
  SinglePurchaseOrderResponse,
  DeleteResponse,
  BulkDeleteResponse,
  UpdateApprovalStatusPayload,
  AcknowledgeByVendorPayload,
  AddAttachmentPayload,
  PurchaseOrderStatsResponse,
  PaginationInfo,
  Company,
  Vendor,
  User,
  Item,
  Attachment
};