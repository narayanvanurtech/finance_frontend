import React, { useState } from "react";
import HeaderBar from "./HeaderBar";
import ActionBar from "./ActionBar";
import SelectVendorSection from "../SelectVendorSection";
import ItemTable from "../ItemTable";
import SummaryCard from "../SummaryCard";
import AdditionalInputs from "../AdditionalInputs";
import AddItemModal from "@/components/finance/AddItemModal";
import AddItemBulkModal from "@/components/finance/AddItemBulkModal";
import AddVendorModal from "@/components/finance/AddVendorModal";
import YourDetailsSection from "@/components/finance/BussinessDetailsSection";
import type { Vendor } from "@/api/finance/vendorApi";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";

export type PurchaseOrderFormValues = {
  purchaseOrderNo: string;
  supplierInvoiceNo: string;
  orderDate: string;
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
};

type PurchaseOrderFormProps = {
  initialValues: PurchaseOrderFormValues;
  onSubmit: (values: PurchaseOrderFormValues) => void;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  loading?: boolean;
  mockVendors: Vendor[];
  mockProducts?: any[];
};

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  initialValues,
  onSubmit,
  mode,
  onSuccess,
  loading,
  mockVendors,
  mockProducts,
}) => {
  const products = mockProducts || [];
  const vendors = useVendorStore((state) => state.vendors);
  // Use vendors from store if available, otherwise fallback to mockVendors
  const availableVendors = vendors.length > 0 ? vendors : mockVendors;
  // Header state
  const [purchaseOrderNo, setPurchaseOrderNo] = useState(
    initialValues.purchaseOrderNo || ""
  );
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState(
    initialValues.supplierInvoiceNo || ""
  );
  const [orderDate, setOrderDate] = useState(initialValues.orderDate || "");
  const [dueDate, setDueDate] = useState(initialValues.dueDate || "");
  // Vendor state
  const [vendorId, setVendorId] = useState(initialValues.vendorId);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [vendorDetails, setVendorDetails] = useState(
    initialValues.vendorDetails || {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    }
  );
  // Business state
  const [businessDetails] = useState(initialValues.businessDetails);
  // Items and other states
  const [items, setItems] = useState(initialValues.items);
  const [discountType, setDiscountType] = useState(initialValues.discountType);
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

  // Handlers for items
  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev: any) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      // Recalculate amount
      const item = updated[idx];
      let amount =
        (Number(item.qty) || 0) * (Number(item.rate) || 0) -
        (Number(item.discount) || 0);
      updated[idx].amount = amount;
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
  // Vendor selection handler
  const handleVendorSelect = (value: string) => {
    setVendorId(value);
    if (value === "new") return;
    const found = availableVendors.find(
      (v: any) => String(v._id || v.id) === value
    );
    if (found) {
      setVendorDetails({
        name: found.name,
        gstin: found.gstin || "",
        address: found.address || "",
        contact: found.phone || found.contact || "",
        email: found.email || "",
      });
    }
  };
  // Summary calculations (simple version)
  const subtotal = items.reduce(
    (sum: number, item: any) => sum + Number(item.qty) * Number(item.rate),
    0
  );
  let discount = 0;
  if (discountType === "flat") discount = discountValue;
  else if (discountType === "percent")
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
    if (!purchaseOrderNo.trim())
      newErrors.purchaseOrderNo = "Purchase Order No is required";
    if (!orderDate) newErrors.orderDate = "Order Date is required";
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
      purchaseOrderNo,
      supplierInvoiceNo,
      orderDate,
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
    });
    if (onSuccess) onSuccess();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <HeaderBar
        purchaseOrderNo={purchaseOrderNo}
        setPurchaseOrderNo={setPurchaseOrderNo}
        supplierInvoiceNo={supplierInvoiceNo}
        setSupplierInvoiceNo={setSupplierInvoiceNo}
        orderDate={orderDate}
        setOrderDate={setOrderDate}
        dueDate={dueDate}
        setDueDate={setDueDate}
      />
      {/* Error messages for header fields */}
      <div className="mb-2">
        {errors.purchaseOrderNo && (
          <div className="text-red-500 text-xs">{errors.purchaseOrderNo}</div>
        )}
        {errors.orderDate && (
          <div className="text-red-500 text-xs">{errors.orderDate}</div>
        )}
        {errors.vendorId && (
          <div className="text-red-500 text-xs">{errors.vendorId}</div>
        )}
      </div>
      {/* Flex row for billed to (business) and billed by (vendor) details */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2">
          <YourDetailsSection businessDetails={businessDetails} hideSelector />
        </div>
        <div className="md:w-1/2">
          <SelectVendorSection
            vendorId={vendorId}
            onVendorSelect={handleVendorSelect}
            showAddVendor={showAddVendor}
            setShowAddVendor={setShowAddVendor}
            vendorDetails={vendorDetails}
            setVendorDetails={setVendorDetails}
            handleAddVendor={() => setShowAddVendor(true)}
            mockVendors={availableVendors}
          />
        </div>
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
        taxType={"exclusive"}
        cessList={[]}
        setTaxType={() => {}}
        setCessList={() => {}}
        taxConfiguration={"IGST"}
        setTaxConfiguration={() => {}}
        mockProducts={products}
      />
      {/* Error message for items */}
      {errors.items && (
        <div className="text-red-500 text-xs mb-2">{errors.items}</div>
      )}
      <SummaryCard
        subtotal={subtotal}
        discountType={discountType as "flat" | "percentage"}
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
          // Close the modal
          setShowAddVendor(false);
          // Reset vendor selection to allow user to select the newly created vendor
          setVendorId("");
          setVendorDetails({
            name: "",
            gstin: "",
            address: "",
            contact: "",
            email: "",
          });
        }}
      />
    </div>
  );
};

export default PurchaseOrderForm;
