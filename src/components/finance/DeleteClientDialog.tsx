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
import { Client } from "@/stores/financeStore/useClientStore";

interface DeleteClientDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  client: Client | null;
  loading?: boolean;
}

const DeleteClientDialog: React.FC<DeleteClientDialogProps> = ({
  open,
  onClose,
  onConfirm,
  client,
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
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete this client? This action cannot be
              undone.
            </p>
            {client && (
              <div className="bg-gray-50 p-3 rounded-lg mt-3">
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Business Name:</strong> {client.businessName}
                  </div>
                  {client.email && (
                    <div>
                      <strong>Email:</strong> {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div>
                      <strong>Phone:</strong> {client.phone}
                    </div>
                  )}
                  {client.gstin && (
                    <div>
                      <strong>GSTIN:</strong> {client.gstin}
                    </div>
                  )}
                </div>
              </div>
            )}
            <p className="text-red-600 font-medium">
              ⚠️ Warning: This will permanently delete the client and all
              associated data.
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
            {loading ? "Deleting..." : "Delete Client"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteClientDialog;
