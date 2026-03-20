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
import {
  useAddAttachment,
  useRemoveAttachment,
} from "@/hooks/usePurchaseOrderQueries";
import { sign } from "crypto";
import { toast } from "sonner";
import QrScanner from "@/utils/QrScanner";
import axiosInstance from "@/utils/axios";

export type PurchaseOrderFormValues = {
  purchaseOrderNo: string;
  supplierInvoiceNo: string;
  orderDate: string;
  dueDate: string;
  deliveryDate: string;
  vendorId: string;
  vendorDetails: any;
  businessDetails: any;
  deliveryAddress: string;
  paymentTerms: string;
  status: string;
  priority: string;
  referenceNumber: string;
  currency: string;
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
  existingAttachments?: string[];
  signature:string;
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
  purchaseOrderId?: string;
  isLocked?: boolean;
};

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  initialValues,
  onSubmit,
  mode,
  onSuccess,
  loading,
  mockProducts,
  mockVendors,
  purchaseOrderId,
  isLocked = false,
}) => {
  // Use vendors passed as props
  const availableVendors = mockVendors;

  // Attachment hooks
  const addAttachmentMutation = useAddAttachment();
  const removeAttachmentMutation = useRemoveAttachment();
  // Header state
  const [purchaseOrderNo, setPurchaseOrderNo] = useState(
    initialValues.purchaseOrderNo || ""
  );
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState(
    initialValues.supplierInvoiceNo || ""
  );
  const [orderDate, setOrderDate] = useState(initialValues.orderDate || "");
  const [dueDate, setDueDate] = useState(initialValues.dueDate || "");
  const [deliveryDate, setDeliveryDate] = useState(
    initialValues.deliveryDate || ""
  );
  const [paymentTerms, setPaymentTerms] = useState(
    initialValues.paymentTerms || "Net 30"
  );
  const [status, setStatus] = useState(initialValues.status || "draft");
  const [priority, setPriority] = useState(initialValues.priority || "medium");
  const [referenceNumber, setReferenceNumber] = useState(
    initialValues.referenceNumber || ""
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    initialValues.deliveryAddress || ""
  );
  const [currency, setCurrency] = useState(initialValues.currency || "INR");
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
  const [existingAttachments, setExistingAttachments] = useState<string[]>(
    initialValues.existingAttachments || []
  );
  const [showSignature, setShowSignature] = useState(
    initialValues.showSignature
  );

    const [showScanner, setShowScanner] = useState(false);


    const [signature,setSignature]=useState(initialValues.signature)
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddItemBulkModal, setShowAddItemBulkModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Attachment handlers
  const handleAddAttachment = async (file: File) => {
    if (!purchaseOrderId) return;
    await addAttachmentMutation.mutateAsync({
      purchaseOrderId,
      file,
    });
  };

  const handleRemoveAttachment = async (
    attachmentIndex: number,
    attachmentUrl: string
  ) => {
    if (!purchaseOrderId) return;
    await removeAttachmentMutation.mutateAsync({
      purchaseOrderId,
      attachmentIndex,
      attachmentUrl,
    });
  };

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

    return parts.join(", ");
  };

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
        address: formatAddress(found.address),
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

   const handleQrScan = async (decodedText: string) => {
    try {
      // Parse QR data
      const parsed = JSON.parse(decodedText);
      const itemId = parsed.itemId;
  let token = null

if (typeof window !== "undefined") {
  token = localStorage.getItem("token")
}
  
      console.log("Item id (scanner) ::----->>>>>>>", itemId);
  
      const companyId = localStorage.getItem("currentCompanyId");
    console.log(companyId)
      const res = await axiosInstance.get( `/api/v1/finance/inventory/item/itemDetails/${companyId}/${itemId}`,{
        headers:{
          "Authorization":`Bearer ${token}`
        },
        withCredentials:true
      })
  
      console.log("res,res,res===>",res)
      const product = res?.data?.result || res?.data;
  
      console.log("Scanned product:", product);
  
      if (!product) {
        toast.error("Item not found");
        return;
      }
  
      const newItem = {
        itemId: product._id,
        name: product.name,
        description: product.description || "",
        quantity: 1,
        rate: product.sellingPrice || 0,
        discount: 0,
        discountType: "flat",
        unit: product.unit || "pcs",
        hsn: product.hsn || "",
        igst: product.igst || 0,
        sgst: product.sgst || 0,
        cgst: product.cgst || 0,
        amount: product.sellingPrice || 0,
        taxRate:0
      };
  
      // Add item to table
      setItems((prev) => [...prev, newItem]);
  
      toast.success("Item added successfully");
  
    } catch (err) {
      console.log(err);
      toast.error("Invalid QR Code");
    }
  
    setShowScanner(false);
  };

  const handleFormSubmit = () => {
    const newErrors: { [key: string]: string } = {};
    if (!purchaseOrderNo.trim())
      newErrors.purchaseOrderNo = "Purchase Order No is required";
    if (!orderDate) newErrors.orderDate = "Order Date is required";
    // if (!vendorId) newErrors.vendorId = "Vendor is required";
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
      deliveryDate,
      vendorId,
      vendorDetails: { ...vendorDetails },
      businessDetails: businessDetails,
      deliveryAddress,
      paymentTerms,
      status,
      priority,
      referenceNumber,
      currency,
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
      signature,
      showSignature,
    });
    if (onSuccess) onSuccess();
  };

  const handleCloseScanner=()=>{
  setShowScanner(false)
}
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
        deliveryDate={deliveryDate}
        setDeliveryDate={setDeliveryDate}
        paymentTerms={paymentTerms}
        setPaymentTerms={setPaymentTerms}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        referenceNumber={referenceNumber}
        setReferenceNumber={setReferenceNumber}
        currency={currency}
        setCurrency={setCurrency}
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

      {/* Delivery Address Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
          Delivery Address
        </h3>
        <div>
          <label className="block text-sm font-medium mb-2">
            Delivery Location
          </label>
          <textarea
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Enter complete delivery address with pincode"
          />
        </div>
      </div>
      <ItemTable
      mockProducts={mockProducts}
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
        setShowScanner={setShowScanner}
      />
       {showScanner && (
        <div className="p-4 bg-white rounded shadow mt-5 ">
          <QrScanner onClose={handleCloseScanner}  onScan={handleQrScan} />
        </div>
      )}
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
        signature={signature}
        setSignature={setSignature}
        showSignature={showSignature}
        setShowSignature={setShowSignature}
        purchaseOrderId={purchaseOrderId}
        existingAttachments={existingAttachments}
        onAddAttachment={handleAddAttachment}
        onRemoveAttachment={handleRemoveAttachment}
        mode={mode}
        isLoadingAttachment={
          addAttachmentMutation.isPending || removeAttachmentMutation.isPending
        }
      />
      <ActionBar mode={mode} onSubmit={handleFormSubmit} loading={loading} disabled={isLocked} />
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
