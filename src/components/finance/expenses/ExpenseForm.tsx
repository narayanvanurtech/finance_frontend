import React, { useState } from "react";
import HeaderBar from "./HeaderBar";
import SelectVendorSection from "../SelectVendorSection";
import ItemTable from "../ItemTable";
import SummaryCard from "../SummaryCard";
import AdditionalInputs from "../AdditionalInputs";
import ActionBar from "./ActionBar";
import AddItemModal from "@/components/finance/AddItemModal";
import AddItemBulkModal from "@/components/finance/AddItemBulkModal";
import YourDetailsSection from "@/components/finance/BussinessDetailsSection";
import type { Vendor } from "@/stores/financeStore/useVendorStore";
import AddVendorModal from "@/components/finance//AddVendorModal";

export type ExpenseFormValues = {
  expenseNo: string;
  invoiceNo: string;
  purchaseDate: string;
  dueDate: string;
  vendorId: string;
  vendorDetails: any;
  businessDetails: any;
  items: any[];
  discountType: string;
  discountValue: number;
  shipping: number;
  roundOff: boolean;
  showHSN: boolean;
  showUnit: boolean;
  terms: string;
  notes: string;
  attachments: File[];
  showSignature: boolean;
  expenseCategory: string;
  paymentMode: string;
};

