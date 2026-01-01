import React, { useState } from "react";

import AddClientModal from "@/components/finance/AddClientModal";
import AddItemModal from "@/components/finance/AddItemModal";
import AddItemBulkModal from "@/components/finance/AddItemBulkModal";
import YourDetailsSection from "@/components/finance/BussinessDetailsSection";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import type { Cess } from "@/components/finance/ConfigureTax";
import ItemTable from "@/components/finance/ItemTable";
import SummaryCard from "@/components/finance/SummaryCard";
import AdditionalInputs from "@/components/finance/AdditionalInputs";
import ActionBar from "@/components/finance/ActionBar";
import ClientSection from "@/components/finance/ClientSection";

// State Code to State Name mapping (GSTIN state codes)
const STATE_CODE_TO_NAME: { [key: string]: string } = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman & Diu",
  "26": "Dadra and Nagar Haveli and Daman and Diu",
  "27": "Maharashtra",
  "28": "Andhra Pradesh",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
};

// Reverse mapping: State Name to State Code (with variations)
const STATE_NAME_TO_CODE: { [key: string]: string } = {};
Object.entries(STATE_CODE_TO_NAME).forEach(([code, name]) => {
  STATE_NAME_TO_CODE[name.toLowerCase()] = code;
  // Add common variations
  if (name.includes("&")) {
    STATE_NAME_TO_CODE[name.replace("&", "and").toLowerCase()] = code;
    STATE_NAME_TO_CODE[name.replace("&", "And").toLowerCase()] = code;
  }
});

// Helper function to find state code from state name (fuzzy match)
const findStateCodeFromName = (stateName: string): string => {
  if (!stateName) return "";
  const normalized = stateName.trim().toLowerCase();
  
  // Direct match
  if (STATE_NAME_TO_CODE[normalized]) {
    return STATE_NAME_TO_CODE[normalized];
  }
  
  // Partial match
  for (const [code, name] of Object.entries(STATE_CODE_TO_NAME)) {
    if (name.toLowerCase().includes(normalized) || normalized.includes(name.toLowerCase())) {
      return code;
    }
  }
  
  return "";
};

// Helper function to find state name from state code
const findStateNameFromCode = (code: string): string => {
  return STATE_CODE_TO_NAME[code] || "";
};

// Types for invoices and reasons
export type Invoice = {
  id: string;
  label: string;
  invoiceNo: string;
  invoiceDate: string;
  clientId?: string;
  clientDetails?: any;
  items?: any[];
  taxType?: string;
  taxConfiguration?: string;
  discountType?: string;
  discountValue?: number;
  shipping?: number;
  roundOff?: boolean;
  showHSN?: boolean;
  showUnit?: boolean;
  terms?: string;
  notes?: string;
  cessList?: any[];
};

export type CreditNoteFormValues = {
  creditNoteNo: string;
  creditNoteDate: string;
  placeOfSupply: string;
  stateCode: string;
  linkedInvoice: string;
  originalInvoiceNo: string;
  originalInvoiceDate: string;
  reason: string;
  clientId: string;
  clientDetails: any;
  businessDetails: any;
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
};

type CreditNotesFormProps = {
  initialValues: CreditNoteFormValues;
  onSubmit: (values: CreditNoteFormValues) => void;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  loading?: boolean;
  invoices: Invoice[];
  reasons: string[];
  mockClients?: any[];
  mockProducts?: any[];
};

