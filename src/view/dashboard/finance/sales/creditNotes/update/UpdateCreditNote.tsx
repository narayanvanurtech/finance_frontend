"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/stores/financeStore/useClientStore";

import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { useInvoiceStore } from "@/stores/financeStore/useInvoiceStore";
import { useGetCreditNoteById, useUpdateCreditNote } from "../hooks/useCreditNoteQueries";
import CreditNotesForm, { CreditNoteFormValues, Invoice } from "../components/CreditNotesForm";
import { useItems } from "@/hooks/useItemQueries";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

export default function UpdateCreditNote() {
  const params = useParams();
  const router = useRouter();
  const { clients } = useClientStore();
 const { user } = useAuthStore();
    const { data: itemsData } = useItems(user?.companyId || "");
    const items = itemsData?.result?.items || [];
  const { details: businessStoreDetails } = useBussinessStore();
  const { invoices: apiInvoices, fetchInvoices } = useInvoiceStore();
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  // Get credit note ID from URL (id param)
  const creditNoteId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Fetch invoices on mount
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setInvoicesLoading(true);
        await fetchInvoices();
      } catch (error) {
        console.error("Invoice fetch error:", error);
      } finally {
        setInvoicesLoading(false);
      }
    };
    loadInvoices();
  }, [fetchInvoices]);

  // Fetch credit note data
  const { data: creditNoteResponse, isLoading: isFetching } = useGetCreditNoteById(creditNoteId);
  const creditNote = creditNoteResponse?.data;

  // Setup update mutation
  const updateMutation = useUpdateCreditNote(creditNoteId);

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

  const initialValues: CreditNoteFormValues | undefined = useMemo(
    () => {
      if (!creditNote) return undefined;

      // Try to get placeOfSupply and stateCode from creditNote (in case API returns them but interface doesn't define them)
      let placeOfSupply = (creditNote as any).placeOfSupply || "";
      let stateCode = (creditNote as any).stateCode || "";

      // If not in creditNote, derive from clientSnapshot
      if (!placeOfSupply && creditNote.clientSnapshot?.address?.state) {
        placeOfSupply = creditNote.clientSnapshot.address.state;
      }

      // If stateCode not found, derive from GSTIN (first 2 characters)
      if (!stateCode) {
        const gstin = creditNote.clientSnapshot?.gstin || "";
        if (gstin && gstin.length >= 2) {
          stateCode = gstin.substring(0, 2);
        }
      }

      // If still not found, try to get from invoice
      const invoiceId = typeof creditNote.invoiceId === "string" ? creditNote.invoiceId : creditNote.invoiceId?._id || "";
      if ((!placeOfSupply || !stateCode) && invoiceId) {
        const foundInvoice = apiInvoices.find(inv => inv._id === invoiceId);
        if (foundInvoice?.clientDetails) {
          const clientDetails = foundInvoice.clientDetails as any;
          // Try to get placeOfSupply from invoice client details state (check both direct state and address.state)
          if (!placeOfSupply) {
            const invoiceState = clientDetails.state || (typeof clientDetails.address === 'object' && clientDetails.address?.state) || "";
            if (invoiceState) {
              placeOfSupply = invoiceState;
            }
          }
          // Try to get stateCode from invoice client details GSTIN
          if (!stateCode && clientDetails.gstin && clientDetails.gstin.length >= 2) {
            stateCode = clientDetails.gstin.substring(0, 2);
          }
        }
      }

      return {
        creditNoteNo: creditNote.creditNoteNumber,
        creditNoteDate: creditNote.creditNoteDate,
        placeOfSupply: placeOfSupply,
        stateCode: stateCode,
        linkedInvoice: invoiceId,
        originalInvoiceNo: typeof creditNote.invoiceId === "string" 
          ? ""
          : (creditNote.invoiceId as any)?.invoiceNumber || "",
        originalInvoiceDate: typeof creditNote.invoiceId === "string"
          ? ""
          : new Date((creditNote.invoiceId as any)?.date || "").toISOString().slice(0, 10),
        reason: creditNote.reason || "",
        clientId: typeof creditNote.clientId === "string" ? creditNote.clientId : creditNote.clientId?._id || "",
        clientDetails: creditNote.clientSnapshot,
        businessDetails: mappedBusinessDetails,
        taxType: (creditNote.taxType === "exclusive" || creditNote.taxType === "inclusive" ? creditNote.taxType : "exclusive") as "inclusive" | "exclusive",
        taxConfiguration: "SGST_CGST",
        items: creditNote.items,
        discountType: creditNote.discountType || "flat",
        discountValue: creditNote.discountValue || 0,
        shipping: creditNote.shipping || 0,
        roundOff: creditNote.roundOff || false,
        showHSN: creditNote.showHSN || false,
        showUnit: creditNote.showUnit || false,
        terms: creditNote.terms || "",
        notes: creditNote.notes || "",
        attachments: [],
        showSignature: creditNote.showSignature || false,
        cessList: [],
      };
    },
    [creditNote, mappedBusinessDetails, apiInvoices]
  );

  const invoices: Invoice[] = apiInvoices
    .filter((inv): inv is typeof inv & { _id: string } => !!inv._id)
    .map((inv) => ({
      id: inv._id,
      label: `${inv.invoiceNumber} - ${inv?.clientDetails?.name || "Unknown"}`,
      invoiceNo: inv.invoiceNumber,
      invoiceDate: inv.date
        ? new Date(inv.date).toISOString().slice(0, 10)
        : "",
      clientId: inv.clientId,
      clientDetails: inv.clientDetails,
      items: inv.items,
      taxType: inv.taxType,
      taxConfiguration: inv.taxConfiguration,
      discountType: inv.discountType,
      discountValue: inv.discountValue,
      shipping: inv.shipping,
      roundOff: inv.roundOff,
      showHSN: inv.showHSN,
      showUnit: inv.showUnit,
      terms: inv.terms,
      notes: inv.notes,
      cessList: inv.cessList,
    }));
  const reasons: string[] = [
    "Goods returned",
    "Deficiency in services",
    "Price difference",
    "Discount/Allowance",
    "Post-sale discount",
    "Cancellation of sales",
    "Other",
  ];

  if (isFetching || invoicesLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!initialValues) {
    return <div className="p-8 text-center">Credit note not found</div>;
  }

  const handleUpdate = async (values: CreditNoteFormValues) => {
    try {
      const updatePayload = {
        creditNoteNumber: values.creditNoteNo,
        creditNoteDate: values.creditNoteDate,
        reason: values.reason,
        items: values.items,
        taxType: values.taxType,
        discountType: values.discountType as "flat" | "percentage" | undefined,
        discountValue: values.discountValue,
        shipping: values.shipping,
        roundOff: values.roundOff,
        terms: values.terms,
        notes: values.notes,
      };
      await updateMutation.mutateAsync(updatePayload);
      router.push("/finance/credit-notes");
    } catch (error) {
      console.error("Failed to update credit note:", error);
    }
  };

  return (
    <CreditNotesForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      mockClients={clients}
      mockProducts={items}
      invoices={invoices}
      reasons={reasons}
      loading={updateMutation.isPending}
    />
  );
}
