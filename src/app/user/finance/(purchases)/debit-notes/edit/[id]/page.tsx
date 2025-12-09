"use client";

import React, { useState } from "react";
import DebitNotesForm, { DebitNoteFormValues, Invoice } from "@/finance/debitNotes/DebitNotesForm";
import { useDebitNotesStore } from "@/financeStore/useDebitNotesStore";
import { useParams, useRouter } from "next/navigation";
import { useVendorStore } from "@/financeStore/useVendorStore";
import { useItemStore } from "@/financeStore/useItemStore";
import { useBussinessStore } from "@/financeStore/useBussinessStore";

export default function EditDebitNotePage() {
  const params = useParams();
  const router = useRouter();
  const { vendors } = useVendorStore();
  const { items } = useItemStore();
  const { debitNotes, updateDebitNote } = useDebitNotesStore();
  const [loading, setLoading] = useState(false);
  const { details: businessStoreDetails } = useBussinessStore();

  // Get debit note number from URL (id param)
  const debitNoteNo = Array.isArray(params.id) ? params.id[0] : params.id;
  const debitNote = debitNotes.find(note => note.debitNoteNo === debitNoteNo);

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

  const initialValues: DebitNoteFormValues | undefined = debitNote
    ? {
        ...debitNote,
        businessDetails: debitNote.businessDetails || mappedBusinessDetails,
      }
    : undefined;

  // TODO: Replace with real invoices and reasons
  const invoices: Invoice[] = [];
  const reasons: string[] = [];

  if (!initialValues) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const handleUpdate = async (values: DebitNoteFormValues) => {
    setLoading(true);
    try {
      await updateDebitNote(values.debitNoteNo, values);
      router.push("/dashboard/debit-notes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DebitNotesForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      mockVendors={vendors}
      mockProducts={items}
      invoices={invoices}
      reasons={reasons}
      loading={loading}
    />
  );
}
