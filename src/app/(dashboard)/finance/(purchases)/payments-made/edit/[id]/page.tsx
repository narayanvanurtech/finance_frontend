"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  useGetPayoutReceiptById,
  useUpdatePayoutReceipt,
} from "@/hooks/usePaymentMadeQueries";
import { UpdatePayoutReceiptPayload } from "@/api/finance/paymentMadeApi";
import PaymentsMadeForm, {
  PaymentsMadeFormValues,
} from "@/components/finance/paymentsMade/PaymentsMadeForm";

export default function PaymentsMadeEditPage() {
  const { id } = useParams();
  const router = useRouter();

  // Fetch payment data
  const {
    data: paymentData,
    isLoading,
    isError,
  } = useGetPayoutReceiptById(id as string);

  // Update mutation
  const updatePaymentMutation = useUpdatePayoutReceipt();

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !paymentData?.result) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Payment Not Found
          </h2>
          <p className="text-red-600 mb-4">
            The payment you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => router.push("/finance/payments-made")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Back to Payments
          </button>
        </div>
      </div>
    );
  }

  const payment = paymentData.result;

  // Debug: Log payment data
  //console.log("📋 Payment Data:", payment);
  //console.log("📋 Allocations:", payment.allocations);

  // Convert payment data to form values format
  const getVendorId = () => {
    if (typeof payment.vendorId === "string") {
      return payment.vendorId;
    }
    return payment.vendorId?._id || "";
  };

  // Get the first purchase order ID from allocations
  const getPurchaseOrderId = () => {
    const allocation = payment.allocations?.find((a) => a.purchaseId);
    //console.log("🔍 Found Allocation:", allocation);

    if (!allocation) return "";

    // Handle if purchaseId is an object or string
    if (typeof allocation.purchaseId === "string") {
      //console.log("✅ Purchase ID (string):", allocation.purchaseId);
      return allocation.purchaseId;
    }

    const poId = (allocation.purchaseId as any)?._id || "";
    //console.log("✅ Purchase ID (object):", poId);
    return poId;
  };

  const purchaseOrderId = getPurchaseOrderId();

  const initialFormValues: PaymentsMadeFormValues = {
    vendorId: getVendorId(),
    receiptDate: payment.receiptDate
      ? new Date(payment.receiptDate).toISOString().split("T")[0]
      : "",
    paymentType: payment.paymentType || "Payment",
    paymentRecords: payment.paymentRecords || [],
    allocations: payment.allocations || [],
    purpose: payment.purpose || "",
    internalNotes: payment.internalNotes || "",
    // Backward compatibility for form
    paymentNo: payment.receiptNumber || payment.receiptNo || "",
    amountPaid:
      payment.totalGrossAmount?.toString() ||
      payment.totalAmountPaid?.toString() ||
      payment.totalAmount?.toString() ||
      "",
    paymentMode: payment.paymentRecords?.[0]?.paymentMethod || "",
    paidThrough: payment.paymentRecords?.[0]?.paidFrom || "",
    referenceNo: payment.paymentRecords?.[0]?.referenceId || "",
    selectedPurchases: purchaseOrderId ? [purchaseOrderId] : [],
    notes: payment.paymentRecords?.[0]?.notes || "",
  };

  
  const handleSubmit = async (values: PaymentsMadeFormValues) => {
    try {
      const updatePayload: UpdatePayoutReceiptPayload = {
        purpose: values.purpose,
        internalNotes: values.internalNotes,
        paymentRecords: values.paymentRecords,
        paymentType:values.paymentType,
      };

      await updatePaymentMutation.mutateAsync({
        receiptId: id as string,
        data: updatePayload,
      });

      // Toast is already handled in the mutation hook
      router.push("/finance/payments-made");
    } catch (error) {
      // Error toast is also handled in the mutation hook
      console.error("Failed to update payment:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <PaymentsMadeForm
        initialValues={initialFormValues}
        mode="edit"
        onSubmit={handleSubmit}
        loading={updatePaymentMutation.isPending}
      />
    </div>
  );
}
