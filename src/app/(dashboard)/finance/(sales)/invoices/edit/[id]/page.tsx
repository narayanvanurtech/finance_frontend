"use client";

import React, { useState, useEffect } from "react";
import InvoiceForm, {
  InvoiceFormValues,
} from "@/components/finance/invoice/InvoiceForm";
import { useInvoiceStore } from "@/stores/financeStore/useInvoiceStore";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { toast } from "sonner";
import { useItems } from "@/hooks/useItemQueries";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { clients, fetchClients } = useClientStore();
  const { user } = useAuthStore();
  const { data: itemsData } = useItems(user?.companyId || "");
  const items = itemsData?.result?.items || [];
  const { fetchInvoiceById, updateInvoice } = useInvoiceStore();
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<
    InvoiceFormValues | undefined
  >(undefined);
  const { details: businessStoreDetails } = useBussinessStore();

  // Get invoice ID from URL (id param)
  const invoiceId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Fetch clients when component mounts (only once)
  useEffect(() => {
    if (user?.companyId) {
      fetchClients(user.companyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.companyId]);

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

            // Extract client details from clientId object if clientDetails missing
            const extractClientDetailsFromClientId = () => {
              if (invoice.clientDetails) {
                // Extract state from clientDetails.address if it's an object
                const clientState = 
                  (invoice.clientDetails as any).state ||
                  (typeof invoice.clientDetails.address === "object" && invoice.clientDetails.address !== null
                    ? (invoice.clientDetails.address as any)?.state
                    : "") || "";

                return {
                  name: invoice.clientDetails.name || "",
                  gstin: invoice.clientDetails.gstin || "",
                  address:
                    typeof invoice.clientDetails.address === "string"
                      ? invoice.clientDetails.address
                      : (invoice.clientDetails.address as any)?.street ||
                        (invoice.clientDetails.address as any)?.address ||
                        "",
                  contact: invoice.clientDetails.contact || "",
                  email: invoice.clientDetails.email || "",
                  state: clientState,
                };
              }

              // If clientDetails missing, extract from clientId object
              if (invoice.clientId && typeof invoice.clientId === "object") {
                const clientIdObj = invoice.clientId as any;
                const clientAddress = clientIdObj.address || {};
                
                // Extract state from clientId.address
                const clientState = 
                  clientAddress.state || 
                  clientIdObj.state || 
                  "";

                // Build address string from address object
                const addressParts = [];
                if (clientAddress.street) addressParts.push(clientAddress.street);
                if (clientAddress.city) addressParts.push(clientAddress.city);
                if (clientAddress.state) addressParts.push(clientAddress.state);
                if (clientAddress.postalCode) addressParts.push(clientAddress.postalCode);
                if (clientAddress.country) addressParts.push(clientAddress.country);
                const addressString = addressParts.join(", ");

                // Try to find client in client store for more details
                const clientInStore = clients.find(
                  (c: any) => 
                    c._id === clientIdObj._id || 
                    c._id === clientIdObj.id ||
                    String(c._id) === String(clientIdObj._id) ||
                    String(c._id) === String(clientIdObj.id)
                );

                // Get state from client store if available
                const storeState = clientInStore 
                  ? ((clientInStore.address as any)?.state || (clientInStore as any).state || "")
                  : "";

                // Extract company name from multiple possible sources
                const companyName = 
                  clientInStore?.businessName || 
                  (clientInStore as any)?.companyName ||
                  (clientInStore as any)?.name ||
                  clientIdObj.businessName || 
                  clientIdObj.companyName ||
                  clientIdObj.name ||
                  "";

                console.log("🔍 Client Details Extraction:", {
                  clientIdObj: {
                    _id: clientIdObj._id,
                    id: clientIdObj.id,
                    businessName: clientIdObj.businessName,
                    companyName: clientIdObj.companyName,
                    name: clientIdObj.name,
                    allKeys: Object.keys(clientIdObj),
                  },
                  clientInStore: clientInStore ? {
                    _id: clientInStore._id,
                    businessName: clientInStore.businessName,
                    companyName: (clientInStore as any).companyName,
                    name: (clientInStore as any).name,
                  } : null,
                  clientsLength: clients.length,
                  extractedCompanyName: companyName,
                });

                return {
                  name: companyName,
                  gstin: clientInStore?.gstin || clientIdObj.gstin || "",
                  address: clientInStore?.address 
                    ? (typeof clientInStore.address === "string" 
                        ? clientInStore.address 
                        : clientInStore.address?.street || "")
                    : addressString,
                  contact: clientInStore?.phone || clientIdObj.phone || "",
                  email: clientInStore?.email || clientIdObj.email || "",
                  state: storeState || clientState,
                };
              }

              return {
                name: "",
                gstin: "",
                address: "",
                contact: "",
                email: "",
                state: "",
              };
            };

            // Map items - Backend sends quantity, taxType, taxRate, and amount fields
            const mappedItems = (invoice.items || []).map((item: any) => {
              // Get taxRate from backend
              const taxRate = Number(item.taxRate) || 0;
              const taxType = item.taxType || "cgst_sgst";
              
              // Calculate igst/sgst/cgst from taxAmount fields or taxRate
              let igst = 0;
              let sgst = 0;
              let cgst = 0;
              
              if (taxType === "igst") {
                igst = Number(item.igstAmount) || taxRate;
              } else {
                // Split between SGST and CGST
                sgst = Number(item.sgstAmount) || taxRate / 2;
                cgst = Number(item.cgstAmount) || taxRate / 2;
              }
              
              return {
                ...item,
                // Backend sends 'quantity', form needs 'qty'
                qty: item.quantity || item.qty || 1,
                quantity: item.quantity || item.qty || 1,
                name: item.name || "",
                description: item.description || "",
                rate: Number(item.rate) || 0,
                discount: Number(item.discount) || 0,
                amount: Number(item.amount) || 0,
                hsn: item.hsn || "",
                unit: item.unit || "pcs",
                // Map tax fields
                igst: igst,
                sgst: sgst,
                cgst: cgst,
                taxRate: taxRate,
                taxType: taxType,
              };
            });

            // Map client details - extract from clientId object if clientDetails missing
            const mappedClientDetails = extractClientDetailsFromClientId();

           

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
                  : (invoice.clientId as any)?._id || (invoice.clientId as any)?.id || "",
              clientDetails: mappedClientDetails,
              businessDetails,
              taxType: (invoice.taxType || "exclusive") as
                | "inclusive"
                | "exclusive",
              taxConfiguration: determineTaxConfiguration(),
              items: mappedItems,
              discountType: invoice.discountType || "flat",
              discountValue: invoice.discountValue || 0,
              shipping: invoice.shipping || 0,
              roundOff: invoice.roundOff || false,
              showHSN: invoice.showHSN || false,
              showUnit: invoice.showUnit || false,
              // Handle terms - preserve actual value from backend (even if empty string)
              terms: (() => {
                // Check invoice.terms first, then alternative fields
                const termsValue = invoice.terms !== undefined 
                  ? invoice.terms 
                  : (invoice as any).paymentTerms !== undefined
                  ? (invoice as any).paymentTerms
                  : "";
                // Convert to string and preserve empty strings
                return termsValue !== undefined && termsValue !== null ? String(termsValue) : "";
              })(),
              // Handle notes - preserve actual value from backend (even if empty string)
              notes: (() => {
                // Check invoice.notes first, then alternative fields
                const notesValue = invoice.notes !== undefined
                  ? invoice.notes
                  : (invoice as any).note !== undefined
                  ? (invoice as any).note
                  : "";
                // Convert to string and preserve empty strings
                return notesValue !== undefined && notesValue !== null ? String(notesValue) : "";
              })(),
              attachments: invoice.attachments as any,
              showSignature: invoice.showSignature || false,
              signature:invoice.signature || "",
              // Handle phases - check all possible locations and formats
              phases: (() => {
                // Check multiple possible field names
                const phasesData = invoice.phases ?? (invoice as any).paymentPhases ?? (invoice as any).phasesData ?? null;
                if (phasesData && Array.isArray(phasesData) && phasesData.length > 0) {
                  return phasesData.map((phase: any) => ({
                    title: phase.title || phase.name || "",
                    percentage: Number(phase.percentage || phase.percent || 0),
                    dueDate: phase.dueDate || phase.date || "",
                  }));
                }
                // Even if empty array, return empty array
                return Array.isArray(phasesData) ? phasesData : [];
              })(),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // ✅ Create final payload - explicitly include all fields
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
        // ✅ Explicitly include terms and notes (even if empty strings)
        terms: values.terms !== undefined && values.terms !== null ? String(values.terms) : "",
        notes: values.notes !== undefined && values.notes !== null ? String(values.notes) : "",
        showSignature: values.showSignature || false,
        signature: values.signature || "",
      };


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
