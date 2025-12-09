import React from "react";

type HeaderBarProps = {
  purchaseOrderNo: string;
  setPurchaseOrderNo: (val: string) => void;
  supplierInvoiceNo: string;
  setSupplierInvoiceNo: (val: string) => void;
  orderDate: string;
  setOrderDate: (val: string) => void;
  dueDate: string;
  setDueDate: (val: string) => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  purchaseOrderNo,
  setPurchaseOrderNo,
  supplierInvoiceNo,
  setSupplierInvoiceNo,
  orderDate,
  setOrderDate,
  dueDate,
  setDueDate,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">
          Purchase Order No <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={purchaseOrderNo}
          onChange={e => setPurchaseOrderNo(e.target.value)}
          placeholder="PO00001"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Supplier Invoice No</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={supplierInvoiceNo}
          onChange={e => setSupplierInvoiceNo(e.target.value)}
          placeholder="Enter Supplier Invoice Number"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Order Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          value={orderDate}
          onChange={e => setOrderDate(e.target.value)}
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