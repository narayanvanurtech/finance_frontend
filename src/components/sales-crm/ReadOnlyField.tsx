import React from 'react';

interface ReadOnlyFieldProps {
  label: string;
  value?: string | null;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({ label, value = '' }) => {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
        {value && value.trim() !== '' ? value : <span className="text-gray-400">-</span>}
      </div>
    </div>
  );
};

export default ReadOnlyField;
