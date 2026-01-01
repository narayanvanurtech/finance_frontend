"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateStock } from "@/hooks/useItemQueries";
import { toast } from "sonner";
import type { Item } from "@/api/finance/itemApi";
import { Package, TrendingUp, TrendingDown } from "lucide-react";

interface StockAdjustmentModalProps {
  open: boolean;
  onClose: () => void;
  item: Item | null;
  companyId: string;
  onSuccess?: () => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  open,
  onClose,
  item,
  companyId,
  onSuccess,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">("increase");
  const [adjustment, setAdjustment] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const updateStockMutation = useUpdateStock(
    companyId || "",
    item?._id || ""
  );

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open && item) {
      setAdjustment("");
      setReason("");
      setAdjustmentType("increase");
    }
  }, [open, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) {
      toast.error("No item selected");
      return;
    }

    const adjustmentValue = parseFloat(adjustment);
    
    if (isNaN(adjustmentValue) || adjustmentValue <= 0) {
      toast.error("Please enter a valid adjustment amount");
      return;
    }

    if (adjustmentType === "decrease" && adjustmentValue > (item.currentStock || 0)) {
      toast.error(
        `Cannot decrease stock by more than current stock (${item.currentStock || 0})`
      );
      return;
    }

    try {
      await updateStockMutation.mutateAsync({
        adjustment: adjustmentValue,
        adjustmentType,
        reason: reason.trim() || undefined,
      });
      
      toast.success("Stock adjusted successfully");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to adjust stock"
      );
    }
  };

  const handleClose = () => {
    if (!updateStockMutation.isPending) {
      setAdjustment("");
      setReason("");
      setAdjustmentType("increase");
      onClose();
    }
  };

  const currentStock = item?.currentStock || 0;
  const newStock =
    adjustmentType === "increase"
      ? currentStock + (parseFloat(adjustment) || 0)
      : currentStock - (parseFloat(adjustment) || 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Adjust Stock
          </DialogTitle>
          <DialogDescription>
            Adjust the stock quantity for {item?.name || "this item"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Current Stock Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Item Name:</span>
              <span className="font-semibold text-gray-900">{item?.name || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Stock:</span>
              <span className="font-semibold text-gray-900">
                {currentStock} {item?.unit || "units"}
              </span>
            </div>
            {item?.lowStockThreshold !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Low Stock Threshold:</span>
                <span className="font-semibold text-gray-900">
                  {item.lowStockThreshold} {item?.unit || "units"}
                </span>
              </div>
            )}
          </div>

          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Adjustment Type <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={adjustmentType === "increase" ? "default" : "outline"}
                onClick={() => setAdjustmentType("increase")}
                className="flex-1 flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Increase Stock
              </Button>
              <Button
                type="button"
                variant={adjustmentType === "decrease" ? "default" : "outline"}
                onClick={() => setAdjustmentType("decrease")}
                className="flex-1 flex items-center gap-2"
              >
                <TrendingDown className="w-4 h-4" />
                Decrease Stock
              </Button>
            </div>
          </div>

          {/* Adjustment Amount */}
          <div className="space-y-2">
            <Label htmlFor="adjustment" className="text-sm font-medium text-gray-700">
              Adjustment Amount <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="adjustment"
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                className="pr-16"
                placeholder="0"
                step="0.01"
                min="0"
                required
                disabled={updateStockMutation.isPending}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                {item?.unit || "units"}
              </span>
            </div>
            {adjustment && !isNaN(parseFloat(adjustment)) && (
              <div className="text-sm text-gray-600">
                New stock will be:{" "}
                <span
                  className={`font-semibold ${
                    newStock < 0
                      ? "text-red-600"
                      : item?.lowStockThreshold !== undefined &&
                        newStock <= item.lowStockThreshold
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {Math.max(0, newStock)} {item?.unit || "units"}
                </span>
                {newStock < 0 && (
                  <span className="text-red-600 ml-2">(Invalid: cannot be negative)</span>
                )}
                {item?.lowStockThreshold !== undefined &&
                  newStock > 0 &&
                  newStock <= item.lowStockThreshold && (
                    <span className="text-yellow-600 ml-2">(Low Stock Warning)</span>
                  )}
              </div>
            )}
          </div>

          {/* Reason (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
              Reason (Optional)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for stock adjustment..."
              rows={3}
              disabled={updateStockMutation.isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateStockMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                updateStockMutation.isPending ||
                !adjustment ||
                isNaN(parseFloat(adjustment)) ||
                parseFloat(adjustment) <= 0 ||
                newStock < 0
              }
            >
              {updateStockMutation.isPending ? "Adjusting..." : "Adjust Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustmentModal;

