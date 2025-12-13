import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpdatePaymentStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (status: "pending" | "partial" | "paid", paidAmount?: number) => void;
  expense: any;
  loading?: boolean;
}

const UpdatePaymentStatusDialog: React.FC<UpdatePaymentStatusDialogProps> = ({
  open,
  onClose,
  onConfirm,
  expense,
  loading,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "partial" | "paid">(
    expense?.paymentStatus || "pending"
  );
  const [paidAmount, setPaidAmount] = useState<number>(
    expense?.paidAmount || 0
  );

  const totalAmount = expense?.grandTotal || expense?.totalAmount || 0;
  const balanceAmount = totalAmount - paidAmount;

  const handleStatusClick = (status: "pending" | "partial" | "paid") => {
    setSelectedStatus(status);
    
    // Auto-set amounts based on status
    if (status === "pending") {
      setPaidAmount(0);
    } else if (status === "paid") {
      setPaidAmount(totalAmount);
    }
    // For partial, user will manually enter amount
  };

  const handleConfirm = () => {
    if (selectedStatus === "partial" && paidAmount <= 0) {
      alert("Please enter paid amount for partial payment");
      return;
    }
    if (selectedStatus === "partial" && paidAmount >= totalAmount) {
      alert("Paid amount should be less than total amount for partial payment");
      return;
    }

    onConfirm(selectedStatus, paidAmount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Payment Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Status Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expense No:</span>
              <span className="font-semibold text-gray-900">
                {expense?.purchaseNumber || expense?.billNumber || "N/A"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold text-gray-900">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Status:</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold capitalize ${
                  expense?.paymentStatus === "paid"
                    ? "bg-green-100 text-green-800"
                    : expense?.paymentStatus === "partial"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {expense?.paymentStatus || "pending"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Paid Amount:</span>
              <span className="font-semibold text-gray-900">
                ₹{(expense?.paidAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Select New Status
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleStatusClick("pending")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedStatus === "pending"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg">
                    🔴
                  </span>
                  <span className="text-sm font-medium text-gray-900">Pending</span>
                  <span className="text-xs text-gray-500">₹0</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleStatusClick("partial")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedStatus === "partial"
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-amber-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-lg">
                    🟡
                  </span>
                  <span className="text-sm font-medium text-gray-900">Partial</span>
                  <span className="text-xs text-gray-500">Custom</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleStatusClick("paid")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedStatus === "paid"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg">
                    🟢
                  </span>
                  <span className="text-sm font-medium text-gray-900">Paid</span>
                  <span className="text-xs text-gray-500">
                    ₹{totalAmount.toFixed(0)}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Amount Input (shown for partial and paid) */}
          {(selectedStatus === "partial" || selectedStatus === "paid") && (
            <div className="space-y-2">
              <Label htmlFor="paidAmount" className="text-sm font-medium text-gray-700">
                Paid Amount <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <Input
                  id="paidAmount"
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="pl-8"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={totalAmount}
                  disabled={selectedStatus === "paid"}
                />
              </div>
              
              {/* Balance Amount Display */}
              <div className="flex justify-between text-sm mt-2 p-2 bg-blue-50 rounded">
                <span className="text-gray-600">Balance Amount:</span>
                <span className="font-semibold text-blue-700">
                  ₹{Math.max(0, balanceAmount).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Helpful Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              {selectedStatus === "pending" && (
                <>
                  <strong>Pending:</strong> No payment has been made yet.
                </>
              )}
              {selectedStatus === "partial" && (
                <>
                  <strong>Partial:</strong> Some payment has been made but not the full amount.
                </>
              )}
              {selectedStatus === "paid" && (
                <>
                  <strong>Paid:</strong> Full payment has been completed.
                </>
              )}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePaymentStatusDialog;
