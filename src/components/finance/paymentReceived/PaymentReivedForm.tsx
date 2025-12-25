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
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useRouter } from "next/navigation";
import { useInvoiceStore } from "@/stores/financeStore/useInvoiceStore";

export type PaymentRecord = {
  paymentMethod: string;
  depositedTo: string;
  amountReceived: number;
  tdsPercent?: number;
  tdsWithheldAmount?: number;
  transactionCharge?: number;
  referenceId?: string;
  notes?: string;
};

export type Allocation = {
  invoiceId: string;
  amount: number;
};

export type PaymentsMadeFormValues = {
  clientId: string;
  paymentDate: string;
  paymentType: string; // Payment type: Receipt, Advance, Partial Payment, Full Payment, Refund, Credit Note, Adjustment
  paymentRecords: PaymentRecord[];
  allocations: Allocation[];
  attachments?: string[];
  // Temporary backward compatibility
  paymentNo?: string;
  amountPaid?: string;
  paymentMode?: string;
  paidThrough?: string;
  referenceNo?: string;
  selectedInvoices?: string[];
  notes?: string;
};

type PaymentsMadeFormProps = {
  initialValues?: PaymentsMadeFormValues;
  mode?: "create" | "edit";
  onSubmit: (values: PaymentsMadeFormValues) => void;
  loading?: boolean;
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const defaultInitialValues: PaymentsMadeFormValues = {
  clientId: "",
  paymentDate: getTodayDate(),
  paymentType: "Receipt",
  paymentRecords: [
    {
      paymentMethod: "",
      depositedTo: "",
      amountReceived: 0,
      tdsPercent: 0,
      tdsWithheldAmount: 0,
      transactionCharge: 0,
      referenceId: "",
      notes: "",
    },
  ],
  allocations: [],
  attachments: [],
};

const PAYMENT_MODES = [
  "Bank Transfer",
  "Cash",
  "Cheque",
  "UPI",
  "Credit Card",
  "Debit Card",
  "NEFT/RTGS",
  "IMPS",
  "Net Banking",
  "Other",
];

const PAYMENT_TYPES = [
  "Receipt",
  "Advance",
  "Partial Payment",
  "Full Payment",
  "Refund",
  "Credit Note",
  "Adjustment",
];

export default function PaymentsMadeForm({
  initialValues,
  mode = "create",
  onSubmit,
}: PaymentsMadeFormProps) {
  const { clients, fetchClients, createClient } = useClientStore();
  const { invoices, fetchInvoices } = useInvoiceStore();
  const { user } = useAuthStore();
  const router = useRouter();

  // Form state
  const [clientId, setClientId] = useState(
    initialValues?.clientId || defaultInitialValues.clientId
  );
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientDetails, setClientDetails] = useState<any>({});
  const [selectedInvoice, setSelectedInvoice] = useState("");
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
  const [paymentType, setPaymentType] = useState(
    initialValues?.paymentType || defaultInitialValues.paymentType
  );
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>(
    initialValues?.selectedInvoices || []
  );
  const [notes, setNotes] = useState(
    initialValues?.notes || defaultInitialValues.notes
  );

  // Error states
  const [errors, setErrors] = useState<{
    clientId?: string;
    paymentMode?: string;
    paidThrough?: string;
    amountPaid?: string;
    paymentType?: string;
  }>({});

  // Fetch clients and invoices on mount and when user returns to the page
  useEffect(() => {
    if (user?.companyId) {
      fetchClients(user.companyId);
      fetchInvoices(); // Fetch invoices when component mounts
    }

    // Listen for visibility change to refetch when user returns
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && user?.companyId) {
        fetchClients(user.companyId);
        fetchInvoices(); // Fetch invoices when user returns to page
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user?.companyId, fetchClients, fetchInvoices]);

  // Update clientDetails when clientId changes
  useEffect(() => {
    if (clientId && clientId !== "new") {
      const found = clients.find((c) => c._id === clientId);
      if (found) {
        setClientDetails({
          name: found.businessName,
          gstin: found.gstin,
          address: found.address,
          contact: found.phone,
          email: found.email,
        });
      }
    } else if (clientId === "new") {
      setClientDetails({});
    }
  }, [clientId, clients]);

  // Initialize selectedInvoice from initialValues when invoices are loaded
  useEffect(() => {
    if (initialValues && invoices.length > 0 && clientId) {
      // First try to get from selectedInvoices array (invoiceNumbers)
      if (initialValues.selectedInvoices && initialValues.selectedInvoices.length > 0) {
        const invoiceNumber = initialValues.selectedInvoices[0];
        // Verify it exists in the invoices list
        const invoiceExists = invoices.some(
          (inv) => inv.invoiceNumber === invoiceNumber
        );
        if (invoiceExists && !selectedInvoice) {
          setSelectedInvoice(invoiceNumber);
        }
      }
      // If not found, try to map from allocations (invoiceIds)
      else if (initialValues.allocations && initialValues.allocations.length > 0) {
        const allocation = initialValues.allocations[0];
        // Try to find invoice by _id first
        let invoice = invoices.find((inv) => inv._id === allocation.invoiceId);
        // If not found by _id, try by invoiceNumber
        if (!invoice) {
          invoice = invoices.find((inv) => inv.invoiceNumber === allocation.invoiceId);
        }
        if (invoice && invoice.invoiceNumber && !selectedInvoice) {
          setSelectedInvoice(invoice.invoiceNumber);
        }
      }
    }
  }, [initialValues, invoices, clientId, selectedInvoice]);

  // Update form fields when initialValues change (for edit mode)
  useEffect(() => {
    if (initialValues && mode === "edit") {
      if (initialValues.referenceNo !== undefined) {
        setReferenceNo(initialValues.referenceNo || "");
      }
      if (initialValues.notes !== undefined) {
        setNotes(initialValues.notes || "");
      }
      if (initialValues.paymentMode !== undefined) {
        setPaymentMode(initialValues.paymentMode || "");
      }
      if (initialValues.paidThrough !== undefined) {
        setPaidThrough(initialValues.paidThrough || "");
      }
      if (initialValues.amountPaid !== undefined) {
        setAmountPaid(initialValues.amountPaid || "");
      }
      if (initialValues.paymentDate !== undefined) {
        setPaymentDate(initialValues.paymentDate || "");
      }
      if (initialValues.paymentType !== undefined) {
        setPaymentType(initialValues.paymentType || "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues?.referenceNo, initialValues?.notes, initialValues?.paymentMode, initialValues?.paidThrough, initialValues?.amountPaid, initialValues?.paymentDate, initialValues?.paymentType, mode]);

  // Filter invoices for this client
  const clientInvoices = invoices.filter((inv) => {
    const invClientId =
      typeof inv.clientId === "string"
        ? inv.clientId
        : (inv.clientId as any)?._id;
    return String(invClientId) === String(clientId);
  });

  // Handle invoice selection and auto-fill amount
  const handleInvoiceSelect = (invoiceNo: string) => {
    setSelectedInvoice(invoiceNo);
    if (invoiceNo) {
      const invoice = clientInvoices.find(
        (inv) => inv.invoiceNumber === invoiceNo
      );
      if (invoice) {
        const total =
          (invoice.items || []).reduce(
            (sum: number, item: any) => sum + (Number(item.amount) || 0),
            0
          ) + (Number(invoice.shipping) || 0);
        setAmountPaid(total.toString());
      }
    } else {
      setAmountPaid("");
    }
  };

  const calculateTotalSelected = () => {
    return clientInvoices
      .filter((inv) => selectedInvoices.includes(inv.invoiceNumber || ""))
      .reduce((sum: number, inv: any) => {
        const total =
          (inv.items || []).reduce(
            (s: number, item: any) => s + (Number(item.amount) || 0),
            0
          ) + (Number(inv.shipping) || 0);
        return sum + total;
      }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validation
    const newErrors: typeof errors = {};

    if (!clientId) {
      newErrors.clientId = "Please select a client";
    }
    if (!paymentMode) {
      newErrors.paymentMode = "Please select a payment mode";
    }
    if (!paidThrough) {
      newErrors.paidThrough = "This field is required";
    }
    if (!amountPaid || Number(amountPaid) <= 0) {
      newErrors.amountPaid = "Please enter a valid amount";
    }
    if (!paymentType || !PAYMENT_TYPES.includes(paymentType)) {
      newErrors.paymentType = "Please select a valid payment type";
    }

    // If there are errors, set them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Transform old form data to new backend format
    const paymentRecords: PaymentRecord[] = [
      {
        paymentMethod: paymentMode!,
        depositedTo: paidThrough!,
        amountReceived: Number(amountPaid),
        tdsPercent: 0,
        tdsWithheldAmount: 0,
        transactionCharge: 0,
        referenceId: referenceNo || "",
        notes: notes || "",
      },
    ];

    const allocations: Allocation[] = selectedInvoice
      ? [
          {
            invoiceId: selectedInvoice,
            amount: Number(amountPaid),
          },
        ]
      : [];

    onSubmit({
      clientId,
      paymentDate,
      paymentType,
      paymentRecords,
      allocations,
      attachments: [],
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Record Payment Made
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Track payments made to clients and vendors
        </p>
      </div>

      {/* Client Selection */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Client Name *
        </label>
        <div className="flex gap-2 items-center">
          <Select
            onValueChange={(val) => {
              if (val === "new") {
                router.push("/finance/clients/create");
              } else {
                setClientId(val);
                setErrors((prev) => ({ ...prev, clientId: undefined }));
              }
            }}
            value={clientId}
          >
            <SelectTrigger
              className={`flex-1 bg-white ${
                errors.clientId ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.businessName}
                </SelectItem>
              ))}
              <SelectItem value="new">+ Add New Client</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors.clientId && (
          <p className="text-red-500 text-xs mt-1">{errors.clientId}</p>
        )}
        {clientDetails.name && (
          <div className="mt-3 text-sm text-gray-600 bg-white p-3 rounded border">
            <p>
              <strong>Contact:</strong> {clientDetails.contact || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {clientDetails.email || "N/A"}
            </p>
          </div>
        )}
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Select Invoice *
          </label>
          <Select onValueChange={handleInvoiceSelect} value={selectedInvoice}>
            <SelectTrigger className="bg-gray-50">
              <SelectValue placeholder="Select an invoice" />
            </SelectTrigger>
            <SelectContent>
              {clientInvoices.length === 0 ? (
                <SelectItem value="none" disabled>
                  No invoices available
                </SelectItem>
              ) : (
                clientInvoices.map((inv) => {
                  const total =
                    (inv.items || []).reduce(
                      (sum: number, item: any) =>
                        sum + (Number(item.amount) || 0),
                      0
                    ) + (Number(inv.shipping) || 0);
                  return (
                    <SelectItem
                      key={inv.invoiceNumber}
                      value={inv.invoiceNumber || ""}
                    >
                      {inv.invoiceNumber} - ₹{total.toFixed(2)} ({inv.date})
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Amount Paid (INR) *
          </label>
          <Input
            value={amountPaid}
            onChange={(e) => {
              setAmountPaid(e.target.value);
              setErrors((prev) => ({ ...prev, amountPaid: undefined }));
            }}
            placeholder="Auto-filled from invoice"
            type="number"
            step="0.01"
            className={`bg-gray-50 ${
              errors.amountPaid ? "border-red-500" : ""
            }`}
          />
          {errors.amountPaid && (
            <p className="text-red-500 text-xs mt-1">{errors.amountPaid}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Payment Date *
          </label>
          <Input
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            type="date"
            className="bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Payment Mode *
          </label>
          <Select
            onValueChange={(val) => {
              setPaymentMode(val);
              setErrors((prev) => ({ ...prev, paymentMode: undefined }));
            }}
            value={paymentMode}
          >
            <SelectTrigger
              className={`bg-gray-50 ${
                errors.paymentMode ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select Payment Mode" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_MODES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.paymentMode && (
            <p className="text-red-500 text-xs mt-1">{errors.paymentMode}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Payment Type *
          </label>
          <Select
            onValueChange={(val) => {
              setPaymentType(val);
              setErrors((prev) => ({ ...prev, paymentType: undefined }));
            }}
            value={paymentType}
          >
            <SelectTrigger
              className={`bg-gray-50 ${
                errors.paymentType ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select Payment Type" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.paymentType && (
            <p className="text-red-500 text-xs mt-1">{errors.paymentType}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Paid Through *
          </label>
          <Input
            value={paidThrough}
            onChange={(e) => {
              setPaidThrough(e.target.value);
              setErrors((prev) => ({ ...prev, paidThrough: undefined }));
            }}
            placeholder="e.g., HDFC Bank Account"
            className={`bg-gray-50 ${
              errors.paidThrough ? "border-red-500" : ""
            }`}
          />
          {errors.paidThrough && (
            <p className="text-red-500 text-xs mt-1">{errors.paidThrough}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Reference / Transaction #
          </label>
          <Input
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
            placeholder="Transaction or Reference Number"
            className="bg-gray-50"
          />
        </div>
      </div>

      {/* Invoice Selection */}
      {clientId && clientId !== "new" && selectedInvoice && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Invoice Details
          </label>
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Invoice No</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const invoice = clientInvoices.find(
                      (inv) => inv.invoiceNumber === selectedInvoice
                    );
                    if (!invoice) return null;
                    const total =
                      (invoice.items || []).reduce(
                        (sum: number, item: any) =>
                          sum + (Number(item.amount) || 0),
                        0
                      ) + (Number(invoice.shipping) || 0);
                    return (
                      <tr className="bg-blue-50">
                        <td className="px-3 py-2 font-medium">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-3 py-2">{invoice.date}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          ₹{total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Notes / Description
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes about this payment..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          rows={3}
        />
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <p className="text-sm text-gray-500">* Required fields</p>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              const paymentId = (initialValues as any)?._id;
              if (mode === "edit" && paymentId) {
                window.open(
                  `/finance/payments-received/preview/${paymentId}`,
                  "_blank"
                );
              } else {
                alert(
                  "Please save the payment first before printing or downloading."
                );
              }
            }}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-800"
          >
            Print / Download
          </Button>
          <Button
            type="button"
            onClick={() => {
              const paymentId = (initialValues as any)?._id;
              if (mode === "edit" && paymentId) {
                alert("Email functionality will be implemented soon!");
              } else {
                alert("Please save the payment first before sending email.");
              }
            }}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-800"
          >
            Send Email
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
          >
            {mode === "edit" ? "Update Payment" : "Record Payment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
