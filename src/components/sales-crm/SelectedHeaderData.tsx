import React from "react";

interface SelectedHeaderDataProps {
  total: number;
  selected: number;
}

const SelectedHeaderData: React.FC<SelectedHeaderDataProps> = ({ total, selected }) => {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <p className="text-sm text-gray-700">
        Total Leads: <strong>{total}</strong>
      </p>
      <p className="text-sm text-gray-700">
        Selected: <strong>{selected}</strong>
      </p>
    </div>
  );
};

export default SelectedHeaderData;
