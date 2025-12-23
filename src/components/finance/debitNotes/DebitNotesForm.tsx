import React, { useState } from "react";
import HeaderBar from "./HeaderBar";
import SelectVendorSection from "@/components/finance/SelectVendorSection";
import ItemTable from "../ItemTable";
import SummaryCard from "../SummaryCard";
import AdditionalInputs from "../AdditionalInputs";
import ActionBar from "./ActionBar";
import AddVendorModal from "@/components/finance/AddVendorModal";
import AddItemModal from "@/components/finance/AddItemModal";
import AddItemBulkModal from "@/components/finance/AddItemBulkModal";
import YourDetailsSection from "@/components/finance/BussinessDetailsSection";

// Types for invoices and reasons
export type Invoice = {
  id: string;
  label: string;
};

export type DebitNoteFormValues = {
  debitNoteNo: string;
  debitNoteDate: string;
  linkedInvoice: string;
  reason: string;
  purchaseId: string;
  originalBillNumber: string;
  originalBillDate?: string;
  priority?: string;
  debitType: string;
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
  taxType: "inclusive" | "exclusive";
  taxConfiguration: "IGST" | "SGST_CGST";
  cessList: { name: string; showInInvoice: boolean }[];
  terms: string;
  notes: string;
  attachments: File[];
  showSignature: boolean;
};

type PurchaseOrder = {
  _id: string;
  purchaseOrderNumber: string;
  purchaseOrderDate: string;
  vendorId: any;
  items?: any[];
};

type DebitNotesFormProps = {
  initialValues: DebitNoteFormValues;
  onSubmit: (values: DebitNoteFormValues) => void;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  loading?: boolean;
  invoices: Invoice[];
  reasons: string[];
  mockVendors?: any[];
  mockProducts?: any[];
  purchaseOrders?: PurchaseOrder[];
  onVendorChange?: (vendorId: string) => void;
};

