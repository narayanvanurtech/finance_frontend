"use client";

import React, { useState } from "react";
import PurchaseOrderForm, { PurchaseOrderFormValues } from "@/finance/purchaseOrder/PurchaseOrderForm";
import { usePurchaseOrderStore } from "@/financeStore/usePurchaseOrderStore";
import { useVendorStore } from "@/financeStore/useVendorStore";
import { useItemStore } from "@/financeStore/useItemStore";
import { useParams, useRouter } from "next/navigation";

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { vendors } = useVendorStore();
  const { items } = useItemStore();
  const purchaseOrders = usePurchaseOrderStore((state) => state.purchaseOrders);
  const updatePurchaseOrder = usePurchaseOrderStore((state) => state.updatePurchaseOrder);
  const [loading, setLoading] = useState(false);

  // Get purchase order number from URL (id param)
  const purchaseOrderNo = Array.isArray(params.id) ? params.id[0] : params.id;
  const initialValues = purchaseOrders.find(po => po.purchaseOrderNo === purchaseOrderNo);

  if (!initialValues) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const handleUpdate = async (values: PurchaseOrderFormValues) => {
    setLoading(true);
    try {
      await updatePurchaseOrder(values.purchaseOrderNo, values);
      router.push("/dashboard/purchase-order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PurchaseOrderForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      loading={loading}
      mockVendors={vendors}
      mockProducts={items}
    />
  );
} 