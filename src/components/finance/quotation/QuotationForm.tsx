import React, { useState, useEffect } from "react";
import HeaderBar from "./HeaderBar";
import ClientSection from "../ClientSection";
import ItemTable from "../ItemTable";
import SummaryCard from "../SummaryCard";
import AdditionalInputs from "../AdditionalInputs";
import ActionBar from "../ActionBar";
import AddClientModal from "@/components/finance/AddClientModal";
import AddItemModal from "@/components/finance/AddItemModal";
import AddItemBulkModal from "@/components/finance/AddItemBulkModal";
import PhaseWisePayment, {
  PaymentPhase,
} from "@/components/finance/PhaseWisePayment";
import type { Cess as ConfigureTaxCess } from "@/components/finance/ConfigureTax";
import YourDetailsSection from "@/components/finance/BussinessDetailsSection";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useQuotationStore } from "@/stores/financeStore/useQuotationStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  QuotationItem,
  ClientDetails,
  BusinessDetails,
  CreateQuotationPayload,
  UpdateQuotationPayload,
  Cess,
} from "@/api/finance/quotationApi";

export type QuotationFormValues = {
  _id?: string;
  companyId?: string;
  quotationTitle: string;
  quotationNumber: string;
  date: string;
  dueDate: string;
  clientId: string;
  clientDetails: ClientDetails;
  businessDetails: BusinessDetails;
  taxType: "inclusive" | "exclusive";
  taxConfiguration?: "IGST" | "SGST_CGST";
  cessList: ConfigureTaxCess[];
  items: QuotationItem[];
  discountType: "flat" | "percentage";
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
  phases: PaymentPhase[];
  status?: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  convertedToInvoice?: boolean;
  convertedToProformaInvoice?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type QuotationFormProps = {
  initialValues: QuotationFormValues;
  onSubmit: (values: QuotationFormValues) => void;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  loading?: boolean;
  mockClients?: any[];
  mockProducts?: any[];
  onSendEmail?: () => void;
};

const QuotationForm: React.FC<QuotationFormProps> = ({
  initialValues,
  onSubmit,
  mode = "create",
  mockClients,
  mockProducts,
  onSuccess,
  loading,
  onSendEmail,
}) => {
  // Use provided mocks or fallback to defaults
  const mockClientsFromProps = mockClients || [];
  const products = mockProducts || [];
  const clients = useClientStore((state) => state.clients);
  const createClient = useClientStore((state) => state.createClient);
  const { user } = useAuthStore();

  // State initialization from initialValues
  const [quotationTitle, setQuotationTitle] = useState(
    initialValues.quotationTitle
  );
  const [quotationNumber, setQuotationNumber] = useState(
    initialValues.quotationNumber
  );
  const [date, setDate] = useState(initialValues.date);
  const [dueDate, setDueDate] = useState(initialValues.dueDate);
  const [clientId, setClientId] = useState(initialValues.clientId);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientDetails, setClientDetails] = useState<ClientDetails>(
    initialValues.clientDetails || {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
      igstn: "",
      state: "",
    }
  );
  const [taxType, setTaxType] = useState<"inclusive" | "exclusive">(
    initialValues.taxType
  );
  const [taxConfiguration, setTaxConfiguration] = useState<
    "IGST" | "SGST_CGST"
  >(initialValues.taxConfiguration || "SGST_CGST");
  const [cessList, setCessList] = useState<ConfigureTaxCess[]>(
    initialValues.cessList || []
  );

  // Handler for tax configuration change to reset tax values
  const handleTaxConfigurationChange = (newTaxConfig: "IGST" | "SGST_CGST") => {
    setTaxConfiguration(newTaxConfig);

    setItems((prevItems) =>
      prevItems.map((item) => {
        const quantity = Number(item.quantity) || 0;
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

  const [items, setItems] = useState<QuotationItem[]>(initialValues.items);
  const [discountType, setDiscountType] = useState<"flat" | "percentage">(
    initialValues.discountType
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

  const [signature,setSignature]=useState(initialValues.signature)
  const [phases, setPhases] = useState<PaymentPhase[]>(initialValues.phases);
  // Use businessDetails from initialValues
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>(
    initialValues.businessDetails || {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    }
  );

  // console.log("Signature....",signature)
  // Update form state when initialValues change (for edit mode)
  useEffect(() => {
    if (initialValues) {
      setQuotationTitle(initialValues.quotationTitle || "");
      setQuotationNumber(initialValues.quotationNumber || "");
      setDate(initialValues.date || "");
      setDueDate(initialValues.dueDate || "");
      setClientId(initialValues.clientId || "");
      
      // Set client details with all fields
      const clientDetailsToSet = initialValues.clientDetails || {
        name: "",
        gstin: "",
        address: "",
        contact: "",
        email: "",
        igstn: "",
        state: "",
      };
      setClientDetails({
        name: clientDetailsToSet.name || "",
        gstin: clientDetailsToSet.gstin || "",
        address: 
          typeof clientDetailsToSet.address === "string"
            ? clientDetailsToSet.address
            : "",
        contact: clientDetailsToSet.contact || "",
        email: clientDetailsToSet.email || "",
        igstn: clientDetailsToSet.igstn || "",
        state: clientDetailsToSet.state || "",
      });
      
      // Set business details with all fields
      const businessDetailsToSet = initialValues.businessDetails || {
        name: "",
        gstin: "",
        address: "",
        contact: "",
        email: "",
      };
      setBusinessDetails({
        name: businessDetailsToSet.name || "",
        gstin: businessDetailsToSet.gstin || "",
        address: businessDetailsToSet.address || "",
        contact: businessDetailsToSet.contact || "",
        email: businessDetailsToSet.email || "",
      });
      
      setTaxType(initialValues.taxType || "exclusive");
      setTaxConfiguration(initialValues.taxConfiguration || "SGST_CGST");
      setCessList(initialValues.cessList || []);
      setItems(initialValues.items || []);
      setDiscountType(initialValues.discountType || "flat");
      setDiscountValue(initialValues.discountValue || 0);
      setShipping(initialValues.shipping || 0);
      setRoundOff(initialValues.roundOff || false);
      setShowHSN(initialValues.showHSN || false);
      setShowUnit(initialValues.showUnit || false);
      setTerms(initialValues.terms || "");
      setNotes(initialValues.notes || "");
      setAttachments(initialValues.attachments || []);
      setShowSignature(initialValues.showSignature || false);
      setSignature(initialValues.signature || "")
      setPhases(initialValues.phases || []);
    }
  }, [initialValues]);

  // Add modal state for AddClientModal, AddItemModal, AddItemBulkModal
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddItemBulkModal, setShowAddItemBulkModal] = useState(false);

  // Error state for validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handlers for items
  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      if (field === "qty") {
        // Map qty to the API field quantity
        updated[idx] = { ...updated[idx], quantity: value };
      } else {
        updated[idx] = { ...updated[idx], [field]: value };
      }

      // Recalculate amount based on tax configuration
      const item = updated[idx];
      const quantity = Number(item.quantity) || 0;
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
    setItems((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        quantity: 1,
        unit: "Hours",
        rate: 0,
        discount: 0,
        taxType: taxConfiguration === "IGST" ? "igst" : "cgst_sgst",
        taxRate: 0,
        amount: 0,
        hsn: "",
        igst: taxConfiguration === "IGST" ? 0 : 0,
        cgst: taxConfiguration === "SGST_CGST" ? 0 : 0,
        sgst: taxConfiguration === "SGST_CGST" ? 0 : 0,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const onAddNewItemClick = () => setShowAddItemModal(true);
  const openBulkModal = () => setShowAddItemBulkModal(true);

  // Add client handler
  const handleAddClient = () => setShowAddClient(true);

  // Handler for client selection
  const handleClientSelect = (value: string) => {
    setClientId(value);
    if (value === "new") return;

    const found = clients.find((c) => String(c._id) === value);
    if (!found) return;

    const clientState = found.address?.state || (found as any).state || "";
    const businessState = (businessDetails as any)?.state || "";

    // 1️⃣ UPDATE CLIENT DETAILS
    setClientDetails({
      name: found.businessName || "",
      gstin: found.gstin || "",
      igstn: (found as any).igstn || "",
      state: found.address?.state || (found as any).state || "",
      address:
        typeof found.address === "string"
          ? found.address
          : found.address?.street || "",
      contact: found.phone || "",
      email: found.email || "",
    });

    // 2️⃣ AUTO APPLY GST RULES BASED ON STATE
    if (businessState && clientState) {
      if (businessState === clientState) {
        // SAME STATE = SGST + CGST
        handleTaxConfigurationChange("SGST_CGST");
      } else {
        // DIFFERENT STATE = IGST
        handleTaxConfigurationChange("IGST");
      }
    }
  };

  // Phase validation calculations
  const totalPhasePercentage = phases.reduce(
    (sum, phase) => sum + (Number(phase.percentage) || 0),
    0
  );
  const isPhasePercentageValid =
    phases.length === 0 || totalPhasePercentage === 100;

  // Summary calculations
  // Calculate subtotal (quantity * rate for all items, before any discounts or taxes)
  const subtotal = items.reduce(
    (sum: number, item) =>
      sum + Number(item.quantity || 0) * Number(item.rate || 0),
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
  let taxAmount = 0;
  if (taxType === "exclusive") {
    // For exclusive tax, calculate tax on (subtotal - discount)
    const taxableAmount = subtotal - discountAmount;
    items.forEach((item) => {
      const itemSubtotal = Number(item.quantity || 0) * Number(item.rate || 0);
      // Calculate proportional share of this item in the total taxable amount
      const itemTaxableAmount =
        subtotal > 0 ? (itemSubtotal / subtotal) * taxableAmount : 0;
      const taxRate = Number(item.taxRate || 0);

      if (item.taxType === "igst") {
        taxAmount += (itemTaxableAmount * taxRate) / 100;
      } else if (item.taxType === "cgst_sgst") {
        taxAmount += (itemTaxableAmount * taxRate) / 100; // Total tax rate for CGST + SGST
      }
    });
  } else {
    // For inclusive tax, tax is already included in item amounts
    // We need to extract the tax amount from the item amounts
    items.forEach((item) => {
      const itemAmount = Number(item.amount || 0);
      const taxRate = Number(item.taxRate || 0);
      if (taxRate > 0) {
        // Calculate tax component from inclusive amount
        const taxComponent = (itemAmount * taxRate) / (100 + taxRate);
        taxAmount += taxComponent;
      }
    });
  }

  // Final total calculation
  let total = subtotal - discountAmount + taxAmount + Number(shipping || 0);
  if (roundOff) total = Math.round(total);

  // Attachment handler
  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  // Helper functions to convert between API types and component types
  const convertItemsToComponentFormat = (apiItems: QuotationItem[]) => {
    return apiItems.map((item) => {
      // Determine tax values based on current tax configuration
      let igst = 0,
        sgst = 0,
        cgst = 0;

      if (taxConfiguration === "IGST" && item.taxType === "igst") {
        igst = item.igst || item.taxRate || 0;
      } else if (
        taxConfiguration === "SGST_CGST" &&
        item.taxType === "cgst_sgst"
      ) {
        sgst = item.sgst || (item.taxRate || 0) / 2;
        cgst = item.cgst || (item.taxRate || 0) / 2;
      }

      return {
        name: item.name,
        description: item.description || "",
        qty: item.quantity,
        rate: item.rate,
        discount: item.discount,
        igst,
        sgst,
        cgst,
        amount: item.amount || 0,
        hsn: item.hsn || "",
        unit: item.unit || "",
      };
    });
  };

  const convertClientToComponentFormat = (clients: any[]) => {
    return clients.map((client) => ({
      id: parseInt(client._id) || 0,
      name: client.businessName || "",
      gstin: client.gstin || "",
      address:
        typeof client.address === "string"
          ? client.address
          : client.address?.street || "",
      contact: client.phone || "",
      email: client.email || "",
    }));
  };

  const convertCessToApiFormat = (cessList: ConfigureTaxCess[]): Cess[] => {
    return cessList.map((cess) => ({
      name: cess.name || cess.type || "",
      rate: Number(cess.value || 0),
      showInInvoice: Boolean(cess.showInInvoice),
    }));
  };

  const convertPhasesToApiFormat = (phases: any[]) => {
    return phases.map((phase) => ({
      title: phase.name || phase.title,
      percentage: phase.percentage || 0,
      dueDate: phase.dueDate,
    }));
  };

  // On submit, gather all state and call onSubmit
  const handleFormSubmit = () => {
    console.log("handleFormSubmit called");

    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!quotationTitle.trim())
      newErrors.quotationTitle = "Quotation title is required";
    if (!quotationNumber.trim())
      newErrors.quotationNumber = "Quotation number is required";
    if (!date) newErrors.date = "Quotation date is required";
    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    } else if (new Date(dueDate) < new Date(date)) {
      newErrors.dueDate = "Due date cannot be earlier than quotation date";
    }
    if (
      !items ||
      items.length === 0 ||
      items.every((item) => !item.name.trim())
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

    const formData: QuotationFormValues = {
      quotationTitle,
      quotationNumber,
      date,
      dueDate,
      clientId,
      clientDetails: {
        name: clientDetails.name || "",
        gstin: clientDetails.gstin || "",
        address: clientDetails.address || "",
        contact: clientDetails.contact || "",
        email: clientDetails.email || "",
        igstn: clientDetails.igstn || "",
        state: clientDetails.state || "",
      },
      businessDetails: {
        name: businessDetails.name || "",
        gstin: businessDetails.gstin,
        address: businessDetails.address,
        contact: businessDetails.contact,
        email: businessDetails.email,
      },
      taxType,
      taxConfiguration,
      cessList: cessList,
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
      phases: convertPhasesToApiFormat(phases),
    };

    console.log("Signature inside the form submit",signature)

    console.log("✅ Form validation passed!");
    console.log("Form data prepared:", formData);
    console.log("Items count:", items.length);
    console.log("Business Details:", businessDetails);
    console.log("Calling onSubmit with form data");
    onSubmit(formData);
    if (onSuccess) onSuccess();
  };

  const handlePrintDownload = () => {
    // Check if we're in edit mode and have an ID
    const quotationId = (initialValues as any)?._id;
    if (mode === "edit" && quotationId) {
      // Navigate to preview page
      window.open(`/finance/quotations/preview/${quotationId}`, "_blank");
    } else {
      alert("Please save the quotation first before printing or downloading.");
    }
  };

  const handleSendEmail = () => {
    toast.success("Send Email functionality - Backend API integration pending");
    // TODO: Implement with backend API
    // const emailData = {
    //   to: clientEmail,
    //   subject: `Quotation ${quotationNumber}`,
    //   message: "Please find the quotation attached"
    // };
    // await sendQuotationEmail(quotationId, emailData);
  };

  const handleCancel = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };


  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <HeaderBar
        title={quotationTitle}
        onTitleChange={(e) => setQuotationTitle(e.target.value)}
        date={date}
        onDateChange={setDate}
        dueDate={dueDate}
        onDueDateChange={setDueDate}
      />
      {/* Error messages for header fields */}
      <div className="mb-2">
        {errors.quotationTitle && (
          <div className="text-red-500 text-xs">{errors.quotationTitle}</div>
        )}
        {errors.quotationNumber && (
          <div className="text-red-500 text-xs">{errors.quotationNumber}</div>
        )}
        {errors.date && (
          <div className="text-red-500 text-xs">{errors.date}</div>
        )}
        {errors.dueDate && (
          <div className="text-red-500 text-xs">{errors.dueDate}</div>
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
              name: businessDetails?.name || "",
              gstin: businessDetails?.gstin || "",
              address: businessDetails?.address || "",
              contact: businessDetails?.contact || "",
              email: businessDetails?.email || "",
              igstn: (businessDetails as any)?.igstn || "",
              state: (businessDetails as any)?.state || "",
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
            setClientDetails={setClientDetails}
            handleAddClient={handleAddClient}
            mockClients={clients}
          />
        </div>
      </div>
      <div>
        {/* Info icon for Amount guideline */}
        <div className="flex items-center mb-2">
          <span className="font-semibold">Amount</span>
          <span className="ml-1 relative group cursor-pointer">
            <svg
              width="16"
              height="16"
              fill="currentColor"
              className="inline text-blue-500"
            >
              <circle cx="8" cy="8" r="8" />
              <text x="8" y="12" textAnchor="middle" fontSize="10" fill="#fff">
                i
              </text>
            </svg>
            <div className="absolute left-6 top-0 z-10 hidden group-hover:block bg-white border border-gray-300 rounded px-2 py-1 text-xs shadow w-56">
              Amount is calculated as per quantity, rate, discount, and tax
              configuration. Please verify values before saving.
            </div>
          </span>
        </div>
        <ItemTable
          items={convertItemsToComponentFormat(items)}
          setItems={(itemsAction) => {
            if (typeof itemsAction === "function") {
              setItems((prev) => {
                const componentItems = convertItemsToComponentFormat(prev);
                const newComponentItems = itemsAction(componentItems);
                // Convert back to API format
                return newComponentItems.map((item) => ({
                  name: item.name,
                  description: item.description,
                  quantity: item.qty,
                  unit: item.unit,
                  rate: item.rate,
                  discount: item.discount,
                  taxType: ((item.igst || 0) > 0 ? "igst" : "cgst_sgst") as
                    | "igst"
                    | "cgst_sgst",
                  taxRate:
                    (item.igst || 0) > 0
                      ? item.igst || 0
                      : (item.sgst || 0) + (item.cgst || 0),
                  amount: item.amount,
                  hsn: item.hsn,
                  igst: item.igst,
                  cgst: item.cgst,
                  sgst: item.sgst,
                }));
              });
            } else {
              // Direct array assignment
              const apiItems = itemsAction.map((item) => ({
                name: item.name,
                description: item.description,
                quantity: item.qty,
                unit: item.unit,
                rate: item.rate,
                discount: item.discount,
                taxType: ((item.igst || 0) > 0 ? "igst" : "cgst_sgst") as
                  | "igst"
                  | "cgst_sgst",
                taxRate:
                  (item.igst || 0) > 0
                    ? item.igst || 0
                    : (item.sgst || 0) + (item.cgst || 0),
                amount: item.amount,
                hsn: item.hsn,
                igst: item.igst,
                cgst: item.cgst,
                sgst: item.sgst,
              }));
              setItems(apiItems);
            }
          }}
          handleItemChange={(idx, field, value) => {
            if (field === "qty") {
              handleItemChange(idx, "quantity", value);
            } else {
              handleItemChange(idx, field, value);
            }
          }}
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
          cessList={cessList as any}
          setTaxType={(value) => setTaxType(value as "inclusive" | "exclusive")}
          setTaxConfiguration={handleTaxConfigurationChange}
          setCessList={setCessList as any}
          mockProducts={products}
        />
      </div>
      {/* Error message for items */}
      {errors.items && (
        <div className="text-red-500 text-xs mb-2">{errors.items}</div>
      )}
      <PhaseWisePayment
        phases={phases}
        setPhases={setPhases}
        totalAmount={total}
      />
      {/* Error message for phases */}
      {errors.phases && (
        <div className="text-red-500 text-xs mb-2">{errors.phases}</div>
      )}
      <SummaryCard
        subtotal={subtotal}
        discountType={discountType}
        discountValue={discountValue}
        setDiscountType={(value) =>
          setDiscountType(value as "flat" | "percentage")
        }
        setDiscountValue={setDiscountValue}
        tax={taxAmount}
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
        setSignature={setSignature}
        signature={signature}
        setShowSignature={setShowSignature}
      />
      <ActionBar
        mode={mode}
        onSubmit={handleFormSubmit}
        loading={loading}
        onPrintDownload={handlePrintDownload}
        onSendEmail={onSendEmail}
        onCancel={handleCancel}
        documentType="quotation"
        disabled={
          mode === "edit" &&
          (initialValues?.status === "accepted" ||
            initialValues?.status === "rejected" ||
            initialValues?.status === "converted")
        }
      />
      <AddClientModal
        open={showAddClient}
        onClose={() => setShowAddClient(false)}
        onSubmit={async (form) => {
          try {
            // Create client using the store
            const response = await createClient({
              companyId: user?.companyId || "",
              businessName: form.businessName,
              gstin: form.gstin,
              email: form.email,
              phone: form.phone || "",
              address: {
                street: form.street,
                city: form.addressCity || "",
                state: form.addressState || "",
                postalCode: form.postalCode || "",
                country: form.addressCountry || "India",
              },
              alias: form.alias || form.businessName,
            });

            // Update local state with the new client
            setClientDetails({
              name: form.businessName,
              gstin: form.gstin,
              address: form.street,
              contact: form.phone || form.alias || form.businessName,
              email: form.email,
              igstn: (form as any).igstn || "",
              state: form.addressState || "",
            });
            setClientId(response.result._id);
            setShowAddClient(false);
          } catch (error) {
            console.error("Failed to create client:", error);
          }
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
              quantity: 1,
              rate: item.sellingPrice || 0,
              discount: 0,
              taxType: taxConfiguration === "IGST" ? "igst" : "cgst_sgst",
              taxRate: 0,
              igst: 0,
              sgst: 0,
              cgst: 0,
              amount: item.sellingPrice || 0,
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
              quantity: item.unit,
              rate: 0,
              discount: 0,
              taxType: taxConfiguration === "IGST" ? "igst" : "cgst_sgst",
              taxRate: 0,
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

export default QuotationForm;
