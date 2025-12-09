import type { PurchaseOrder, CreatePurchaseOrderPayload, UpdatePurchaseOrderPayload } from '@/api/finance/purchaseOrderApi';
import type { PurchaseOrderFormValues } from '@/components/finance/purchaseOrder/PurchaseOrderForm';

/**
 * Validate purchase order form values
 */
export const validatePurchaseOrderForm = (formValues: PurchaseOrderFormValues): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formValues.purchaseOrderNo?.trim()) {
    errors.push("Purchase Order Number is required");
  }
  if (!formValues.orderDate) {
    errors.push("Order Date is required");
  }
  if (!formValues.vendorId) {
    errors.push("Vendor is required");
  }
  if (!formValues.items || formValues.items.length === 0) {
    errors.push("At least one item is required");
  } else {
    const hasValidItem = formValues.items.some(item => item.name?.trim() && item.qty > 0 && item.rate >= 0);
    if (!hasValidItem) {
      errors.push("At least one item must have a name, quantity > 0, and rate >= 0");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Transform form values to API create payload
 */
export const transformFormToCreatePayload = (formValues: PurchaseOrderFormValues): CreatePurchaseOrderPayload => {
  // Validation
  if (!formValues.vendorId) {
    throw new Error("Vendor is required");
  }
  if (!formValues.orderDate) {
    throw new Error("Order date is required");
  }
  // Filter valid items first
  const validItems = formValues.items?.filter(item => item.name?.trim() && (item.qty > 0 || item.quantity > 0)) || [];
  
  if (validItems.length === 0) {
    throw new Error("At least one valid item is required");
  }

  return {
    vendorId: formValues.vendorId,
    purchaseOrderDate: formValues.orderDate,
    expectedDeliveryDate: formValues.dueDate || undefined,
    status: "draft", // Default status
    priority: "medium", // Default priority
    taxType: "exclusive", // Default tax type
    discountType: formValues.discountType as "flat" | "percentage",
    discountValue: formValues.discountValue,
    shipping: formValues.shipping,
    roundOff: formValues.roundOff,
    items: formValues.items
      .filter(item => item.name?.trim() && (item.qty > 0 || item.quantity > 0)) // Only include items with name and quantity
      .map(item => ({
        itemId: item.itemId,
        name: item.name.trim(),
        hsn: item.hsn || "",
        unit: item.unit || "pcs",
        quantity: item.qty || item.quantity, // Handle both qty and quantity fields
        rate: item.rate || 0,
        discount: item.discount || 0,
        discountType: (item.discountType as "flat" | "percentage") || "flat",
        taxType: (item.taxType as "cgst_sgst" | "igst" | "nil") || "cgst_sgst",
        taxRate: item.taxRate || 0,
        cess: item.cess || []
      })),
    terms: formValues.terms,
    notes: formValues.notes
  };
};

/**
 * Transform form values to API update payload
 */
export const transformFormToUpdatePayload = (formValues: Partial<PurchaseOrderFormValues>): UpdatePurchaseOrderPayload => {
  const payload: UpdatePurchaseOrderPayload = {};
  
  if (formValues.vendorId) payload.vendorId = formValues.vendorId;
  if (formValues.orderDate) payload.purchaseOrderDate = formValues.orderDate;
  if (formValues.dueDate) payload.expectedDeliveryDate = formValues.dueDate;
  if (formValues.discountType) payload.discountType = formValues.discountType as "flat" | "percentage";
  if (formValues.discountValue !== undefined) payload.discountValue = formValues.discountValue;
  if (formValues.shipping !== undefined) payload.shipping = formValues.shipping;
  if (formValues.roundOff !== undefined) payload.roundOff = formValues.roundOff;
  if (formValues.terms) payload.terms = formValues.terms;
  if (formValues.notes) payload.notes = formValues.notes;
  
  if (formValues.items) {
    payload.items = formValues.items.map(item => ({
      itemId: item.itemId,
      name: item.name,
      hsn: item.hsn,
      unit: item.unit,
      quantity: item.quantity,
      rate: item.rate,
      discount: item.discount,
      discountType: item.discountType as "flat" | "percentage",
      taxType: item.taxType as "cgst_sgst" | "igst" | "nil",
      taxRate: item.taxRate,
      cess: item.cess
    }));
  }
  
  return payload;
};

/**
 * Transform API purchase order to form values
 */
export const transformApiToFormValues = (apiPO: PurchaseOrder): PurchaseOrderFormValues => {
  return {
    purchaseOrderNo: apiPO.purchaseOrderNumber,
    supplierInvoiceNo: "", // Not available in API response
    orderDate: new Date(apiPO.purchaseOrderDate).toISOString().split('T')[0],
    dueDate: apiPO.expectedDeliveryDate ? new Date(apiPO.expectedDeliveryDate).toISOString().split('T')[0] : "",
    vendorId: apiPO.vendorId._id,
    vendorDetails: {
      name: apiPO.vendorId.name,
      gstin: apiPO.vendorId.gstin || "",
      address: apiPO.vendorId.address ? JSON.stringify(apiPO.vendorId.address) : "",
      contact: apiPO.vendorId.phone || "",
      email: apiPO.vendorId.email || "",
    },
    businessDetails: {
      name: apiPO.companyId.companyName,
      gstin: "",
      address: "",
      contact: "",
      email: "",
    },
    items: apiPO.items.map(item => ({
      itemId: item.itemId,
      name: item.name,
      hsn: item.hsn || "",
      unit: item.unit,
      quantity: item.quantity,
      rate: item.rate,
      discount: item.discount || 0,
      discountType: item.discountType || "flat",
      taxType: item.taxType || "cgst_sgst",
      taxRate: item.taxRate || 0,
      cess: item.cess || [],
      deliveredQuantity: item.deliveredQuantity || 0,
      remainingQuantity: item.remainingQuantity || item.quantity,
    })),
    discountType: apiPO.discountType,
    discountValue: apiPO.discountValue || 0,
    shipping: apiPO.shipping || 0,
    roundOff: apiPO.roundOff,
    showHSN: true, // Default value
    showUnit: true, // Default value
    terms: apiPO.terms || "",
    notes: apiPO.notes || "",
    attachments: [], // File attachments not supported in this transformation
    showSignature: false, // Default value
  };
};

/**
 * Generate purchase order number
 */
export const generatePurchaseOrderNumber = (): string => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `PO${datePart}${randomPart}`;
};

/**
 * Calculate totals for purchase order items
 */
export const calculatePurchaseOrderTotals = (
  items: any[],
  discountType: string = "flat",
  discountValue: number = 0,
  shipping: number = 0
) => {
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.rate;
    const itemDiscount = item.discountType === "percentage" 
      ? (itemTotal * (item.discount || 0)) / 100 
      : (item.discount || 0);
    const itemAfterDiscount = itemTotal - itemDiscount;
    
    const taxAmount = (itemAfterDiscount * (item.taxRate || 0)) / 100;
    const cessAmount = (item.cess || []).reduce((cessSum: number, cess: any) => 
      cessSum + (itemAfterDiscount * cess.rate) / 100, 0);
    
    return sum + itemAfterDiscount + taxAmount + cessAmount;
  }, 0);

  const orderDiscount = discountType === "percentage" 
    ? (subtotal * discountValue) / 100 
    : discountValue;

  const totalBeforeShipping = subtotal - orderDiscount;
  const total = totalBeforeShipping + shipping;

  return {
    subtotal,
    discount: orderDiscount,
    shipping,
    total,
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = "INR"): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get status color for UI
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    acknowledged: "bg-yellow-100 text-yellow-800",
    partial_delivery: "bg-orange-100 text-orange-800",
    complete: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  
  return statusColors[status] || "bg-gray-100 text-gray-800";
};

/**
 * Get priority color for UI
 */
export const getPriorityColor = (priority: string): string => {
  const priorityColors: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };
  
  return priorityColors[priority] || "bg-gray-100 text-gray-800";
};
