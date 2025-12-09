import React from "react";

type HeaderBarProps = {
  expenseNo: string;
  setExpenseNo: (val: string) => void;
  invoiceNo: string;
  setInvoiceNo: (val: string) => void;
  purchaseDate: string;
  setPurchaseDate: (val: string) => void;
  dueDate: string;
  setDueDate: (val: string) => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  expenseNo,
  setExpenseNo,
  invoiceNo,
  setInvoiceNo,
  purchaseDate,
  setPurchaseDate,
  dueDate,
  setDueDate,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">
          Expense No <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={expenseNo}
          onChange={e => setExpenseNo(e.target.value)}
          placeholder="A00001"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Invoice No</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={invoiceNo}
          onChange={e => setInvoiceNo(e.target.value)}
          placeholder="Enter Invoice Number"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Purchase Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          value={purchaseDate}
          onChange={e => setPurchaseDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Due Date</label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
      </div>
    </div>
  );
};

export default HeaderBar;
