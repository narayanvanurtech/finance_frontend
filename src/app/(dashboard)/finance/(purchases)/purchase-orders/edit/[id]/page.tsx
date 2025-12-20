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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return dateString.split("T")[0]; // ISO se sirf YYYY-MM-DD nikal lega
  };

  // Transform API data to form values
  const initialValues: PurchaseOrderFormValues = {
    purchaseOrderNo: purchaseOrder.purchaseOrderNumber,
    supplierInvoiceNo: "",
    orderDate: formatDate(purchaseOrder.purchaseOrderDate),
    dueDate: formatDate(purchaseOrder.expectedDeliveryDate) || "",
    deliveryDate: formatDate(purchaseOrder.expectedDeliveryDate) || "",
    vendorId:
      typeof purchaseOrder.vendorId === "string"
        ? purchaseOrder.vendorId
        : purchaseOrder.vendorId?._id || "",

    vendorDetails: {
      name:
        purchaseOrder.vendorSnapshot?.name ||
        purchaseOrder.vendorDetails?.name ||
        "",
      gstin:
        purchaseOrder.vendorSnapshot?.gstin ||
        purchaseOrder.vendorDetails?.gstin ||
        "",
      contact:
        purchaseOrder.vendorSnapshot?.phone ||
        purchaseOrder.vendorSnapshot?.contact ||
        purchaseOrder.vendorDetails?.phone ||
        purchaseOrder.vendorDetails?.contact ||
        "",
      email:
        purchaseOrder.vendorSnapshot?.email ||
        purchaseOrder.vendorDetails?.email ||
        "",
      address:
        purchaseOrder.vendorSnapshot?.address ||
        purchaseOrder.vendorDetails?.address ||
        "",
    },

    businessDetails: {
      name:
        typeof purchaseOrder.companyId === "object" &&
        purchaseOrder.companyId?.companyName
          ? purchaseOrder.companyId.companyName
          : purchaseOrder.businessDetails?.name || "",
      gstin: purchaseOrder.businessDetails?.gstin || "",
      address: purchaseOrder.businessDetails?.address || "",
      contact:
        purchaseOrder.businessDetails?.contact ||
        purchaseOrder.businessDetails?.phone ||
        "",
      email: purchaseOrder.businessDetails?.email || "",
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
