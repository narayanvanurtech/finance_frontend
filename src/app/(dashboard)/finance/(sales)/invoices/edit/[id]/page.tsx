"use client";

import React, { useState, useEffect } from "react";
import InvoiceForm, {
  InvoiceFormValues,
} from "@/components/finance/invoice/InvoiceForm";
import { useInvoiceStore } from "@/stores/financeStore/useInvoiceStore";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useItemStore } from "@/stores/financeStore/useItemStore";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { toast } from "sonner";

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { clients } = useClientStore();
  const { items } = useItemStore();
  const { fetchInvoiceById, updateInvoice } = useInvoiceStore();
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<
    InvoiceFormValues | undefined
  >(undefined);
  const { details: businessStoreDetails } = useBussinessStore();

  // Get invoice ID from URL (id param)
  const invoiceId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        if (invoiceId) {
          const invoice = await fetchInvoiceById(invoiceId);
          if (invoice) {
            // Map business store details if available
            let businessDetails = invoice.businessDetails || {
              name: "",
              gstin: "",
              address: "",
              contact: "",
              email: "",
            };

            if (businessStoreDetails) {
              businessDetails = {
                name: businessStoreDetails.businessName || "",
                gstin: businessStoreDetails.gstNumber || "",
                address:
                  (businessStoreDetails as any).address ||
                  (businessStoreDetails as any).website ||
                  "",
                contact: businessStoreDetails.phone || "",
                email: (businessStoreDetails as any).email || "",
              };
            }

            // Determine taxConfiguration from items (IGST vs SGST_CGST)
            const determineTaxConfiguration = (): "IGST" | "SGST_CGST" => {
              if (invoice.items && invoice.items.length > 0) {
                const firstItem = invoice.items[0];
                if (firstItem.taxType === "igst" || firstItem.igstAmount) {
                  return "IGST";
                }
              }
              return "SGST_CGST";
            };

            const formValues: InvoiceFormValues = {
              type: (invoice as any).type || "invoice",
              invoiceTitle: invoice.invoiceTitle || "",
              invoiceNumber: invoice.invoiceNumber || "",
              date: invoice.date
                ? new Date(invoice.date).toISOString().split("T")[0]
                : "",
              dueDate: invoice.dueDate
                ? new Date(invoice.dueDate).toISOString().split("T")[0]
                : "",
              clientId:
                typeof invoice.clientId === "string"
                  ? invoice.clientId
                  : (invoice.clientId as any)?._id || "",
              clientDetails: invoice.clientDetails || {
                name: "",
                gstin: "",
                address: "",
                contact: "",
                email: "",
              },
              businessDetails,
              taxType: (invoice.taxType || "exclusive") as
                | "inclusive"
                | "exclusive",
              taxConfiguration: determineTaxConfiguration(),
              items: invoice.items || [],
              discountType: invoice.discountType || "flat",
              discountValue: invoice.discountValue || 0,
              shipping: invoice.shipping || 0,
              roundOff: invoice.roundOff || false,
              showHSN: invoice.showHSN || false,
              showUnit: invoice.showUnit || false,
              terms: invoice.terms || "",
              notes: invoice.notes || "",
              attachments: invoice.attachments as any,
              showSignature: invoice.showSignature || false,
              phases: invoice.phases || [],
              status: (invoice as any).status || "draft",
              cessList: (invoice as any).cessList || [],
              _id: (invoice as any)._id,
            };

            setInitialValues(formValues);
          }
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
        toast.error("Failed to load invoice");
        router.push("/finance/invoices");
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId, fetchInvoiceById, businessStoreDetails, router]);

  if (loading) {
    return <div className="p-8 text-center">Loading invoice...</div>;
  }

  if (!initialValues) {
    return <div className="p-8 text-center">Invoice not found</div>;
  }

  const handleUpdate = async (values: InvoiceFormValues) => {
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

      // ✅ Sanitize items
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

      // ✅ Sanitize phases
      const sanitizedPhases =
        values.phases?.map((phase) => ({
          ...phase,
          title: phase.title || "",
          percentage: Number(phase.percentage) || 0,
          dueDate: phase.dueDate || "",
        })) || [];

      // ✅ Sanitize attachments
      const sanitizedAttachments = Array.isArray(values.attachments)
        ? values.attachments.filter((att) => att && Object.keys(att).length > 0)
        : [];

      // ✅ Sanitize emails
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

      // ✅ Create final payload
      const sanitizedValues: InvoiceFormValues = {
        ...values,
        type: values.type || "invoice",
        invoiceTitle: values.invoiceTitle.trim(),
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
        showSignature: values.showSignature || false,
      };

      console.log("✅ Invoice validation passed!");
      console.log("Sanitized values:", sanitizedValues);

      // Use the invoice's backend ID (_id)
      const invoiceIdentifier = (initialValues as any)._id;
      if (!invoiceIdentifier) {
        throw new Error("Invoice ID not found");
      }
      await updateInvoice(invoiceIdentifier, sanitizedValues);
      toast.success("Invoice updated successfully!");
      router.push("/finance/invoices");
    } catch (error: any) {
      console.error("Error updating invoice:", error);
      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Error updating invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <InvoiceForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      mockClients={clients}
      mockProducts={items}
      loading={loading}
    />
  );
}
