"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import PerformaInvoiceForm, {
  PerformaInvoiceFormValues,
} from "@/components/finance/performa-invoice/PerformaInvoiceForm";
import { usePerformaInvoiceStore } from "@/stores/financeStore/usePerformaInvoiceStore";
import { useItems } from "@/hooks/useItemQueries";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

export default function EditPerformaInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { clients } = useClientStore();
const { user } = useAuthStore();
const { data: itemsData } = useItems(user?.companyId || "");
const items = itemsData?.result?.items || [];

  const { fetchPerformaInvoiceById } = usePerformaInvoiceStore();
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<
    PerformaInvoiceFormValues | undefined
  >(undefined);
  const { details: businessStoreDetails } = useBussinessStore();

  // Get invoice ID from URL (id param)
  const invoiceId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        if (invoiceId) {
          const invoice = await fetchPerformaInvoiceById(invoiceId);
          console.log("Fetched Performa Invoice:", invoice);
          console.log(
            "📊 Business Details from fetch:",
            invoice?.businessDetails
          );
          if (invoice) {
            setInitialValues(invoice);
          }
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId, fetchPerformaInvoiceById]);

  if (loading) {
    return <div className="p-8 text-center">Loading invoice...</div>;
  }

  if (!initialValues) {
    return <div className="p-8 text-center">Invoice not found</div>;
  }

  const handleUpdate = async (values: PerformaInvoiceFormValues) => {
    setLoading(true);
    try {
      // Use the performa invoice's backend ID (_id)
      const performaIdentifier = (initialValues as any)._id;
      if (!performaIdentifier) {
        throw new Error("Performa Invoice ID not found");
      }
      await usePerformaInvoiceStore
        .getState()
        .updatePerformaInvoice(initialValues.performaInvoiceNumber, values);
      router.push("/finance/performa-invoices");
    } catch (error) {
      console.error("Error updating performa invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const initialItems = [
    {
      name: "",
      description: "",
      qty: 1,
      rate: 0,
      discount: 0,
      igst: 0,
      sgst: 0,
      cgst: 0,
      amount: 0,
      hsn: "",
      unit: "pcs",
    },
  ];

  return (
    <PerformaInvoiceForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      mockClients={clients}
      mockProducts={items}
      loading={loading}
    />
  );
}
