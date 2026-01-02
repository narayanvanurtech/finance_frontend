import React, { useState, useEffect } from "react";
import ClientSection from "../ClientSection";
import ItemTable from "../ItemTable";
import SummaryCard from "../SummaryCard";
import AdditionalInputs from "../AdditionalInputs";
import ActionBar from "./ActionBar";
import AddClientModal from "@/components/finance/AddClientModal";
import AddItemModal from "@/components/finance/AddItemModal";
import AddItemBulkModal from "@/components/finance/AddItemBulkModal";
import PhaseWisePayment, {
  PaymentPhase,
} from "@/components/finance/PhaseWisePayment";
import type { Cess } from "@/components/finance/ConfigureTax";
import InvoiceHeaderBar from "./HeaderBar";
import YourDetailsSection from "@/components/finance/BussinessDetailsSection";
import { useClientStore } from "@/stores/financeStore/useClientStore";
// InvoiceHeaderBar will be created next

export type InvoiceFormValues = {
  type: "invoice" | "performa";
  invoiceTitle: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientId: string;
  clientDetails: {
    name: string;
    gstin: string;
    address: string;
    contact: string;
    email: string;
    state?: string;
  };
  businessDetails: {
    name: string;
    gstin: string;
    address: string;
    contact: string;
    email: string;
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
  showSignature: boolean;
  cessList: Cess[];
  phases: PaymentPhase[];

  /** ⭐ ADD THIS */
  status?:
    | "draft"
    | "sent"
    | "accepted"
    | "rejected"
    | "expired"
    | "converted"
    | "paid"
    | "partially_paid"
    | "overdue"
    | "cancelled";

  /** ⭐ OPTIONAL — if missing */
  _id?: string;
};

type InvoiceFormProps = {
  initialValues: InvoiceFormValues;
  onSubmit: (values: InvoiceFormValues) => void;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  loading?: boolean;
  mockClients?: any[];
  mockProducts?: any[];
};

const InvoiceForm: React.FC<any> = ({
  initialValues,
  onSubmit,
  mode,
  mockClients,
  mockProducts,
  onSuccess,
  loading,
}) => {
  const mockClientsFromProps = mockClients || [];
  const products = mockProducts || [];
  const clients = useClientStore((state) => state.clients);
  const [invoiceTitle, setInvoiceTitle] = useState(initialValues.invoiceTitle);
  const [invoiceNumber] = useState(initialValues.invoiceNumber);
  const [date, setDate] = useState(initialValues.date);
  const [dueDate, setDueDate] = useState(initialValues.dueDate);
  const [clientId, setClientId] = useState(initialValues.clientId);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientDetails, setClientDetails] = useState(
    initialValues.clientDetails
  );
  const [taxType, setTaxType] = useState<"inclusive" | "exclusive">(
    (initialValues.taxType as "inclusive" | "exclusive") || "exclusive"
  );
  const [taxConfiguration, setTaxConfiguration] = useState<
    "IGST" | "SGST_CGST"
  >((initialValues.taxConfiguration as "IGST" | "SGST_CGST") || "SGST_CGST");

  // Handler for tax configuration change to reset tax values
  const handleTaxConfigurationChange = (newConfig: "IGST" | "SGST_CGST") => {
    setTaxConfiguration(newConfig);

    setItems((prev: any) =>
      prev.map((item: any) => {
        const qty = Number(item.qty || item.quantity || 1);
        const rate = Number(item.rate || 0);
        const discount = Number(item.discount || 0);

        let base = qty * rate - discount;
        if (base < 0) base = 0;

        const taxRate = Number(
          item.taxRate || item.igst || item.cgst + item.sgst || 0
        );

        // IGST
        if (newConfig === "IGST") {
          return {
            ...item,
            taxType: "igst",
            igst: taxRate,
            cgst: 0,
            sgst: 0,
            amount:
              taxType === "exclusive" ? base + (base * taxRate) / 100 : base,
          };
        }

        // SGST + CGST
        return {
          ...item,
          taxType: "cgst_sgst",
          igst: 0,
          cgst: taxRate / 2,
          sgst: taxRate / 2,
          amount:
            taxType === "exclusive" ? base + (base * taxRate) / 100 : base,
        };
      })
    );
  };

  const [discountType, setDiscountType] = useState(initialValues.discountType);
  const [discountValue, setDiscountValue] = useState(
    initialValues.discountValue
  );
  const [shipping, setShipping] = useState(initialValues.shipping);
  const [roundOff, setRoundOff] = useState(initialValues.roundOff);
  const [showHSN, setShowHSN] = useState(initialValues.showHSN);
  const [showUnit, setShowUnit] = useState(initialValues.showUnit);
  const [terms, setTerms] = useState(
    mode === "edit" 
      ? (initialValues.terms !== undefined && initialValues.terms !== null ? String(initialValues.terms) : "") 
      : (initialValues.terms || "dueOnReceipt")
  );
  const [notes, setNotes] = useState(
    initialValues.notes !== undefined && initialValues.notes !== null ? String(initialValues.notes) : ""
  );
  const [attachments, setAttachments] = useState<File[]>(
    initialValues.attachments
  );
  const [showSignature, setShowSignature] = useState(
    initialValues.showSignature
  );
  const [cessList, setCessList] = useState<Cess[]>(
    initialValues.cessList || []
  );
  const [phases, setPhases] = useState<PaymentPhase[]>(
    initialValues.phases && Array.isArray(initialValues.phases) ? initialValues.phases : []
  );
  const [type] = useState(initialValues.type);

  // Use businessDetails from initialValues
  const [businessDetails, setBusinessDetails] = useState(
    initialValues.businessDetails
  );

  // Update form state when initialValues change (for edit mode)
  useEffect(() => {
    if (mode === "edit" && initialValues) {
      console.log("🔄 InvoiceForm useEffect - Updating form with initialValues:", {
        terms: initialValues.terms,
        notes: initialValues.notes,
        phases: initialValues.phases,
      });

      setInvoiceTitle(initialValues.invoiceTitle);
      setDate(initialValues.date);
      setDueDate(initialValues.dueDate);
      setClientId(initialValues.clientId);
      setClientDetails(initialValues.clientDetails);
      setBusinessDetails(initialValues.businessDetails);
      setTaxType(initialValues.taxType as "inclusive" | "exclusive");
      setTaxConfiguration(
        (initialValues.taxConfiguration as "IGST" | "SGST_CGST") || "SGST_CGST"
      );
      setItems(initialValues.items);
      setDiscountType(initialValues.discountType);
      setDiscountValue(initialValues.discountValue);
      setShipping(initialValues.shipping);
      setRoundOff(initialValues.roundOff);
      setShowHSN(initialValues.showHSN);
      setShowUnit(initialValues.showUnit);
      
      // Set terms, notes, and phases - ensure they're properly set
      const termsValue = initialValues.terms !== undefined && initialValues.terms !== null 
        ? String(initialValues.terms) 
        : "";
      const notesValue = initialValues.notes !== undefined && initialValues.notes !== null 
        ? String(initialValues.notes) 
        : "";
      const phasesValue = initialValues.phases && Array.isArray(initialValues.phases)
        ? initialValues.phases
        : [];

      console.log("📝 Setting form values:", {
        termsValue,
        notesValue,
        termsValueType: typeof termsValue,
        notesValueType: typeof notesValue,
        termsValueLength: termsValue?.length || 0,
        notesValueLength: notesValue?.length || 0,
        phasesValue,
      });

      setTerms(termsValue);
      setNotes(notesValue);
      setAttachments(initialValues.attachments);
      setShowSignature(initialValues.showSignature);
      setCessList(initialValues.cessList || []);
      setPhases(phasesValue);
    }
  }, [initialValues, mode]);

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddItemBulkModal, setShowAddItemBulkModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // =====================
  // INIT ITEMS (Quotation logic)
  // =====================
  const [items, setItems] = useState(
    initialValues.items.map((item: any) => {
      const taxRate = Number(item.taxRate || 0);

      if (initialValues.taxConfiguration === "IGST") {
        return {
          ...item,
          taxType: "igst",
          igst: taxRate,
          cgst: 0,
          sgst: 0,
        };
      }

      // SGST + CGST
      return {
        ...item,
        taxType: "cgst_sgst",
        igst: 0,
        cgst: taxRate / 2,
        sgst: taxRate / 2,
      };
    })
  );

  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev: any) => {
      const updated = [...prev];
      const item = { ...updated[idx] };

      // Field update
      item[field] = value;

      // Normalize qty
      item.quantity = Number(item.qty || value || 0);
      const qty = item.quantity;
      const rate = Number(item.rate || 0);
      const discount = Number(item.discount || 0);

      let base = qty * rate - discount;
      if (base < 0) base = 0;

      // TAX UPDATE
      const taxRate = Number(
        item.taxRate || item.igst || item.cgst + item.sgst || 0
      );

      if (taxConfiguration === "IGST") {
        item.taxType = "igst";
        item.igst = taxRate;
        item.cgst = 0;
        item.sgst = 0;
      } else {
        item.taxType = "cgst_sgst";
        item.cgst = taxRate / 2;
        item.sgst = taxRate / 2;
        item.igst = 0;
      }

      // Final amount
      item.amount =
        taxType === "exclusive" ? base + (base * taxRate) / 100 : base;

      updated[idx] = item;
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
        quantity: 1,
        rate: 0,
        discount: 0,
        taxType: taxConfiguration === "IGST" ? "igst" : "cgst_sgst",
        taxRate: 0,
        amount: 0,
        hsn: "",
        unit: "pcs",
        igst: taxConfiguration === "IGST" ? 0 : 0,
        cgst: taxConfiguration === "SGST_CGST" ? 0 : 0,
        sgst: taxConfiguration === "SGST_CGST" ? 0 : 0,
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

    const clientState =
      (found.address as any)?.state || (found as any).state || "";
    const businessState = (businessDetails as any)?.state || "";

    // Update client details
    setClientDetails({
      name: found.businessName || "",
      gstin: found.gstin || "",
      state: clientState,
      address:
        typeof found.address === "string"
          ? found.address
          : found.address?.street || "",
      contact: found.phone || "",
      email: found.email || "",
    });

    const taxRate = (i: any) =>
      Number(i.taxRate || i.igst || i.cgst + i.sgst || 0);

    // SAME STATE = CGST + SGST
    if (businessState === clientState) {
      setTaxConfiguration("SGST_CGST");

      setItems((prev: any) =>
        prev.map((item: any) => {
          const r = taxRate(item);
          return {
            ...item,
            taxType: "cgst_sgst",
            igst: 0,
            cgst: r / 2,
            sgst: r / 2,
          };
        })
      );
    }
    // DIFFERENT STATE = IGST
    else {
      setTaxConfiguration("IGST");

      setItems((prev: any) =>
        prev.map((item: any) => {
          const r = taxRate(item);
          return {
            ...item,
            taxType: "igst",
            igst: r,
            cgst: 0,
            sgst: 0,
          };
        })
      );
    }
  };

  // Summary calculations
  const subtotal = items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.qty || item.quantity) * Number(item.rate),
    0
  );

  // Calculate discount amount based on subtotal
  let discountAmount = 0;
  if (discountType === "flat") {
    discountAmount = Number(discountValue || 0);
  } else if (discountType === "percentage") {
    discountAmount = (subtotal * Number(discountValue || 0)) / 100;
  }

  // Calculate tax amount from items
  let tax = 0;
  if (taxType === "exclusive") {
    // For exclusive tax, calculate tax on (subtotal - discount)
    const taxableAmount = subtotal - discountAmount;
    items.forEach((item: any) => {
      const itemSubtotal =
        Number(item.qty || item.quantity) * Number(item.rate || 0);
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

  // Final total calculation
  let total = subtotal - discountAmount + tax + Number(shipping || 0);
  if (roundOff) total = Math.round(total);

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handlePrintDownload = () => {
    // Check if we're in edit mode and have an ID
    const invoiceId = (initialValues as any)?._id;
    if (mode === "edit" && invoiceId) {
      // Navigate to preview page
      window.open(`/finance/invoices/preview/${invoiceId}`, "_blank");
    } else {
      alert("Please save the invoice first before printing or downloading.");
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleFormSubmit = () => {
    console.log("handleFormSubmit called");

    // Validation with comprehensive error messages
    const newErrors: { [key: string]: string } = {};

    if (!invoiceTitle.trim())
      newErrors.invoiceTitle = "Invoice title is required";
    if (!invoiceNumber.trim())
      newErrors.invoiceNumber = "Invoice number is required";
    if (!clientId || clientId.trim() === "")
      newErrors.clientId = "Please select a client";
    if (!date) {
      newErrors.date = "Invoice date is required";
    } else if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    } else if (new Date(dueDate) < new Date(date)) {
      newErrors.dueDate = "Due date cannot be earlier than invoice date";
    }
    if (
      !items ||
      items.length === 0 ||
      items.every((item: any) => !item.name.trim())
    )
      newErrors.items = "At least one item is required";

    // Validate phases if any exist
    if (phases && phases.length > 0) {
      const totalPercentage = phases.reduce(
        (sum, phase) => sum + (Number(phase.percentage) || 0),
        0
      );
      if (totalPercentage !== 100) {
        newErrors.phases = `Total percentage of phases must equal 100%. Current total: ${totalPercentage}%`;
      }

      // Check for empty phase titles
      const hasEmptyTitles = phases.some((phase) => !phase.title?.trim());
      if (hasEmptyTitles) {
        newErrors.phases = newErrors.phases
          ? `${newErrors.phases} Also, all phases must have a title.`
          : "All phases must have a title.";
      }
    }

    setErrors(newErrors);

    console.log("Validation errors:", newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.log("Validation failed, not proceeding");
      return;
    }

    console.log("✅ Form validation passed!");
    console.log("Items count:", items.length);
    console.log("Business Details:", businessDetails);

    onSubmit({
      type,
      invoiceTitle,
      invoiceNumber,
      date,
      dueDate,
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
      cessList,
      phases,
    });
    if (onSuccess) onSuccess();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <InvoiceHeaderBar
        title={invoiceTitle}
        onTitleChange={(e) => setInvoiceTitle(e.target.value)}
        invoiceNumber={invoiceNumber}
        date={date}
        onDateChange={setDate}
        dueDate={dueDate}
        onDueDateChange={setDueDate}
        terms={terms}
        onTermsChange={setTerms}
      />
      <div className="mb-4">
        {errors.invoiceTitle && (
          <div className="text-red-500 text-xs mb-2 bg-red-50 p-2 rounded">
            {errors.invoiceTitle}
          </div>
        )}
        {errors.invoiceNumber && (
          <div className="text-red-500 text-xs mb-2 bg-red-50 p-2 rounded">
            {errors.invoiceNumber}
          </div>
        )}
        {errors.clientId && (
          <div className="text-red-500 text-xs mb-2 bg-red-50 p-2 rounded">
            {errors.clientId}
          </div>
        )}
        {errors.date && (
          <div className="text-red-500 text-xs mb-2 bg-red-50 p-2 rounded">
            {errors.date}
          </div>
        )}
        {errors.dueDate && (
          <div className="text-red-500 text-xs mb-2 bg-red-50 p-2 rounded">
            {errors.dueDate}
          </div>
        )}
      </div>
      {/* Business & Client Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Business Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
            Business Details
          </h3>
          <YourDetailsSection businessDetails={businessDetails} hideSelector />
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
        setTaxType={setTaxType}
        setTaxConfiguration={handleTaxConfigurationChange}
        setCessList={setCessList as any}
        mockProducts={products}
      />
      {errors.items && (
        <div className="text-red-500 text-xs mb-2 bg-red-50 p-2 rounded">
          {errors.items}
        </div>
      )}
      <PhaseWisePayment
        phases={phases}
        setPhases={setPhases}
        totalAmount={total}
      />
      {errors.phases && (
        <div className="text-red-500 text-xs mb-2 bg-red-50 p-2 rounded">
          {errors.phases}
        </div>
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
        handleAttachment={handleAttachment}
        showSignature={showSignature}
        setShowSignature={setShowSignature}
        mode={mode}
      />
      <ActionBar
        mode={mode}
        onSubmit={handleFormSubmit}
        loading={loading}
        onPrintDownload={handlePrintDownload}
        onCancel={handleCancel}
        disabled={
          mode === "edit" &&
          (initialValues.status === "paid" || initialValues.status === "cancelled")
        }
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
          setItems((prev: any) => [
            ...prev,
            {
              name: item.name,
              description: item.description,
              qty: 1,
              rate: item.sellingPrice || 0,
              discount: 0,
              igst: 0,
              sgst: 0,
              cgst: 0,
              amount: item.sellingPrice || 0,
              hsn: item.hsn || "",
              unit: item.unit || "pcs",
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
              qty: item.unit || 1,
              rate: 0,
              discount: 0,
              igst: 0,
              sgst: 0,
              cgst: 0,
              amount: 0,
              hsn: "",
              unit: "pcs",
            })),
          ]);
          setShowAddItemBulkModal(false);
        }}
      />
    </div>
  );
};

export default InvoiceForm;
