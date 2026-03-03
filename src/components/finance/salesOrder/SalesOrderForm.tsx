import React, { useState } from "react";
import SalesOrderHeaderBar from "./HeaderBar";
import ClientSection from "../ClientSection";
import ItemTable from "../ItemTable";
import SummaryCard from "../SummaryCard";
import AdditionalInputs from "../AdditionalInputs";
import ActionBar from "./ActionBar";
import AddClientModal from "@/components/finance/AddClientModal";
import AddItemModal from "@/components/finance/AddItemModal";
import AddItemBulkModal from "@/components/finance/AddItemBulkModal";
import type { Cess as ConfigureTaxCess } from "@/components/finance/ConfigureTax";
import YourDetailsSection from "@/components/finance/BussinessDetailsSection";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { useParams, useRouter } from "next/navigation";

// Cess type compatible with ItemTable
type Cess = {
  name: string;
  showInInvoice: boolean;
};

export type SalesOrderFormValues = {
  type: "salesOrder";
  orderTitle: string;
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  clientId: string;
  clientDetails: {
    name: string;
    gstin: string;
    address: string;
    contact: string;
    email: string;
  };
  businessDetails: {
    name: string;
    gstin: string;
    address: string;
    contact: string;
    email: string;
    state?: string;
  };
  taxType: "inclusive" | "exclusive";
  taxConfiguration?: "IGST" | "SGST_CGST";
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
  showSignature:boolean;
  signature:string;
  cessList: Cess[];
};

type SalesOrderFormProps = {
  initialValues: SalesOrderFormValues;
  onSubmit: (values: SalesOrderFormValues) => void;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  loading?: boolean;
  mockClients?: any[];
  mockProducts?: any[];
  disabled?: boolean;
};

