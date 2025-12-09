"use client";

import React, { useState } from "react";
import PurchaseOrderForm, { PurchaseOrderFormValues } from "@/components/finance/purchaseOrder/PurchaseOrderForm";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";
import { useItemStore } from "@/stores/financeStore/useItemStore";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { usePurchaseOrderStore } from "@/stores/financeStore/usePurchaseOrderStore";
import { useRouter } from "next/navigation";
import { transformFormToCreatePayload, validatePurchaseOrderForm } from "@/utils/purchaseOrderUtils";
import { toast } from "sonner";

const generatePurchaseOrderNo = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `PO${datePart}${randomPart}`;
};

export default function CreatePurchaseOrderPage() {
  const { vendors } = useVendorStore();
  const { items } = useItemStore();
  const { details } = useBussinessStore();
  const createPurchaseOrderApi = usePurchaseOrderStore((state) => state.createPurchaseOrderApi);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    vendorId: "",
    vendorDetails: {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    },
    businessDetails: mappedBusinessDetails,
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
    setLoading(true);
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
      const result = await createPurchaseOrderApi(apiPayload);
      
      if (result) {
        toast.success("Purchase order created successfully!");
        router.push("/dashboard/finance/purchase-orders");
      } else {
        toast.error("Failed to create purchase order");
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while creating the purchase order";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PurchaseOrderForm
      initialValues={defaultInitialValues}
      onSubmit={handleCreate}
      mode="create"
      mockVendors={vendors}
      mockProducts={items}
      loading={loading}
    />
  );
} 