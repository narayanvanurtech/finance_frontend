"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetPayoutReceiptById,
  useUpdatePayoutReceipt,
} from "@/hooks/usePaymentMadeQueries";
import { UpdatePayoutReceiptPayload } from "@/api/finance/paymentMadeApi";

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

  const handleSubmit = async (values: UpdatePayoutReceiptPayload) => {
    try {
      await updatePaymentMutation.mutateAsync({
        receiptId: id as string,
        data: values,
      });
      router.push("/finance/payments-made");
    } catch (error) {
      console.error("Failed to update payment:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Payment</h1>
        <p className="text-gray-600 mt-1">
          Update payment details for {payment.receiptNo}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const values: UpdatePayoutReceiptPayload = {
              purpose: formData.get("purpose") as string,
              internalNotes: formData.get("internalNotes") as string,
            };
            handleSubmit(values);
          }}
        >
          {/* Payment Info (Read-only) */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt Number
                </label>
                <input
                  type="text"
                  value={payment.receiptNo}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor
                </label>
                <input
                  type="text"
                  value={
                    typeof payment.vendorId === "string"
                      ? payment.vendorId
                      : payment.vendorId?.name || "Unknown"
                  }
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="text"
                  value={new Date(payment.receiptDate).toLocaleDateString()}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <input
                  type="text"
                  value={`₹${payment.totalAmount?.toLocaleString()}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="purpose"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Purpose
              </label>
              <input
                type="text"
                id="purpose"
                name="purpose"
                defaultValue={payment.purpose || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter payment purpose"
              />
            </div>

            <div>
              <label
                htmlFor="internalNotes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Internal Notes
              </label>
              <textarea
                id="internalNotes"
                name="internalNotes"
                rows={4}
                defaultValue={payment.internalNotes || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add internal notes (not visible to vendor)"
              />
            </div>
          </div>

          {/* Payment Records Display */}
          {payment.paymentRecords && payment.paymentRecords.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Records
              </h3>
              <div className="space-y-3">
                {payment.paymentRecords.map((record, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Method:</span>
                        <p className="font-medium capitalize">
                          {record.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <p className="font-medium">
                          ₹{record.amountPaid?.toLocaleString()}
                        </p>
                      </div>
                      {record.tdsDeductedAmount && (
                        <div>
                          <span className="text-gray-600">TDS:</span>
                          <p className="font-medium">
                            ₹{record.tdsDeductedAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {record.referenceId && (
                        <div>
                          <span className="text-gray-600">Reference:</span>
                          <p className="font-medium">{record.referenceId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={updatePaymentMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatePaymentMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {updatePaymentMutation.isPending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  Updating...
                </>
              ) : (
                "Update Payment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
