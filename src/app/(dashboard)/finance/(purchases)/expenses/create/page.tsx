"use client";

import React, { useState, useEffect } from "react";
import ExpenseForm, { ExpenseFormValues } from "@/finance/expenses/ExpenseForm";
import { useVendorStore } from "@/financeStore/useVendorStore";
// import { useItemStore } from "@/financeStore/useItemStore";
import { useBussinessStore } from "@/financeStore/useBussinessStore";
import {
  useCreatePurchase,
  useAddAttachment,
} from "@/hooks/usePurchaseExpenseQueries";
import { useRouter } from "next/navigation";

const generateExpenseNo = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `A${datePart}${randomPart}`;
};

export default function CreateExpensePage() {
  const { vendors, fetchVendors } = useVendorStore();
  // const { items } = useItemStore();
  const { details } = useBussinessStore();
  const { mutate: createPurchase, isPending } = useCreatePurchase();
  const { mutate: addAttachment, isPending: isUploadingAttachment } =
    useAddAttachment();
  const router = useRouter();
  const businessStoreDetails = details;

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // if (!businessStoreDetails) {
  //   return <div>Loading business details...</div>;
  // }

  const mappedBusinessDetails = {
    name: businessStoreDetails?.businessName,
    gstin: businessStoreDetails?.gstNumber || "",
    address: businessStoreDetails?.website || "",
    contact: businessStoreDetails?.phone,
    email: "",
  };

  const defaultInitialValues: ExpenseFormValues = {
    expenseNo: generateExpenseNo(),
    invoiceNo: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
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
        quantity: 1,
        rate: 0,
        discount: 0,
        discountType: "flat",
        taxType: "cgst_sgst",
        taxRate: 0,
        igst: 0,
        sgst: 0,
        cgst: 0,
        cess: [],
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
    expenseCategory: "",
    paymentMode: "",
    phases: [],
    taxType: "exclusive",
  };

  const handleCreate = async (values: ExpenseFormValues) => {
    // Transform ExpenseFormValues to CreatePurchasePayload
    const purchaseData = {
      vendorId: values.vendorId,
      billDate: values.purchaseDate,
      taxType: (values.taxType || "exclusive") as "inclusive" | "exclusive",
      discountType: values.discountType as "flat" | "percentage",
      discountValue: values.discountValue,
      shipping: values.shipping,
      roundOff: values.roundOff,
      showHSN: values.showHSN,
      showUnit: values.showUnit,
      showSignature: values.showSignature,
      purchaseType: "goods" as const,
      priority: "medium" as const,
      items: values.items.map((item) => {
        // Calculate taxRate based on item configuration
        let taxRate = 0;
        let taxType: "cgst_sgst" | "igst" | "nil" = "nil";
        
        if (item.taxType === "igst" && item.igst) {
          taxType = "igst";
          taxRate = Number(item.igst) || 0;
        } else if (item.taxType === "cgst_sgst" || (item.sgst && item.cgst)) {
          taxType = "cgst_sgst";
          taxRate = (Number(item.sgst) || 0) + (Number(item.cgst) || 0);
        } else if (item.taxRate) {
          taxRate = Number(item.taxRate);
          taxType = item.taxType || "cgst_sgst";
        }

        return {
          name: item.name,
          hsn: item.hsn || "",
          unit: item.unit || "pcs",
          quantity: Number(item.qty) || Number(item.quantity) || 1,
          rate: Number(item.rate) || 0,
          discount: Number(item.discount) || 0,
          discountType: (item.discountType as "flat" | "percentage") || "flat",
          taxType: taxType,
          taxRate: taxRate,
          cess: item.cess && Array.isArray(item.cess) ? item.cess : [],
        };
      }),
      phases: values.phases && values.phases.length > 0 ? values.phases : undefined,
      terms: values.terms,
      notes: values.notes,
    };

    createPurchase(purchaseData, {
      onSuccess: (response) => {
        const newPurchaseId = response.data._id;

        // Upload attachments if any
        if (values.attachments && values.attachments.length > 0) {
          values.attachments.forEach((file) => {
            addAttachment(
              { purchaseId: newPurchaseId, data: { file } },
              {
                onSuccess: () => {
                  console.log(`Attachment ${file.name} uploaded successfully`);
                },
                onError: (error) => {
                  console.error(`Failed to upload ${file.name}:`, error);
                },
              }
            );
          });
        }

        router.push("/finance/expenses");
      },
    });
  };

  return (
    <ExpenseForm
      initialValues={defaultInitialValues}
      onSubmit={handleCreate}
      mode="create"
      mockVendors={vendors}
      // mockProducts={items}
      loading={isPending || isUploadingAttachment}
    />
  );
}
