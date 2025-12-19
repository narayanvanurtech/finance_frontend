"use client";

// Copy and adapt from quotation create page
import React, { useState, useEffect } from "react";
import InvoiceForm, {
  InvoiceFormValues,
} from "@/components/finance/invoice/InvoiceForm";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useItems } from "@/hooks/useItemQueries";
import { useRouter } from "next/navigation";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { toast } from "sonner";
import { useInvoiceStore } from "@/stores/financeStore/useInvoiceStore";

const generateInvoiceNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `INV-${datePart}-${randomPart}`;
};

export default function CreateInvoicePage() {
  const router = useRouter();
  const { clients } = useClientStore();
  const { data: itemsData } = useItems("");
  const items = itemsData?.result?.items || [];
  const [loading, setLoading] = useState(false);
  const createInvoice = useInvoiceStore((state) => state.createInvoice);
  const { details } = useBussinessStore();
  const businessStoreDetails = details;

  // State for initial items (for bulk invoice)
  const [initialItems, setInitialItems] = useState<InvoiceFormValues["items"]>([
    {
      name: "",
      description: "",
      qty: 1,
      rate: 0,
      discount: 0,
      igst: 0,
      sgst: 0,
      cgst: 0,
      amount: 0,
      hsn: "",
      unit: "pcs",
    },
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const bulkItems = localStorage.getItem("bulkInvoiceItems");
      if (bulkItems) {
        try {
          const parsed = JSON.parse(bulkItems);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setInitialItems(
              parsed.map((item: any) => ({
                name: item.name || "",
                description: item.description || "",
                qty: 1,
                rate: item.sellingPrice || 0,
                discount: 0,
                igst: 0,
                sgst: 0,
                cgst: 0,
                amount: 0,
                hsn: item.hsn || "",
                unit: item.unit || "pcs",
              }))
            );
          }
        } catch (e) {
          // ignore
        }
        localStorage.removeItem("bulkInvoiceItems");
      }
    }
  }, []);

  // if (!businessStoreDetails) {
  //   return <div>Loading business details...</div>;
  // }

  const mappedBusinessDetails = {
    name: businessStoreDetails?.businessName || "",
    gstin: businessStoreDetails?.gstNumber || "",
    address: businessStoreDetails?.website || "",
    contact: businessStoreDetails?.phone || "",
    email: "",
  };

  const defaultInitialValues: InvoiceFormValues = {
    type: "invoice",
    invoiceTitle: "",
    invoiceNumber: generateInvoiceNumber(),
    date: new Date().toISOString().slice(0, 10),
    dueDate: "",
    clientId: "",
    clientDetails: {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    },
    businessDetails: mappedBusinessDetails,
    taxType: "exclusive",
    taxConfiguration: "SGST_CGST",
    cessList: [],
    items: initialItems,
    discountType: "flat",
    discountValue: 0,
    shipping: 0,
    roundOff: false,
    showHSN: false,
    showUnit: false,
    terms: "",
    notes: "",
    attachments: [],
    showSignature: false,
    phases: [],
  };

  console.log(defaultInitialValues);

  const handleCreate = async (values: InvoiceFormValues) => {
    setLoading(true);
    try {
      // ✅ Validate clientId is provided
      if (!values.clientId || values.clientId.trim() === "") {
        toast.error("Please select a client");
        setLoading(false);
        return;
      }

      // ✅ Validate items exist
      if (!values.items || values.items.length === 0) {
        toast.error("Please add at least one item");
        setLoading(false);
        return;
      }

      // ✅ Validate that at least one item has a name
      if (values.items.every((item: any) => !item.name || !item.name.trim())) {
        toast.error("Please add at least one item with a name");
        setLoading(false);
        return;
      }

      // ✅ Validate dates
      if (!values.date) {
        toast.error("Invoice date is required");
        setLoading(false);
        return;
      }

      if (!values.dueDate) {
        toast.error("Due date is required");
        setLoading(false);
        return;
      }

      if (new Date(values.dueDate) < new Date(values.date)) {
        toast.error("Due date cannot be earlier than invoice date");
        setLoading(false);
        return;
      }

      // ✅ Validate invoice title
      if (!values.invoiceTitle || !values.invoiceTitle.trim()) {
        toast.error("Invoice title is required");
        setLoading(false);
        return;
      }

      // ✅ Validate phases if any exist
      if (values.phases && values.phases.length > 0) {
        const totalPercentage = values.phases.reduce(
          (sum, phase) => sum + (Number(phase.percentage) || 0),
          0
        );
        if (totalPercentage !== 100) {
          toast.error(
            `Total percentage of phases must equal 100%. Current total: ${totalPercentage}%`
          );
          setLoading(false);
          return;
        }

        // Check for empty phase titles
        const hasEmptyTitles = values.phases.some(
          (phase) => !phase.title || !phase.title.trim()
        );
        if (hasEmptyTitles) {
          toast.error("All phases must have a title");
          setLoading(false);
          return;
        }
      }

      // ✅ Sanitize items - convert string numbers to actual numbers
      const sanitizedItems = values.items.map((item: any) => ({
        ...item,
        name: item.name || "",
        description: item.description || "",
        qty: Number(item.qty) || 0,
        quantity: Number(item.quantity) || Number(item.qty) || 0,
        rate: Number(item.rate) || 0,
        discount: Number(item.discount) || 0,
        igst: Number(item.igst) || 0,
        sgst: Number(item.sgst) || 0,
        cgst: Number(item.cgst) || 0,
        amount: Number(item.amount) || 0,
        hsn: item.hsn || "",
        unit: item.unit || "pcs",
        taxRate: Number(item.taxRate) || 0,
      }));

      // ✅ Sanitize phases - convert percentage strings to numbers
      const sanitizedPhases =
        values.phases?.map((phase) => ({
          ...phase,
          title: phase.title || "",
          percentage: Number(phase.percentage) || 0,
          dueDate: phase.dueDate || "",
        })) || [];

      // ✅ Sanitize attachments - remove empty ones
      const sanitizedAttachments = Array.isArray(values.attachments)
        ? values.attachments.filter((att) => att && Object.keys(att).length > 0)
        : [];

      // ✅ Sanitize emails - ensure they are strings (not undefined)
      const sanitizedBusinessDetails = {
        name: values.businessDetails?.name || "",
        gstin: values.businessDetails?.gstin || "",
        address: values.businessDetails?.address || "",
        contact: values.businessDetails?.contact || "",
        email:
          values.businessDetails?.email &&
          values.businessDetails.email.trim() !== ""
            ? values.businessDetails.email
            : "",
      };

      const sanitizedClientDetails = {
        name: values.clientDetails?.name || "",
        gstin: values.clientDetails?.gstin || "",
        address: values.clientDetails?.address || "",
        contact: values.clientDetails?.contact || "",
        email:
          values.clientDetails?.email &&
          values.clientDetails.email.trim() !== ""
            ? values.clientDetails.email
            : "",
      };

      // ✅ Sanitize cessList
      const sanitizedCessList =
        values.cessList?.map((cess: any) => ({
          name: cess.name || "",
          value: Number(cess.value) || 0,
          showInInvoice: cess.showInInvoice || false,
        })) || [];

      // ✅ Create final payload with all sanitized values
      const sanitizedValues: InvoiceFormValues = {
        ...values,
        type: values.type || "invoice",
        invoiceTitle: values.invoiceTitle.trim(),
        invoiceNumber: values.invoiceNumber,
        date: values.date,
        dueDate: values.dueDate,
        clientId: values.clientId,
        items: sanitizedItems,
        phases: sanitizedPhases,
        attachments: sanitizedAttachments,
        businessDetails: sanitizedBusinessDetails,
        clientDetails: sanitizedClientDetails,
        cessList: sanitizedCessList as any,
        discountType: values.discountType || "flat",
        discountValue: Number(values.discountValue) || 0,
        shipping: Number(values.shipping) || 0,
        roundOff: values.roundOff || false,
        showHSN: values.showHSN || false,
        showUnit: values.showUnit || false,
        terms: values.terms || "",
        notes: values.notes || "",
        showSignature: values.showSignature || false,
      };

      console.log("✅ Invoice validation passed!");
      console.log("Sanitized values:", sanitizedValues);

      // Call the store's createInvoice which makes the API call
      await createInvoice(sanitizedValues);
      toast.success("Invoice created successfully!");
      router.push("/finance/invoices");
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Error creating invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <InvoiceForm
      initialValues={defaultInitialValues}
      onSubmit={handleCreate}
      mode="create"
      mockClients={clients}
      mockProducts={items.map((item) => ({
        ...item,
        price: item.sellingPrice,
      }))}
      loading={loading}
    />
  );
}
