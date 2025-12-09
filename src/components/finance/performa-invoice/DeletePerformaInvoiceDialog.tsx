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
import type { PerformaInvoiceFormValues } from "@/components/finance/performa-invoice/PerformaInvoiceForm";

interface DeletePerformaInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  invoice: PerformaInvoiceFormValues | null;
  loading?: boolean;
}

const DeletePerformaInvoiceDialog: React.FC<
  DeletePerformaInvoiceDialogProps
> = ({ open, onClose, onConfirm, invoice, loading }) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-full">
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle>Delete Proforma Invoice</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete this proforma invoice? This action
              cannot be undone.
            </p>
            {invoice && (
              <div className="bg-gray-50 p-3 rounded-lg mt-3">
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Invoice:</strong> {invoice.performaInvoiceNumber}
                  </div>
                  {invoice.performaInvoiceTitle && (
                    <div>
                      <strong>Title:</strong> {invoice.performaInvoiceTitle}
                    </div>
                  )}
                  {invoice.date && (
                    <div>
                      <strong>Date:</strong>{" "}
                      {new Date(invoice.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
            <p className="text-red-600 font-medium">
              ⚠️ Warning: This will permanently delete the proforma invoice and
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
            {loading ? "Deleting..." : "Delete Proforma Invoice"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePerformaInvoiceDialog;
