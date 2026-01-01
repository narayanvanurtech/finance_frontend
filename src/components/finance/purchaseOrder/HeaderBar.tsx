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
  deliveryDate: string;
  setDeliveryDate: (val: string) => void;
  paymentTerms: string;
  setPaymentTerms: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  priority: string;
  setPriority: (val: string) => void;
  referenceNumber: string;
  setReferenceNumber: (val: string) => void;
  currency: string;
  setCurrency: (val: string) => void;
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
  deliveryDate,
  setDeliveryDate,
  paymentTerms,
  setPaymentTerms,
  status,
  setStatus,
  priority,
  setPriority,
  referenceNumber,
  setReferenceNumber,
  currency,
  setCurrency,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
        Purchase Order Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Row 1 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Purchase Order No <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={purchaseOrderNo}
            onChange={(e) => setPurchaseOrderNo(e.target.value)}
            placeholder="PO00001"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Supplier Invoice No
          </label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={supplierInvoiceNo}
            onChange={(e) => setSupplierInvoiceNo(e.target.value)}
            placeholder="Enter Supplier Invoice Number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Reference Number
          </label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="Enter Reference Number"
          />
        </div>

        {/* Row 2 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Order Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Expected Delivery Date
          </label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Row 3 */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent to Vendor</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="partial_delivery">Partial Delivery</option>
            <option value="complete">Complete</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <select
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="AED">AED (د.إ)</option>
          </select>
        </div>

        {/* Row 4 */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1">
            Payment Terms
          </label>
          <select
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
          >
            <option value="Net 15">Net 15 Days</option>
            <option value="Net 30">Net 30 Days</option>
            <option value="Net 45">Net 45 Days</option>
            <option value="Net 60">Net 60 Days</option>
            <option value="Due on Receipt">Due on Receipt</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="Advance Payment">Advance Payment</option>
            <option value="50% Advance">50% Advance, 50% on Delivery</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;
