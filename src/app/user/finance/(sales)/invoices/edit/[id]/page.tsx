"use client";

import React, { useState, useEffect } from "react";
import InvoiceForm, { InvoiceFormValues } from "@/finance/invoice/InvoiceForm";
import { useInvoiceStore } from "@/financeStore/useInvoiceStore";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/financeStore/useClientStore";
import { useItemStore } from "@/financeStore/useItemStore";
import { useBussinessStore } from "@/financeStore/useBussinessStore";
import { toast } from "sonner";

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { clients } = useClientStore();
  const { items } = useItemStore();
  const { invoices, updateInvoice, fetchInvoiceById } = useInvoiceStore();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const { details: businessStoreDetails } = useBussinessStore();

  // Get invoice ID from URL (id param)
  const invoiceId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        // First try to find in store by _id
        let foundInvoice = invoices.find((inv: any) => inv._id === invoiceId);

        // If not found in store, fetch from API
        if (!foundInvoice) {
          //console.log("Invoice not found in store, fetching from API...");
          const result = await fetchInvoiceById(invoiceId);
          if (result) foundInvoice = result;
        }

        //console.log("Loaded invoice:", foundInvoice);
        setInvoice(foundInvoice);
      } catch (error) {
        console.error("Error loading invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId, invoices, fetchInvoiceById]);

  if (loading) {
    return <div className="p-8 text-center">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="p-8 text-center">Invoice not found</div>;
  }

  // Map business details from store if not present in invoice
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
    if (invoice.items && invoice.items.length > 0) {
      const firstItem = invoice.items[0];
      if (firstItem.taxType === "igst" || firstItem.igstAmount) {
        return "IGST";
      }
    }
    return "SGST_CGST";
  };

  // Map invoice data to form values with all required fields
  const initialValues: InvoiceFormValues = {
    type: "invoice",
    invoiceTitle: invoice.invoiceTitle || "",
    invoiceNumber: invoice.invoiceNumber,
    date: invoice.date || new Date().toISOString().slice(0, 10),
    dueDate: invoice.dueDate || "",
    clientId:
      typeof invoice.clientId === "string"
        ? invoice.clientId
        : invoice.clientId?._id || "",
    clientDetails: invoice.clientDetails || {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    },
    businessDetails: invoice.businessDetails || mappedBusinessDetails,
    taxType: invoice.taxType || "exclusive",
    taxConfiguration: determineTaxConfiguration(),
    items: invoice.items || [],
    discountType: invoice.discountType || "flat",
    discountValue: invoice.discountValue || 0,
    shipping: invoice.shipping || 0,
    roundOff: invoice.roundOff !== undefined ? invoice.roundOff : false,
    showHSN: invoice.showHSN !== undefined ? invoice.showHSN : false,
    showUnit: invoice.showUnit !== undefined ? invoice.showUnit : false,
    terms: invoice.terms || "",
    notes: invoice.notes || "",
    attachments: (invoice.attachments || []) as any,
    showSignature:
      invoice.showSignature !== undefined ? invoice.showSignature : false,
    cessList: invoice.cessList || [],
    phases: invoice.phases || [],
    status: invoice.status,
    _id: invoice._id,
  };

  //console.log("📝 Invoice Edit - Initial Values:", initialValues);
  //console.log("📎 Attachments:", initialValues.attachments);
  //console.log("✍️ Signature:", initialValues.showSignature);
  //console.log("👤 Client Details:", initialValues.clientDetails);
  //console.log("🏢 Business Details:", initialValues.businessDetails);

  const handleUpdate = async (values: InvoiceFormValues) => {
    setLoading(true);
    try {
      // Use invoice _id for update
      const invoiceId = (values as any)._id;
      await updateInvoice(invoiceId, values);
      toast.success("Invoice updated successfully!");
      router.push("/dashboard/invoices");
    } catch (error: any) {
      console.error("Error updating invoice:", error);
      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Failed to update invoice"
      );
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
