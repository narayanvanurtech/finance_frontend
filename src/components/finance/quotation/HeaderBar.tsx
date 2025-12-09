import React from "react";
import { Input } from "@/components/ui/input";

export type HeaderBarProps = {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  date: string;
  onDateChange: (date: string) => void;
  dueDate: string;
  onDueDateChange: (date: string) => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({ 
  title, 
  onTitleChange, 
  date, 
  onDateChange, 
  dueDate, 
  onDueDateChange 
}) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDueDateChange(e.target.value);
  };

  return (
    <section className="top-0 z-10 mb-6 pb-4 flex flex-col md:flex-row md:items-end gap-6 px-2 bg-white p-4 rounded-md border">
      <div className="flex-1">
        <label className="block text-xs font-semibold mb-1 text-gray-500">
          Quotation Title <span className="text-red-500">*</span>
        </label>
        <Input 
          type="text" 
          value={title} 
          onChange={onTitleChange}
          placeholder="Enter quotation title"
          className="focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-500">
          Date <span className="text-red-500">*</span>
        </label>
        <Input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="w-[180px] focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-500">Due Date / Expiry</label>
        <Input
          type="date"
          value={dueDate}
          onChange={handleDueDateChange}
          className="w-[180px] focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
        />
      </div>
    </section>
  );
};

export default HeaderBar;