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
    state: businessStoreDetails?.state || businessStoreDetails?.igstnState || "",
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
    signature:"",
    showSignature: false,
    cessList: [],
  };

  // Convert invoice API response for form
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

      // Extract placeOfSupply from client address state
      let placeOfSupply = "";
      let stateCode = "";
      
      if (inv.clientDetails) {
        // Try to get state from address
        if (typeof inv.clientDetails.address === "object" && inv.clientDetails.address) {
          placeOfSupply = (inv.clientDetails.address as any)?.state || "";
        } else if (typeof inv.clientDetails.address === "string") {
          // If address is a string, try to extract state from it
          placeOfSupply = inv.clientDetails.address;
        }
        
        // Try to get stateCode from GSTIN (first 2 characters)
        if (inv.clientDetails.gstin && inv.clientDetails.gstin.length >= 2) {
          stateCode = inv.clientDetails.gstin.substring(0, 2);
        }
      }

      return {
        id: inv._id,
        label: `${inv.invoiceNumber} - ${inv?.clientDetails?.name || "Unknown"}`,
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
        placeOfSupply: placeOfSupply,
        stateCode: stateCode,
      };
    });

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
        setLoading(false);
        return;
      }

      // Extract clientId - handle both string and object formats
      let clientId = values.clientId;
      
      // If clientId is missing or empty, try to get it from the selected invoice
      if (!clientId || clientId.trim() === "") {
        const selectedInvoice = apiInvoices.find(inv => inv._id === values.linkedInvoice);
        if (selectedInvoice) {
          // Handle both string and object formats
          if (typeof selectedInvoice.clientId === "string") {
            clientId = selectedInvoice.clientId;
          } else if (selectedInvoice.clientId && typeof selectedInvoice.clientId === "object") {
            clientId = (selectedInvoice.clientId as any)?._id || "";
          }
        }
      } else {
        // If clientId is provided, ensure it's a string (extract _id if it's an object)
        if (typeof clientId === "object" && clientId !== null) {
          clientId = (clientId as any)?._id || "";
        }
      }

      // Validate clientId is present
      if (!clientId || clientId.trim() === "") {
        toast.error("Client ID is required. Please select a client or ensure the invoice has a client.");
        setLoading(false);
        return;
      }

      const payload = {
        clientId: clientId,
        invoiceId: values.linkedInvoice,
        creditNoteNumber: values.creditNoteNo,
        creditNoteDate: values.creditNoteDate,
        originalInvoiceNumber: values.originalInvoiceNo,
        originalInvoiceDate: values.originalInvoiceDate,
        placeOfSupply: values.placeOfSupply,
        stateCode: values.stateCode,
        reason: values.reason,
        creditType: "quality_issue" as const,
        taxType: values.taxType as "inclusive" | "exclusive" | "none",
        taxConfiguration: values.taxConfiguration,
        discountType: values.discountType as "flat" | "percentage",
        discountValue: values.discountValue,
        shipping: values.shipping,
        roundOff: values.roundOff,
        showHSN: values.showHSN,
        showUnit: values.showUnit,
        signature:values.signature,
        showSignature: values.showSignature,
        priority: "high" as const,
        terms: values.terms,
        notes: values.notes,
        clientSnapshot: values.clientDetails,
        items: values.items.map((i) => ({
          name: i.name,
          hsn: i.hsn || "",
          unit: i.unit || "pcs",
          quantity: i.quantity ?? i.qty ?? 1,
          rate: i.rate || 0,
          discount: i.discount || 0,
          taxType: i.taxType as "cgst_sgst" | "igst" | "none",
          taxRate: i.taxRate ?? i.igst ?? ((i.cgst || 0) + (i.sgst || 0)),
          reason: i.reason || "Quality issue with the product",
          cess: i.cess || [],
        })),
      };

      const response = await createNoteMutation.mutateAsync(payload);

      // Check if the response indicates success
      if (response?.success || response?.data) {
        toast.success(response?.message || "Credit Note Created Successfully");
        router.push("/finance/credit-notes");
      } else {
        toast.error(response?.message || "Error creating credit note");
      }
    } catch (e: any) {
      console.error("Credit note creation error:", e);
      const errorMessage = 
        e?.response?.data?.message || 
        e?.message || 
        "Error creating credit note";
      toast.error(errorMessage);
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
