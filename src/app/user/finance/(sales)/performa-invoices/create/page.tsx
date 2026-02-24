"use client";

import React, { useState, useEffect } from "react";
import PerformaInvoiceForm, {
  PerformaInvoiceFormValues,
} from "@/components/finance/performa-invoice/PerformaInvoiceForm";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useItemStore } from "@/stores/financeStore/useItemStore";
import { usePerformaInvoiceStore } from "@/stores/financeStore/usePerformaInvoiceStore";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { toast } from "sonner";

const generateInvoiceNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `PINV-${datePart}-${randomPart}`;
};

export default function CreatePerformaInvoicePage() {
  const router = useRouter();
  const { clients, fetchClients } = useClientStore();
  const { items } = useItemStore();
  const { details } = useBussinessStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const createPerformaInvoice = usePerformaInvoiceStore(
    (state) => state.createPerformaInvoice
  );
  const previewPerformaInvoiceNumber = usePerformaInvoiceStore(
    (state) => state.previewPerformaInvoiceNumber
  );
  const [invoiceNumber, setInvoiceNumber] = useState("");

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

  const businessStoreDetails = details;

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
    items: [
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
    signature:"",
    phases: [],
  };

  const handleCreate = async (values: PerformaInvoiceFormValues) => {
    console.log("Performa Invoice Data:", values);
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

     const res =  await createPerformaInvoice(values);
      // Success toast is already shown in the store
      router.push("/user/finance/performa-invoices");
    } catch (error: any) {
      console.error("Failed to create performa invoice:", error);
      // Error toast is already shown in the store
      // toast.error(
      //   error?.response?.data?.message || "Failed to create performa invoice"
      // );
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
      mockProducts={items}
      loading={loading}
    />
  );
}
