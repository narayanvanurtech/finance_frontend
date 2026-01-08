import axiosInstance from "../../utils/axios";

// -----------------------------------------------------
//                    INTERFACES
// -----------------------------------------------------

export interface Cess {
  name: string;
  rate: number;
  showInInvoice?: boolean;
}

export interface PurchaseOrderItem {
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
  cess?: Cess[];
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

export interface CreatePurchaseOrderPayload {
  vendorId: string;
  purchaseOrderNumber: string;
  purchaseOrderDate: string;
  expectedDeliveryDate?: string;
  status?: "draft" | "sent" | "acknowledged" | "partial_delivery" | "complete" | "cancelled";
  priority?: "low" | "medium" | "high";
  taxType: "inclusive" | "exclusive";
  discountType: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  items: PurchaseOrderItem[];
  terms?: string;
  notes?: string;
  attachments?: string[]; // Array of attachment URLs (optional)
}

export interface UpdatePurchaseOrderPayload {
  vendorId?: string;
  purchaseOrderNumber?: string;
  purchaseOrderDate?: string;
  expectedDeliveryDate?: string;
  status?: "draft" | "sent" | "acknowledged" | "partial_delivery" | "complete" | "cancelled";
  priority?: "low" | "medium" | "high";
  taxType?: "inclusive" | "exclusive";
  discountType?: "flat" | "percentage";
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  items?: PurchaseOrderItem[];
  terms?: string;
  notes?: string;
  vendorDetails?: VendorDetails;
  businessDetails?: BusinessDetails;
}

export interface UpdateApprovalStatusPayload {
  approvalStatus: "approved" | "rejected";
}

export interface VendorAcknowledgmentPayload {
  vendorComments: string;
}

export interface PurchaseOrder {
  _id: string;
  companyId: any;
  purchaseOrderNumber: string;
  purchaseOrderDate: string;
  expectedDeliveryDate?: string;
  vendorId: any;
  vendorDetails?: VendorDetails;
  vendorSnapshot?: VendorDetails;
  businessDetails?: BusinessDetails;
  deliveryAddress?: string;
  paymentTerms?: string;
  referenceNumber?: string;
  currency?: string;
  status: "draft" | "sent" | "acknowledged" | "partial_delivery" | "complete" | "cancelled";
  priority?: "low" | "medium" | "high";
  approvalStatus?: "pending" | "approved" | "rejected";
  items: PurchaseOrderItem[];
  taxType: "inclusive" | "exclusive";
  discountType: "flat" | "percentage";
  discountValue: number;
  shipping: number;
  roundOff: boolean;
  terms?: string;
  notes?: string;
  attachments?: string[];
  subtotal?: number;
  totalTax?: number;
  totalCess?: number;
  grandTotal?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderResponse {
  success: boolean;
  message: string;
  result: PurchaseOrder;
}

export interface PurchaseOrdersResponse {
  success: boolean;
  message: string;
  result: {
    purchaseOrders: PurchaseOrder[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// -----------------------------------------------------
//                    API FUNCTIONS
// -----------------------------------------------------

export const createPurchaseOrder = async (
  data: CreatePurchaseOrderPayload
): Promise<PurchaseOrderResponse> => {
  const res = await axiosInstance.post(
    "/api/v1/finance/purchases/purchase-orders/createPurchaseOrder",
    data
  );
  return res.data;
};

export const getAllPurchaseOrders = async (
  params?: any
): Promise<PurchaseOrdersResponse> => {
  console.log("🔍 getAllPurchaseOrders called with params:", params);
  console.log("🔍 Search parameter:", params?.search);
  const res = await axiosInstance.get(
    "/api/v1/finance/purchases/purchase-orders/getAllPurchaseOrders",
    { params }
  );
  console.log("✅ getAllPurchaseOrders response:", res.data);
  console.log("✅ Total results:", res.data?.result?.purchaseOrders?.length);
  return res.data;
};

export const getPurchaseOrderById = async (
  id: string
): Promise<PurchaseOrderResponse> => {
  const res = await axiosInstance.get(
    `/api/v1/finance/purchases/purchase-orders/purchaseOrderDetails/${id}`
  );
  return res.data;
};

export const updatePurchaseOrderDetails = async (
  id: string,
  data: UpdatePurchaseOrderPayload
): Promise<PurchaseOrderResponse> => {
  const res = await axiosInstance.put(
    `/api/v1/finance/purchases/purchase-orders/updatePurchaseOrderDetails/${id}`,
    data
  );
  return res.data;
};

export const deletePurchaseOrder = async (id: string) => {
  const res = await axiosInstance.delete(
    `/api/v1/finance/purchases/purchase-orders/deletePurchaseOrder/${id}`
  );
  return res.data;
};

// APPROVAL STATUS
export const updateApprovalStatus = async (
  id: string,
  data: UpdateApprovalStatusPayload
): Promise<PurchaseOrderResponse> => {
  const res = await axiosInstance.patch(
    `/api/v1/finance/purchases/purchase-orders/updateApprovalStatus/${id}`,
    data
  );
  return res.data;
};

// VENDOR ACKNOWLEDGEMENT
export const acknowledgeByVendor = async (
  id: string,
  data: VendorAcknowledgmentPayload
): Promise<PurchaseOrderResponse> => {
  const res = await axiosInstance.patch(
    `/api/v1/finance/purchases/purchase-orders/acknowledgeByVendor/${id}`,
    data
  );
  return res.data;
};

export const getPurchaseOrderStats = async () => {
  const res = await axiosInstance.get(
    "/api/v1/finance/purchases/purchase-orders/stats/"
  );
  return res.data;
};

// SEARCH PO
export const searchPurchaseOrders = async (query: any) => {
  // Ensure search term is present
  if (!query.search || query.search.trim().length === 0) {
    throw new Error("Search term is required");
  }

  const res = await axiosInstance.get(
    "/api/v1/finance/purchases/purchase-orders/searchPurchaseOrders",
    { params: { search: query.search.trim(), ...query } }
  );
  return res.data;
};

// BULK DELETE PO
export const bulkDeletePurchaseOrders = async (ids: string[]) => {
  const res = await axiosInstance.delete(
    "/api/v1/finance/purchases/purchase-orders/bulkDeletePurchaseOrders",
    {
      data: { purchaseOrderIds: ids }, // ✅ backend expects this
    }
  );
  return res.data;
};

// ADD ATTACHMENT
export const addAttachment = async (
  purchaseOrderId: string,
  file: File
): Promise<PurchaseOrderResponse> => {
  const formData = new FormData();
  formData.append("attachment", file);

  const res = await axiosInstance.post(
    `/api/v1/finance/purchases/purchase-orders/addAttachment/${purchaseOrderId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

// REMOVE ATTACHMENT
export const removeAttachment = async (
  purchaseOrderId: string,
  attachmentIndex: number,
  attachmentUrl: string
): Promise<PurchaseOrderResponse> => {
  const res = await axiosInstance.delete(
    `/api/v1/finance/purchases/purchase-orders/removeAttachment/${purchaseOrderId}/${attachmentIndex}`,
    {
      data: { url: attachmentUrl }, // ✅ Backend expects url field
    }
  );
  return res.data;
};

// EXPORT DEFAULT
export default {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderDetails,
  deletePurchaseOrder,
  updateApprovalStatus,
  acknowledgeByVendor,
  getPurchaseOrderStats,
  searchPurchaseOrders,
  bulkDeletePurchaseOrders,
  addAttachment,
  removeAttachment,
};
