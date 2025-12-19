"use client";

import React, { useState } from "react";
import DebitNotesForm, {
  DebitNoteFormValues,
  Invoice,
} from "@/finance/debitNotes/DebitNotesForm";
import { useGetVendors } from "@/hooks/useVendorQueries";
import { useGetItems } from "@/hooks/useItemQueries";
import { useCreateDebitNote } from "@/hooks/useDebitNotesQueries";
import { useGetPurchaseOrders } from "@/hooks/usePurchaseOrderQueries";
import { useRouter } from "next/navigation";
import { CreateDebitNotePayload } from "@/api/finance/debitNotesApi";

const generateDebitNoteNo = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `D${datePart}${randomPart}`;
};

export default function CreateDebitNotePage() {
  const router = useRouter();
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");

  // Fetch data using React Query
  const { data: vendorsData, isLoading: vendorsLoading } = useGetVendors();
  const { data: itemsData, isLoading: itemsLoading } = useGetItems();
  const { data: purchaseOrdersData, isLoading: purchaseOrdersLoading } =
    useGetPurchaseOrders();
  const createDebitNoteMutation = useCreateDebitNote();
console.log("puchaseOrdersData",purchaseOrdersData);
  // Extract data from React Query responses
  const vendors = vendorsData?.result?.vendors || [];
  const items = itemsData?.result?.items || [];
  const allPurchaseOrders = purchaseOrdersData?.result?.purchaseOrders || [];
  
  // Filter purchase orders by selected vendor
  const purchaseOrders = selectedVendorId 
    ? allPurchaseOrders.filter((po: any) => {
        const vendorIdStr = typeof po.vendorId === 'object' ? po.vendorId._id || po.vendorId.id : po.vendorId;
        return String(vendorIdStr) === String(selectedVendorId);
      })
    : [];

  // Debug logging
  React.useEffect(() => {
    console.log("🔍 Selected Vendor ID:", selectedVendorId);
    console.log("📦 All Purchase Orders:", allPurchaseOrders.length);
    console.log("📋 Filtered Purchase Orders:", purchaseOrders.length);
    if (purchaseOrders.length > 0) {
      console.log("🎯 Sample PO:", purchaseOrders[0]);
    }
  }, [selectedVendorId, allPurchaseOrders, purchaseOrders]);

  // For now, using placeholder business details
  // You can add a separate query for business details if needed
  const mappedBusinessDetails = {
    name: "Your Business Name",
    gstin: "",
    address: "",
    contact: "",
    email: "",
  };

  const defaultInitialValues: DebitNoteFormValues = {
    debitNoteNo: generateDebitNoteNo(),
    debitNoteDate: new Date().toISOString().slice(0, 10),
    linkedInvoice: "",
    reason: "",
    purchaseId: "",
    originalBillNumber: "",
    debitType: "",
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
        discountType: "flat",
        amount: 0,
        hsn: "",
        unit: "pcs",
        igst: 0,
        sgst: 0,
        cgst: 0,
        reason: "",
      },
    ],
    discountType: "flat",
    discountValue: 0,
    shipping: 0,
    roundOff: false,
    showHSN: false,
    showUnit: false,
    taxType: "exclusive",
    taxConfiguration: "IGST",
    cessList: [],
    terms: "",
    notes: "",
    attachments: [],
    showSignature: false,
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

  const handleCreate = async (values: DebitNoteFormValues) => {
    try {
      // Transform form values to API payload
      const payload: CreateDebitNotePayload = {
        vendorId: values.vendorId,
        purchaseId: values.purchaseId,
        debitNoteDate: values.debitNoteDate,
        originalBillNumber: values.originalBillNumber,
        originalBillDate: values.debitNoteDate, // You may need to adjust this
        debitType: values.debitType as
          | "quality_issue"
          | "price_difference"
          | "excess_billing"
          | "return"
          | "other",
        reason: values.reason,
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
          reason: item.reason || values.reason, // Use item reason if provided, otherwise use general reason
        })),
        terms: values.terms,
        notes: values.notes,
      };

      await createDebitNoteMutation.mutateAsync(payload);
      router.push("/user/finance/debit-notes");
    } catch (error) {
      console.error("Error creating debit note:", error);
    }
  };

  // Show loading state if data is being fetched
  if (vendorsLoading || itemsLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <DebitNotesForm
      initialValues={defaultInitialValues}
      onSubmit={handleCreate}
      mode="create"
      mockVendors={vendors}
      mockProducts={items}
      invoices={invoices}
      reasons={reasons}
      purchaseOrders={purchaseOrders}
      onVendorChange={setSelectedVendorId}
      loading={createDebitNoteMutation.isPending}
    />
  );
}