const CreditNotesForm: React.FC<CreditNotesFormProps> = ({
  initialValues,
  onSubmit,
  mode,
  onSuccess,
  loading,
  invoices,
  reasons,
  mockClients,
  mockProducts,
}) => {
  const mockClientsFromProps = mockClients || [];
  const products = mockProducts || [];
  const clients = useClientStore((state) => state.clients);

  // Credit Note Details state
  const [creditNoteNo, setCreditNoteNo] = useState(
    initialValues.creditNoteNo || ""
  );
  const [creditNoteDate, setCreditNoteDate] = useState(
    initialValues.creditNoteDate || ""
  );
  const [placeOfSupply, setPlaceOfSupply] = useState(
    initialValues.placeOfSupply || ""
  );
  const [stateCode, setStateCode] = useState(initialValues.stateCode || "");

  // Handler for place of supply change - auto-fill state code
  const handlePlaceOfSupplyChange = (value: string) => {
    setPlaceOfSupply(value);
    // Auto-fill state code when state name is entered and matches a known state
    if (value) {
      const code = findStateCodeFromName(value);
      if (code && code !== stateCode) {
        setStateCode(code);
      }
    }
  };

  // Handler for state code change - auto-fill place of supply
  const handleStateCodeChange = (value: string) => {
    setStateCode(value);
    // Auto-fill place of supply when state code is entered and matches a known code
    if (value && value.length === 2) {
      const stateName = findStateNameFromCode(value);
      if (stateName && stateName !== placeOfSupply) {
        setPlaceOfSupply(stateName);
      }
    }
  };

  // Linked Invoice Details state
  const [linkedInvoice, setLinkedInvoice] = useState(
    initialValues.linkedInvoice || ""
  );
  const [originalInvoiceNo, setOriginalInvoiceNo] = useState(
    initialValues.originalInvoiceNo || ""
  );
  const [originalInvoiceDate, setOriginalInvoiceDate] = useState(
    initialValues.originalInvoiceDate || ""
  );
  const [reason, setReason] = useState(initialValues.reason || "");

  // Other state
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
  const [businessDetails] = useState(initialValues.businessDetails);
  const [cessList, setCessList] = useState<Cess[]>(
    initialValues.cessList || []
  );
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddItemBulkModal, setShowAddItemBulkModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handler for tax configuration change to reset tax values
  const handleTaxConfigurationChange = (newConfig: "IGST" | "SGST_CGST") => {
    setTaxConfiguration(newConfig);

    setItems((prev) =>
      prev.map((item) => {
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

  // Handlers for items
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

    const clientState = found.address?.state || (found as any).state || "";
    const businessState = businessDetails?.state || "";

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

    // Auto-fill place of supply from client state
    if (clientState && !placeOfSupply) {
      setPlaceOfSupply(clientState);
      // Also auto-fill state code
      const code = findStateCodeFromName(clientState);
      if (code && !stateCode) {
        setStateCode(code);
      }
    }

    // If place of supply is still empty, try to get from GSTIN
    if (!placeOfSupply && found.gstin && found.gstin.length >= 2) {
      const gstinStateCode = found.gstin.substring(0, 2);
      const stateName = findStateNameFromCode(gstinStateCode);
      if (stateName) {
        setPlaceOfSupply(stateName);
        setStateCode(gstinStateCode);
      }
    }

    const taxRate = (i: any) =>
      Number(i.taxRate || i.igst || i.cgst + i.sgst || 0);

    // SAME STATE = CGST + SGST
    if (businessState === clientState) {
      setTaxConfiguration("SGST_CGST");

      setItems((prev) =>
        prev.map((item) => {
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

      setItems((prev) =>
        prev.map((item) => {
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

  // Handle linked invoice selection - auto-populate invoice details
  const handleLinkedInvoiceChange = (value: string) => {
    setLinkedInvoice(value);
    const foundInvoice = invoices.find((inv) => inv.id === value);
    
    console.log("Selected invoice:", value);
    console.log("Found invoice:", foundInvoice);
    
    if (foundInvoice) {
      // Auto-fill invoice number and date
      setOriginalInvoiceNo(foundInvoice.invoiceNo || "");
      setOriginalInvoiceDate(foundInvoice.invoiceDate || "");
      
      console.log("Setting invoice date:", foundInvoice.invoiceDate);

      // Auto-fill client details if available
      if (foundInvoice.clientId) {
        setClientId(foundInvoice.clientId);
        if (foundInvoice.clientDetails) {
          setClientDetails(foundInvoice.clientDetails);
        }
      }

      // Auto-fill items if available
      if (foundInvoice.items && foundInvoice.items.length > 0) {
        setItems(
          foundInvoice.items.map((item: any) => ({
            ...item,
            qty: item.quantity || item.qty || 1,
            quantity: item.quantity || item.qty || 1,
          }))
        );
      }

      // Auto-fill tax configuration
      if (foundInvoice.taxConfiguration) {
        setTaxConfiguration(
          foundInvoice.taxConfiguration as "IGST" | "SGST_CGST"
        );
      }

      // Auto-fill tax type
      if (foundInvoice.taxType) {
        setTaxType(foundInvoice.taxType as "inclusive" | "exclusive");
      }

      // Auto-fill discount
      if (foundInvoice.discountType) {
        setDiscountType(foundInvoice.discountType);
      }
      if (foundInvoice.discountValue !== undefined) {
        setDiscountValue(foundInvoice.discountValue);
      }

      // Auto-fill shipping
      if (foundInvoice.shipping !== undefined) {
        setShipping(foundInvoice.shipping);
      }

      // Auto-fill other options
      if (foundInvoice.roundOff !== undefined) {
        setRoundOff(foundInvoice.roundOff);
      }
      if (foundInvoice.showHSN !== undefined) {
        setShowHSN(foundInvoice.showHSN);
      }
      if (foundInvoice.showUnit !== undefined) {
        setShowUnit(foundInvoice.showUnit);
      }

      // Auto-fill terms and notes
      if (foundInvoice.terms) {
        setTerms(foundInvoice.terms);
      }
      if (foundInvoice.notes) {
        setNotes(foundInvoice.notes);
      }

      // Auto-fill cess list
      if (foundInvoice.cessList) {
        setCessList(foundInvoice.cessList);
      }
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

  const handleFormSubmit = () => {
    const newErrors: { [key: string]: string } = {};
    if (!creditNoteNo.trim())
      newErrors.creditNoteNo = "Credit Note No is required";
    if (!creditNoteDate)
      newErrors.creditNoteDate = "Credit Note Date is required";
    if (!placeOfSupply.trim())
      newErrors.placeOfSupply = "Place of Supply is required";
    if (!stateCode.trim()) newErrors.stateCode = "State Code is required";
    if (!originalInvoiceNo.trim())
      newErrors.originalInvoiceNo = "Original Invoice No is required";
    if (!originalInvoiceDate)
      newErrors.originalInvoiceDate = "Original Invoice Date is required";
    if (!reason) newErrors.reason = "Reason is required";
    if (
      !items ||
      items.length === 0 ||
      items.every((item: any) => !item.name.trim())
    )
      newErrors.items = "At least one item is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit({
      creditNoteNo,
      creditNoteDate,
      placeOfSupply,
      stateCode,
      linkedInvoice,
      originalInvoiceNo,
      originalInvoiceDate,
      reason,
      clientId,
      clientDetails: { ...clientDetails },
      businessDetails: businessDetails,
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
    });

    if (onSuccess) onSuccess();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Credit Note Details Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
          Credit Note Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Note Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={creditNoteNo}
              onChange={(e) => setCreditNoteNo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="CN-001"
            />
            {errors.creditNoteNo && (
              <div className="text-red-500 text-xs mt-1">
                {errors.creditNoteNo}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Note Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={creditNoteDate}
              onChange={(e) => setCreditNoteDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.creditNoteDate && (
              <div className="text-red-500 text-xs mt-1">
                {errors.creditNoteDate}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Place of Supply <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={placeOfSupply}
              onChange={(e) => handlePlaceOfSupplyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Maharashtra"
            />
            {errors.placeOfSupply && (
              <div className="text-red-500 text-xs mt-1">
                {errors.placeOfSupply}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={stateCode}
              onChange={(e) => handleStateCodeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="27"
              maxLength={2}
            />
            {errors.stateCode && (
              <div className="text-red-500 text-xs mt-1">
                {errors.stateCode}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Linked Invoice Details Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
          Linked Invoice Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Invoice (Optional)
            </label>
            <select
              value={linkedInvoice}
              onChange={(e) => handleLinkedInvoiceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Invoice --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Original Invoice Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={originalInvoiceNo}
              onChange={(e) => setOriginalInvoiceNo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="INV-001"
            />
            {errors.originalInvoiceNo && (
              <div className="text-red-500 text-xs mt-1">
                {errors.originalInvoiceNo}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Original Invoice Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={originalInvoiceDate}
              onChange={(e) => setOriginalInvoiceDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.originalInvoiceDate && (
              <div className="text-red-500 text-xs mt-1">
                {errors.originalInvoiceDate}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Credit Note <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Reason --</option>
              {reasons.map((r, idx) => (
                <option key={idx} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.reason && (
              <div className="text-red-500 text-xs mt-1">{errors.reason}</div>
            )}
          </div>
        </div>
      </div>

      {/* Business and Client Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Business Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
          <div className="mb-4 border-b pb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Business Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Company Name</div>
              <div className="font-medium text-base text-gray-900">
                {businessDetails?.name || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">GSTIN</div>
              <div className="font-medium text-base text-gray-900">
                {businessDetails?.gstin || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Billing Address</div>
              <div className="font-medium text-base text-gray-900">
                {businessDetails?.address || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">State</div>
              <div className="font-medium text-base text-gray-900">
                {businessDetails?.state || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Contact Person</div>
              <div className="font-medium text-base text-gray-900">
                {businessDetails?.contact || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Client Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
          <div className="mb-4 border-b pb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Client Details
            </h3>
          </div>
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

      {/* Items Table */}
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
        <div className="text-red-500 text-xs mb-2">{errors.items}</div>
      )}

      {/* Summary/Calculation */}
      <SummaryCard
        subtotal={subtotal}
        discountType={discountType as "flat" | "percentage"}
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

      {/* Terms, Notes, Signature */}
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

      {/* Action Bar */}
      <ActionBar mode={mode} onSubmit={handleFormSubmit} loading={loading} />

      {/* Modals */}
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

export default CreditNotesForm;
