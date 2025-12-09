"use client";

import React, { useState } from "react";
import ExpenseForm, { ExpenseFormValues } from "@/finance/expenses/ExpenseForm";
import { useVendorStore } from "@/financeStore/useVendorStore";
import { useItemStore } from "@/financeStore/useItemStore";
import { useBussinessStore } from "@/financeStore/useBussinessStore";
import { useExpenseStore } from "@/financeStore/useExpenseStore";
import { useRouter } from "next/navigation";

const generateExpenseNo = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `A${datePart}${randomPart}`;
};

export default function CreateExpensePage() {
  const { vendors } = useVendorStore();
  const { items } = useItemStore();
  const { details } = useBussinessStore();
  const createExpense = useExpenseStore((state) => state.createExpense);
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
    expenseCategory: "",
    paymentMode: "",
  };

  const handleCreate = async (values: ExpenseFormValues) => {
    setLoading(true);
    try {
      await createExpense(values);
      router.push("/dashboard/expenses");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExpenseForm
      initialValues={defaultInitialValues}
      onSubmit={handleCreate}
      mode="create"
      mockVendors={vendors}
      mockProducts={items}
      loading={loading}
    />
  );
}
