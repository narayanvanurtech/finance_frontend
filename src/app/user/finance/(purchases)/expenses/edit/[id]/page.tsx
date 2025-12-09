"use client";

import React, { useState } from "react";
import ExpenseForm, { ExpenseFormValues } from "@/finance/expenses/ExpenseForm";
import { useExpenseStore } from "@/financeStore/useExpenseStore";
import { useVendorStore } from "@/financeStore/useVendorStore";
import { useItemStore } from "@/financeStore/useItemStore";
import { useParams, useRouter } from "next/navigation";

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const { vendors } = useVendorStore();
  const { items } = useItemStore();
  const expenses = useExpenseStore((state) => state.expenses);
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const [loading, setLoading] = useState(false);

  // Get expense number from URL (id param)
  const expenseNo = Array.isArray(params.id) ? params.id[0] : params.id;
  const initialValues = expenses.find(e => e.expenseNo === expenseNo);

  if (!initialValues) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const handleUpdate = async (values: ExpenseFormValues) => {
    setLoading(true);
    try {
      await updateExpense(values.expenseNo, values);
      router.push("/dashboard/expenses");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExpenseForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      loading={loading}
      mockVendors={vendors}
      mockProducts={items}
    />
  );
}

