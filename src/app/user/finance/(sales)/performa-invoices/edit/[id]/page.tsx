"use client";

import React, { useState, useEffect } from "react";
import PerformaInvoiceForm, {
  PerformaInvoiceFormValues,
} from "@/finance/performa-invoice/PerformaInvoiceForm";
import { usePerformaInvoiceStore } from "@/financeStore/usePerformaInvoiceStore";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/financeStore/useClientStore";
import { useItemStore } from "@/financeStore/useItemStore";
import { useBussinessStore } from "@/financeStore/useBussinessStore";

export default function EditPerformaInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { clients } = useClientStore();
  const { items } = useItemStore();
  const { performaInvoices, updatePerformaInvoice, fetchPerformaInvoiceById } =
    usePerformaInvoiceStore();
  const [loading, setLoading] = useState(true);
  const [performaInvoice, setPerformaInvoice] = useState<any>(null);
  const { details: businessStoreDetails } = useBussinessStore();

  // Get invoice number from URL (id param)
  const invoiceNumber = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const loadPerformaInvoice = async () => {
      try {
        // First try to find in store
        let foundInvoice = performaInvoices.find(
          (inv: any) => inv.invoiceNumber === invoiceNumber
        );

        // If not found in store, fetch from API
        if (!foundInvoice) {
          //console.log(
            "Performa Invoice not found in store, fetching from API..."
          );
          const result = await fetchPerformaInvoiceById(invoiceNumber);
          if (result) foundInvoice = result;
        }

        //console.log("Loaded performa invoice:", foundInvoice);
        setPerformaInvoice(foundInvoice);
      } catch (error) {
        console.error("Error loading performa invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPerformaInvoice();
  }, [invoiceNumber, performaInvoices, fetchPerformaInvoiceById]);

  if (loading) {
    return <div className="p-8 text-center">Loading performa invoice...</div>;
  }

  if (!performaInvoice) {
    return <div className="p-8 text-center">Performa Invoice not found</div>;
  }

  // Map business details from store if not present in performa invoice
  const mappedBusinessDetails = businessStoreDetails
    ? {
        name: businessStoreDetails.businessName,
        gstin: businessStoreDetails.gstNumber || "",
        address: businessStoreDetails.website || "",
        contact: businessStoreDetails.phone,
        email: "",
      }
    : {
        name: "",
        gstin: "",
        address: "",
        contact: "",
        email: "",
      };

  // Determine taxConfiguration from items (IGST vs SGST_CGST)
  const determineTaxConfiguration = (): "IGST" | "SGST_CGST" => {
    if (performaInvoice.items && performaInvoice.items.length > 0) {
      const firstItem = performaInvoice.items[0];
      if (firstItem.taxType === "igst" || firstItem.igstAmount) {
        return "IGST";
      }
    }
    return "SGST_CGST";
  };

  // Map performa invoice data to form values with all required fields
  const initialValues: PerformaInvoiceFormValues = {
    type: "performa",
    performaInvoiceTitle: performaInvoice.invoiceTitle || "",
    performaInvoiceNumber: performaInvoice.invoiceNumber,
    invoiceTitle: performaInvoice.invoiceTitle || "",
    invoiceNumber: performaInvoice.invoiceNumber,
    date: performaInvoice.date || new Date().toISOString().slice(0, 10),
    dueDate: performaInvoice.dueDate || "",
    clientId:
      typeof performaInvoice.clientId === "string"
        ? performaInvoice.clientId
        : performaInvoice.clientId?._id || "",
    clientDetails: performaInvoice.clientDetails || {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    },
    businessDetails: performaInvoice.businessDetails || mappedBusinessDetails,
    taxType: determineTaxConfiguration(),
    items: performaInvoice.items || [],
    discountType: performaInvoice.discountType || "flat",
    discountValue: performaInvoice.discountValue || 0,
    shipping: performaInvoice.shipping || 0,
    roundOff:
      performaInvoice.roundOff !== undefined ? performaInvoice.roundOff : false,
    showHSN:
      performaInvoice.showHSN !== undefined ? performaInvoice.showHSN : false,
    showUnit:
      performaInvoice.showUnit !== undefined ? performaInvoice.showUnit : false,
    terms: performaInvoice.terms || "",
    notes: performaInvoice.notes || "",
    attachments: (performaInvoice.attachments || []) as any,
    showSignature:
      performaInvoice.showSignature !== undefined
        ? performaInvoice.showSignature
        : false,
    cessList: performaInvoice.cessList || [],
    phases: performaInvoice.phases || [],
    status: performaInvoice.status,
    _id: performaInvoice._id,
    subtotal: performaInvoice.subtotal,
    totalTax: performaInvoice.totalTax,
    totalCess: performaInvoice.totalCess,
    grandTotal: performaInvoice.grandTotal,
    createdAt: performaInvoice.createdAt,
    updatedAt: performaInvoice.updatedAt,
    quotationId: performaInvoice.quotationId,
    convertedFromQuotation: performaInvoice.convertedFromQuotation,
    validUntil: performaInvoice.validUntil,
  };

  //console.log("Performa Invoice initialValues:", initialValues);

  const handleUpdate = async (values: PerformaInvoiceFormValues) => {
    setLoading(true);
    try {
      await updatePerformaInvoice(
        values.performaInvoiceNumber || values.invoiceNumber || "",
        values
      );
      router.push("/dashboard/performa-invoices");
    } finally {
      setLoading(false);
    }
  };

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