const SalesOrderForm: React.FC<any> = ({
  initialValues,
  onSubmit,
  mode,
  mockClients,
  mockProducts,
  onSuccess,
  loading,
  disabled,
}) => {
  const mockClientsFromProps = mockClients || [];
  const products = mockProducts || [];
  const clients = useClientStore((state) => state.clients);

  console.log("🎯 SalesOrderForm - Initial Values:", initialValues);
  console.log("🎯 Business Details:", initialValues.businessDetails);
  console.log("🎯 Round Off Initial:", initialValues.roundOff);

  const [orderTitle, setOrderTitle] = useState(initialValues.orderTitle);
  const [orderNumber] = useState(initialValues.orderNumber);
  const [orderDate, setOrderDate] = useState(initialValues.orderDate);
  const [deliveryDate, setDeliveryDate] = useState(initialValues.deliveryDate);
  const [clientId, setClientId] = useState(initialValues.clientId);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientDetails, setClientDetails] = useState(
    initialValues.clientDetails
  );

   const router =  useRouter()
 const {id}=useParams()

  const businessStoreDetails = useBussinessStore((s) => s.details);

  // Prefer business details from initial values (API) if present, otherwise fallback to global business store
  const computeInitialBusinessDetails = () => {
    const iv = initialValues.businessDetails || {};
    const hasIv = !!(
      iv.name ||
      iv.gstin ||
      iv.address ||
      iv.contact ||
      iv.email
    );
    if (hasIv) return iv;
    if (businessStoreDetails) {
      return {
        name: businessStoreDetails.businessName || "",
        gstin: businessStoreDetails.gstNumber || "",
        address: businessStoreDetails.website || "",
        contact: businessStoreDetails.phone || "",
        email: "",
        state:
          businessStoreDetails.state || businessStoreDetails.igstnState || "",
      } as any;
    }
    return iv;
  };

  const [businessDetails, setBusinessDetails] = useState(
    computeInitialBusinessDetails()
  );
  const [taxType, setTaxType] = useState<"inclusive" | "exclusive">(
    (initialValues.taxType as "inclusive" | "exclusive") || "exclusive"
  );
  const [taxConfiguration, setTaxConfiguration] = useState<
    "IGST" | "SGST_CGST"
  >((initialValues.taxConfiguration as "IGST" | "SGST_CGST") || "SGST_CGST");
  const [items, setItems] = useState(initialValues.items);
  const [discountType, setDiscountType] = useState(initialValues.discountType);
  const [discountValue, setDiscountValue] = useState(
    initialValues.discountValue
  );
  const [shipping, setShipping] = useState(initialValues.shipping);
  const [roundOff, setRoundOff] = useState(initialValues.roundOff);
  const [showHSN, setShowHSN] = useState(initialValues.showHSN);
  const [showUnit, setShowUnit] = useState(initialValues.showUnit);
  const [terms, setTerms] = useState(initialValues.terms || "dueOnReceipt");
  const [notes, setNotes] = useState(initialValues.notes);
  const [attachments, setAttachments] = useState<File[]>(
    initialValues.attachments
  );
  const [showSignature, setShowSignature] = useState(
    initialValues.showSignature || false
  );
   const [signature, setSignature] = useState(
    initialValues.signature || ""
  );
  const [cessList, setCessList] = useState<Cess[]>(
    initialValues.cessList || []
  );
  const [type] = useState(initialValues.type);

  console.log("🔍 Round Off State:", roundOff);
  console.log("🔍 Business Details State:", businessDetails);

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddItemBulkModal, setShowAddItemBulkModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handler for tax configuration change to reset tax values
  const handleTaxConfigurationChange = (newTaxConfig: "IGST" | "SGST_CGST") => {
    setTaxConfiguration(newTaxConfig);

    setItems((prevItems: any[]) =>
      prevItems.map((item) => {
        const quantity = Number(item.qty) || 0;
        const rate = Number(item.rate) || 0;
        const discount = Number(item.discount) || 0;

        let baseAmount = quantity * rate - discount;
        if (baseAmount < 0) baseAmount = 0;

        if (newTaxConfig === "IGST") {
          return {
            ...item,
            taxType: "igst",
            igst: item.taxRate || 0,
            cgst: 0,
            sgst: 0,
            taxRate: item.taxRate || 0,
            amount:
              taxType === "exclusive"
                ? baseAmount + (baseAmount * (item.taxRate || 0)) / 100
                : baseAmount,
          };
        } else {
          const half = (item.taxRate || 0) / 2;
          return {
            ...item,
            taxType: "cgst_sgst",
            cgst: half,
            sgst: half,
            igst: 0,
            taxRate: item.taxRate || 0,
            amount:
              taxType === "exclusive"
                ? baseAmount + (baseAmount * (item.taxRate || 0)) / 100
                : baseAmount,
          };
        }
      })
    );
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev: any) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };

      // Recalculate amount based on tax configuration
      const item = updated[idx];
      const quantity = Number(item.qty) || 0;
      const rate = Number(item.rate) || 0;
      const discount = Number(item.discount) || 0;

      // Calculate base amount (quantity * rate - discount)
      let baseAmount = quantity * rate - discount;
      if (baseAmount < 0) baseAmount = 0; // Ensure amount doesn't go negative

      // Set tax type based on current tax configuration
      updated[idx].taxType = taxConfiguration === "IGST" ? "igst" : "cgst_sgst";

      // Update tax rates based on field changes
      if (taxConfiguration === "IGST") {
        if (field === "igst") {
          const igstRate = Number(value) || 0;
          updated[idx].taxRate = igstRate;
          updated[idx].igst = igstRate;
          updated[idx].cgst = 0;
          updated[idx].sgst = 0;
        }
      } else if (taxConfiguration === "SGST_CGST") {
        if (field === "cgst" || field === "sgst") {
          // When user changes CGST or SGST, update the individual values and total tax rate
          const currentCgst =
            field === "cgst" ? Number(value) || 0 : updated[idx].cgst || 0;
          const currentSgst =
            field === "sgst" ? Number(value) || 0 : updated[idx].sgst || 0;
          updated[idx].cgst = currentCgst;
          updated[idx].sgst = currentSgst;
          updated[idx].taxRate = currentCgst + currentSgst;
          updated[idx].igst = 0;
        }
      }

      // Calculate final amount based on tax type
      let finalAmount = baseAmount;
      if (taxType === "exclusive") {
        // For exclusive tax, add tax to base amount
        const taxRate = updated[idx].taxRate || 0;
        finalAmount = baseAmount + (baseAmount * taxRate) / 100;
      } else {
        // For inclusive tax, the base amount already includes tax
        finalAmount = baseAmount;
      }

      updated[idx].amount = finalAmount;
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
        taxType: taxConfiguration === "IGST" ? "igst" : "cgst_sgst",
        taxRate: 0,
        igst: taxConfiguration === "IGST" ? 0 : 0,
        sgst: taxConfiguration === "SGST_CGST" ? 0 : 0,
        cgst: taxConfiguration === "SGST_CGST" ? 0 : 0,
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

  const handleAddClient = () => setShowAddClient(true);

  const handleClientSelect = (value: string) => {
    setClientId(value);
    if (value === "new") return;

    const found = clients.find((c: any) => String(c._id) === value);
    if (!found) return;

    const clientState = found.address?.state || "";
    const businessState = (businessDetails as any)?.state || "";

    // Update client details
    setClientDetails({
      name: found.businessName || "",
      gstin: found.gstin || "",
      address:
        typeof found.address === "string"
          ? found.address
          : found.address?.street || "",
      contact: found.phone || "",
      email: found.email || "",
    });

    // Auto apply GST rules based on state
    if (businessState && clientState) {
      if (businessState === clientState) {
        // Same state = SGST + CGST
        handleTaxConfigurationChange("SGST_CGST");
      } else {
        // Different state = IGST
        handleTaxConfigurationChange("IGST");
      }
    }
  };

  // Summary calculations
  // Calculate subtotal (quantity * rate for all items, before any discounts or taxes)
  const subtotal = items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.qty || 0) * Number(item.rate || 0),
    0
  );

  // Calculate discount amount based on subtotal
  let discountAmount = 0;
  if (discountType === "flat") {
    discountAmount = Number(discountValue || 0);
  } else if (discountType === "percent" || discountType === "percentage") {
    discountAmount = (subtotal * Number(discountValue || 0)) / 100;
  }

  // Calculate tax amount from items
  let tax = 0;
  if (taxType === "exclusive") {
    // For exclusive tax, calculate tax on (subtotal - discount)
    const taxableAmount = subtotal - discountAmount;
    items.forEach((item: any) => {
      const itemSubtotal = Number(item.qty || 0) * Number(item.rate || 0);
      // Calculate proportional share of this item in the total taxable amount
      const itemTaxableAmount =
        subtotal > 0 ? (itemSubtotal / subtotal) * taxableAmount : 0;
      const taxRate = Number(item.taxRate || 0);

      if (item.taxType === "igst") {
        tax += (itemTaxableAmount * taxRate) / 100;
      } else if (item.taxType === "cgst_sgst") {
        tax += (itemTaxableAmount * taxRate) / 100; // Total tax rate for CGST + SGST
      }
    });
  } else {
    // For inclusive tax, tax is already included in item amounts
    // We need to extract the tax amount from the item amounts
    items.forEach((item: any) => {
      const itemAmount = Number(item.amount || 0);
      const taxRate = Number(item.taxRate || 0);
      if (taxRate > 0) {
        // Calculate tax component from inclusive amount
        const taxComponent = (itemAmount * taxRate) / (100 + taxRate);
        tax += taxComponent;
      }
    });
  }

  // Add cess
  let cessTotal = 0;
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

  // Final total calculation
  let total =
    subtotal - discountAmount + tax + cessTotal + Number(shipping || 0);
  if (roundOff) total = Math.round(total);

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handlePrintDownload = () => {
    // Check if we're in edit mode and have an ID
    const salesOrderId = (initialValues as any)?._id;
    if (mode === "edit" && salesOrderId) {
      // Navigate to preview page
      window.open(`/finance/sales-orders/preview/${salesOrderId}`, "_blank");
    } else {
      alert(
        "Please save the sales order first before printing or downloading."
      );
    }
  };

  const submitEmail =()=>{
    router.push(`/finance/sales-orders/email/${id}`)
}


  const handleCancel = () => {
    router.push("/finance/sales-orders")
  };

  const handleFormSubmit = () => {
    const newErrors: { [key: string]: string } = {};
    if (!orderTitle.trim()) newErrors.orderTitle = "Order title is required";
    if (!orderNumber.trim()) newErrors.orderNumber = "Order number is required";
    if (!orderDate) newErrors.orderDate = "Order date is required";
    if (
      !items ||
      items.length === 0 ||
      items.every((item: any) => !item.name.trim())
    )
      newErrors.items = "At least one item is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const formValues = {
      type,
      orderTitle,
      orderNumber,
      orderDate,
      deliveryDate,
      clientId,
      clientDetails,
      businessDetails,
      taxType,
      taxConfiguration,
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
      signature,
      cessList,
    };

    console.log("📤 Form Submit Values:", formValues);
    console.log("🔍 Business Details:", businessDetails);
    console.log("🔍 Client Details:", clientDetails);
    console.log("🔍 Round Off:", roundOff);
    console.log("🔍 Tax Type:", taxType);

    onSubmit(formValues);
    if (onSuccess) onSuccess();
  };
  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="space-y-6">
        {" "}
        {/* 💥 NEW Wrapper for equal spacing */}
        <SalesOrderHeaderBar
          title={orderTitle}
          onTitleChange={(e) => setOrderTitle(e.target.value)}
          orderNumber={orderNumber}
          date={orderDate}
          onDateChange={setOrderDate}
          deliveryDate={deliveryDate}
          onDeliveryDateChange={setDeliveryDate}
          terms={terms}
          onTermsChange={setTerms}
        />
        {/* Error messages */}
        <div>
          {errors.orderTitle && (
            <div className="text-red-500 text-xs">{errors.orderTitle}</div>
          )}
          {errors.orderNumber && (
            <div className="text-red-500 text-xs">{errors.orderNumber}</div>
          )}
          {errors.orderDate && (
            <div className="text-red-500 text-xs">{errors.orderDate}</div>
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
              businessDetails={businessDetails}
              hideSelector
              setBusinessDetails={setBusinessDetails}
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
              setClientDetails={setClientDetails}
              handleAddClient={handleAddClient}
              mockClients={clients}
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
          taxType={taxType}
          taxConfiguration={taxConfiguration}
          cessList={cessList}
          setTaxType={(value) => setTaxType(value as "inclusive" | "exclusive")}
          setTaxConfiguration={handleTaxConfigurationChange}
          setCessList={setCessList}
          mockProducts={products}
        />
        {errors.items && (
          <div className="text-red-500 text-xs">{errors.items}</div>
        )}
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
          signature={signature}
          setSignature={setSignature}
          handleAttachment={handleAttachment}
          showSignature={showSignature}
          setShowSignature={setShowSignature}
        />
        <ActionBar
          mode={mode}
          onSubmit={handleFormSubmit}
         
          loading={loading}
          disabled={disabled}
          onPrintDownload={handlePrintDownload}
          onSendEmail={submitEmail}
          onCancel={handleCancel}
          documentType="invoice"
        />
      </div>
    </div>
  );
};

export default SalesOrderForm;
