import React, { useState, useEffect } from "react";
import { Truck, Upload, FileText } from "lucide-react";
import HeaderBar from "./HeaderBar";
import ClientSection from "../ClientSection";
import ItemTable from "../ItemTable";
import SummaryCard from "../SummaryCard";
import AdditionalInputs from "../AdditionalInputs";
import ActionBar from "./ActionBar";
import AddClientModal from "@/components/finance/AddClientModal";
import AddItemModal from "@/components/finance/AddItemModal";
import AddItemBulkModal from "@/components/finance/AddItemBulkModal";
import type { Cess } from "@/components/finance/ConfigureTax";
import YourDetailsSection from "@/components/finance/BussinessDetailsSection";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useRouter } from "next/navigation";

export type DeliveryChallanFormValues = {
  quotationTitle?: string;
  quotationNumber?: string;
  date: string;
  dueDate?: string;
  clientId: string;
  clientDetails: {
    name: string;
    gstin?: string;
    address: string;
    contact: string;
    email: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branch?: string;
  };
  businessDetails: {
    name: string;
    gstin?: string;
    address: string;
    contact: string;
    email: string;
     state?: string;
  };
  taxType: "inclusive" | "exclusive";
  taxConfiguration?: "IGST" | "SGST_CGST";
  items: any[];
  discountType: "flat" | "percentage" | string;
  discountValue: number;
  shipping: number;
  roundOff: boolean;
  showHSN: boolean;
  showUnit: boolean;
  terms: string;
  notes: string;
  attachments: File[];
  signature:string;
  showSignature: boolean;
  cessList: Cess[];
  phases?: any[];
  transportDetails?: {
    vehicleNumber?: string;
    transportMode?: string;
    eWayBillNo?: string;
    lrNumber?: string;
    dispatchThrough?: string;
    destination?: string;
    returnable?: boolean;
    returnDate?: string;
    purpose?: string;
  };
  reference?: string;
  challanType?: string;
  status?: string; // Add status field
};

export type DeliveryChallanFormProps = {
  initialValues: DeliveryChallanFormValues;
  onSubmit: (values: DeliveryChallanFormValues) => void;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  loading?: boolean;
  mockClients?: any[];
  mockProducts?: any[];
};

