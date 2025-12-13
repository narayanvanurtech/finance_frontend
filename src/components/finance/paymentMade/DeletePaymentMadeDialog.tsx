"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiAlertTriangle } from "react-icons/fi";

interface DeletePaymentMadeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  payment: any;
}

const DeletePaymentMadeDialog: React.FC<DeletePaymentMadeDialogProps> = ({
  open,
  onClose,
  onConfirm,
  loading,
  payment,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <FiAlertTriangle className="w-5 h-5" />
            Delete Payment
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this payment?
          </DialogDescription>
        </DialogHeader>

        {payment && (
          <div className="py-4 space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Receipt Number</p>
              <p className="font-semibold text-gray-900">
                {payment.receiptNo || payment.id}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Vendor</p>
              <p className="font-semibold text-gray-900">
                {typeof payment.vendorId === "string"
                  ? payment.vendorId
                  : payment.vendorId?.name || "Unknown"}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Amount</p>
              <p className="font-semibold text-gray-900">
                ₹{payment.totalAmount?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        )}

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> This action cannot be undone. The payment
            record will be permanently deleted.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
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
                Deleting...
              </>
            ) : (
              "Delete Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePaymentMadeDialog;
