"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "className"
  > {
  value?: string | Date;
  onChange?: (value: string) => void;
  dateFormat?: string;
  displayFormat?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  calendarProps?: React.ComponentProps<typeof Calendar>;
}

export function DateInput({
  value,
  onChange,
  dateFormat = "yyyy-MM-dd",
  displayFormat = "MMM dd, yyyy",
  placeholder = "Select date",
  disabled = false,
  className,
  calendarProps,
  ...props
}: DateInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Convert value to Date object
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    try {
      const parsed = parse(value, dateFormat, new Date());
      return isValid(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }, [value, dateFormat]);

  // Update input display value when value changes
  React.useEffect(() => {
    if (dateValue) {
      setInputValue(format(dateValue, displayFormat));
    } else {
      setInputValue("");
    }
  }, [dateValue, displayFormat]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);

    // Try to parse various date formats
    const tryParseDate = (val: string) => {
      const formats = [
        displayFormat,
        dateFormat,
        "MM/dd/yyyy",
        "MM-dd-yyyy",
        "dd/MM/yyyy",
        "dd-MM-yyyy",
        "yyyy/MM/dd",
        "yyyy-MM-dd",
      ];

      for (const fmt of formats) {
        try {
          const parsed = parse(val, fmt, new Date());
          if (isValid(parsed)) return parsed;
        } catch {
          continue;
        }
      }

      // Try native Date parsing as fallback
      const nativeDate = new Date(val);
      return isValid(nativeDate) ? nativeDate : null;
    };

    const parsedDate = tryParseDate(inputVal);
    if (parsedDate) {
      onChange?.(format(parsedDate, dateFormat));
    }
  };

  const handleInputBlur = () => {
    // Reformat the input value when focus is lost
    if (dateValue) {
      setInputValue(format(dateValue, displayFormat));
    } else if (inputValue) {
      // Try to parse and reformat
      const tryParseDate = (val: string) => {
        try {
          const nativeDate = new Date(val);
          return isValid(nativeDate) ? nativeDate : null;
        } catch {
          return null;
        }
      };

      const parsedDate = tryParseDate(inputValue);
      if (parsedDate) {
        setInputValue(format(parsedDate, displayFormat));
        onChange?.(format(parsedDate, dateFormat));
      } else {
        setInputValue("");
      }
    }
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange?.(format(selectedDate, dateFormat));
    } else {
      onChange?.("");
    }
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        {...props}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        className="pr-10"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Open calendar</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue as any}
            onSelect={handleCalendarSelect as any}
            disabled={disabled}
            initialFocus
            {...calendarProps}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DateInput;
