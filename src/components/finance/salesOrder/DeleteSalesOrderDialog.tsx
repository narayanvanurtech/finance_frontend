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
import type { SalesOrder } from "@/api/finance/salesOrderApi";

interface DeleteSalesOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: SalesOrder | null;
  loading?: boolean;
}

const DeleteSalesOrderDialog: React.FC<DeleteSalesOrderDialogProps> = ({
  open,
  onClose,
  onConfirm,
  order,
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
            <AlertDialogTitle>Delete Sales Order</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete this sales order? This action
              cannot be undone.
            </p>
            {order && (
              <div className="bg-gray-50 p-3 rounded-lg mt-3">
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Order:</strong> {order.orderNumber}
                  </div>
                  {order.orderTitle && (
                    <div>
                      <strong>Title:</strong> {order.orderTitle}
                    </div>
                  )}
                  {order.orderDate && (
                    <div>
                      <strong>Date:</strong>{" "}
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
            <p className="text-red-600 font-medium">
              ⚠️ Warning: This will permanently delete the sales order and
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
            {loading ? "Deleting..." : "Delete Sales Order"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSalesOrderDialog;
