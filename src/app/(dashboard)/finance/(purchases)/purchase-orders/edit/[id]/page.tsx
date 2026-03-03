"use client";

import React from "react";
import PurchaseOrderForm, {
  PurchaseOrderFormValues,
} from "@/components/finance/purchaseOrder/PurchaseOrderForm";
import {
  useGetPurchaseOrderById,
  useUpdatePurchaseOrder,
} from "@/hooks/usePurchaseOrderQueries";
import { useGetVendors } from "@/hooks/useVendorQueries";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  transformFormToUpdatePayload,
  validatePurchaseOrderForm,
} from "@/utils/purchaseOrderUtils";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useItems } from "@/hooks/useItemQueries";

export default function EditPurchaseOrderPage() {
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const purchaseOrderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: vendorsData } = useGetVendors();
  const { data: itemsData, isLoading: itemsLoading } = useItems(
  user?.companyId ?? "",
  {
    enabled: !!user?.companyId,   // 🚀 prevents empty API call
  }
);

 const items = itemsData?.result?.items || [];
  const { data: purchaseOrderData, isLoading } =
    useGetPurchaseOrderById(purchaseOrderId);
  const { mutate: updatePurchaseOrder, isPending } = useUpdatePurchaseOrder();

  const vendors = vendorsData?.result?.vendors || [];
  const purchaseOrder = purchaseOrderData?.result;

  // Check if purchase order can be updated
  const isOrderLocked = purchaseOrder?.status === "complete" || purchaseOrder?.status === "cancelled";

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!purchaseOrder) {
    return <div className="p-8 text-center">Purchase order not found</div>;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return dateString.split("T")[0]; // ISO se sirf YYYY-MM-DD nikal lega
  };

  // Transform API data to form values
  const initialValues: PurchaseOrderFormValues = {
    purchaseOrderNo: purchaseOrder.purchaseOrderNumber || "",
    supplierInvoiceNo: "",
    orderDate: formatDate(purchaseOrder.purchaseOrderDate),
    dueDate: formatDate(purchaseOrder.expectedDeliveryDate) || "",
    deliveryDate: formatDate(purchaseOrder.expectedDeliveryDate) || "",
    vendorId:
      typeof purchaseOrder.vendorId === "object"
        ? purchaseOrder.vendorId?._id || ""
        : purchaseOrder.vendorId || "",

    vendorDetails: {
      name: purchaseOrder.vendorSnapshot?.name || "",
      gstin: purchaseOrder.vendorSnapshot?.gstin || "",
      contact: purchaseOrder.vendorSnapshot?.phone || "",
      email: purchaseOrder.vendorSnapshot?.email || "",
      address: purchaseOrder.vendorSnapshot?.address || "",
    },

    businessDetails: {
      name:
        typeof purchaseOrder.companyId === "object" &&
        purchaseOrder.companyId?.companyName
          ? purchaseOrder.companyId.companyName
          : "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    },

    deliveryAddress: purchaseOrder.deliveryAddress || "",
    paymentTerms: purchaseOrder.paymentTerms || "Net 30",

    status: purchaseOrder.status || "draft",
    priority: purchaseOrder.priority || "medium",

    referenceNumber: purchaseOrder.referenceNumber || "",
    currency: purchaseOrder.currency || "INR",

    items: purchaseOrder.items.map((item) => ({
      name: item.name,
      description: item.description || "",
      qty: item.quantity,
      rate: item.rate,
      discount: item.discount || 0,
      amount: item.quantity * item.rate - (item.discount || 0),
      hsn: item.hsn || "",
      unit: item.unit || "pcs",
    })),

    discountType: purchaseOrder.discountType || "flat",
    discountValue: purchaseOrder.discountValue || 0,
    shipping: purchaseOrder.shipping || 0,
    roundOff: purchaseOrder.roundOff || false,

    showHSN: false,
    showUnit: false,

    terms: purchaseOrder.terms || "",
    notes: purchaseOrder.notes || "",
    attachments: [],
    signature:purchaseOrder.signature || "",
    existingAttachments: purchaseOrder.attachments || [],
    showSignature: false,
  };

  const handleUpdate = async (values: PurchaseOrderFormValues) => {
    try {
      console.log("📝 Form values received:", values);

      // Validate form data
      const validation = validatePurchaseOrderForm(values);
      if (!validation.isValid) {
        console.error("❌ Validation failed:", validation.errors);
        toast.error(validation.errors[0]);
        return;
      }

      // Transform form values to API payload
      const apiPayload = transformFormToUpdatePayload(values);
      console.log("📤 API payload to send:", apiPayload);

      // Call API to update purchase order
      updatePurchaseOrder(
        { purchaseOrderId, data: apiPayload },
        {
          onSuccess: () => {
            toast.success("Purchase order updated successfully!");
            router.push("/finance/purchase-orders");
          },
          onError: (error: any) => {
            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              "An error occurred while updating the purchase order";
            toast.error(errorMessage);
          },
        }
      );
    } catch (error) {
      console.error("Error updating purchase order:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while updating the purchase order";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      {isOrderLocked && (
        <div className="max-w-7xl mx-auto px-2 md:px-8 pt-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Purchase Order Locked
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  This purchase order is {purchaseOrder.status} and cannot be updated. You can view the details but modifications are not allowed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <PurchaseOrderForm
        initialValues={initialValues}
        onSubmit={handleUpdate}
        mode="edit"
        loading={isPending}
        mockVendors={vendors}
        purchaseOrderId={purchaseOrderId}
        isLocked={isOrderLocked}
        mockProducts={items}
      />
    </>
  );
}
