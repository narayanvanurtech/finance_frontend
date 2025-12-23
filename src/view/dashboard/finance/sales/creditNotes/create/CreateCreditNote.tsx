"use client";

import React, { useState, useEffect } from "react";

import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useItems } from "@/hooks/useItemQueries";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { useInvoiceStore } from "@/stores/financeStore/useInvoiceStore";
import { useCreateCreditNote } from "../hooks/useCreditNoteQueries";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CreditNotesForm, { CreditNoteFormValues, Invoice } from "../components/CreditNotesForm";

const generateCreditNoteNo = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `A${datePart}${randomPart}`;
};

export default function CreateCreditNote() {
  const { clients } = useClientStore();
 const { user } = useAuthStore();
    const { data: itemsData } = useItems(user?.companyId || "");
    const items = itemsData?.result?.items || [];
  const { details } = useBussinessStore();
  const createNoteMutation = useCreateCreditNote();
  const { invoices: apiInvoices, fetchInvoices } = useInvoiceStore();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const businessStoreDetails = details;

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setInvoicesLoading(true);
        if (user?.companyId) await fetchInvoices();
      } catch (error) {
        console.error("Invoice fetch error:", error);
      } finally {
        setInvoicesLoading(false);
      }
    };
    loadInvoices();
  }, [fetchInvoices, user?.companyId]);

  // if (!businessStoreDetails)
  //   return (
  //     <div className="h-screen flex items-center justify-center text-lg">
  //       Loading business details...
  //     </div>
  //   );


  if (!user?.companyId)
    return (
      <div className="h-screen flex items-center justify-center text-lg text-red-500">
        Company ID not found. Login again.
      </div>
    );

  const mappedBusinessDetails = {
    name: businessStoreDetails?.businessName,
    gstin: businessStoreDetails?.gstNumber || "",
    address: businessStoreDetails?.website || "",
    contact: businessStoreDetails?.phone,
    email: "",
  };

  const defaultInitialValues: CreditNoteFormValues = {
    creditNoteNo: generateCreditNoteNo(),
    creditNoteDate: new Date().toISOString().slice(0, 10),
    placeOfSupply: "",
    stateCode: "",
    linkedInvoice: "",
    originalInvoiceNo: "",
    originalInvoiceDate: "",
    reason: "",
    clientId: "",
    clientDetails: { name: "", gstin: "", address: "", contact: "", email: "" },
    businessDetails: mappedBusinessDetails,

    taxType: "exclusive",
    taxConfiguration: "SGST_CGST",

    items: [
      {
        name: "",
        qty: 1,
        quantity: 1,
        rate: 0,
        discount: 0,
        taxType: "cgst_sgst",
        taxRate: 0,
        igst: 0,
        sgst: 0,
        cgst: 0,
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
    cessList: [],
  };

  // Convert invoice API response for form
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

  const reasons = [
    "Goods returned",
    "Deficiency in services",
    "Price difference",
    "Discount/Allowance",
    "Post-sale discount",
    "Cancellation of sales",
    "Other",
  ];

  /* -------------------------------------------------------------
     FINAL: BACKEND REQUIRED PAYLOAD BUILDER → No mapper needed
     -------------------------------------------------------------*/
  const handleCreate = async (values: CreditNoteFormValues) => {
    setLoading(true);

    try {
      if (!values.linkedInvoice) {
        toast.error("Select Invoice first — invoiceId missing");
        return;
      }

      const payload = {
        clientId: values.clientId,
        invoiceId: values.linkedInvoice,
        creditNoteNumber: values.creditNoteNo,
        creditNoteDate: values.creditNoteDate,
        reason: values.reason,
        creditType: "quality_issue" as const,
        taxType: values.taxType as "inclusive" | "exclusive" | "none",
        discountType: values.discountType as "flat" | "percentage",
        discountValue: values.discountValue,
        shipping: values.shipping,
        roundOff: values.roundOff,
        showHSN: values.showHSN,
        showUnit: values.showUnit,
        showSignature: values.showSignature,
        priority: "high" as const,
        terms: values.terms,
        notes: values.notes,

        items: values.items.map((i) => ({
          name: i.name,
          hsn: i.hsn,
          unit: i.unit,
          quantity: i.quantity ?? i.qty,
          rate: i.rate,
          discount: i.discount,
          taxType: i.taxType as "cgst_sgst" | "igst" | "none",
          taxRate: i.taxRate ?? i.igst ?? i.cgst + i.sgst,
          reason: "Quality issue with the product",
        })),
      };

      await createNoteMutation.mutateAsync(payload);

      toast.success("Credit Note Created Successfully");
      router.push("/finance/credit-notes");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Error creating note");
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreditNotesForm
      initialValues={defaultInitialValues}
      onSubmit={handleCreate}
      mode="create"
      mockClients={clients}
      mockProducts={items}
      invoices={invoices}
      reasons={reasons}
      loading={loading}
    />
  );
}
