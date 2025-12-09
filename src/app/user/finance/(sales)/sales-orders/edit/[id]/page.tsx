"use client";

import React, { useState } from "react";
import InvoiceForm, { InvoiceFormValues } from "@/finance/invoice/InvoiceForm";
import { useInvoiceStore } from "@/stores/financeStore/useInvoiceStore";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/financeStore/useClientStore";
import { useItemStore } from "@/financeStore/useItemStore";

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { clients } = useClientStore();
  const { items } = useItemStore();
  const { invoices, updateInvoice } = useInvoiceStore();
  const [loading, setLoading] = useState(false);

  // Get invoice number from URL (id param)
  const invoiceNumber = Array.isArray(params.id) ? params.id[0] : params.id;
  const initialValues = invoices.find(inv => inv.invoiceNumber === invoiceNumber);

  if (!initialValues) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const handleUpdate = async (values: InvoiceFormValues) => {
    setLoading(true);
    try {
      await updateInvoice(values.invoiceNumber, values);
      router.push("/dashboard//performa-invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <InvoiceForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      mockClients={clients}
      mockProducts={items}
      loading={loading}
    />
  );
}
