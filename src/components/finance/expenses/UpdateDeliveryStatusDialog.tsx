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

interface UpdateDeliveryStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (receivedQuantity: number) => void;
  expense: any;
  loading?: boolean;
}

const UpdateDeliveryStatusDialog: React.FC<UpdateDeliveryStatusDialogProps> = ({
  open,
  onClose,
  onConfirm,
  expense,
  loading,
}) => {
  const [receivedQuantity, setReceivedQuantity] = useState<number>(0);

  // Calculate total quantity from purchase items
  const totalQuantity = expense?.items?.reduce((sum: number, item: any) => {
    return sum + (item.quantity || 0);
  }, 0) || 0;

  const pendingQuantity = totalQuantity - receivedQuantity;

  const handleConfirm = () => {
    if (receivedQuantity < 0) {
      alert("Received quantity cannot be negative");
      return;
    }
    if (receivedQuantity > totalQuantity) {
      alert(`Received quantity cannot exceed total quantity (${totalQuantity})`);
      return;
    }

    onConfirm(receivedQuantity);
  };

  const handleDialogOpen = (isOpen: boolean) => {
    if (isOpen) {
      // Reset form when opening
      setReceivedQuantity(expense?.deliveryStatus?.receivedQuantity || 0);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Delivery Status</DialogTitle>
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
              <span className="text-gray-600">Total Items:</span>
              <span className="font-semibold text-gray-900">
                {expense?.items?.length || 0} items
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Quantity:</span>
              <span className="font-semibold text-gray-900">
                {totalQuantity} units
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Previously Received:</span>
              <span className="font-semibold text-gray-900">
                {expense?.deliveryStatus?.receivedQuantity || 0} units
              </span>
            </div>
          </div>

          {/* Delivery Items List */}
          {expense?.items && expense.items.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Items to Deliver
              </Label>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {expense.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm p-2 bg-white rounded border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.itemName || item.name || `Item ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        SKU: {item.sku || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {item.quantity || 0}
                      </p>
                      <p className="text-xs text-gray-500">units</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="receivedQuantity" className="text-sm font-medium text-gray-700">
              Total Received Quantity <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="receivedQuantity"
                type="number"
                value={receivedQuantity}
                onChange={(e) => setReceivedQuantity(Math.max(0, Number(e.target.value)))}
                className="pr-16"
                placeholder="0"
                step="1"
                min="0"
                max={totalQuantity}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                units
              </span>
            </div>

            {/* Pending Quantity Display */}
            <div className="flex justify-between text-sm mt-2 p-2 bg-blue-50 rounded">
              <span className="text-gray-600">Pending Quantity:</span>
              <span className="font-semibold text-blue-700">
                {Math.max(0, pendingQuantity)} units
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              {receivedQuantity === 0 && (
                <>
                  <strong>No Delivery:</strong> No items have been received yet.
                </>
              )}
              {receivedQuantity > 0 && receivedQuantity < totalQuantity && (
                <>
                  <strong>Partial Delivery:</strong> {receivedQuantity} of {totalQuantity} units received. {pendingQuantity} units pending.
                </>
              )}
              {receivedQuantity === totalQuantity && (
                <>
                  <strong>Completed:</strong> All {totalQuantity} units have been received.
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
              "Update Delivery"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDeliveryStatusDialog;
