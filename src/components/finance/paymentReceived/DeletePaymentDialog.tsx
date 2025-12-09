"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";

interface DeletePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  payment?: {
    receiptNo?: string;
    clientName?: string;
    date?: string;
    amount?: number;
  } | null;
  loading?: boolean;
  isBulk?: boolean;
  count?: number;
}

const DeletePaymentDialog: React.FC<DeletePaymentDialogProps> = ({
  open,
  onClose,
  onConfirm,
  payment,
  loading,
  isBulk = false,
  count = 1,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-full">
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle>
              {isBulk
                ? `Delete ${count} Payment Receipts?`
                : `Delete Payment Receipt`}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="space-y-2">
            <p>This action cannot be undone.</p>

            {/* Single delete --> show payment details */}
            {!isBulk && payment && (
              <div className="bg-gray-50 p-3 rounded-lg border mt-3">
                <div className="space-y-1 text-sm">
                  {payment.receiptNo && (
                    <div>
                      <strong>Receipt:</strong> {payment.receiptNo}
                    </div>
                  )}
                  {payment.clientName && (
                    <div>
                      <strong>Client:</strong> {payment.clientName}
                    </div>
                  )}
                  {payment.date && (
                    <div>
                      <strong>Date:</strong>{" "}
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                  )}
                  {payment.amount && (
                    <div>
                      <strong>Amount:</strong> ₹
                      {payment.amount.toLocaleString("en-IN")}
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="text-red-600 font-medium">
              ⚠️ This will permanently delete{" "}
              {isBulk ? `${count} receipts` : `this receipt`}& related data.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={loading}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <FiTrash2 className="w-4 h-4 mr-2" />
            {loading
              ? "Deleting..."
              : isBulk
              ? `Delete ${count}`
              : "Delete Receipt"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePaymentDialog;
