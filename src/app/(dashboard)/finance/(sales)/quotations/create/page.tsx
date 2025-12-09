"use client";

import React, { useState, useEffect } from "react";
import { usePerformaInvoiceStore } from "@/stores/financeStore/usePerformaInvoiceStore";
import QuotationForm, {
  QuotationFormValues,
} from "@/components/finance/quotation/QuotationForm";
import { useQuotationStore } from "@/stores/financeStore/useQuotationStore";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useRouter } from "next/navigation";
import { useItemStore } from "@/stores/financeStore/useItemStore";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { CreateQuotationPayload } from "@/api/finance/quotationApi";
import { toast } from "sonner";

export default function CreateQuotationPage() {
  const { clients } = useClientStore();
  const { items } = useItemStore();
  const { createQuotation, previewQuotationNumber } = useQuotationStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { details } = useBussinessStore();
  const businessStoreDetails = details;
  const [quotationNumber, setQuotationNumber] = useState("");
  const [showConvertToInvoice, setShowConvertToInvoice] = useState(false);
  const { duplicatePerformaInvoice } = usePerformaInvoiceStore();

  // Fetch quotation number on component mount
  useEffect(() => {
    const fetchQuotationNumber = async () => {
      try {
        const number = await previewQuotationNumber();
        setQuotationNumber(number);
      } catch (error: any) {
        const datePart = new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        setQuotationNumber(`QTN-${datePart}-${randomPart}`);
      }
    };

    fetchQuotationNumber();
  }, [previewQuotationNumber]);

  // if (!businessStoreDetails) {
  //   return <div>Loading business details...</div>;
  // }
  const mappedBusinessDetails = {
    name: details?.businessName || "",
    gstin: details?.gstNumber || "",
    igstn: details?.igstn || "",
    state: details?.state || "",
    address: details?.website || "",
    contact: details?.phone || "",
    email: "",
  };

  const defaultInitialValues: QuotationFormValues = {
    quotationTitle: "",
    quotationNumber: quotationNumber,
    date: new Date().toISOString().slice(0, 10),
    dueDate: "",
    clientId: "",
    clientDetails: {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    },
    businessDetails: mappedBusinessDetails,
    taxType: "exclusive",
    taxConfiguration: "SGST_CGST",
    cessList: [],
    items: [
      {
        name: "",
        description: "",
        quantity: 1,
        unit: "Hours",
        rate: 0,
        discount: 0,
        taxType: "cgst_sgst",
        taxRate: 18,
        amount: 0,
        hsn: "",
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
    phases: [],
  };

  const handleCreate = async (values: QuotationFormValues) => {
    setLoading(true);
    try {
      // Validate clientId
      if (!values.clientId || values.clientId.trim() === "") {
        toast.error("Please select a client");
        setLoading(false);
        return;
      }
      // Validate items
      if (!values.items || values.items.length === 0) {
        toast.error("Please add at least one item");
        setLoading(false);
        return;
      }

      // Sanitize items
      const sanitizedItems = values.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discount: Number(item.discount),
        taxRate: Number(item.taxRate),
      }));

      // Sanitize phases
      const sanitizedPhases =
        values.phases?.map((phase) => ({
          ...phase,
          percentage: Number(phase.percentage),
        })) || [];

      // Sanitize attachments
      const sanitizedAttachments = Array.isArray(values.attachments)
        ? values.attachments.filter((att) => att && Object.keys(att).length > 0)
        : [];

      // Sanitize emails - ensure they are strings (not undefined)
      const sanitizedBusinessDetails = {
        ...values.businessDetails,
        email:
          values.businessDetails.email &&
          values.businessDetails.email.trim() !== ""
            ? values.businessDetails.email
            : "",
      };
      const sanitizedClientDetails = {
        ...values.clientDetails,
        email:
          values.clientDetails.email && values.clientDetails.email.trim() !== ""
            ? values.clientDetails.email
            : "",
      };

      // Map cessList to API format
      const payload: CreateQuotationPayload = {
        ...values,
        companyId: user?.companyId || "",
        quotationNumber: quotationNumber,
        items: sanitizedItems,
        phases: sanitizedPhases,
        attachments: sanitizedAttachments,
        businessDetails: sanitizedBusinessDetails,
        clientDetails: sanitizedClientDetails,
        cessList:
          values.cessList?.map((cess) => ({
            name: cess.name,
            rate: cess.value ? Number(cess.value) : 0,
            showInInvoice: cess.showInInvoice,
          })) || [],
      };
      await createQuotation(payload);
      toast.success("Quotation created successfully");
      router.push("/finance/quotations"); // Redirect to quotations listing
    } catch (error: any) {
      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Error creating quotation"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!quotationNumber) {
    return <div>Loading...</div>;
  }

  const handleConvertToInvoice = async () => {
    try {
      setLoading(true);
      // You need the quotationId to duplicate as performa invoice
      // Here, we assume quotationNumber is the id (update if you use _id)
      await duplicatePerformaInvoice(quotationNumber);
      toast.success("Converted to Performa Invoice successfully");
      router.push("/finance/performa-invoices");
    } catch (error: any) {
      toast.error(error?.message || "Failed to convert to invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <QuotationForm
        initialValues={defaultInitialValues}
        onSubmit={handleCreate}
        mode="create"
        mockClients={clients}
        mockProducts={items}
        loading={loading}
        onSendEmail={() => {
          router.push(`/finance/quotations/email/${quotationNumber}`);
          setShowConvertToInvoice(true); // Show Convert to Invoice after sending email
        }}
      />
      {showConvertToInvoice && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={handleConvertToInvoice}
            style={{
              padding: "10px 20px",
              background: "#4F46E5",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Convert to Invoice
          </button>
        </div>
      )}
    </div>
  );
}
