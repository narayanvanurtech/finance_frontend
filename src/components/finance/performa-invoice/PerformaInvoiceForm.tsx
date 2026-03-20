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
import PerformaInvoiceHeaderBar from "./HeaderBar";
import YourDetailsSection from "@/components/finance/BussinessDetailsSection";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import QrScanner from "@/utils/QrScanner";

export type PerformaInvoiceFormValues = {
  type: "invoice" | "performa";
  performaInvoiceTitle: string;
  performaInvoiceNumber: string;
  // Also include invoiceTitle and invoiceNumber for compatibility with API
  invoiceTitle?: string;
  invoiceNumber?: string;
  date: string;
  dueDate: string;
  clientId:
    | string
    | {
        _id: string;
        email?: string;
        phone?: string;
        id?: string;
        businessName?: string;
      };
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
  };
  taxType: string;
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
  signature:string;
  cessList: Cess[];
  phases: PaymentPhase[];

  status?: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";

  _id?: string;

  // Additional fields from API response
  subtotal?: number;
  totalTax?: number;
  totalCess?: number;
  grandTotal?: number;
  createdAt?: string;
  updatedAt?: string;
  quotationId?: string;
  convertedFromQuotation?: boolean;
  convertedToInvoice?: boolean;
  validUntil?: string;
};

type PerformaInvoiceFormProps = {
  initialValues: PerformaInvoiceFormValues;
  onSubmit: (values: PerformaInvoiceFormValues) => void;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  loading?: boolean;
  mockClients?: any[];
  mockProducts?: any[];
};

const PerformaInvoiceForm: React.FC<any> = ({
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
  const [invoiceTitle, setInvoiceTitle] = useState(
    initialValues.performaInvoiceTitle
  );
  const [invoiceNumber] = useState(initialValues.performaInvoiceNumber);
  const [date, setDate] = useState(initialValues.date);
  const [dueDate, setDueDate] = useState(initialValues.dueDate);
  const [clientId, setClientId] = useState(initialValues.clientId);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientDetails, setClientDetails] = useState(
    initialValues.clientDetails
  );
  const [taxType, setTaxType] = useState<"inclusive" | "exclusive">(
    "exclusive"
  );
  const [taxConfiguration, setTaxConfiguration] = useState<
    "IGST" | "SGST_CGST"
  >(initialValues.taxType === "IGST" ? "IGST" : "SGST_CGST");
  const [items, setItems] = useState(initialValues.items);

  // Ensure all items have discountType initialized
  useEffect(() => {
    setItems((prev: any) =>
      prev.map((item: any) => ({
        ...item,
        discountType: item.discountType || "flat",
      }))
    );
  }, []);

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
    initialValues.showSignature
  );
  const [signature, setSignature] = useState<string>(
  initialValues.signature || ""
);
  const [cessList, setCessList] = useState<Cess[]>(
    initialValues.cessList || []
  );
  const [phases, setPhases] = useState<PaymentPhase[]>(
    initialValues.phases || []
  );
  const [type] = useState(initialValues.type);

  // Use businessDetails from initialValues
  const [businessDetails, setBusinessDetails] = useState(
    initialValues.businessDetails
  );

  // Debug log
  //console.log("📊 PerformaInvoiceForm businessDetails:", businessDetails);

  // Enrich clientDetails from clients store if missing fields
  useEffect(() => {
    // Get clientId as string
    let clientIdString = "";
    if (typeof clientId === "string") {
      clientIdString = clientId;
    } else if (clientId && typeof clientId === "object") {
      clientIdString = clientId._id || clientId.id || "";
    }

    // If no clientId or clients not loaded, nothing to do
    if (!clientIdString || clientIdString === "new" || clients.length === 0) {
      return;
    }

    // If clientDetails already has meaningful values, don't do anything
    const hasValue = (val: any) => val && val !== null && val !== undefined && val.toString().trim() !== "";
    if (hasValue(clientDetails?.name) && hasValue(clientDetails?.gstin) && hasValue(clientDetails?.address)) {
      return;
    }
    
    //console.log("🔍 Looking for client in store. clientId:", clientIdString, "clients count:", clients.length);

    // Find client in store
    const foundClient = clients.find(
      (c: any) => String(c._id) === clientIdString || String(c.id) === clientIdString
    );

      if (foundClient) {
        // Format address from nested structure
      const formatAddress = (address: any): string => {
        if (!address) return "";
        if (typeof address === "string") return address;
        if (typeof address === "object" && address.street) {
          const parts = [
            address.street,
            address.city,
            address.state,
            address.postalCode,
            address.country,
          ].filter(Boolean);
          return parts.join(", ");
        }
        return "";
      };

        const hasValue = (val: any) => val && val !== null && val !== undefined && val.toString().trim() !== "";
        setClientDetails((prev: any) => {
          const updated = {
            name: hasValue(prev?.name) ? prev.name : (foundClient.businessName || ""),
            gstin: hasValue(prev?.gstin) ? prev.gstin : (foundClient.gstin || ""),
            address: hasValue(prev?.address) ? prev.address : (formatAddress(foundClient.address) || ""),
            contact: hasValue(prev?.contact) ? prev.contact : (foundClient.phone || ""),
            email: hasValue(prev?.email) ? prev.email : (foundClient.email || ""),
            state: hasValue(prev?.state) ? prev.state : (foundClient.address?.state || ""),
          };
          //console.log("📝 Updating clientDetails:", { prev, foundClient, updated });
          return updated;
        });
    }
  }, [clientId, clients.length]); // Only depend on clientId and clients array length

  // Update form state when initialValues change (for edit mode)
