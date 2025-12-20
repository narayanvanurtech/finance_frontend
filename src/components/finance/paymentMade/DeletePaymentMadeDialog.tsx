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

interface DeletePaymentMadeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  payment: any | null;
  loading?: boolean;
}

const DeletePaymentMadeDialog: React.FC<DeletePaymentMadeDialogProps> = ({
  open,
  onClose,
  onConfirm,
  payment,
  loading,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-full">
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
          </div>

          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete this payment? This action cannot
              be undone.
            </p>

            {payment && (
              <div className="bg-gray-50 p-3 rounded-lg mt-3">
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Receipt No:</strong>{" "}
                    {payment.receiptNo || payment._id}
                  </div>

                  {payment.vendorId && (
                    <div>
                      <strong>Vendor:</strong>{" "}
                      {typeof payment.vendorId === "string"
                        ? payment.vendorId
                        : payment.vendorId?.name || "Unknown"}
                    </div>
                  )}

                  {payment.paymentDate && (
                    <div>
                      <strong>Payment Date:</strong>{" "}
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </div>
                  )}

                  {payment.paymentMethod && (
                    <div>
                      <strong>Payment Method:</strong>{" "}
                      <span className="capitalize">
                        {payment.paymentMethod}
                      </span>
                    </div>
                  )}

                  {payment.totalAmount && (
                    <div>
                      <strong>Amount:</strong> ₹
                      {payment.totalAmount.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="text-red-600 font-medium">
              ⚠️ Warning: This will permanently delete the payment record and
              all associated data.
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
            {loading ? "Deleting..." : "Delete Payment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePaymentMadeDialog;
