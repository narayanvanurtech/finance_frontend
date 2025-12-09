import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export type PaymentHeaderBarProps = {
  paymentNumber: string;
  paymentDate: string;
  onPaymentDateChange: (date: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  reference?: string;
  onReferenceChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Cheque", value: "cheque" },
  { label: "Credit Card", value: "credit_card" },
  { label: "Debit Card", value: "debit_card" },
  { label: "UPI", value: "upi" },
  { label: "Other", value: "other" },
];

const PaymentHeaderBar: React.FC<PaymentHeaderBarProps> = ({
  paymentNumber,
  paymentDate,
  onPaymentDateChange,
  paymentMethod,
  onPaymentMethodChange,
  reference,
  onReferenceChange,
}) => {
  return (
    <section className="sticky top-0 z-10 mb-6 pb-4 flex flex-col md:flex-row md:items-end gap-6 px-2">
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-500">
          Payment Number
        </label>
        <Input
          type="text"
          value={paymentNumber}
          readOnly
          className="w-[180px]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-500">
          Payment Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[180px] justify-start text-left font-normal"
            >
              {paymentDate ? (
                format(new Date(paymentDate), "yyyy-MM-dd")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={paymentDate ? new Date(paymentDate) : undefined}
              onSelect={(newDate) => {
                if (newDate) {
                  onPaymentDateChange(format(newDate, "yyyy-MM-dd"));
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-500">
          Payment Method
        </label>
        <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="block text-xs font-semibold mb-1 text-gray-500">
          Reference Number (Optional)
        </label>
        <Input
          type="text"
          value={reference || ""}
          onChange={onReferenceChange}
          placeholder="Transaction ID, Cheque No., etc."
        />
      </div>
    </section>
  );
};

export default PaymentHeaderBar;
