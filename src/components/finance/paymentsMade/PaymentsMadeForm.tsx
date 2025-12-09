import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";
import { useExpenseStore } from "@/stores/financeStore/useExpenseStore";
import AddVendorModal from "@/components/finance/AddVendorModal";
import { format } from "date-fns";

export type PaymentsMadeFormValues = {
  vendorId?: string;
  paymentNo?: string;
  amountPaid?: string;
  paymentDate?: string;
  paymentMode?: string;
  paidThrough?: string;
  referenceNo?: string;
};

type PaymentsMadeFormProps = {
  initialValues?: PaymentsMadeFormValues;
  mode?: "create" | "edit";
  onSubmit: (values: PaymentsMadeFormValues) => void;
};

const defaultInitialValues: PaymentsMadeFormValues = {
  vendorId: "",
  paymentNo: "",
  amountPaid: "",
  paymentDate: format(new Date(), "yyyy-MM-dd"),
  paymentMode: "",
  paidThrough: "",
  referenceNo: "",
};

export default function PaymentsMadeForm({
  initialValues,
  mode = "create",
  onSubmit,
}: PaymentsMadeFormProps) {
  const vendors = useVendorStore((state) => state.vendors);
  const expenses = useExpenseStore((state) => state.expenses);

  // Form state
  const [vendorId, setVendorId] = useState(
    initialValues?.vendorId || defaultInitialValues.vendorId
  );
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [vendorDetails, setVendorDetails] = useState<any>({});
  const [paymentNo, setPaymentNo] = useState(
    initialValues?.paymentNo || defaultInitialValues.paymentNo
  );
  const [amountPaid, setAmountPaid] = useState(
    initialValues?.amountPaid || defaultInitialValues.amountPaid
  );
  const [paymentDate, setPaymentDate] = useState(
    initialValues?.paymentDate || defaultInitialValues.paymentDate
  );
  const [paymentMode, setPaymentMode] = useState(
    initialValues?.paymentMode || defaultInitialValues.paymentMode
  );
  const [paidThrough, setPaidThrough] = useState(
    initialValues?.paidThrough || defaultInitialValues.paidThrough
  );
  const [referenceNo, setReferenceNo] = useState(
    initialValues?.referenceNo || defaultInitialValues.referenceNo
  );

  // Update vendorDetails when vendorId changes
  useEffect(() => {
    if (vendorId && vendorId !== "new") {
      const found = vendors.find((v) => String(v._id) === String(vendorId));
      if (found) {
        setVendorDetails({
          name: found.name,
          gstin: found.gstin,
          address: found.address,
          contact: found.contact,
          email: found.email,
        });
      }
    } else if (vendorId === "new") {
      setVendorDetails({});
    }
  }, [vendorId, vendors]);

  // Filter expenses for this vendor
  const vendorExpenses = expenses.filter(
    (e) => String(e.vendorId) === String(vendorId)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      vendorId,
      paymentNo,
      amountPaid,
      paymentDate,
      paymentMode,
      paidThrough,
      referenceNo,
    });
  };

  return (
    <form
      className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 space-y-6"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold mb-4">Record Payment Made</h2>
      {/* Vendor Selection */}
      <div>
        <label className="block text-sm font-medium mb-1">Vendor Name</label>
        <div className="flex gap-2 items-center">
          <Select onValueChange={(val) => setVendorId(val)} value={vendorId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((v) => (
                <SelectItem key={v._id} value={v._id.toString()}>
                  {v.name}
                </SelectItem>
              ))}
              <SelectItem value="new">+ Add New Vendor</SelectItem>
            </SelectContent>
          </Select>
          {vendorId === "new" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddVendor(true)}
            >
              Add Vendor
            </Button>
          )}
        </div>
        <AddVendorModal
          open={showAddVendor}
          onOpenChange={setShowAddVendor}
          onSuccess={() => setShowAddVendor(false)}
        />
      </div>
      {/* Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Payment #</label>
          <Input
            value={paymentNo}
            onChange={(e) => setPaymentNo(e.target.value)}
            placeholder="Auto or manual"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Payment Made (INR)
          </label>
          <Input
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            placeholder="Amount"
            type="number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Payment Date</label>
          <Input
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            type="date"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Payment Mode</label>
          <Input
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            placeholder="e.g. Bank Transfer, Cash"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Paid Through</label>
          <Input
            value={paidThrough}
            onChange={(e) => setPaidThrough(e.target.value)}
            placeholder="e.g. HDFC Bank"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reference#</label>
          <Input
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
            placeholder="Reference Number"
          />
        </div>
      </div>
      {/* List of Expenses for this Vendor */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Expenses for this Vendor
        </label>
        <div className="border rounded-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Expense No</th>
                <th className="px-3 py-2 text-left">Invoice No</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {vendorExpenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-400">
                    No expenses found for this vendor.
                  </td>
                </tr>
              ) : (
                vendorExpenses.map((exp) => {
                  const total =
                    (exp.items || []).reduce(
                      (sum, item) => sum + (Number(item.amount) || 0),
                      0
                    ) + (Number(exp.shipping) || 0);
                  return (
                    <tr key={exp.expenseNo} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{exp.expenseNo}</td>
                      <td className="px-3 py-2">{exp.invoiceNo}</td>
                      <td className="px-3 py-2">{exp.purchaseDate}</td>
                      <td className="px-3 py-2">₹{total.toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" className="mt-4">
          {mode === "edit" ? "Update Payment" : "Record Payment"}
        </Button>
      </div>
    </form>
  );
}