useEffect(() => {
  if (mode === "edit" && initialValues) {
    setInvoiceTitle(initialValues.performaInvoiceTitle);
    setDate(initialValues.date);
    setDueDate(initialValues.dueDate);
    setClientId(initialValues.clientId);
    setClientDetails(initialValues.clientDetails);
    setBusinessDetails(initialValues.businessDetails);
    setTaxConfiguration(
      initialValues.taxType === "IGST" ? "IGST" : "SGST_CGST"
    );
    setItems(initialValues.items);
    setDiscountType(initialValues.discountType);
    setDiscountValue(initialValues.discountValue);
    setShipping(initialValues.shipping);
    setRoundOff(initialValues.roundOff);
    setShowHSN(initialValues.showHSN);
    setShowUnit(initialValues.showUnit);
    setTerms(initialValues.terms || "dueOnReceipt");
    setNotes(initialValues.notes);
    setAttachments(initialValues.attachments || []);
    setShowSignature(initialValues.showSignature || false);


    setSignature(initialValues.signature || "");

    setCessList(initialValues.cessList || []);
    setPhases(initialValues.phases || []);
  }
}, [initialValues, mode]);
const [showScanner, setShowScanner] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddItemBulkModal, setShowAddItemBulkModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router =  useRouter()

  const handleItemChange = (idx: number, field: string, value: any) => {
    //console.log(
      `handleItemChange called: idx=${idx}, field=${field}, value=${value}`
    );
    setItems((prev: any) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      //console.log(`Item after update:`, updated[idx]);
      // Recalculate amount
      const item = updated[idx];
      const baseAmount = (Number(item.qty) || 0) * (Number(item.rate) || 0);

      // Calculate discount based on type
      let discountAmount = 0;
      const discountType = item.discountType || "flat";
      //console.log(
        `Discount calculation: discountType=${discountType}, discount=${item.discount}`
      );
      if (discountType === "flat") {
        discountAmount = Number(item.discount) || 0;
      } else if (discountType === "percentage") {
        discountAmount = (baseAmount * (Number(item.discount) || 0)) / 100;
      }

      let amount = baseAmount - discountAmount;

      // Add tax if present (only for exclusive tax)
      if (taxType === "exclusive") {
        if (taxConfiguration === "IGST")
          amount += (amount * (Number(item.igst) || 0)) / 100;
        if (taxConfiguration === "SGST_CGST")
          amount +=
            (amount * ((Number(item.sgst) || 0) + (Number(item.cgst) || 0))) /
            100;
      }
      updated[idx].amount = amount;
      return updated;
    });
  };


  let token = null

