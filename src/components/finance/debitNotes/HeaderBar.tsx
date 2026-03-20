import React from "react";

type Invoice = {
  id: string;
  label: string;
};

type PurchaseOrder = {
  _id: string;
  purchaseOrderNumber: string;
  purchaseOrderDate: string;
  vendorId: any;
};

type HeaderBarProps = {
  debitNoteNo: string;
  setDebitNoteNo: (val: string) => void;
  debitNoteDate: string;
  setDebitNoteDate: (val: string) => void;
  linkedInvoice: string;
  setLinkedInvoice: (val: string) => void;
  reason: string;
  setReason: (val: string) => void;
  purchaseId: string;
  setPurchaseId: (val: string) => void;
  originalBillNumber: string;
  setOriginalBillNumber: (val: string) => void;
  originalBillDate?: string;
  setOriginalBillDate?: (val: string) => void;
  priority?: string;
  setPriority?: (val: string) => void;
  debitType: string;
  setDebitType: (val: string) => void;
  invoices: Invoice[];
  reasons: string[];
  purchaseOrders?: PurchaseOrder[];
  onPurchaseOrderSelect?: (purchaseOrder: PurchaseOrder) => void;
  selectedVendorId?: string;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  debitNoteNo,
  setDebitNoteNo,
  debitNoteDate,
  setDebitNoteDate,
  linkedInvoice,
  setLinkedInvoice,
  reason,
  setReason,
  purchaseId,
  setPurchaseId,
  originalBillNumber,
  setOriginalBillNumber,
  originalBillDate,
  setOriginalBillDate,
  priority,
  setPriority,
  debitType,
  setDebitType,
  invoices,
  reasons,
  purchaseOrders = [],
  onPurchaseOrderSelect,
  selectedVendorId,
}) => {
  const debitTypes = [
    { value: "quality_issue", label: "Quality Issue" },
    { value: "price_difference", label: "Price Difference" },
    { value: "excess_billing", label: "Excess Billing" },
    { value: "return", label: "Return" },
    { value: "other", label: "Other" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/** Debug logs for purchase orders visibility */}
      {(() => {
        if (typeof window !== "undefined") {
          //console.log("HeaderBar: selectedVendorId:", selectedVendorId);
          //console.log(
            "HeaderBar: purchaseOrders count:",
            purchaseOrders.length
          );
        }
        return null;
      })()}
      <div>
        <label className="block text-sm font-medium mb-1">
          Debit Note No <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={debitNoteNo}
          onChange={(e) => setDebitNoteNo(e.target.value)}
          placeholder="D00001"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Debit Note Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          value={debitNoteDate}
          onChange={(e) => setDebitNoteDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Select Purchase Order{" "}
          {selectedVendorId && <span className="text-red-500">*</span>}
        </label>
        <select
          className="w-full border rounded px-3 py-2"
          value={purchaseId}
          onChange={(e) => {
            const selectedPO = purchaseOrders.find(
              (po) => po._id === e.target.value
            );
            if (selectedPO && onPurchaseOrderSelect) {
              onPurchaseOrderSelect(selectedPO);
            }
          }}
          disabled={!selectedVendorId}
        >
          <option value="">
            {selectedVendorId ? "Select Purchase Order" : "Select vendor first"}
          </option>
          {selectedVendorId && purchaseOrders.length === 0 && (
            <option value="" disabled>
              No purchase orders for selected vendor
            </option>
          )}
          {purchaseOrders.map((po) => (
            <option key={po._id} value={po._id}>
              {po.purchaseOrderNumber} -{" "}
              {new Date(po.purchaseOrderDate).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Select reason <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full border rounded px-3 py-2"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        >
          <option value="">Select reason</option>
          {reasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Original Bill Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={originalBillNumber}
          onChange={(e) => setOriginalBillNumber(e.target.value)}
          placeholder="Enter bill number or select purchase order"
        />
        <p className="text-xs text-gray-500 mt-1">
          Auto-filled when purchase order is selected, or enter manually
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Original Bill Date
        </label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          value={originalBillDate || ""}
          onChange={(e) =>
            setOriginalBillDate && setOriginalBillDate(e.target.value)
          }
        />
        <p className="text-xs text-gray-500 mt-1">
          Auto-filled when purchase order is selected, or enter manually
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={priority || ""}
          onChange={(e) => setPriority && setPriority(e.target.value)}
        >
          <option value="">Select priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Debit Type <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full border rounded px-3 py-2"
          value={debitType}
          onChange={(e) => setDebitType(e.target.value)}
          required
        >
          <option value="">Select Debit Type</option>
          {debitTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default HeaderBar;
