import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { IoClose } from "react-icons/io5";

export type PaymentPhase = {
  title: string;
  dueDate: string;
  percentage: number;
  paymentType?: "percentage" | "amount";
  amount?: number;
};

type PhaseWisePaymentProps = {
  phases: PaymentPhase[];
  setPhases: React.Dispatch<React.SetStateAction<PaymentPhase[]>>;
  totalAmount: number;
};

export default function PhaseWisePayment({
  phases,
  setPhases,
  totalAmount,
}: PhaseWisePaymentProps) {
  const [error, setError] = React.useState("");

  const handlePhaseChange = (
    idx: number,
    field: keyof PaymentPhase,
    value: any
  ) => {
    setPhases((prev) => {
      const updated = [...prev];

      if (field === "paymentType") {
        // When switching payment type, keep the values synced
        updated[idx] = { ...updated[idx], [field]: value };
        if (value === "percentage") {
          // Recalculate amount from percentage
          updated[idx].amount = (updated[idx].percentage / 100) * totalAmount;
        } else if (value === "amount") {
          // Recalculate percentage from amount
          updated[idx].percentage =
            totalAmount > 0 ? (updated[idx].amount! / totalAmount) * 100 : 0;
        }
      } else if (field === "percentage") {
        // When percentage changes, calculate amount
        const newPercentage = Number(value);
        updated[idx] = {
          ...updated[idx],
          percentage: newPercentage,
          amount: (newPercentage / 100) * totalAmount,
        };
      } else if (field === "amount") {
        // When amount changes, calculate percentage
        const newAmount = Number(value);
        updated[idx] = {
          ...updated[idx],
          amount: newAmount,
          percentage: totalAmount > 0 ? (newAmount / totalAmount) * 100 : 0,
        };
      } else {
        // For other fields (title, dueDate), just update the value
        updated[idx] = { ...updated[idx], [field]: value };
      }

      return updated;
    });
  };

  const handleAddPhase = () => {
    setPhases((prev) => [
      ...prev,
      {
        title: "",
        dueDate: "",
        percentage: 0,
        paymentType: "percentage",
        amount: 0,
      },
    ]);
  };

  const handleRemovePhase = (idx: number) => {
    setPhases((prev) => prev.filter((_, i) => i !== idx));
  };

  // Update all amounts when totalAmount changes
  React.useEffect(() => {
    setPhases((prev) =>
      prev.map((phase) => ({
        ...phase,
        amount: (phase.percentage / 100) * totalAmount,
      }))
    );
  }, [totalAmount, setPhases]);

  // Validate percentages and amounts
  React.useEffect(() => {
    if (phases.length === 0) {
      setError("");
      return;
    }

    const totalPercentage = phases.reduce(
      (acc, p) => acc + Number(p.percentage || 0),
      0
    );
    const totalPhaseAmount = phases.reduce(
      (acc, p) => acc + Number(p.amount || 0),
      0
    );
    const remainingPercentage = 100 - totalPercentage;
    const remainingAmount = totalAmount - totalPhaseAmount;

    // Check if any phase is using amount type
    const hasAmountType = phases.some((p) => p.paymentType === "amount");

    if (totalPercentage > 100) {
      if (hasAmountType) {
        setError(
          `Total amount of all phases exceeds invoice total. Exceeds by ₹${Math.abs(
            remainingAmount
          ).toFixed(2)}`
        );
      } else {
        setError("Total percentage of all phases exceeds 100%.");
      }
    } else if (totalPercentage < 100 && totalPercentage > 0) {
      if (hasAmountType) {
        setError(
          `Total phase amount must equal invoice amount. Currently ₹${totalPhaseAmount.toFixed(
            2
          )} (₹${remainingAmount.toFixed(2)} remaining).`
        );
      } else {
        setError(
          `Total percentage must equal 100%. Currently ${totalPercentage.toFixed(
            2
          )}% (${remainingPercentage.toFixed(2)}% remaining).`
        );
      }
    } else {
      setError("");
    }
  }, [phases, totalAmount]);

  return (
    <Card className="bg-white rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 border-b pb-2">
        Phase-wise Payment
      </h2>
      <div className="space-y-3">
        {phases.map((phase, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            {/* Phase Title - Takes more space */}
            <div className="col-span-12 md:col-span-4">
              <label className="block text-xs font-medium mb-1.5 text-gray-600">
                Phase Title
              </label>
              <Input
                type="text"
                value={phase.title}
                onChange={(e) =>
                  handlePhaseChange(idx, "title", e.target.value)
                }
                placeholder={`Phase ${idx + 1}`}
                className="w-full"
              />
            </div>

            {/* Payment Type */}
            <div className="col-span-6 md:col-span-2">
              <label className="block text-xs font-medium mb-1.5 text-gray-600">
                Type
              </label>
              <Select
                value={phase.paymentType || "percentage"}
                onValueChange={(value) =>
                  handlePhaseChange(idx, "paymentType", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">%</SelectItem>
                  <SelectItem value="amount">₹</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Percentage/Amount Input */}
            <div className="col-span-6 md:col-span-2">
              {phase.paymentType === "percentage" || !phase.paymentType ? (
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-600">
                    Percentage
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={phase.percentage || 0}
                    onChange={(e) =>
                      handlePhaseChange(idx, "percentage", e.target.value)
                    }
                    className="w-full"
                  />
                  <div className="mt-1 text-xs font-medium text-blue-600">
                    ₹
                    {(((phase.percentage || 0) / 100) * totalAmount).toFixed(2)}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-600">
                    Amount
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={phase.amount || 0}
                    onChange={(e) =>
                      handlePhaseChange(idx, "amount", e.target.value)
                    }
                    className="w-full"
                  />
                  <div className="mt-1 text-xs font-medium text-blue-600">
                    {(totalAmount > 0
                      ? ((phase.amount || 0) / totalAmount) * 100
                      : 0
                    ).toFixed(2)}
                    %
                  </div>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="col-span-10 md:col-span-3">
              <label className="block text-xs font-medium mb-1.5 text-gray-600">
                Due Date
              </label>
              <Input
                type="date"
                value={phase.dueDate}
                onChange={(e) =>
                  handlePhaseChange(idx, "dueDate", e.target.value)
                }
                className="w-full"
              />
            </div>

            {/* Remove Button */}
            <div className="col-span-2 md:col-span-1 flex items-end justify-center">
              <Button
                type="button"
                variant="ghost"
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-10 w-10 p-0"
                onClick={() => handleRemovePhase(idx)}
                disabled={phases.length === 1}
                title="Remove phase"
              >
                <IoClose className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddPhase}
          className="text-sm font-medium"
        >
          + Add Phase
        </Button>
      </div>
      {phases.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                Total Invoice Amount:
              </span>
              <span className="text-lg font-bold text-blue-700">
                ₹
                {(totalAmount || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="h-px bg-blue-200"></div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                Total Percentage:
              </span>
              <span
                className={`text-lg font-bold ${
                  phases
                    .reduce((acc, p) => acc + Number(p.percentage || 0), 0)
                    .toFixed(2) === "100.00"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {phases
                  .reduce((acc, p) => acc + Number(p.percentage || 0), 0)
                  .toFixed(2)}
                % / 100%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                Total Phase Amount:
              </span>
              <span
                className={`text-lg font-bold ${
                  Math.abs(
                    phases.reduce((acc, p) => acc + (p.amount || 0), 0) -
                      totalAmount
                  ) < 0.01
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                ₹
                {phases
                  .reduce((acc, p) => acc + (p.amount || 0), 0)
                  .toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </span>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}
    </Card>
  );
}