if (typeof window !== "undefined") {
  token = localStorage.getItem("token")
}
  
  const handleQrScan = async (decodedText: string) => {
    try {
      // Parse QR data
      const parsed = JSON.parse(decodedText);
      const itemId = parsed.itemId;
  
      //console.log("Item id (scanner) ::----->>>>>>>", itemId);
  
      const companyId = localStorage.getItem("currentCompanyId");
    //console.log(companyId)
      const res = await axiosInstance.get( `/api/v1/finance/inventory/item/itemDetails/${companyId}/${itemId}`,{
        headers:{
          "Authorization":`Bearer ${token}`
        },
        withCredentials:true
      })
  
      //console.log("res,res,res===>",res)
      const product = res?.data?.result || res?.data;
  
      //console.log("Scanned product:", product);
  
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
      //console.log(err);
      toast.error("Invalid QR Code");
    }
  
    setShowScanner(false);
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

  const handleAddClient = () => setShowAddClient(true);

  const handleClientSelect = (value: string) => {
    setClientId(value);
    if (value === "new") return;
    const found = clients.find(
      (c: any) => String(c._id) === value || String(c.id) === value
    );
    if (found) {
      // Format address from nested structure
      const formatAddress = (address: any): string => {
        if (!address) return "";
        if (typeof address === "string") return address;
        if (typeof address === "object" && address.street) {
          const parts = [
            address.street,
            address.city,
            address.state,
            address.postalCode,
            address.country,
          ].filter(Boolean);
          return parts.join(", ");
        }
        return "";
      };

      setClientDetails({
        name: found.businessName || "",
        gstin: found.gstin || "",
        address: formatAddress(found.address),
        contact: found.phone || "",
        email: found.email || "",
        state: found.address?.state || "",
      });
    }
  };

  // Summary calculations
  const subtotal = items.reduce(
    (sum: number, item: any) => sum + Number(item.qty) * Number(item.rate),
    0
  );
  let discount = 0;
  if (discountType === "flat") discount = discountValue;
  else if (discountType === "percent" || discountType === "percentage")
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
  let total = taxable + tax + Number(shipping || 0);
  if (roundOff) total = Math.round(total);

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handlePrintDownload = () => {
    // Check if we're in edit mode and have an ID
    const performaInvoiceId = (initialValues as any)?._id;
    if (mode === "edit" && performaInvoiceId) {
      // Navigate to preview page
      window.open(
        `/finance/performa-invoices/preview/${performaInvoiceId}`,
        "_blank"
      );
    } else {
      alert(
        "Please save the performa invoice first before printing or downloading."
      );
    }
  };

  const handleCancel = () => {
    router.push("/finance/performa-invoices")
  };

  const handleFormSubmit = () => {
    //console.log("handleFormSubmit called");

    // Validation with comprehensive error messages
    const newErrors: { [key: string]: string } = {};

    if (!invoiceTitle.trim())
      newErrors.invoiceTitle = "Proforma Invoice title is required";
    if (!invoiceNumber.trim())
      newErrors.invoiceNumber = "Invoice number is required";
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

    //console.log("Validation errors:", newErrors);
    if (Object.keys(newErrors).length > 0) {
      //console.log("Validation failed, not proceeding");
      return;
    }

    const formData: PerformaInvoiceFormValues = {
      type,
      // Include both field names for compatibility
      invoiceTitle,
      performaInvoiceTitle: invoiceTitle,
      invoiceNumber,
      performaInvoiceNumber: invoiceNumber,
      date,
      dueDate,
      clientId,
      clientDetails,
      businessDetails,
      taxType,
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
      phases,
    };

    //console.log("✅ Form validation passed!");
    //console.log("Form data prepared:", formData);
    //console.log("Items count:", items.length);
    //console.log("Business Details:", businessDetails);
    //console.log("Calling onSubmit with form data");

    onSubmit(formData);

    if (onSuccess) onSuccess();
  };

      //console.log("📤 Sending Signature:", signature);
//console.log("📤 Signature Length:", signature?.length);
//console.log("📤 Show Signature:", showSignature);
 const {id} = useParams()
 
const submitEmail =()=>{
    router.push(`/finance/performa-invoices/email/${id}`)
}

const handleCloseScanner=()=>{
  setShowScanner(false)
}

  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <PerformaInvoiceHeaderBar
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
        setTaxConfiguration={setTaxConfiguration}
        setCessList={setCessList as any}
        mockProducts={products}
        setShowScanner={setShowScanner}
      />
      {showScanner && (
        <div className="p-4 bg-white rounded shadow mt-5 ">
          <QrScanner onClose={handleCloseScanner}  onScan={handleQrScan} />
        </div>
      )}
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
        signature={signature}
        setSignature={setSignature}
        setShowSignature={setShowSignature}
      />

      <ActionBar
        mode={mode}
        onSubmit={handleFormSubmit}
        onSendEmail={submitEmail}
        loading={loading}
        onPrintDownload={handlePrintDownload}
        onCancel={handleCancel}
        disabled={
          mode === "edit" &&
          (initialValues?.status === "sent" ||
            initialValues?.status === "rejected" ||
            initialValues?.status === "accepted")
        }
      />
      <AddClientModal
        open={showAddClient}
        onClose={() => setShowAddClient(false)}
        onSubmit={(form) => {
          // Update local state with the new client details
          setClientDetails({
            name: form.businessName,
            gstin: form.gstin || "",
            address: form.street || "",
            contact: form.phone || form.alias || form.businessName,
            email: form.email,
          });
          setClientId("temp-" + Date.now()); // Temporary ID until client is created
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

export default PerformaInvoiceForm;
