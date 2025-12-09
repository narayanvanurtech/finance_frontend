"use client";

import React, { useState } from "react";
import DebitNotesForm, { DebitNoteFormValues, Invoice } from "@/finance/debitNotes/DebitNotesForm";
import { useVendorStore } from "@/financeStore/useVendorStore";
import { useItemStore } from "@/financeStore/useItemStore";
import { useBussinessStore } from "@/financeStore/useBussinessStore";
import { useDebitNotesStore } from "@/financeStore/useDebitNotesStore";
import { useRouter } from "next/navigation";

const generateDebitNoteNo = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `D${datePart}${randomPart}`;
};

export default function CreateDebitNotePage() {
  const { vendors } = useVendorStore();
  const { items } = useItemStore();
  const { details } = useBussinessStore();
  const createDebitNote = useDebitNotesStore((state) => state.createDebitNote);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const businessStoreDetails = details;

  if (!businessStoreDetails) {
    return <div>Loading business details...</div>;
  }

  const mappedBusinessDetails = {
    name: businessStoreDetails.businessName,
    gstin: businessStoreDetails.gstNumber || "",
    address: businessStoreDetails.website || "",
    contact: businessStoreDetails.phone,
    email: "",
  };

  const defaultInitialValues: DebitNoteFormValues = {
    debitNoteNo: generateDebitNoteNo(),
    debitNoteDate: new Date().toISOString().slice(0, 10),
    linkedInvoice: "",
    reason: "",
    vendorId: "",
    vendorDetails: {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    },
    businessDetails: mappedBusinessDetails,
    items: [
      {
        name: "",
        description: "",
        qty: 1,
        rate: 0,
        discount: 0,
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
  };

  // TODO: Replace with real invoices and reasons
  const invoices: Invoice[] = [];
  const reasons: string[] = [];

  const handleCreate = async (values: DebitNoteFormValues) => {
    setLoading(true);
    try {
      await createDebitNote(values);
      router.push("/dashboard/debit-notes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DebitNotesForm
      initialValues={defaultInitialValues}
      onSubmit={handleCreate}
      mode="create"
      mockVendors={vendors}
      mockProducts={items}
      invoices={invoices}
      reasons={reasons}
      loading={loading}
    />
  );
}
