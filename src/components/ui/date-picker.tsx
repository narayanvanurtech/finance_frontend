"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  inputClassName?: string
  calendarClassName?: string
  formatStr?: string
  showInput?: boolean
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  className,
  inputClassName,
  calendarClassName,
  formatStr = "PPP",
  showInput = true,
  inputProps,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  // Update input value when date changes
  React.useEffect(() => {
    if (date) {
      setInputValue(format(date, formatStr))
    } else {
      setInputValue("")
    }
  }, [date, formatStr])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // Try to parse the input value as a date
    try {
      const parsedDate = new Date(value)
      if (!isNaN(parsedDate.getTime()) && value.trim() !== "") {
        onSelect?.(parsedDate)
      }
    } catch (error) {
      // If parsing fails, don't update the date
    }
  }

  const handleInputBlur = () => {
    // Reformat the input value when focus is lost
    if (date) {
      setInputValue(format(date, formatStr))
    }
  }

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    onSelect?.(selectedDate)
    setOpen(false)
  }

  if (showInput) {
    return (
      <div className={cn("relative", className)}>
        <div className="relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={disabled}
            className={cn("pr-10", inputClassName)}
            {...inputProps}
          />
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
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
                selected={date}
                onSelect={handleCalendarSelect}
                disabled={disabled}
                initialFocus
                className={calendarClassName}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    )
  }

  // Fallback to button-only mode
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, formatStr) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleCalendarSelect}
          disabled={disabled}
          initialFocus
          className={calendarClassName}
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker