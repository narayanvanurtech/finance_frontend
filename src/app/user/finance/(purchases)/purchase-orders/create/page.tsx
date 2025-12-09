"use client";

import React, { useState } from "react";
import PurchaseOrderForm, { PurchaseOrderFormValues } from "@/finance/purchaseOrder/PurchaseOrderForm";
import { useVendorStore } from "@/financeStore/useVendorStore";
import { useItemStore } from "@/financeStore/useItemStore";
import { useBussinessStore } from "@/financeStore/useBussinessStore";
// You will need to implement usePurchaseOrderStore
import { usePurchaseOrderStore } from "@/financeStore/usePurchaseOrderStore";
import { useRouter } from "next/navigation";

const generatePurchaseOrderNo = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `PO${datePart}${randomPart}`;
};

export default function CreatePurchaseOrderPage() {
  const { vendors } = useVendorStore();
  const { items } = useItemStore();
  const { details } = useBussinessStore();
  const createPurchaseOrder = usePurchaseOrderStore((state) => state.createPurchaseOrder);
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
      await createPurchaseOrder(values);
      router.push("/dashboard/purchase-order");
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