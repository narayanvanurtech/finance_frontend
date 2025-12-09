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

interface DeliveryChallan {
  _id?: string;
  deliveryChallanNumber?: string;
  clientId?:
    | {
        businessName?: string;
        email?: string;
        phone?: string;
      }
    | string;
  date?: string;
  status?: string;
}

interface DeleteDeliveryChallanDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  challan: DeliveryChallan | null;
  loading?: boolean;
}

const DeleteDeliveryChallanDialog: React.FC<
  DeleteDeliveryChallanDialogProps
> = ({ open, onClose, onConfirm, challan, loading }) => {
  const clientName =
    typeof challan?.clientId === "object"
      ? challan?.clientId?.businessName || challan?.clientId?.email || "N/A"
      : "N/A";

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-full">
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle>Delete Delivery Challan</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete this delivery challan? This action
              cannot be undone.
            </p>
            {challan && (
              <div className="bg-gray-50 p-3 rounded-lg mt-3">
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Challan No:</strong>{" "}
                    {challan.deliveryChallanNumber || "N/A"}
                  </div>
                  {clientName !== "N/A" && (
                    <div>
                      <strong>Client:</strong> {clientName}
                    </div>
                  )}
                  {challan.date && (
                    <div>
                      <strong>Date:</strong>{" "}
                      {new Date(challan.date).toLocaleDateString()}
                    </div>
                  )}
                  {challan.status && (
                    <div>
                      <strong>Status:</strong>{" "}
                      <span className="capitalize">{challan.status}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <p className="text-red-600 font-medium">
              ⚠️ Warning: This will permanently delete the delivery challan and
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
            {loading ? "Deleting..." : "Delete Delivery Challan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDeliveryChallanDialog;
