"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/stores/financeStore/useClientStore";

import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { useInvoiceStore } from "@/stores/financeStore/useInvoiceStore";
import {
  useGetCreditNoteById,
  useUpdateCreditNote,
} from "../hooks/useCreditNoteQueries";
import CreditNotesForm, {
  CreditNoteFormValues,
  Invoice,
} from "../components/CreditNotesForm";
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
  const {
    data: creditNoteResponse,
    isLoading: isFetching,
    error: fetchError,
  } = useGetCreditNoteById(creditNoteId);
  const creditNote = creditNoteResponse?.data;

  // Debug logging
  useEffect(() => {
    if (creditNoteResponse) {
      console.log("Credit Note Response:", creditNoteResponse);
      console.log("Credit Note Data:", creditNote);
    }
    if (fetchError) {
      console.error("Error fetching credit note:", fetchError);
    }
  }, [creditNoteResponse, creditNote, fetchError]);

  // Setup update mutation
  const updateMutation = useUpdateCreditNote(creditNoteId);

  const mappedBusinessDetails = businessStoreDetails
    ? {
        name: businessStoreDetails.businessName,
        gstin: businessStoreDetails.gstNumber || "",
        address: businessStoreDetails.website || "",
        contact: businessStoreDetails.phone,
        email: "",
        state:
          businessStoreDetails.state || businessStoreDetails.igstnState || "",
      }
    : {
        name: "",
        gstin: "",
        address: "",
        contact: "",
        email: "",
        state: "",
      };

  const formatDate = (date?: string) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  };

  const initialValues: CreditNoteFormValues | undefined = useMemo(() => {
    if (!creditNote) return undefined;

    // Extract invoiceId (handle both string and object formats)
    const invoiceId =
      typeof creditNote.invoiceId === "string"
        ? creditNote.invoiceId
        : creditNote.invoiceId?._id || "";

    // Extract clientId (handle both string and object formats)
    const clientIdValue =
      typeof creditNote.clientId === "string"
        ? creditNote.clientId
        : creditNote.clientId?._id || "";

    // Get placeOfSupply and stateCode from API response
    let placeOfSupply = (creditNote as any).placeOfSupply || "";
    let stateCode = (creditNote as any).stateCode || "";

    // If not in creditNote, derive from clientId object (API sends full client object)
    if (
      !placeOfSupply &&
      typeof creditNote.clientId === "object" &&
      creditNote.clientId
    ) {
      const clientObj = creditNote.clientId as any;
      placeOfSupply = clientObj.address?.state || "";
    }

    // If stateCode not found, derive from clientId object GSTIN
    if (
      !stateCode &&
      typeof creditNote.clientId === "object" &&
      creditNote.clientId
    ) {
      const clientObj = creditNote.clientId as any;
      const gstin = clientObj.gstin || "";
      if (gstin && gstin.length >= 2) {
        stateCode = gstin.substring(0, 2);
      }
    }

    // Fallback: If still not found, derive from clientSnapshot
    if (!placeOfSupply && creditNote.clientSnapshot?.address?.state) {
      placeOfSupply = creditNote.clientSnapshot.address.state;
    }

    if (!stateCode && creditNote.clientSnapshot?.gstin) {
      const gstin = creditNote.clientSnapshot.gstin;
      if (gstin && gstin.length >= 2) {
        stateCode = gstin.substring(0, 2);
      }
    }

    // Build clientDetails from clientId object if available, otherwise use clientSnapshot
    let clientDetailsValue: any = creditNote.clientSnapshot;
    if (typeof creditNote.clientId === "object" && creditNote.clientId) {
      const clientObj = creditNote.clientId as any;
      clientDetailsValue = {
        name: clientObj.businessName || clientObj.fullName || "",
        gstin: clientObj.gstin || "",
        address:
          typeof clientObj.address === "string"
            ? clientObj.address
            : clientObj.address?.street ||
              clientObj.address?.city ||
              clientObj.address?.state ||
              "",
        phone: clientObj.phone || "",
        email: clientObj.email || "",
        state: clientObj.address?.state || "",
      };
    } else if (clientDetailsValue) {
      // Ensure state is included in clientSnapshot
      clientDetailsValue = {
        ...clientDetailsValue,
        state: clientDetailsValue.address?.state || "",
      };
    }

    // Get taxConfiguration from invoice or items
    let taxConfiguration = (creditNote as any).taxConfiguration || "";
    if (!taxConfiguration && creditNote.items && creditNote.items.length > 0) {
      const firstItem = creditNote.items[0] as any;
      taxConfiguration = firstItem.taxType === "igst" ? "IGST" : "SGST_CGST";
    }
    if (!taxConfiguration) taxConfiguration = "SGST_CGST";

    // Get tax type from invoice object if available
    let taxType = (creditNote as any).taxType || "exclusive";
    if (typeof creditNote.invoiceId === "object" && creditNote.invoiceId) {
      const invoiceObj = creditNote.invoiceId as any;
      taxType = invoiceObj.taxType || taxType;
    }

    return {
      creditNoteNo: creditNote.creditNoteNumber,
      creditNoteDate: formatDate(creditNote.creditNoteDate),
      placeOfSupply: placeOfSupply,
      stateCode: stateCode,
      linkedInvoice: invoiceId,
      originalInvoiceNo:
        (creditNote as any).originalInvoiceNumber ||
        (typeof creditNote.invoiceId === "object"
          ? (creditNote.invoiceId as any)?.invoiceNumber || ""
          : ""),
      originalInvoiceDate: (creditNote as any).originalInvoiceDate
        ? formatDate((creditNote as any).originalInvoiceDate)
        : typeof creditNote.invoiceId === "object"
        ? formatDate((creditNote.invoiceId as any)?.date)
        : "",
      reason: creditNote.reason || "",
      clientId: clientIdValue,
      clientDetails: clientDetailsValue,
      businessDetails: mappedBusinessDetails,
      taxType: (taxType === "exclusive" || taxType === "inclusive"
        ? taxType
        : "exclusive") as "inclusive" | "exclusive",
      taxConfiguration: taxConfiguration as "IGST" | "SGST_CGST",
      items: creditNote.items || [],
      discountType: creditNote.discountType || "flat",
      discountValue: creditNote.discountValue || 0,
      shipping: creditNote.shipping || 0,
      roundOff:
        (creditNote as any).roundOff !== undefined
          ? (creditNote as any).roundOff
          : false,
      showHSN:
        (creditNote as any).showHSN !== undefined
          ? (creditNote as any).showHSN
          : false,
      showUnit:
        (creditNote as any).showUnit !== undefined
          ? (creditNote as any).showUnit
          : false,
      terms: (creditNote as any).terms || "",
      notes: (creditNote as any).notes || "",
      attachments: [],
      signature: (creditNote as any).signature || "",
      reason:(creditNote as any).reason || "",
      showSignature:
        (creditNote as any).showSignature !== undefined
          ? (creditNote as any).showSignature
          : false,
      cessList: (creditNote as any).cessList || [],
    };
  }, [creditNote, mappedBusinessDetails, apiInvoices]);

  const invoices: Invoice[] = apiInvoices
    .filter((inv): inv is typeof inv & { _id: string } => !!inv._id)
    .map((inv) => {
      // Extract clientId - handle both string and object formats
      let clientId = "";
      if (typeof inv.clientId === "string") {
        clientId = inv.clientId;
      } else if (inv.clientId && typeof inv.clientId === "object") {
        clientId = (inv.clientId as any)?._id || "";
      }

      return {
        id: inv._id,
        label: `${inv.invoiceNumber} - ${
          inv?.clientDetails?.name || "Unknown"
        }`,
        invoiceNo: inv.invoiceNumber,
        invoiceDate: inv.date
          ? new Date(inv.date).toISOString().slice(0, 10)
          : "",
        clientId: clientId,
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
      };
    });
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

  if (fetchError) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>
          Error loading credit note: {fetchError.message || "Unknown error"}
        </p>
        <button
          onClick={() => router.push("/finance/credit-notes")}
          className="mt-4 text-blue-600 underline"
        >
          Go back to Credit Notes
        </button>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="p-8 text-center">
        <p>Credit note not found</p>
        <button
          onClick={() => router.push("/finance/credit-notes")}
          className="mt-4 text-blue-600 underline"
        >
          Go back to Credit Notes
        </button>
      </div>
    );
  }

  const handleUpdate = async (values: CreditNoteFormValues) => {
    try {
      const updatePayload = {
        creditNoteNumber: values.creditNoteNo,
        creditNoteDate: values.creditNoteDate,
        originalInvoiceNumber: values.originalInvoiceNo,
        originalInvoiceDate: values.originalInvoiceDate,
        placeOfSupply: values.placeOfSupply,
        stateCode: values.stateCode,
        reason: values.reason,
        items: values.items.map((i) => ({
          name: i.name,
          hsn: i.hsn || "",
          unit: i.unit || "pcs",
          quantity: i.quantity ?? i.qty ?? 1,
          rate: i.rate || 0,
          discount: i.discount || 0,
          taxType: i.taxType as "cgst_sgst" | "igst" | "none",
          taxRate: i.taxRate ?? i.igst ?? (i.cgst || 0) + (i.sgst || 0),
          reason: i.reason || "",
          cess: i.cess || [],
        })),
        taxType: values.taxType,
        taxConfiguration: values.taxConfiguration,
        discountType: values.discountType as "flat" | "percentage" | undefined,
        discountValue: values.discountValue,
        shipping: values.shipping,
        roundOff: values.roundOff,
        showHSN: values.showHSN,
        showUnit: values.showUnit,
        reason:values.reason,
        signature:values.signature,
        showSignature: values.showSignature,
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
