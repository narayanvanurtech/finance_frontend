"use client";

import React, { useState, useEffect } from "react";
import ExpenseForm, {
  ExpenseFormValues,
} from "@/components/finance/expenses/ExpenseForm";
import { useParams, useRouter } from "next/navigation";
import {
  useGetPurchaseById,
  useUpdatePurchase,
} from "@/hooks/usePurchaseExpenseQueries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const purchaseId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Fetch purchase data - only if purchaseId exists
  const {
    data: purchaseData,
    isLoading,
    isError,
    error,
  } = useGetPurchaseById(purchaseId, !!purchaseId);
  const { mutate: updatePurchase, isPending: isUpdating } = useUpdatePurchase();

  const [initialValues, setInitialValues] = useState<ExpenseFormValues | null>(
    null
  );

  // Debug logging
  useEffect(() => {
    //console.log("Purchase ID:", purchaseId);
    //console.log("Purchase Data:", purchaseData);
    //console.log("Is Loading:", isLoading);
    //console.log("Is Error:", isError);
    //console.log("Error:", error);
  }, [purchaseId, purchaseData, isLoading, isError, error]);

  // Early return if no purchase ID
  if (!purchaseId) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Invalid Expense ID
            </h2>
            <p className="text-gray-600 mb-6">
              No expense ID provided in the URL.
            </p>
            <Link href="/user/finance/expenses">
              <Button className="gap-2">
                <FiArrowLeft />
                Back to Expenses
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    if (purchaseData?.data) {
      const purchase = purchaseData.data as any;

      // Extract vendor details properly from vendorId or vendorSnapshot
      const vendorInfo =
        typeof purchase.vendorId === "object"
          ? purchase.vendorId
          : purchase.vendorSnapshot || {};

      // Create properly structured vendor details like invoice clientDetails
      const vendorDetails = {
        name: vendorInfo.name || vendorInfo.email || "",
        email: vendorInfo.email || "",
        gstin: vendorInfo.gstin || "",
        address: vendorInfo.address || "",
        contact: vendorInfo.phone || vendorInfo.contact || "",
      };

      // Transform API data to form values
      const formValues: ExpenseFormValues = {
        expenseNo: purchase.billNumber || "",
        invoiceNo: purchase.billNumber || "",
        purchaseDate: purchase.billDate
          ? new Date(purchase.billDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        dueDate: "",
        vendorId:
          typeof purchase.vendorId === "object"
            ? purchase.vendorId._id
            : purchase.vendorId || "",
        vendorDetails: vendorDetails,
        businessDetails:
          typeof purchase.companyId === "object" ? purchase.companyId : null,
        items: purchase.items || [],
        discountType: purchase.discountType || "percentage",
        discountValue: purchase.discountValue || 0,
        shipping: purchase.shipping || 0,
        roundOff: purchase.roundOff ?? true,
        showHSN: purchase.showHSN ?? true,
        showUnit: purchase.showUnit ?? true,
        terms: purchase.terms || "",
        notes: purchase.notes || "",
        attachments: [],
        showSignature: purchase.showSignature ?? false,
        expenseCategory: purchase.purchaseType || "goods",
        paymentMode: purchase.paymentStatus || "pending",
      };

      //console.log("📦 Mapped Vendor Details:", vendorDetails);
      setInitialValues(formValues);
    }
  }, [purchaseData]);
  const handleUpdate = async (values: ExpenseFormValues) => {
    // Transform form values to API payload
    const payload = {
      vendorId: values.vendorId,
      billDate: values.purchaseDate,
      taxType: "inclusive" as const,
      discountType: values.discountType as "flat" | "percentage",
      discountValue: values.discountValue || 0,
      shipping: values.shipping || 0,
      roundOff: values.roundOff,
      showHSN: values.showHSN,
      showUnit: values.showUnit,
      showSignature: values.showSignature,
      purchaseType: (values.expenseCategory || "goods") as "goods" | "services",
      priority: "medium" as const,
      items: values.items.map((item: any) => ({
        name: item.name,
        hsn: item.hsn || "",
        unit: item.unit || "pcs",
        quantity: item.quantity || item.qty || 1,
        rate: item.rate || 0,
        discount: item.discount || 0,
        discountType: (item.discountType || "flat") as "flat" | "percentage",
        taxType: item.taxType || "none",
        taxRate: item.taxRate || 0,
      })),
      phases: [],
      terms: values.terms || "",
      notes: values.notes || "",
    };

    updatePurchase(
      { purchaseId, data: payload },
      {
        onSuccess: () => {
          router.push("/user/finance/expenses");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expense...</p>
          <p className="text-xs text-gray-400 mt-2">ID: {purchaseId}</p>
        </div>
      </div>
    );
  }

  if (isError || !initialValues) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Expense Not Found
            </h2>
            <p className="text-gray-600 mb-2">
              The expense you're looking for doesn't exist or has been deleted.
            </p>
            {error && (
              <p className="text-xs text-red-600 mb-4">
                Error: {(error as any)?.message || "Unknown error"}
              </p>
            )}
            <p className="text-xs text-gray-400 mb-6">
              Purchase ID: {purchaseId}
            </p>
            <Link href="/user/finance/expenses">
              <Button className="gap-2">
                <FiArrowLeft />
                Back to Expenses
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <ExpenseForm
        initialValues={initialValues}
        onSubmit={handleUpdate}
        mode="edit"
        loading={isUpdating}
        mockVendors={[]}
        mockProducts={[]}
      />
    </div>
  );
}
