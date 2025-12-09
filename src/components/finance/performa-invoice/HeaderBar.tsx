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

export type PerformaInvoiceHeaderBarProps = {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  invoiceNumber: string;
  date: string;
  onDateChange: (date: string) => void;
  dueDate: string;
  onDueDateChange: (date: string) => void;
  terms: string;
  onTermsChange: (terms: string) => void;
};

const TERMS_OPTIONS = [
  { label: "Net 15 days", value: "net15" },
  { label: "Net 20 days", value: "net20" },
  { label: "Net 30 days", value: "net30" },
  { label: "Due on receipt", value: "dueOnReceipt" },
  { label: "Due end of the month", value: "dueEndOfMonth" },
  { label: "Due end of next month", value: "dueEndOfNextMonth" },
];

function calculateDueDate(date: string, terms: string): string {
  if (!date) return "";
  const d = new Date(date);
  switch (terms) {
    case "net15":
      d.setDate(d.getDate() + 15);
      break;
    case "net20":
      d.setDate(d.getDate() + 20);
      break;
    case "net30":
      d.setDate(d.getDate() + 30);
      break;
    case "dueOnReceipt":
      break;
    case "dueEndOfMonth":
      d.setMonth(d.getMonth() + 1, 0);
      break;
    case "dueEndOfNextMonth":
      d.setMonth(d.getMonth() + 2, 0);
      break;
    default:
      break;
  }
  return format(d, "yyyy-MM-dd");
}

const PerformaInvoiceHeaderBar: React.FC<PerformaInvoiceHeaderBarProps> = ({
  title,
  onTitleChange,
  invoiceNumber,
  date,
  onDateChange,
  dueDate,
  onDueDateChange,
  terms,
  onTermsChange,
}) => {
  // When terms or date changes, update due date
  React.useEffect(() => {
    if (terms && date) {
      const newDue = calculateDueDate(date, terms);
      onDueDateChange(newDue);
    }
  }, [terms, date]);

  return (
    <section className="sticky top-0 z-10 mb-6 pb-4 flex flex-col md:flex-row md:items-end gap-6 px-2">
      <div className="flex-1">
        <label className="block text-xs font-semibold mb-1 text-gray-500">
          Proforma Invoice Title
        </label>
        <Input type="text" value={title} onChange={onTitleChange} />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-500">
          Invoice Number
        </label>
        <Input type="text" value={invoiceNumber} readOnly />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-500">
          Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[180px] justify-start text-left font-normal"
              onClick={() => onDateChange(date)}
            >
              {date ? (
                format(new Date(date), "yyyy-MM-dd")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date ? new Date(date) : undefined}
              onSelect={(newDate) => {
                if (newDate) {
                  onDateChange(format(newDate, "yyyy-MM-dd"));
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-500">
          Terms
        </label>
        <Select value={terms} onValueChange={onTermsChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select terms" />
          </SelectTrigger>
          <SelectContent>
            {TERMS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-500">
          Due Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[180px] justify-start text-left font-normal"
              onClick={() => onDueDateChange(dueDate)}
            >
              {dueDate ? (
                format(new Date(dueDate), "yyyy-MM-dd")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate ? new Date(dueDate) : undefined}
              onSelect={(newDate) => {
                if (newDate) {
                  onDueDateChange(format(newDate, "yyyy-MM-dd"));
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </section>
  );
};

export default PerformaInvoiceHeaderBar;