const DeliveryChallanForm: React.FC<DeliveryChallanFormProps> = ({
  initialValues,
  onSubmit,
  mode,
  onSuccess,
  loading,
  mockClients,
  mockProducts,
}) => {
  const mockClientsFromProps = mockClients || [];
  const products = mockProducts || [];
  const clients = useClientStore((state) => state.clients);
  // State initialization from initialValues
  const [challanNumber, setChallanNumber] = useState(
    initialValues?.quotationNumber || ""
  );
  const [reference, setReference] = useState(
    initialValues?.reference || initialValues?.notes || ""
  );
  const [challanType, setChallanType] = useState(
    initialValues?.challanType || initialValues?.terms || ""
  );
  const [quotationTitle, setQuotationTitle] = useState(
    initialValues?.quotationTitle || ""
  );
  const [date, setDate] = useState(initialValues?.date);
  const [dueDate, setDueDate] = useState(initialValues?.dueDate);
  const [clientId, setClientId] = useState(initialValues?.clientId);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientDetails, setClientDetails] = useState(
    initialValues?.clientDetails
  );
  const [taxType, setTaxType] = useState(initialValues?.taxType);
  const [cessList, setCessList] = useState<Cess[]>(initialValues.cessList);
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
  const [businessDetails, setBusinessDetails] = useState(
    initialValues.businessDetails
  );
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddItemBulkModal, setShowAddItemBulkModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [taxConfiguration, setTaxConfiguration] = useState<
    "IGST" | "SGST_CGST"
  >(initialValues.taxConfiguration || "SGST_CGST");

    const [signature,setSignature]=useState(initialValues.signature)
  // Transport Details
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [transportMode, setTransportMode] = useState("Road");
  const [eWayBillNo, setEWayBillNo] = useState("");
  const [lrNumber, setLrNumber] = useState("");
  const [dispatchThrough, setDispatchThrough] = useState("");
  const [destination, setDestination] = useState("");
  const [returnable, setReturnable] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [purpose, setPurpose] = useState("For Delivery");

  const router = useRouter()
  // Function to calculate item amount based on current tax settings
  const calculateItemAmount = (item: any) => {
    // Support both qty and quantity fields
    const quantity = Number(item.quantity || item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discount) || 0;

    const baseAmount = quantity * rate - discount;

    let amount = baseAmount;

    // Add tax if present (only for exclusive tax)
    if (taxType === "exclusive") {
      if (taxConfiguration === "IGST") {
        amount += (baseAmount * (Number(item.igst) || 0)) / 100;
      }
      if (taxConfiguration === "SGST_CGST") {
        amount +=
          (baseAmount * ((Number(item.sgst) || 0) + (Number(item.cgst) || 0))) /
          100;
      }
      // Add cess
      cessList
        .filter((c) => c.showInInvoice)
        .forEach((cess) => {
          amount += (baseAmount * (Number(item[cess.name]) || 0)) / 100;
        });
    }

    return amount;
  };

  // Recalculate all items when tax settings change
  useEffect(() => {
    setItems((prevItems: any) => {
      return prevItems.map((item: any) => ({
        ...item,
        amount: calculateItemAmount(item),
      }));
    });
  }, [taxType, taxConfiguration, cessList]);

  // Initialize items with calculated amounts on mount or when initialValues change
  useEffect(() => {
    if (initialValues.items && initialValues.items.length > 0) {
      const itemsWithAmounts = initialValues.items.map((item: any) => ({
        ...item,
        // Ensure both qty and quantity fields are present for compatibility
        qty: item.qty || item.quantity || 0,
        quantity: item.quantity || item.qty || 0,
        amount: calculateItemAmount(item),
      }));
      setItems(itemsWithAmounts);
    }
  }, [initialValues.items]);

  // Sync all form fields when initialValues changes (for edit mode)
  useEffect(() => {
    if (initialValues && mode === "edit" && initialValues.quotationNumber) {
      setChallanNumber(initialValues.quotationNumber || "");
      setReference(initialValues.reference || "");
      setChallanType(initialValues.challanType || "");
      setQuotationTitle(initialValues.quotationTitle || "");
      setDate(initialValues.date || "");
      setDueDate(initialValues.dueDate || "");
      setClientId(initialValues.clientId || "");
      setClientDetails(
        initialValues.clientDetails || {
          name: "",
          gstin: "",
          address: "",
          contact: "",
          email: "",
        }
      );
      setTaxType(initialValues.taxType || "exclusive");
      setCessList(initialValues.cessList || []);
      setDiscountType(
        (initialValues.discountType as "flat" | "percentage") || "flat"
      );
      setDiscountValue(initialValues.discountValue || 0);
      setShipping(initialValues.shipping || 0);
      setRoundOff(initialValues.roundOff || false);
      setShowHSN(initialValues.showHSN || false);
      setShowUnit(initialValues.showUnit || false);
      setTerms(initialValues.terms || "");
      setNotes(initialValues.notes || "");
      setAttachments(initialValues.attachments || []);
      setShowSignature(initialValues.showSignature || false);
      setBusinessDetails(
        initialValues.businessDetails || {
          name: "",
          gstin: "",
          address: "",
          contact: "",
          email: "",
        }
      );
      setTaxConfiguration(initialValues.taxConfiguration || "SGST_CGST");
    }
    // Items are handled separately by the items useEffect above
  }, [initialValues, mode]);

  // Handlers for items
  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev: any) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };

      // Sync qty and quantity fields
      if (field === "qty") {
        updated[idx].quantity = value;
      }
      if (field === "quantity") {
        updated[idx].qty = value;
      }

      // Recalculate amount for this item
      updated[idx].amount = calculateItemAmount(updated[idx]);
      return updated;
    });
  };
  const handleAddItem = () => {
    const newItem = {
      name: "",
      description: "",
      quantity: 1,
      qty: 1, // Add qty field for compatibility with ItemTable
      rate: 0,
      discount: 0,
      igst: 0,
      sgst: 0,
      cgst: 0,
      amount: 0,
      hsn: "",
      unit: "pcs",
    };
    setItems((prev: any) => [...prev, newItem]);
  };
  const handleRemoveItem = (idx: number) => {
    setItems((prev: any) => prev.filter((_: any, i: any) => i !== idx));
  };
  const onAddNewItemClick = () => setShowAddItemModal(true);
  const openBulkModal = () => setShowAddItemBulkModal(true);
  const handleAddClient = () => setShowAddClient(true);
  const handleClientSelect = (value: string) => {
    setClientId(value);
    if (value === "new") return;
    const found = clients.find((c: any) => String(c.id) === value);
    if (found) {
      console.log("🔍 Selected Client:", found);
      console.log("🏦 Bank Details:", {
        bankName: found.bankName,
        accountNumber: found.bankAccountNumber,
        ifscCode: found.ifscCode,
        branch: found.branchName,
      });

      setClientDetails({
        name: found.businessName,
        gstin: found.gstin,
        address: found.address?.street || found.address,
        contact: found.alias || found.businessName,
        email: found.email,
        // Add client's bank details (using any to bypass type check)
        bankName: found.bankName,
        accountNumber: found.bankAccountNumber,
        ifscCode: found.ifscCode,
        branch: found.branchName,
      } as any);
    }
  };
  // Summary calculations
  const subtotal = items.reduce(
    (sum: number, item: any) => sum + Number(item.quantity) * Number(item.rate),
    0
  );
  let discount = 0;
  if (discountType === "flat") discount = discountValue;
  else if (discountType === "percentage")
    discount = (subtotal * discountValue) / 100;
  const taxable = subtotal - discount;
  let tax = 0;
  if (taxType === "exclusive") {
    if (taxConfiguration === "IGST")
      tax = items.reduce(
        (sum: number, item: any) =>
          sum +
          ((item.amount - (item.discount || 0)) * (Number(item.igst) || 0)) /
            100,
        0
      );
    if (taxConfiguration === "SGST_CGST")
      tax = items.reduce(
        (sum: number, item: any) =>
          sum +
          ((item.amount - (item.discount || 0)) *
            ((Number(item.sgst) || 0) + (Number(item.cgst) || 0))) /
            100,
        0
      );
  }
  let cessTotal = 0;
  if (taxType === "exclusive") {
    cessList
      .filter((c) => c.showInInvoice)
      .forEach((cess) => {
        cessTotal += items.reduce(
          (sum: number, item: any) =>
            sum +
            ((item.amount - (item.discount || 0)) *
              (Number(item[cess.name]) || 0)) /
              100,
          0
        );
      });
  }
  let total = taxable + tax + cessTotal + Number(shipping || 0);
  if (roundOff) total = Math.round(total);
  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handlePrintDownload = () => {
    // Check if we're in edit mode and have an ID
    const challanId = (initialValues as any)?._id;
    if (mode === "edit" && challanId) {
      // Navigate to preview page
      window.open(`/finance/delivery-challans/preview/${challanId}`, "_blank");
    } else {
      alert(
        "Please save the delivery challan first before printing or downloading."
      );
    }
  };

  const handleSendEmail = () => {
    const challanId = (initialValues as any)?._id;
    if (mode === "edit" && challanId) {
      alert("Email functionality will be implemented soon!");
      // TODO: Implement email sending functionality
    } else {
      alert("Please save the delivery challan first before sending email.");
    }
  };

  const handleCancel = () => {
     router.push("/finance/delivery-challans") 
  };

  const handleFormSubmit = () => {
    const newErrors: { [key: string]: string } = {};
    if (!challanNumber.trim())
      newErrors.challanNumber = "Challan number is required";
    if (!date) newErrors.date = "Challan date is required";
    if (
      !items ||
      items.length === 0 ||
      items.every((item: any) => !item.name.trim())
    )
      newErrors.items = "At least one item is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit({
      quotationTitle,
      quotationNumber: challanNumber,
      date,
      dueDate,
      clientId,
      clientDetails: {
        ...clientDetails,
      },
      businessDetails: businessDetails,
      taxType,
      taxConfiguration,
      cessList,
      items,
      discountType,
      discountValue,
      shipping,
      roundOff,
      showHSN,
      showUnit,
      terms: terms, // Send actual terms value instead of challanType
      notes: notes, // Send actual notes value instead of reference
      attachments,
      signature,
      showSignature,
      phases: [],
      // Transport Details
      transportDetails: {
        vehicleNumber,
        transportMode,
        eWayBillNo,
        lrNumber,
        dispatchThrough,
        destination,
        returnable,
        returnDate: returnable ? returnDate : undefined,
        purpose,
      },
      // Additional fields
      reference, // Keep reference as separate field
      challanType, // Keep challanType as separate field
    });
    if (onSuccess) onSuccess();
  };

  // Check if challan is in a non-editable status
  const challanStatus = initialValues?.status?.toLowerCase() || "";
  const isStatusDisabled = challanStatus === "delivered" || challanStatus === "cancelled";
  const disabledReason = isStatusDisabled 
    ? `Cannot update ${challanStatus} delivery challans`
    : undefined;

  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Challan Number *
            </label>
            <input
              type="text"
              value={challanNumber}
              onChange={(e) => setChallanNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Challan Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference No.
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="PO/SO Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Challan Type
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option>For Delivery</option>
              <option>For Job Work</option>
              <option>For Testing</option>
              <option>For Repair</option>
              <option>Sample</option>
              <option>Exhibition</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error messages for header fields */}
      <div className="mb-2">
        {errors.challanNumber && (
          <div className="text-red-500 text-xs">{errors.challanNumber}</div>
        )}
        {errors.date && (
          <div className="text-red-500 text-xs">{errors.date}</div>
        )}
      </div>

      {/* Business & Client Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Business Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
            Business Details
          </h3>
          <YourDetailsSection
            businessDetails={{
              ...businessDetails,
              gstin: businessDetails.gstin || "",
            }}
            hideSelector
          />
        </div>

        {/* Client Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
            Client Details
          </h3>
          <ClientSection
            clientId={clientId}
            onClientSelect={handleClientSelect}
            showAddClient={showAddClient}
            setShowAddClient={setShowAddClient}
            clientDetails={clientDetails}
            setClientDetails={setClientDetails as any}
            handleAddClient={handleAddClient}
            mockClients={clients}
            showBankDetails={true}
          />
        </div>
      </div>

      {/* Transport Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4 border-b pb-3">
          <Truck className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-800">
            Transport Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number
            </label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="MH-01-AB-1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transport Mode
            </label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option>Road</option>
              <option>Rail</option>
              <option>Air</option>
              <option>Ship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-Way Bill No.
            </label>
            <input
              type="text"
              value={eWayBillNo}
              onChange={(e) => setEWayBillNo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LR Number
            </label>
            <input
              type="text"
              value={lrNumber}
              onChange={(e) => setLrNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dispatch Through
            </label>
            <input
              type="text"
              value={dispatchThrough}
              onChange={(e) => setDispatchThrough(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={returnable}
              onChange={(e) => setReturnable(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Material Returnable?
            </span>
          </label>

          {returnable && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Return Date:
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
          )}
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
        taxType={taxType}
        taxConfiguration={taxConfiguration}
        cessList={cessList}
        setTaxType={setTaxType}
        setTaxConfiguration={setTaxConfiguration}
        setCessList={setCessList as any}
        mockProducts={products}
      />
      {/* Error message for items */}
      {errors.items && (
        <div className="text-red-500 text-xs mb-2">{errors.items}</div>
      )}

      {/* Remove PhaseWisePayment for delivery challan */}
      <SummaryCard
        subtotal={subtotal}
        discountType={discountType}
        discountValue={discountValue}
        setDiscountType={setDiscountType}
        setDiscountValue={setDiscountValue}
        tax={tax}
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
        setSignature={setSignature}
        signature={signature}
        showSignature={showSignature}
        setShowSignature={setShowSignature}
      />

      <ActionBar
        mode={mode}
        onSubmit={handleFormSubmit}
        loading={loading}
        onPrintDownload={handlePrintDownload}
        onSendEmail={handleSendEmail}
        onCancel={handleCancel}
        documentType="invoice"
        disabled={isStatusDisabled}
        disabledReason={disabledReason}
      />

      <AddClientModal
        open={showAddClient}
        onClose={() => setShowAddClient(false)}
        onSubmit={(form) => {
          // Update local state with the new client
          setClientDetails({
            name: form.businessName,
            gstin: form.gstin,
            address: form.street,
            contact: form.alias || form.businessName,
            email: form.email,
          });
          setShowAddClient(false);
        }}
      />
      <AddItemModal
        open={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onSubmit={(item) => {
          const newItem = {
            name: item.name,
            description: item.description,
            quantity: 1,
            qty: 1, // Add qty field for compatibility with ItemTable
            rate: item.sellingPrice,
            discount: 0,
            igst: 0,
            sgst: 0,
            cgst: 0,
            amount: 0,
            hsn: "",
            unit: "pcs",
          };
          // Calculate amount for the new item
          newItem.amount = calculateItemAmount(newItem);
          setItems((prev: any) => [...prev, newItem]);
          setShowAddItemModal(false);
        }}
      />
      <AddItemBulkModal
        open={showAddItemBulkModal}
        onClose={() => setShowAddItemBulkModal(false)}
        onSubmit={(bulkItems) => {
          const newItems = bulkItems.map((item) => {
            const newItem = {
              name: item.name,
              description: "",
              quantity: item.unit,
              qty: item.unit, // Add qty field for compatibility with ItemTable
              rate: 0,
              discount: 0,
              igst: 0,
              sgst: 0,
              cgst: 0,
              amount: 0,
              hsn: "",
              unit: "pcs",
            };
            // Calculate amount for each new item
            newItem.amount = calculateItemAmount(newItem);
            return newItem;
          });
          setItems((prev: any) => [...prev, ...newItems]);
          setShowAddItemBulkModal(false);
        }}
      />
    </div>
  );
};

export default DeliveryChallanForm;
