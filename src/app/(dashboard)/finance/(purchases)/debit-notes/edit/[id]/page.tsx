"use client";

import React, { useState } from "react";
import DebitNotesForm, {
  DebitNoteFormValues,
  Invoice,
} from "@/finance/debitNotes/DebitNotesForm";

import { useParams, useRouter } from "next/navigation";
import { useGetVendorsWithPurchases } from "@/hooks/useVendorQueries";
import { useGetItems } from "@/hooks/useItemQueries";
import {
  useGetDebitNoteById,
  useUpdateDebitNote,
} from "@/hooks/useDebitNotesQueries";
import { UpdateDebitNotePayload } from "@/api/finance/debitNotesApi";

export default function EditDebitNotePage() {
  const params = useParams();
  const router = useRouter();
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");

  // Get debit note ID from URL
  const debitNoteId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Fetch data using React Query
  const { data: vendorsData, isLoading: vendorsLoading } =
    useGetVendorsWithPurchases(1, 100);
  const { data: itemsData, isLoading: itemsLoading } = useGetItems();
  const {
    data: debitNoteData,
    isLoading: debitNoteLoading,
    isError,
  } = useGetDebitNoteById(debitNoteId);
  const updateDebitNoteMutation = useUpdateDebitNote();

  console.log("sdfdsfsdfsdfdsfdsfdsfsd", debitNoteData);

  // Extract data from React Query responses
  const vendors = vendorsData?.result?.vendors || [];
  const items = itemsData?.result?.items || [];

  // Get purchase orders for the selected vendor
  const selectedVendor = vendors.find(
    (vendor) => vendor._id === selectedVendorId
  );

  // Map purchases to the format expected by the form
  const purchaseOrders =
    selectedVendor?.purchases?.map((purchase) => ({
      _id: purchase._id,
      purchaseOrderNumber: purchase.billNumber,
      purchaseOrderDate: purchase.billDate,
      vendorId: purchase.vendorId,
      paymentStatus: purchase.paymentStatus,
      totalPaidAmount: purchase.totalPaidAmount,
      priority: purchase.priority,
    })) || [];

  const debitNote = debitNoteData?.data;

  // Set the selected vendor ID from the debit note data
  React.useEffect(() => {
    if (debitNote?.vendorId) {
      const vendorId =
        typeof debitNote.vendorId === "string"
          ? debitNote.vendorId
          : debitNote.vendorId._id;
      setSelectedVendorId(vendorId);
    }
  }, [debitNote]);

  const mappedBusinessDetails = {
    name: "Your Business Name",
    gstin: "",
    address: "",
    contact: "",
    email: "",
  };

  // Map invoices from store to dropdown format
  // TODO: Add invoice query hook when available
  const invoices: Invoice[] = [];

  // Common reasons for debit notes
  const reasons: string[] = [
    "Goods returned due to defect",
    "Goods returned due to quality issues",
    "Wrong goods delivered",
    "Price difference adjustment",
    "Quantity short received",
    "Damaged goods received",
    "Late delivery penalty",
    "Service not as per agreement",
    "Incorrect billing adjustment",
    "Other",
  ];

  // Show loading state
  if (vendorsLoading || itemsLoading || debitNoteLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Show error state
  if (isError || !debitNote) {
    return <div className="p-8 text-center">Error loading debit note</div>;
  }

  // Transform debit note data to form values
  const initialValues: DebitNoteFormValues = {
    debitNoteNo: debitNote.debitNoteNumber,
    debitNoteDate: debitNote.debitNoteDate.split("T")[0],
    linkedInvoice: debitNote.originalBillNumber,
    reason: debitNote.reason,
    purchaseId: debitNote.purchaseId?._id || "",
    originalBillNumber: debitNote.originalBillNumber || "",
    debitType: debitNote.debitType || "",
    vendorId: debitNote.vendorId?._id || debitNote.vendorId,
    vendorDetails:  {
      name: debitNote.vendorId?.name,
      gstin: debitNote.vendorId?.gstin,
      address: debitNote.vendorId?.address,
      contact: debitNote.vendorId?.phone,
      email: debitNote.vendorId?.email,
    },
    businessDetails: mappedBusinessDetails,
    items: debitNote.items.map((item) => ({
      name: item.name,
      description: item.description || "",
      qty: item.quantity,
      rate: item.rate,
      discount: item.discount || 0,
      discountType: item.discountType || "flat",
      amount: item.amount || 0,
      hsn: item.hsn || "",
      unit: item.unit || "pcs",
      igst: item.igstAmount || 0,
      sgst: item.sgstAmount || 0,
      cgst: item.cgstAmount || 0,
      reason: item.reason || "",
    })),
    discountType: debitNote.discountType,
    discountValue: debitNote.discountValue,
    shipping: debitNote.shipping,
    roundOff: debitNote.roundOff,
    showHSN: debitNote.showHSN,
    showUnit: debitNote.showUnit,
    taxType: debitNote.taxType,
    taxConfiguration: "IGST",
    cessList: [],
    terms: debitNote.terms || "",
    notes: debitNote.notes || "",
    attachments: [], // Attachments will need to be handled separately
    showSignature: debitNote.showSignature,
  };

  const handleUpdate = async (values: DebitNoteFormValues) => {
    try {
      // Transform form values to API payload
      const payload: UpdateDebitNotePayload = {
        vendorId: values.vendorId,
        reason: values.reason,
        purchaseId: values.purchaseId,
        debitNoteDate: values.debitNoteDate,
        originalBillNumber: values.originalBillNumber,
        debitType: values.debitType as
          | "quality_issue"
          | "price_difference"
          | "excess_billing"
          | "return"
          | "other",
        taxType: values.taxType as "inclusive" | "exclusive",
        discountType: values.discountType as "flat" | "percentage",
        discountValue: values.discountValue,
        shipping: values.shipping,
        roundOff: values.roundOff,
        showHSN: values.showHSN,
        showUnit: values.showUnit,
        showSignature: values.showSignature,
        items: values.items.map((item) => ({
          name: item.name,
          description: item.description,
          hsn: item.hsn,
          unit: item.unit,
          quantity: item.qty,
          rate: item.rate,
          discount: item.discount,
          discountType: item.discountType,
          taxType: values.taxConfiguration === "IGST" ? "igst" : "cgst_sgst",
          taxRate: item.igst || item.cgst + item.sgst,
          reason: item.reason,
        })),
        terms: values.terms,
        notes: values.notes,
      };

      await updateDebitNoteMutation.mutateAsync({
        debitNoteId,
        data: payload,
      });
      router.push("/finance/debit-notes");
    } catch (error) {
      console.error("Error updating debit note:", error);
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
      purchaseOrders={purchaseOrders}
      onVendorChange={setSelectedVendorId}
      loading={updateDebitNoteMutation.isPending}
    />
  );
}
