import React from "react";

// Define a generic type for table props with flexible column headers
interface TableProps<T> {
  columns: {
    header: React.ReactNode; 
    accessor: string;
    className?: string;
  }[];
  renderRow: (item: T, index: number) => React.ReactNode;
  data: T[];
}

const Table = <T,>({ columns, renderRow, data }: TableProps<T>) => {
  return (
    <table className="w-full mt-4 table-auto">
      <thead className="sticky top-0 bg-white z-10 shadow-sm">
        <tr className="text-left text-gray-500 border-b text-sm">
          {columns.map((col) => (
            <th key={col.accessor} className={col.className}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{data.map((item, index) => renderRow(item, index))}</tbody>
    </table>
  );
};

export default Table;