const DebitNotesForm: React.FC<DebitNotesFormProps> = ({
  initialValues,
  onSubmit,
  mode,
  onSuccess,
  loading,
  invoices,
  reasons,
  mockVendors,
  mockProducts,
  purchaseOrders = [],
  onVendorChange,
}) => {
  const vendors = mockVendors || [];
  const products = mockProducts || [];

  // Debug: Log vendors and purchase orders
  React.useEffect(() => {
    console.log("👥 Vendors loaded:", vendors.length);
    if (vendors.length > 0) {
      console.log("📝 First vendor:", vendors[0]);
    }
    console.log("📦 Purchase Orders available:", purchaseOrders.length);
  }, [vendors, purchaseOrders]);

  // Header state
  const [debitNoteNo, setDebitNoteNo] = useState(
    initialValues.debitNoteNo || ""
  );
  const [originalBillDate, setOriginalBillDate] = useState(
    initialValues.originalBillDate || ""
  );
  const [priority, setPriority] = useState(initialValues.priority || "");
  const [debitNoteDate, setDebitNoteDate] = useState(
    initialValues.debitNoteDate || ""
  );
  const [linkedInvoice, setLinkedInvoice] = useState(
    initialValues.linkedInvoice || ""
  );
  const [reason, setReason] = useState(initialValues.reason || "");
  const [purchaseId, setPurchaseId] = useState(initialValues.purchaseId || "");
  const [originalBillNumber, setOriginalBillNumber] = useState(
    initialValues.originalBillNumber || ""
  );
  const [debitType, setDebitType] = useState(initialValues.debitType || "");
  // Other state
  const [vendorId, setVendorId] = useState(initialValues.vendorId);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [vendorDetails, setVendorDetails] = useState(
    initialValues.vendorDetails
  );
  const [items, setItems] = useState(initialValues.items);
  const [discountType, setDiscountType] = useState(initialValues.discountType);
  const [discountValue, setDiscountValue] = useState(
    initialValues.discountValue
  );
  const [shipping, setShipping] = useState(initialValues.shipping);
  const [roundOff, setRoundOff] = useState(initialValues.roundOff);
  const [showHSN, setShowHSN] = useState(initialValues.showHSN);
  const [showUnit, setShowUnit] = useState(initialValues.showUnit);
  const [taxType, setTaxType] = useState<"inclusive" | "exclusive">(
    initialValues.taxType || "exclusive"
  );
  const [taxConfiguration, setTaxConfiguration] = useState<
    "IGST" | "SGST_CGST"
  >(initialValues.taxConfiguration || "IGST");
  const [cessList, setCessList] = useState<
    { name: string; showInInvoice: boolean }[]
  >(initialValues.cessList || []);
  const [terms, setTerms] = useState(initialValues.terms);
  const [notes, setNotes] = useState(initialValues.notes);
  const [attachments, setAttachments] = useState<File[]>(
    initialValues.attachments
  );
  const [showSignature, setShowSignature] = useState(
    initialValues.showSignature
  );
  const [businessDetails] = useState(initialValues.businessDetails);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddItemBulkModal, setShowAddItemBulkModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handlers for items
  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev: any) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };

      // Recalculate amount with proper tax calculation
      const item = updated[idx];
      const qty = Number(item.qty) || 0;
      const rate = Number(item.rate) || 0;
      const baseAmount = qty * rate;

      // Apply discount
      let discount = 0;
      if (item.discountType === "percentage") {
        discount = (baseAmount * (Number(item.discount) || 0)) / 100;
      } else {
        discount = Number(item.discount) || 0;
      }

      const taxableAmount = baseAmount - discount;

      // Calculate tax if exclusive
      let taxAmount = 0;
      if (taxType === "exclusive") {
        if (taxConfiguration === "IGST") {
          taxAmount = (taxableAmount * (Number(item.igst) || 0)) / 100;
        } else if (taxConfiguration === "SGST_CGST") {
          const sgstAmount = (taxableAmount * (Number(item.sgst) || 0)) / 100;
          const cgstAmount = (taxableAmount * (Number(item.cgst) || 0)) / 100;
          taxAmount = sgstAmount + cgstAmount;
        }

        // Add cess if any
        cessList.forEach((cess) => {
          if (cess.showInInvoice) {
            taxAmount += (taxableAmount * (Number(item[cess.name]) || 0)) / 100;
          }
        });
      }

      updated[idx].amount = taxableAmount + taxAmount;
      return updated;
    });
  };
  const handleAddItem = () => {
    setItems((prev: any) => [
      ...prev,
      {
        name: "",
        description: "",
        qty: 1,
        rate: 0,
        discount: 0,
        discountType: "flat",
        amount: 0,
        hsn: "",
        unit: "pcs",
        igst: 0,
        sgst: 0,
        cgst: 0,
        reason: "",
      },
    ]);
  };
  const handleRemoveItem = (idx: number) => {
    setItems((prev: any) => prev.filter((_: any, i: any) => i !== idx));
  };
  const onAddNewItemClick = () => setShowAddItemModal(true);
  const openBulkModal = () => setShowAddItemBulkModal(true);
  const handleAddVendor = () => setShowAddVendor(true);
  const handleVendorSelect = (value: string) => {
    console.log("🎯 Vendor selected:", value);
    setVendorId(value);
    if (value === "new") return;

    // Reset purchase order related fields when vendor changes
    setPurchaseId("");
    setOriginalBillNumber("");

    const found = vendors.find((v: any) => String(v._id || v.id) === value);
    console.log("🔍 Found vendor:", found);

    if (found) {
      setVendorDetails({
        name: found.name,
        gstin: found.gstin,
        address: found.address,
        contact: found.contact,
        email: found.email,
        state: found.state,
      });

      // Trigger purchase order fetch for this vendor
      if (onVendorChange) {
        console.log("📞 Calling onVendorChange with:", value);
        onVendorChange(value);
      }
    } else {
      console.warn("⚠️ Vendor not found for ID:", value);
    }
  };

  const handlePurchaseOrderSelect = (purchaseOrder: PurchaseOrder) => {
    setPurchaseId(purchaseOrder._id);
    setOriginalBillNumber(purchaseOrder.purchaseOrderNumber);
    setOriginalBillDate(purchaseOrder.purchaseOrderDate || "");

    // Optionally populate items from purchase order
    if (purchaseOrder.items && purchaseOrder.items.length > 0) {
      const mappedItems = purchaseOrder.items.map((item: any) => ({
        name: item.name || "",
        description: item.description || "",
        qty: item.quantity || 1,
        rate: item.rate || 0,
        discount: item.discount || 0,
        discountType: item.discountType || "flat",
        amount: item.amount || 0,
        hsn: item.hsn || "",
        unit: item.unit || "pcs",
        igst: item.taxType === "igst" ? item.taxRate || 0 : 0,
        sgst: item.taxType === "cgst_sgst" ? item.taxRate / 2 || 0 : 0,
        cgst: item.taxType === "cgst_sgst" ? item.taxRate / 2 || 0 : 0,
        reason: "", // User needs to fill this
      }));
      setItems(mappedItems);
    }
  };
  // Summary calculations with proper tax calculation
  const subtotal = items.reduce((sum: number, item: any) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    return sum + qty * rate;
  }, 0);

  // Apply global discount
  let globalDiscount = 0;
  if (discountType === "flat") {
    globalDiscount = discountValue;
  } else if (discountType === "percentage") {
    globalDiscount = (subtotal * discountValue) / 100;
  }

  const taxableAmount = subtotal - globalDiscount;

  // Calculate total tax from items
  let totalTax = 0;
  if (taxType === "exclusive") {
    items.forEach((item: any) => {
      const qty = Number(item.qty) || 0;
      const rate = Number(item.rate) || 0;
      const baseAmount = qty * rate;

      let itemDiscount = 0;
      if (item.discountType === "percentage") {
        itemDiscount = (baseAmount * (Number(item.discount) || 0)) / 100;
      } else {
        itemDiscount = Number(item.discount) || 0;
      }

      const itemTaxable = baseAmount - itemDiscount;

      if (taxConfiguration === "IGST") {
        totalTax += (itemTaxable * (Number(item.igst) || 0)) / 100;
      } else if (taxConfiguration === "SGST_CGST") {
        totalTax += (itemTaxable * (Number(item.sgst) || 0)) / 100;
        totalTax += (itemTaxable * (Number(item.cgst) || 0)) / 100;
      }

      // Add cess
      cessList.forEach((cess) => {
        if (cess.showInInvoice) {
          totalTax += (itemTaxable * (Number(item[cess.name]) || 0)) / 100;
        }
      });
    });
  }

  let total = taxableAmount + totalTax + Number(shipping || 0);
  if (roundOff) total = Math.round(total);
  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };
  const handleFormSubmit = () => {
    const newErrors: { [key: string]: string } = {};
    if (!debitNoteNo.trim())
      newErrors.debitNoteNo = "Debit Note No is required";
    if (!debitNoteDate) newErrors.debitNoteDate = "Debit Note Date is required";
    if (!vendorId || !vendorId.trim())
      newErrors.vendorId = "Please select a vendor";
    if (!reason) newErrors.reason = "Reason is required";
    // purchaseId is optional
    if (!originalBillNumber.trim())
      newErrors.originalBillNumber = "Original Bill Number is required";
    if (!debitType) newErrors.debitType = "Debit Type is required";
    if (
      !items ||
      items.length === 0 ||
      items.every((item: any) => !item.name.trim())
    )
      newErrors.items = "At least one item is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit({
      debitNoteNo,
      debitNoteDate,
      linkedInvoice,
      reason,
      purchaseId,
      originalBillNumber,
      originalBillDate,
      priority,
      debitType,
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
      taxType,
      taxConfiguration,
      cessList,
      terms,
      notes,
      attachments,
      showSignature,
    });
    if (onSuccess) onSuccess();
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-3 md:px-8 bg-gradient-to-br from-gray-50 via-blue-50/20 to-white min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <HeaderBar
          debitNoteNo={debitNoteNo}
          setDebitNoteNo={setDebitNoteNo}
          debitNoteDate={debitNoteDate}
          setDebitNoteDate={setDebitNoteDate}
          linkedInvoice={linkedInvoice}
          setLinkedInvoice={setLinkedInvoice}
          reason={reason}
          setReason={setReason}
          purchaseId={purchaseId}
          setPurchaseId={setPurchaseId}
          originalBillNumber={originalBillNumber}
          setOriginalBillNumber={setOriginalBillNumber}
          originalBillDate={originalBillDate}
          setOriginalBillDate={setOriginalBillDate}
          priority={priority}
          setPriority={setPriority}
          debitType={debitType}
          setDebitType={setDebitType}
          invoices={invoices}
          reasons={reasons}
          purchaseOrders={purchaseOrders}
          onPurchaseOrderSelect={handlePurchaseOrderSelect}
          selectedVendorId={vendorId}
        />
        {/* Error messages for header fields */}
        {(errors.debitNoteNo ||
          errors.debitNoteDate ||
          errors.reason ||
          errors.purchaseId ||
          errors.originalBillNumber ||
          errors.debitType) && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg space-y-1 animate-in fade-in slide-in-from-top-2">
            {errors.debitNoteNo && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{errors.debitNoteNo}</span>
              </div>
            )}
            {errors.debitNoteDate && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{errors.debitNoteDate}</span>
              </div>
            )}
            {errors.reason && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{errors.reason}</span>
              </div>
            )}
            {errors.purchaseId && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{errors.purchaseId}</span>
              </div>
            )}
            {errors.originalBillNumber && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{errors.originalBillNumber}</span>
              </div>
            )}
            {errors.debitType && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{errors.debitType}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Business and Vendor Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Business Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
            Business Details
          </h3>
          <YourDetailsSection businessDetails={businessDetails} hideSelector />
        </div>

        <SelectVendorSection
          vendorId={vendorId}
          onVendorSelect={handleVendorSelect}
          showAddVendor={showAddVendor}
          setShowAddVendor={setShowAddVendor}
          vendorDetails={vendorDetails}
          setVendorDetails={setVendorDetails}
          handleAddVendor={handleAddVendor}
          mockVendors={vendors}
        />
        {errors.vendorId && (
          <p className="text-red-500 text-sm mt-2">{errors.vendorId}</p>
        )}
      </div>

      {/* Items Section */}
      <div className="mb-6">
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
          setTaxConfiguration={setTaxConfiguration}
          cessList={cessList}
          setTaxType={setTaxType}
          setCessList={setCessList}
          mockProducts={products}
          businessState={businessDetails?.state}
          clientState={vendorDetails?.state}
        />
        {/* Error message for items */}
        {errors.items && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{errors.items}</span>
            </div>
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="mb-6">
        <SummaryCard
          subtotal={subtotal}
          discountType={discountType as "flat" | "percentage"}
          discountValue={discountValue}
          setDiscountType={setDiscountType}
          setDiscountValue={setDiscountValue}
          tax={totalTax}
          shipping={shipping}
          setShipping={setShipping}
          roundOff={roundOff}
          setRoundOff={setRoundOff}
          total={total}
        />
      </div>

      {/* Additional Inputs Section */}
      <div className="mb-6">
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
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 shadow-lg -mx-3 md:-mx-8 px-3 md:px-8 py-4 mt-8">
        <ActionBar mode={mode} onSubmit={handleFormSubmit} loading={loading} />
      </div>
      <AddVendorModal
        open={showAddVendor}
        onOpenChange={setShowAddVendor}
        onSuccess={() => {
          setShowAddVendor(false);
        }}
      />
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
              discountType: "flat",
              amount: item.sellingPrice,
              hsn: "",
              unit: "pcs",
              igst: 0,
              sgst: 0,
              cgst: 0,
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
              discountType: "flat",
              amount: 0,
              hsn: "",
              unit: "pcs",
              igst: 0,
              sgst: 0,
              cgst: 0,
            })),
          ]);
          setShowAddItemBulkModal(false);
        }}
      />
    </div>
  );
};

export default DebitNotesForm;