type ExpenseFormProps = {
  initialValues: ExpenseFormValues;
  onSubmit: (values: ExpenseFormValues) => void;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  loading?: boolean;
  mockVendors: Vendor[];
  mockProducts?: any[];
};

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialValues,
  onSubmit,
  mode,
  onSuccess,
  loading,
  mockVendors,
  mockProducts,
}) => {
  const products = mockProducts || [];
  // Header state
  const [expenseNo, setExpenseNo] = useState(initialValues.expenseNo || "");
  const [invoiceNo, setInvoiceNo] = useState(initialValues.invoiceNo || "");
  const [purchaseDate, setPurchaseDate] = useState(
    initialValues.purchaseDate || ""
  );
  const [dueDate, setDueDate] = useState(initialValues.dueDate || "");

  // NEW FIELDS - Expense Category & Payment Mode
  const [expenseCategory, setExpenseCategory] = useState(
    initialValues.expenseCategory || ""
  );
  const [paymentMode, setPaymentMode] = useState(
    initialValues.paymentMode || ""
  );

  // Vendor state
  const [vendorId, setVendorId] = useState(initialValues.vendorId);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [vendorDetails, setVendorDetails] = useState(
    initialValues.vendorDetails
  );
  // Business state
  const [businessDetails, setBusinessDetails] = useState(
    initialValues.businessDetails
  );
  // Items and other states
  const [items, setItems] = useState(initialValues.items);
  const [discountType, setDiscountType] = useState<"flat" | "percentage">(
    (initialValues.discountType as "flat" | "percentage") || "flat"
  );
  const [discountValue, setDiscountValue] = useState(
    initialValues.discountValue
  );
  const [shipping, setShipping] = useState(initialValues.shipping);
  const [roundOff, setRoundOff] = useState(initialValues.roundOff);
  const [showHSN, setShowHSN] = useState(initialValues.showHSN);
  const [showUnit, setShowUnit] = useState(initialValues.showUnit);
  const [terms, setTerms] = useState(initialValues.terms);
  const [notes, setNotes] = useState(initialValues.notes);
  const [attachments, setAttachments] = useState<File[]>(
    initialValues.attachments
  );
  const [showSignature, setShowSignature] = useState(
    initialValues.showSignature
  );
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddItemBulkModal, setShowAddItemBulkModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Shipping details state
  const [showShippingDetails, setShowShippingDetails] = useState(false);
  const [shippingFrom, setShippingFrom] = useState({
    name: "",
    address: "",
    contact: "",
    email: "",
  });
  const [shippingTo, setShippingTo] = useState({
    name: "",
    address: "",
    contact: "",
    email: "",
  });

  // Tax configuration states
  const [taxType, setTaxType] = useState<"inclusive" | "exclusive">(
    "exclusive"
  );
  const [taxConfiguration, setTaxConfiguration] = useState<
    "IGST" | "SGST_CGST"
  >("IGST");
  const [cessList, setCessList] = useState<any[]>([]);

  // Auto-switch tax configuration when business or vendor state changes
  React.useEffect(() => {
    const vendorState = (vendorDetails as any)?.state || "";
    const businessState = (businessDetails as any)?.state || "";

    if (businessState && vendorState) {
      if (businessState === vendorState) {
        // Same state - SGST + CGST
        setTaxConfiguration("SGST_CGST");
      } else {
        // Different state - IGST
        setTaxConfiguration("IGST");
      }
    }
  }, [businessDetails, vendorDetails]);

  // Handlers for items
  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev: any) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };

      // If qty is changed, also update quantity field (for consistency)
      if (field === "qty") {
        updated[idx].quantity = value;
      }
      if (field === "quantity") {
        updated[idx].qty = value;
      }

      // Recalculate amount
      const item = updated[idx];
      const qty = Number(item.quantity || item.qty) || 0;
      const rate = Number(item.rate) || 0;
      const discount = Number(item.discount) || 0;

      let subtotal = qty * rate;

      // Apply discount
      if (item.discountType === "percentage") {
        subtotal = subtotal - (subtotal * discount) / 100;
      } else {
        subtotal = subtotal - discount;
      }

      // Calculate tax if exclusive
      let taxAmount = 0;
      if (taxType === "exclusive") {
        if (taxConfiguration === "IGST") {
          taxAmount = (subtotal * (Number(item.igst) || 0)) / 100;
        } else if (taxConfiguration === "SGST_CGST") {
          const sgstAmount = (subtotal * (Number(item.sgst) || 0)) / 100;
          const cgstAmount = (subtotal * (Number(item.cgst) || 0)) / 100;
          taxAmount = sgstAmount + cgstAmount;
        }

        // Add cess if any
        cessList.forEach((cess) => {
          if (cess.showInInvoice && item[cess.name]) {
            taxAmount += (subtotal * (Number(item[cess.name]) || 0)) / 100;
          }
        });
      }

      updated[idx].amount = subtotal + taxAmount;
      return updated;
    });
  };
  const handleAddItem = () => {
    setItems((prev: any) => [
      ...prev,
      {
        name: "",
        description: "",
        quantity: 1,
        qty: 1,
        rate: 0,
        discount: 0,
        discountType: "flat",
        igst: 0,
        sgst: 0,
        cgst: 0,
        amount: 0,
        hsn: "",
        unit: "pcs",
      },
    ]);
  };
  const handleRemoveItem = (idx: number) => {
    setItems((prev: any) => prev.filter((_: any, i: any) => i !== idx));
  };
  const onAddNewItemClick = () => setShowAddItemModal(true);
  const openBulkModal = () => setShowAddItemBulkModal(true);

  // Helper function to format address object to string
  const formatAddress = (address: any): string => {
    if (!address) return "";
    if (typeof address === "string") return address;

    const parts = [
      address.streetAddress,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);

    const formatted = parts.join(", ");
    console.log("Address parts:", parts);
    console.log("Formatted result:", formatted);
    return formatted;
  };

  // Vendor selection handler
  const handleVendorSelect = (value: string) => {
    setVendorId(value);
    if (value === "new") return;
    const found = mockVendors.find((v: any) => String(v._id || v.id) === value);
    if (!found) {
      console.log("Vendor not found for value:", value);
      return;
    }

    console.log("Found vendor:", found);
    console.log("Vendor address:", found.address);
    console.log("Formatted address:", formatAddress(found.address));

    const vendorState =
      (found.address as any)?.state || (found as any).state || "";
    const businessState = (businessDetails as any)?.state || "";

    // Update vendor details
    setVendorDetails({
      name: found.name || "",
      gstin: found.gstin || "",
      address: formatAddress(found.address),
      contact: found.phone || found.contact || "",
      email: found.email || "",
    });

    console.log("Vendor details set:", {
      name: found.name || "",
      gstin: found.gstin || "",
      address: formatAddress(found.address),
      contact: found.phone || found.contact || "",
      email: found.email || "",
    });

    // Auto-switch tax configuration based on state
    // SAME STATE = CGST + SGST, DIFFERENT STATE = IGST
    if (businessState && vendorState) {
      if (businessState === vendorState) {
        setTaxConfiguration("SGST_CGST");

        // Update items with SGST/CGST if they have IGST
        setItems((prev: any) =>
          prev.map((item: any) => {
            if (item.igst && item.igst > 0) {
              const halfTax = item.igst / 2;
              return {
                ...item,
                sgst: halfTax,
                cgst: halfTax,
                igst: 0,
              };
            }
            return item;
          })
        );
      } else {
        setTaxConfiguration("IGST");

        // Update items with IGST if they have SGST/CGST
        setItems((prev: any) =>
          prev.map((item: any) => {
            if ((item.sgst || item.cgst) && (item.sgst > 0 || item.cgst > 0)) {
              const totalTax = (item.sgst || 0) + (item.cgst || 0);
              return {
                ...item,
                igst: totalTax,
                sgst: 0,
                cgst: 0,
              };
            }
            return item;
          })
        );
      }
    }
  };
  // Summary calculations (simple version)
  const subtotal = items.reduce(
    (sum: number, item: any) =>
      sum + (Number(item.quantity || item.qty) || 0) * (Number(item.rate) || 0),
    0
  );
  let discount = 0;
  if (discountType === "flat") discount = discountValue;
  else if (discountType === "percentage")
    discount = (subtotal * discountValue) / 100;
  const taxable = subtotal - discount;
  let total = taxable + Number(shipping || 0);
  if (roundOff) total = Math.round(total);
  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };
  const handleFormSubmit = () => {
    const newErrors: { [key: string]: string } = {};
    if (!expenseNo.trim()) newErrors.expenseNo = "Expense No is required";
    if (!purchaseDate) newErrors.purchaseDate = "Purchase Date is required";
    if (!vendorId) newErrors.vendorId = "Vendor is required";
    if (
      !items ||
      items.length === 0 ||
      items.every((item: any) => !item.name.trim())
    )
      newErrors.items = "At least one item is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit({
      expenseNo,
      invoiceNo,
      purchaseDate,
      dueDate,
      vendorId,
      vendorDetails: { ...vendorDetails },
      businessDetails: businessDetails,
      items,
      discountType,
      discountValue,
      shipping,
      roundOff,
      showHSN,
      showUnit,
      terms,
      notes,
      attachments,
      showSignature,
      expenseCategory,
      paymentMode,
    });
    if (onSuccess) onSuccess();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header Section - Expense No, Invoice No, Dates */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expense No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={expenseNo}
              onChange={(e) => setExpenseNo(e.target.value)}
              placeholder="EXP-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            {errors.expenseNo && (
              <div className="text-red-500 text-xs mt-1">
                {errors.expenseNo}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice No
            </label>
            <input
              type="text"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder="INV-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            {errors.purchaseDate && (
              <div className="text-red-500 text-xs mt-1">
                {errors.purchaseDate}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Category & Payment Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expense Category
            </label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value="">Select Category</option>
              <option value="office-supplies">Office Supplies</option>
              <option value="travel">Travel & Transportation</option>
              <option value="utilities">Utilities</option>
              <option value="rent">Rent</option>
              <option value="salaries">Salaries & Wages</option>
              <option value="marketing">Marketing & Advertising</option>
              <option value="equipment">Equipment & Machinery</option>
              <option value="maintenance">Maintenance & Repairs</option>
              <option value="professional-services">
                Professional Services
              </option>
              <option value="inventory">Inventory Purchase</option>
              <option value="insurance">Insurance</option>
              <option value="software">Software & Subscriptions</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value="">Select Payment Mode</option>
              <option value="cash">Cash</option>
              <option value="credit-card">Credit Card</option>
              <option value="debit-card">Debit Card</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
              <option value="net-banking">Net Banking</option>
              <option value="wallet">Digital Wallet</option>
              <option value="credit">On Credit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendor error message */}
      <div className="mb-2">
        {errors.vendorId && (
          <div className="text-red-500 text-xs">{errors.vendorId}</div>
        )}
      </div>

      {/* Business & Vendor Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Business Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
            Business Details
          </h3>
          <YourDetailsSection businessDetails={businessDetails} hideSelector />
        </div>

        {/* Vendor Details */}

        <SelectVendorSection
          vendorId={vendorId}
          onVendorSelect={handleVendorSelect}
          showAddVendor={showAddVendor}
          setShowAddVendor={setShowAddVendor}
          vendorDetails={vendorDetails}
          setVendorDetails={setVendorDetails}
          handleAddVendor={() => setShowAddVendor(true)}
          mockVendors={mockVendors}
        />
      </div>

      {/* Shipping Details Section - Compact Design */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showShippingDetails"
            checked={showShippingDetails}
            onChange={(e) => setShowShippingDetails(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor="showShippingDetails"
            className="text-sm font-medium text-gray-700 cursor-pointer select-none"
          >
            Add Shipping Details
          </label>
        </div>

        {showShippingDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3 pt-3 border-t border-gray-200">
            {/* Shipping FROM */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">
                Ship From
              </h3>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={shippingFrom.name}
                  onChange={(e) =>
                    setShippingFrom({ ...shippingFrom, name: e.target.value })
                  }
                  placeholder="Company/Person Name"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={shippingFrom.address}
                  onChange={(e) =>
                    setShippingFrom({
                      ...shippingFrom,
                      address: e.target.value,
                    })
                  }
                  placeholder="Complete shipping address"
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  value={shippingFrom.contact}
                  onChange={(e) =>
                    setShippingFrom({
                      ...shippingFrom,
                      contact: e.target.value,
                    })
                  }
                  placeholder="Phone number"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={shippingFrom.email}
                  onChange={(e) =>
                    setShippingFrom({ ...shippingFrom, email: e.target.value })
                  }
                  placeholder="email@example.com"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
            </div>

            {/* Shipping TO */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">
                Ship To
              </h3>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={shippingTo.name}
                  onChange={(e) =>
                    setShippingTo({ ...shippingTo, name: e.target.value })
                  }
                  placeholder="Company/Person Name"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={shippingTo.address}
                  onChange={(e) =>
                    setShippingTo({ ...shippingTo, address: e.target.value })
                  }
                  placeholder="Complete shipping address"
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  value={shippingTo.contact}
                  onChange={(e) =>
                    setShippingTo({ ...shippingTo, contact: e.target.value })
                  }
                  placeholder="Phone number"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={shippingTo.email}
                  onChange={(e) =>
                    setShippingTo({ ...shippingTo, email: e.target.value })
                  }
                  placeholder="email@example.com"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <ItemTable
        items={items}
        setItems={setItems}
        handleItemChange={handleItemChange}
        handleAddItem={handleAddItem}
        handleRemoveItem={handleRemoveItem}
        showHSN={showHSN}
        setShowHSN={setShowHSN}
        showUnit={showUnit}
        setShowUnit={setShowUnit}
        onAddNewItemClick={onAddNewItemClick}
        openBulkModal={openBulkModal}
        taxType={taxType}
        taxConfiguration={taxConfiguration}
        cessList={cessList}
        setTaxType={setTaxType}
        setTaxConfiguration={setTaxConfiguration}
        setCessList={setCessList}
        mockProducts={products}
      />
      {/* Error message for items */}
      {errors.items && (
        <div className="text-red-500 text-xs mb-2">{errors.items}</div>
      )}
      <SummaryCard
        subtotal={subtotal}
        discountType={discountType}
        discountValue={discountValue}
        setDiscountType={setDiscountType}
        setDiscountValue={setDiscountValue}
        tax={0}
        shipping={shipping}
        setShipping={setShipping}
        roundOff={roundOff}
        setRoundOff={setRoundOff}
        total={total}
      />
      <AdditionalInputs
        terms={terms}
        setTerms={setTerms}
        notes={notes}
        setNotes={setNotes}
        attachments={attachments}
        handleAttachment={handleAttachment}
        showSignature={showSignature}
        setShowSignature={setShowSignature}
      />
      <ActionBar mode={mode} onSubmit={handleFormSubmit} loading={loading} />
      <AddItemModal
        open={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onSubmit={(item) => {
          setItems((prev: any) => [
            ...prev,
            {
              name: item.name,
              description: item.description,
              qty: 1,
              rate: item.sellingPrice,
              discount: 0,
              amount: item.sellingPrice,
              hsn: "",
              unit: "pcs",
            },
          ]);
          setShowAddItemModal(false);
        }}
      />
      <AddItemBulkModal
        open={showAddItemBulkModal}
        onClose={() => setShowAddItemBulkModal(false)}
        onSubmit={(bulkItems) => {
          setItems((prev: any) => [
            ...prev,
            ...bulkItems.map((item) => ({
              name: item.name,
              description: "",
              qty: item.unit,
              rate: 0,
              discount: 0,
              amount: 0,
              hsn: "",
              unit: "pcs",
            })),
          ]);
          setShowAddItemBulkModal(false);
        }}
      />
      <AddVendorModal
        open={showAddVendor}
        onOpenChange={setShowAddVendor}
        onSuccess={() => {
          setShowAddVendor(false);
          // Optionally, select the newly added vendor here if you have access to the vendor list
        }}
      />
    </div>
  );
};

export default ExpenseForm;
