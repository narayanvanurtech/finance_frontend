"use client";

import React, { useState, useEffect } from "react";
import PerformaInvoiceForm, {
  PerformaInvoiceFormValues,
} from "@/components/finance/performa-invoice/PerformaInvoiceForm";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useItemStore } from "@/stores/financeStore/useItemStore";
import { usePerformaInvoiceStore } from "@/stores/financeStore/usePerformaInvoiceStore";
import { useRouter } from "next/navigation";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { toast } from "sonner";

const generateInvoiceNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `PINV-${datePart}-${randomPart}`;
};

export default function CreatePerformaInvoicePage() {
  const router = useRouter();
  const { clients, fetchClients } = useClientStore();
  const { items } = useItemStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const createPerformaInvoice = usePerformaInvoiceStore(
    (state) => state.createPerformaInvoice
  );
  const previewPerformaInvoiceNumber = usePerformaInvoiceStore(
    (state) => state.previewPerformaInvoiceNumber
  );
  const { details } = useBussinessStore();
  const businessStoreDetails = details;
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Debug: Check if business details exist
  useEffect(() => {
    console.log("🏢 Business Details from Store:", businessStoreDetails);
  }, [businessStoreDetails]);

  // Fetch performa invoice number on component mount
  useEffect(() => {
    const fetchInvoiceNumber = async () => {
      try {
        const number = await previewPerformaInvoiceNumber();
        setInvoiceNumber(number);
      } catch (error: any) {
        console.error("❌ API ERROR:", error);
        console.log("❌ API RESPONSE:", error.response?.data);
        console.log("❌ API STATUS:", error.response?.status);
        // Fallback to manual generation
        setInvoiceNumber(generateInvoiceNumber());
      }
    };

    fetchInvoiceNumber();
  }, [previewPerformaInvoiceNumber]);

  // Fetch clients on mount
  useEffect(() => {
    if (user?.companyId) {
      console.log("Fetching clients for company:", user.companyId);
      fetchClients(user.companyId);
    }
  }, [user?.companyId, fetchClients]);

  // State for initial items (for bulk invoice)
  const [initialItems, setInitialItems] = useState<
    PerformaInvoiceFormValues["items"]
  >([
    {
      name: "",
      description: "",
      qty: 1,
      rate: 0,
      discount: 0,
      discountType: "flat",
      igst: 0,
      sgst: 0,
      cgst: 0,
      amount: 0,
      hsn: "",
      unit: "pcs",
    },
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const bulkItems = localStorage.getItem("bulkPerformaInvoiceItems");
      if (bulkItems) {
        try {
          const parsed = JSON.parse(bulkItems);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setInitialItems(
              parsed.map((item: any) => ({
                name: item.name || "",
                description: item.description || "",
                qty: 1,
                rate: item.sellingPrice || 0,
                discount: 0,
                discountType: "flat",
                igst: 0,
                sgst: 0,
                cgst: 0,
                amount: 0,
                hsn: item.hsn || "",
                unit: item.unit || "pcs",
              }))
            );
          }
        } catch (e) {
          // ignore
        }
        localStorage.removeItem("bulkPerformaInvoiceItems");
      }
    }
  }, []);

  const mappedBusinessDetails = {
    name: businessStoreDetails?.businessName || "",
    gstin: businessStoreDetails?.gstNumber || "",
    address: businessStoreDetails?.website || "",
    contact: businessStoreDetails?.phone || "",
    email: "",
  };

  const defaultInitialValues: PerformaInvoiceFormValues = {
    type: "performa",
    performaInvoiceTitle: "",
    performaInvoiceNumber: invoiceNumber || generateInvoiceNumber(),
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
    taxType: "IGST",
    cessList: [],
    items: initialItems,
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

  const handleCreate = async (values: PerformaInvoiceFormValues) => {
    setLoading(true);
    try {
      // Validate clientId is provided
      const clientIdString =
        typeof values.clientId === "string"
          ? values.clientId
          : values.clientId?._id || "";
      if (!clientIdString || clientIdString.trim() === "") {
        toast.error("Please select a client");
        setLoading(false);
        return;
      }

      // Validate items exist
      if (!values.items || values.items.length === 0) {
        toast.error("Please add at least one item");
        setLoading(false);
        return;
      }

      // Sanitize items - convert string numbers to actual numbers
      const sanitizedItems = values.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discount: Number(item.discount),
        taxRate: Number(item.taxRate),
      }));

      // Sanitize phases - convert percentage strings to numbers
      const sanitizedPhases =
        values.phases?.map((phase) => ({
          ...phase,
          percentage: Number(phase.percentage),
        })) || [];

      // Sanitize attachments - remove empty ones
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

      // Create payload with sanitized values
      const sanitizedValues = {
        ...values,
        items: sanitizedItems,
        phases: sanitizedPhases,
        attachments: sanitizedAttachments,
        businessDetails: sanitizedBusinessDetails,
        clientDetails: sanitizedClientDetails,
      };

      // Call the store's createPerformaInvoice with sanitized values
      await createPerformaInvoice(sanitizedValues);

      // Success - redirect to performa invoices list
      router.push("/finance/performa-invoices");
    } catch (error: any) {
      console.error("Error creating performa invoice:", error);
      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Error creating performa invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PerformaInvoiceForm
      initialValues={defaultInitialValues}
      onSubmit={handleCreate}
      mode="create"
      mockClients={clients}
      mockProducts={items.map((item) => ({
        ...item,
        price: item.sellingPrice,
      }))}
      loading={loading}
    />
  );
}
