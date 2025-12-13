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
import type { PurchaseOrder } from "@/api/finance/purchaseOrderApi";

interface DeletePurchaseOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  purchaseOrder: PurchaseOrder | null;
  loading?: boolean;
}

const DeletePurchaseOrderDialog: React.FC<DeletePurchaseOrderDialogProps> = ({
  open,
  onClose,
  onConfirm,
  purchaseOrder,
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
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete this purchase order? This action
              cannot be undone.
            </p>
            {purchaseOrder && (
              <div className="bg-gray-50 p-3 rounded-lg mt-3">
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>PO Number:</strong>{" "}
                    {purchaseOrder.purchaseOrderNumber}
                  </div>
                  <div>
                    <strong>Vendor:</strong>{" "}
                    {typeof purchaseOrder.vendorId === "string"
                      ? purchaseOrder.vendorId
                      : purchaseOrder.vendorDetails?.name || "N/A"}
                  </div>
                  {purchaseOrder.purchaseOrderDate && (
                    <div>
                      <strong>Date:</strong>{" "}
                      {new Date(
                        purchaseOrder.purchaseOrderDate
                      ).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <strong>Status:</strong>{" "}
                    <span className="capitalize">
                      {purchaseOrder.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <p className="text-red-600 font-medium">
              ⚠️ Warning: This will permanently delete the purchase order and
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
            {loading ? "Deleting..." : "Delete Purchase Order"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePurchaseOrderDialog;
