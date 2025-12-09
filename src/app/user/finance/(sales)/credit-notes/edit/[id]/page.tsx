"use client";

import React, { useState } from "react";
import CreaditNotesForm, {
  CreditNoteFormValues,
  Invoice,
} from "@/finance/creditNotes/CreaditNotesForm";
import { useCreditNoteStore } from "@/financeStore/useCreditNoteStore";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/financeStore/useClientStore";
import { useItemStore } from "@/financeStore/useItemStore";
import { useBussinessStore } from "@/financeStore/useBussinessStore";

export default function EditCreditNotePage() {
  const params = useParams();
  const router = useRouter();
  const { clients } = useClientStore();
  const { items } = useItemStore();
  const { creditNotes, updateNote } = useCreditNoteStore();
  const [loading, setLoading] = useState(false);
  const { details: businessStoreDetails } = useBussinessStore();

  // Get credit note number from URL (id param)
  const creditNoteNo = Array.isArray(params.id) ? params.id[0] : params.id;
  const creditNote = creditNotes.find(
    (note) => note.creditNoteNo === creditNoteNo
  );

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

  const initialValues: CreditNoteFormValues | undefined = creditNote
    ? {
        ...creditNote,
        businessDetails: creditNote.businessDetails || mappedBusinessDetails,
      }
    : undefined;

  // TODO: Replace with real invoices and reasons
  const invoices: Invoice[] = [];
  const reasons: string[] = [];

  if (!initialValues) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const handleUpdate = async (values: CreditNoteFormValues) => {
    setLoading(true);
    try {
      const companyId = ""; // TODO: Get from auth/context
      await updateNote(values.creditNoteNo, values, companyId);
      router.push("/dashboard/credit-notes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreaditNotesForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      mockClients={clients}
      mockProducts={items}
      invoices={invoices}
      reasons={reasons}
      loading={loading}
    />
  );
}
