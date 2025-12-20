import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface UpdatePriorityDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (priority: "low" | "medium" | "high") => void;
  expense: any;
  loading?: boolean;
}

const UpdatePriorityDialog: React.FC<UpdatePriorityDialogProps> = ({
  open,
  onClose,
  onConfirm,
  expense,
  loading,
}) => {
  const [selectedPriority, setSelectedPriority] = useState<
    "low" | "medium" | "high"
  >(expense?.priority || "low");

  const handlePriorityClick = (priority: "low" | "medium" | "high") => {
    setSelectedPriority(priority);
  };

  const handleConfirm = () => {
    onConfirm(selectedPriority);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Priority</DialogTitle>
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
              <span className="text-gray-600">Vendor:</span>
              <span className="font-semibold text-gray-900">
                {expense?.vendorId?.name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Priority:</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold capitalize ${
                  expense?.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : expense?.priority === "medium"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {expense?.priority || "low"}
              </span>
            </div>
          </div>

          {/* Priority Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Select New Priority
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handlePriorityClick("low")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPriority === "low"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg">
                    🟢
                  </span>
                  <span className="text-sm font-medium text-gray-900">Low</span>
                  <span className="text-xs text-gray-500">Normal Priority</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePriorityClick("medium")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPriority === "medium"
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-amber-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-lg">
                    🟡
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    Medium
                  </span>
                  <span className="text-xs text-gray-500">Important</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePriorityClick("high")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPriority === "high"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg">
                    🔴
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    High
                  </span>
                  <span className="text-xs text-gray-500">Urgent</span>
                </div>
              </button>
            </div>
          </div>

          {/* Helpful Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              {selectedPriority === "low" && (
                <>
                  <strong>Low Priority:</strong> Regular expense with normal
                  processing time.
                </>
              )}
              {selectedPriority === "medium" && (
                <>
                  <strong>Medium Priority:</strong> Important expense that needs
                  attention soon.
                </>
              )}
              {selectedPriority === "high" && (
                <>
                  <strong>High Priority:</strong> Urgent expense requiring
                  immediate attention.
                </>
              )}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                >
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
              "Update Priority"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePriorityDialog;
