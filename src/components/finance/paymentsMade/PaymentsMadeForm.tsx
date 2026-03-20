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
import { useRouter } from "next/navigation";
import { useGetVendors } from "@/hooks/useVendorQueries";
import { useGetPurchaseOrders } from "@/hooks/usePurchaseOrderQueries";
import { useGetVendorPendingPurchases } from "@/hooks/usePaymentMadeQueries";

export type PaymentRecord = {
  paymentMethod: string;
  paidFrom: string;
  amountPaid: number;
  tdsPercent?: number;
  tdsDeductedAmount?: number;
  transactionCharge?: number;
  referenceId?: string;
  notes?: string;
};

export type Allocation = {
  purchaseId: string;
  amount: number;
};

export type PaymentsMadeFormValues = {
  vendorId: string;
  receiptDate: string;
  paymentType: "Payment" | "Advance";
  paymentRecords: PaymentRecord[];
  allocations: Allocation[];
  purpose?: string;
  internalNotes?: string;
  // Temporary backward compatibility
  paymentNo?: string;
  amountPaid?: string;
  paymentDate?: string;
  paymentMode?: string;
  paidThrough?: string;
  referenceNo?: string;
  selectedPurchases?: string[];
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
  vendorId: "",
  receiptDate: getTodayDate(),
  paymentType: "Payment",
  paymentRecords: [
    {
      paymentMethod: "",
      paidFrom: "",
      amountPaid: 0,
      tdsPercent: 0,
      tdsDeductedAmount: 0,
      transactionCharge: 0,
      referenceId: "",
      notes: "",
    },
  ],
  allocations: [],
  purpose: "",
  internalNotes: "",
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

const PAYMENT_TYPES = ["Payment", "Advance"];

export default function PaymentsMadeForm({
  initialValues,
  mode = "create",
  onSubmit,
  loading,
}: PaymentsMadeFormProps) {
  const router = useRouter();

  // React Query hooks
  const { data: vendorsResponse, isLoading: vendorsLoading } = useGetVendors();
  const { data: purchaseOrdersResponse, isLoading: purchaseOrdersLoading } =
    useGetPurchaseOrders();

  // Memoize vendors to prevent infinite re-renders
  const vendors = React.useMemo(
    () =>
      (vendorsResponse?.result?.vendors || []).map((v: any) => ({
        ...v,
        name:
          typeof v.name === "object"
            ? `${v.name.streetAddress || ""}, ${v.name.city || ""}, ${
                v.name.state || ""
              }`.trim()
            : v.name,
      })),
    [vendorsResponse]
  );

  const purchaseOrders = React.useMemo(
    () => purchaseOrdersResponse?.result?.purchaseOrders || [],
    [purchaseOrdersResponse]
  );

  // Create a map of vendors with their PO counts for debugging (memoized)
  const vendorPOCounts = React.useMemo(() => {
    const counts = new Map();
    purchaseOrders.forEach((po: any) => {
      const poVendorId =
        po.vendorId?._id ||
        po.vendorSnapshot?._id ||
        po.vendorDetails?._id ||
        po.vendorId;
      if (poVendorId) {
        counts.set(poVendorId, (counts.get(poVendorId) || 0) + 1);
      }
    });
    return counts;
  }, [purchaseOrders]);

  // Debug log (only run once when data changes)
  React.useEffect(() => {
    if (vendors.length > 0) {
      console.log("📊 Vendors with Purchase Orders:");
      vendors.forEach((v: any) => {
        const count = vendorPOCounts.get(v._id) || 0;
        console.log(`  - ${v.name} (${v._id}): ${count} PO(s)`);
      });
    }
  }, [vendors, vendorPOCounts]);

  // Form state
  const [vendorId, setVendorId] = useState(
    initialValues?.vendorId || defaultInitialValues.vendorId
  );

  // Use the new API for vendor pending purchases - after vendorId is declared
  const { data: pendingPurchasesResponse, isLoading: pendingPurchasesLoading } =
    useGetVendorPendingPurchases(vendorId, !!vendorId && vendorId !== "new");

  const [vendorDetails, setVendorDetails] = useState<any>({});
  const [selectedPurchase, setSelectedPurchase] = useState(
    initialValues?.selectedPurchases?.[0] || ""
  );
  const [paymentNo, setPaymentNo] = useState(
    initialValues?.paymentNo || defaultInitialValues.paymentNo
  );
  const [amountPaid, setAmountPaid] = useState(
    initialValues?.amountPaid || defaultInitialValues.amountPaid
  );
  const [receiptDate, setReceiptDate] = useState(
    initialValues?.receiptDate || defaultInitialValues.receiptDate
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
  const [paymentType, setPaymentType] = useState<"Payment" | "Advance">(
    initialValues?.paymentType || defaultInitialValues.paymentType
  );
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>(
    initialValues?.selectedPurchases || []
  );
  const [notes, setNotes] = useState(
    initialValues?.notes || defaultInitialValues.notes
  );
  const [purpose, setPurpose] = useState(
    initialValues?.purpose || defaultInitialValues.purpose
  );
  const [internalNotes, setInternalNotes] = useState(
    initialValues?.internalNotes || defaultInitialValues.internalNotes
  );

  // Error states
  const [errors, setErrors] = useState<{
    vendorId?: string;
    paymentMode?: string;
    paidThrough?: string;
    amountPaid?: string;
    paymentType?: string;
  }>({});

  // Update vendorDetails when vendorId changes
  useEffect(() => {
    if (vendorId && vendorId !== "new") {
      const found = vendors.find((v: any) => v._id === vendorId);
      if (found) {
        // Helper function to safely convert address object to string
        const formatAddress = (addr: any) => {
          if (!addr) return "N/A";
          if (typeof addr === "string") return addr;
          if (typeof addr === "object") {
            const parts = [
              addr.streetAddress,
              addr.city,
              addr.state,
              addr.postalCode,
              addr.country,
            ].filter(Boolean);
            return parts.length > 0 ? parts.join(", ") : "N/A";
          }
          return "N/A";
        };

        setVendorDetails({
          name: found.name,
          gstin: found.gstin || "N/A",
          address: formatAddress(found.address),
          contact: found.phone || "N/A",
          email: found.email || "N/A",
        });
      }
    } else if (vendorId === "new") {
      setVendorDetails({});
    }
  }, [vendorId, vendors]);

  // Filter purchase orders for this vendor (memoized to prevent re-renders)
  const vendorPurchases = React.useMemo(() => {
    if (!vendorId || vendorId === "new") {
      console.log("❌ No vendor selected");
      return [];
    }

    const filtered = purchaseOrders.filter((po: any) => {
      // Handle different vendorId structures
      let poVendorId = null;

      console logs show vendorId is coming as a string in the object
      // Example from logs: {poVendorId: '694398e89abdf58be860aa7a', ...}
      console.log(`  PO ${po.purchaseOrderNumber}:`, {
        rawVendorId: po.vendorId,
        vendorIdType: typeof po.vendorId,
      });

      // Try to get vendorId from different possible locations
      if (typeof po.vendorId === "string") {
        poVendorId = po.vendorId;
      } else if (typeof po.vendorId === "object" && po.vendorId !== null) {
        // If vendorId is an object, try to get _id or the ID from the object
        if (po.vendorId._id) {
          poVendorId = po.vendorId._id;
        } else {
          // Sometimes the object itself contains the ID as a property
          // Try to find any property that looks like an ID
          const keys = Object.keys(po.vendorId);
          if (keys.length > 0) {
            poVendorId = po.vendorId[keys[0]]; // Get first property value
          }
        }
      } else if (po.vendorSnapshot?._id) {
        poVendorId = po.vendorSnapshot._id;
      } else if (po.vendorDetails?._id) {
        poVendorId = po.vendorDetails._id;
      }

      const matches = poVendorId && String(poVendorId) === String(vendorId);
      return matches;
    });

    if (filtered.length > 0) {
      console.log(
        "✅ Matched Purchase Orders:",
        filtered.map((po: any) => ({
          id: po._id,
          number: po.purchaseOrderNumber,
        }))
      );
    }
    return filtered;
  }, [purchaseOrders, vendorId]);

  // Handle purchase order selection and auto-fill amount (memoized callback)
  const handlePurchaseSelect = React.useCallback(
    (purchaseId: string) => {
      console.log("🔍 Purchase Order ID Selected:", purchaseId);
      setSelectedPurchase(purchaseId);

      if (purchaseId && purchaseId !== "none" && purchaseId !== "loading") {
        const purchase = vendorPurchases.find(
          (po: any) => po._id === purchaseId
        );

        console.log("🔍 Found Purchase:", purchase);

        if (purchase) {
          console.log("🔍 Purchase Items:", purchase.items);
          console.log("🔍 Purchase Shipping:", purchase.shipping);
          console.log("🔍 Purchase Grand Total:", purchase.grandTotal);

          // Try to use grandTotal first, if not available calculate from items
          let total = 0;
          if (purchase.grandTotal) {
            total = Number(purchase.grandTotal);
          } else {
            total =
              (purchase.items || []).reduce(
                (sum: number, item: any) => sum + (Number(item.amount) || 0),
                0
              ) + (Number(purchase.shipping) || 0);
          }

          console.log("💰 Calculated Total:", total);
          setAmountPaid(total.toString());
        } else {
          console.log("❌ Purchase not found in vendorPurchases");
        }
      } else {
        setAmountPaid("");
      }
    },
    [vendorPurchases]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validation
    const newErrors: typeof errors = {};

    if (!vendorId) {
      newErrors.vendorId = "Please select a vendor";
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
    if (
      !paymentType ||
      (paymentType !== "Payment" && paymentType !== "Advance")
    ) {
      newErrors.paymentType = "Please select payment type (Payment or Advance)";
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
        paidFrom: paidThrough!,
        amountPaid: Number(amountPaid),
        tdsPercent: 0,
        tdsDeductedAmount: 0,
        transactionCharge: 0,
        referenceId: referenceNo || "",
        notes: notes || "",
      },
    ];

    const allocations: Allocation[] = selectedPurchase
      ? [
          {
            purchaseId: selectedPurchase,
            amount: Number(amountPaid),
          },
        ]
      : [];

    onSubmit({
      vendorId,
      receiptDate,
      paymentType,
      paymentRecords,
      allocations,
      purpose,
      internalNotes,
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Record Payment Made
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Track payments made to vendors
        </p>
      </div>

      {/* Vendor Selection */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Vendor Name *
        </label>
        <div className="flex gap-2 items-center">
          <Select
            onValueChange={(val) => {
              if (val === "new") {
                router.push("/finance/vendors/create");
              } else {
                setVendorId(val);
                setErrors((prev) => ({ ...prev, vendorId: undefined }));
              }
            }}
            value={vendorId}
          >
            <SelectTrigger
              className={`flex-1 bg-white ${
                errors.vendorId ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select Vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((v) => (
                <SelectItem key={v._id} value={v._id}>
                  {v.name}
                </SelectItem>
              ))}
              <SelectItem value="new">+ Add New Vendor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors.vendorId && (
          <p className="text-red-500 text-xs mt-1">{errors.vendorId}</p>
        )}
        {vendorDetails.name && (
          <div className="mt-3 text-sm text-gray-600 bg-white p-3 rounded border">
            <p>
              <strong>Contact:</strong> {vendorDetails.contact || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {vendorDetails.email || "N/A"}
            </p>
          </div>
        )}
      </div>

      {/* Vendor Pending Purchases - New Section */}
      {/* {vendorId && vendorId !== "new" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-yellow-600">⚠️</span>
            Pending Purchases for this Vendor
          </h3>
          {pendingPurchasesLoading ? (
            <div className="text-sm text-gray-600">
              Loading pending purchases...
            </div>
          ) : pendingPurchasesResponse?.result &&
            pendingPurchasesResponse.result.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pendingPurchasesResponse.result.map((purchase: any) => (
                <div
                  key={purchase._id}
                  className="bg-white p-3 rounded border border-yellow-300 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        PO #{purchase.purchaseOrderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        Date:{" "}
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </p>
                      {purchase.dueDate && (
                        <p className="text-xs text-red-600">
                          Due: {new Date(purchase.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{purchase.balanceAmount?.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-500">
                        Total: ₹{purchase.totalAmount?.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-green-600">
                        Paid: ₹{purchase.paidAmount?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{
                          width: `${
                            ((purchase.paidAmount || 0) /
                              (purchase.totalAmount || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              ✅ No pending purchases for this vendor
            </p>
          )}
        </div>
      )} */}

      {/* Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Select Purchase Order *
          </label>
          <Select
            onValueChange={handlePurchaseSelect}
            value={selectedPurchase}
            disabled={
              !vendorId ||
              vendorId === "new" ||
              purchaseOrdersLoading ||
              vendorsLoading
            }
          >
            <SelectTrigger className="bg-gray-50">
              <SelectValue
                placeholder={
                  vendorsLoading || purchaseOrdersLoading
                    ? "Loading..."
                    : !vendorId || vendorId === "new"
                    ? "Please select a vendor first"
                    : "Select a purchase order"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {purchaseOrdersLoading || vendorsLoading ? (
                <SelectItem value="loading" disabled>
                  Loading...
                </SelectItem>
              ) : vendorPurchases.length === 0 ? (
                <SelectItem value="none" disabled>
                  {!vendorId || vendorId === "new"
                    ? "Please select a vendor first"
                    : "No purchase orders available for this vendor"}
                </SelectItem>
              ) : (
                vendorPurchases.map((po: any) => {
                  return (
                    <SelectItem key={po._id} value={po._id || ""}>
                      {po.purchaseOrderNumber}
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
            placeholder="Auto-filled from purchase order"
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
            value={receiptDate}
            onChange={(e) => setReceiptDate(e.target.value)}
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
              setPaymentType(val as "Payment" | "Advance");
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
          {!paymentType && !errors.paymentType && (
            <p className="text-blue-600 text-xs mt-1">
              💡 Choose "Payment" for invoice payments or "Advance" for advance
              payments
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Paid From *
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

      {/* Purchase Order Details */}
      {vendorId && vendorId !== "new" && selectedPurchase && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Purchase Order Details
          </label>
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">PO Number</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const purchase = vendorPurchases.find(
                      (po: any) => po._id === selectedPurchase
                    );
                    if (!purchase) return null;
                    const total =
                      (purchase.items || []).reduce(
                        (sum: number, item: any) =>
                          sum + (Number(item.amount) || 0),
                        0
                      ) + (Number(purchase.shipping) || 0);
                    return (
                      <tr className="bg-blue-50">
                        <td className="px-3 py-2 font-medium">
                          {purchase.purchaseOrderNumber}
                        </td>
                        <td className="px-3 py-2">
                          {purchase.purchaseOrderDate}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold">
                          ₹{total.toFixed(2) || amountPaid}
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

      {/* Purpose */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Purpose
        </label>
        <Input
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Purpose of payment..."
          className="bg-gray-50"
        />
      </div>

      {/* Internal Notes */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Internal Notes
        </label>
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Add any internal notes about this payment..."
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
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              const paymentId = (initialValues as any)?._id;
              if (mode === "edit" && paymentId) {
                window.open(
                  `/finance/payments-made/preview/${paymentId}`,
                  "_blank"
                );
              } else {
                alert(
                  "Please save the payment first before printing or downloading."
                );
              }
            }}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-800"
            disabled={loading}
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
            disabled={loading}
          >
            Send Email
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : mode === "edit"
              ? "Update Payment"
              : "Record Payment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
