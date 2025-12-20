"use client";

import React, { useState, useEffect } from "react";
import PurchaseOrderForm, {
  PurchaseOrderFormValues,
} from "@/components/finance/purchaseOrder/PurchaseOrderForm";
import { useRouter } from "next/navigation";
import {
  transformFormToCreatePayload,
  validatePurchaseOrderForm,
} from "@/utils/purchaseOrderUtils";
import { toast } from "sonner";
import { useCreatePurchaseOrder } from "@/hooks/usePurchaseOrderQueries";
import { useGetVendors } from "@/hooks/useVendorQueries";
import { useItems } from "@/hooks/useItemQueries";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";

const generatePurchaseOrderNo = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `PO${datePart}${randomPart}`;
};

export default function CreatePurchaseOrderPage() {
  const { data: vendorsData } = useGetVendors();
  const { data: itemsData } = useItems("");
  const { details } = useBussinessStore();
  const { mutate: createPurchaseOrder, isPending } = useCreatePurchaseOrder();
  const router = useRouter();

  const vendors = vendorsData?.result?.vendors || [];
  const items = itemsData?.result?.items || [];
  const businessStoreDetails = details;

  if (!businessStoreDetails) {
    return <div>Loading business details...</div>;
  }

  const mappedBusinessDetails = {
    name: businessStoreDetails.businessName,
    gstin: businessStoreDetails.gstNumber || "",
    address: businessStoreDetails.website || "",
    contact: businessStoreDetails.phone,
    email: "",
  };

  const defaultInitialValues: PurchaseOrderFormValues = {
    purchaseOrderNo: generatePurchaseOrderNo(),
    supplierInvoiceNo: "",
    orderDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    deliveryDate: "",
    vendorId: "",
    vendorDetails: {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    },
    businessDetails: mappedBusinessDetails,
    deliveryAddress: "",
    paymentTerms: "Net 30",
    status: "Draft",
    priority: "Medium",
    referenceNumber: "",
    currency: "INR",
    items: [
      {
        name: "",
        description: "",
        qty: 1,
        rate: 0,
        discount: 0,
        amount: 0,
        hsn: "",
        unit: "pcs",
      },
    ],
    discountType: "flat",
    discountValue: 0,
    shipping: 0,
    roundOff: false,
    showHSN: false,
    showUnit: false,
    terms: "",
    notes: "",
    attachments: [],
    showSignature: false,
  };

  const handleCreate = async (values: PurchaseOrderFormValues) => {
    try {
      // Validate form data
      const validation = validatePurchaseOrderForm(values);
      if (!validation.isValid) {
        toast.error(validation.errors[0]); // Show first error
        return;
      }

      // Transform form values to API payload
      const apiPayload = transformFormToCreatePayload(values);

      // Call API to create purchase order
      createPurchaseOrder(apiPayload, {
        onSuccess: async (response) => {
          toast.success("Purchase order created successfully!");

          // Upload attachments if any (after purchase order is created)
          if (values.attachments && values.attachments.length > 0) {
            try {
              const purchaseOrderId = response.result._id;
              const { addAttachment } = await import(
                "@/api/finance/purchaseOrderApi"
              );

              for (const file of values.attachments) {
                await addAttachment(purchaseOrderId, file);
              }

              toast.success("Attachments uploaded successfully!");
            } catch (attachmentError) {
              console.error("Error uploading attachments:", attachmentError);
              toast.error(
                "Purchase order created, but failed to upload attachments"
              );
            }
          }

          router.push("/finance/purchase-orders");
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "An error occurred while creating the purchase order";
          toast.error(errorMessage);
        },
      });
    } catch (error) {
      console.error("Error creating purchase order:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while creating the purchase order";
      toast.error(errorMessage);
    }
  };

  return (
    <PurchaseOrderForm
      initialValues={defaultInitialValues}
      onSubmit={handleCreate}
      mode="create"
      mockVendors={vendors}
      mockProducts={items}
      loading={isPending}
    />
  );
}
