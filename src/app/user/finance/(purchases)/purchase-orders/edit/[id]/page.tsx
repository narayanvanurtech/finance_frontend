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

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const router = useRouter();
  const purchaseOrderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: vendorsData } = useGetVendors();
  const { data: purchaseOrderData, isLoading } =
    useGetPurchaseOrderById(purchaseOrderId);
  const { mutate: updatePurchaseOrder, isPending } = useUpdatePurchaseOrder();

  const vendors = vendorsData?.result?.vendors || [];
  const purchaseOrder = purchaseOrderData?.result;

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!purchaseOrder) {
    return <div className="p-8 text-center">Purchase order not found</div>;
  }

  // Transform API data to form values
  const initialValues: PurchaseOrderFormValues = {
    purchaseOrderNo: purchaseOrder.purchaseOrderNumber,
    supplierInvoiceNo: "",
    orderDate: purchaseOrder.purchaseOrderDate,
    dueDate: purchaseOrder.expectedDeliveryDate || "",
    deliveryDate: purchaseOrder.expectedDeliveryDate || "",
    vendorId:
      typeof purchaseOrder.vendorId === "string"
        ? purchaseOrder.vendorId
        : purchaseOrder.vendorId._id,
    vendorDetails: purchaseOrder.vendorDetails || {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    },
    businessDetails: purchaseOrder.businessDetails || {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    },
    deliveryAddress: "",
    paymentTerms: "Net 30",
    status: purchaseOrder.status || "Draft",
    priority: purchaseOrder.priority || "Medium",
    referenceNumber: "",
    currency: "INR",
    items: purchaseOrder.items.map((item) => ({
      name: item.name,
      description: item.description || "",
      qty: item.quantity,
      rate: item.rate,
      discount: item.discount || 0,
      amount: item.amount || 0,
      hsn: item.hsn || "",
      unit: item.unit || "pcs",
    })),
    discountType: purchaseOrder.discountType,
    discountValue: purchaseOrder.discountValue,
    shipping: purchaseOrder.shipping,
    roundOff: purchaseOrder.roundOff,
    showHSN: false,
    showUnit: false,
    terms: purchaseOrder.terms || "",
    notes: purchaseOrder.notes || "",
    attachments: [],
    existingAttachments: purchaseOrder.attachments || [], // ✅ Add this
    showSignature: false,
  };

  const handleUpdate = async (values: PurchaseOrderFormValues) => {
    try {
      // Validate form data
      const validation = validatePurchaseOrderForm(values);
      if (!validation.isValid) {
        toast.error(validation.errors[0]);
        return;
      }

      // Transform form values to API payload
      const apiPayload = transformFormToUpdatePayload(values);

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
    <PurchaseOrderForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      loading={isPending}
      mockVendors={vendors}
      purchaseOrderId={purchaseOrderId} // ✅ Add this - important!
    />
  );
}
