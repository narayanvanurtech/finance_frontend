"use client";

import React, { useState, useEffect } from "react";
import QuotationForm, {
  QuotationFormValues,
} from "@/components/finance/quotation/QuotationForm";
import { useQuotationStore } from "@/stores/financeStore/useQuotationStore";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useItems } from "@/hooks/useItemQueries";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { BusinessDetails, ClientDetails } from "@/api/finance/quotationApi";

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const { clients } = useClientStore();
   const { user } = useAuthStore();
 const { data: itemsData } = useItems(user?.companyId || "");
   const items = itemsData?.result?.items || [];
  const { currentQuotation, fetchQuotationById } = useQuotationStore();
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<
    QuotationFormValues | undefined
  >(undefined);
  const { details: businessStoreDetails } = useBussinessStore();

  // Get quotation ID from URL (id param)
  const quotationId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const loadQuotation = async () => {
      try {
        setLoading(true);
        if (quotationId) {
          const quotation = await fetchQuotationById(quotationId);
          if (quotation) {
            // Helper function to format address
            const formatAddress = (address: any): string => {
              if (!address) return "";
              if (typeof address === "string") return address;
              if (typeof address === "object") {
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

            // Parse business details - use quotation data first, then fallback to store
            let businessDetails: BusinessDetails = {
              name: "",
              gstin: "",
              address: "",
              contact: "",
              email: "",
            };

            if (quotation.businessDetails) {
              businessDetails = {
                name: quotation.businessDetails.name || "",
                gstin: quotation.businessDetails.gstin || "",
                address:
                  typeof quotation.businessDetails.address === "string"
                    ? quotation.businessDetails.address
                    : formatAddress(quotation.businessDetails.address) ||
                      "",
                contact: quotation.businessDetails.contact || "",
                email: quotation.businessDetails.email || "",
              };
            }

            // Merge with business store details if available and quotation data is missing
            if (businessStoreDetails) {
              businessDetails = {
                name:
                  businessDetails.name ||
                  businessStoreDetails.businessName ||
                  "",
                gstin:
                  businessDetails.gstin ||
                  businessStoreDetails.gstNumber ||
                  "",
                address:
                  businessDetails.address ||
                  businessStoreDetails.website ||
                  "",
                contact:
                  businessDetails.contact ||
                  businessStoreDetails.phone ||
                  "",
                email: businessDetails.email || "",
              };
            }

            // Parse client details
            let clientDetails: ClientDetails = {
              name: "",
              gstin: "",
              address: "",
              contact: "",
              email: "",
            };

            // First try to get clientDetails from quotation
            if (quotation.clientDetails) {
              clientDetails = {
                name: quotation.clientDetails.name || "",
                gstin: quotation.clientDetails.gstin || "",
                igstn: quotation.clientDetails.igstn || "",
                state: quotation.clientDetails.state || "",
                address:
                  typeof quotation.clientDetails.address === "string"
                    ? quotation.clientDetails.address
                    : formatAddress(quotation.clientDetails.address) || "",
                contact: quotation.clientDetails.contact || "",
                email: quotation.clientDetails.email || "",
              };
            } else {
              // If clientDetails doesn't exist, try to get from clientId object or clients store
              const clientIdValue = typeof quotation.clientId === "string"
                ? quotation.clientId
                : quotation.clientId?._id || "";

              // Try to find client in the clients store
              if (clientIdValue && clients.length > 0) {
                const foundClient = clients.find((c) => String(c._id) === String(clientIdValue));
                if (foundClient) {
                  clientDetails = {
                    name: foundClient.businessName || "",
                    gstin: foundClient.gstin || "",
                    igstn: foundClient.gstin || "",
                    state: foundClient.address?.state || "",
                    address: formatAddress(foundClient.address) || "",
                    contact: foundClient.phone || "",
                    email: foundClient.email || "",
                  };
                }
              }

              // If still empty and clientId is an object, try to extract from it
              if (!clientDetails.name && typeof quotation.clientId === "object" && quotation.clientId) {
                const clientIdObj = quotation.clientId as any;
                clientDetails = {
                  name: clientIdObj.businessName || clientIdObj.name || "",
                  gstin: clientIdObj.gstin || "",
                  igstn: clientIdObj.gstin || clientIdObj.igstn || "",
                  state: clientIdObj.address?.state || clientIdObj.state || "",
                  address: formatAddress(clientIdObj.address) || "",
                  contact: clientIdObj.phone || "",
                  email: clientIdObj.email || "",
                };
              }
            }

            // Determine taxConfiguration from items (IGST vs SGST_CGST)
            const determineTaxConfiguration = (): "IGST" | "SGST_CGST" => {
              if (quotation.items && quotation.items.length > 0) {
                const firstItem = quotation.items[0];
                if (
                  firstItem.taxType === "igst" ||
                  (firstItem.igst && firstItem.igst > 0)
                ) {
                  return "IGST";
                }
              }
              return "SGST_CGST";
            };

            // Process items to ensure all tax fields are present
            const processedItems = quotation.items?.map((item) => {
              // Ensure tax fields are properly set
              let igst = item.igst || 0;
              let cgst = item.cgst || 0;
              let sgst = item.sgst || 0;
              const taxRate = item.taxRate || 0;

              // If taxRate exists but individual tax fields don't, calculate them
              if (taxRate > 0 && igst === 0 && cgst === 0 && sgst === 0) {
                if (item.taxType === "igst") {
                  igst = taxRate;
                } else {
                  // Split equally for CGST and SGST
                  cgst = taxRate / 2;
                  sgst = taxRate / 2;
                }
              }

              return {
                name: item.name || "",
                description: item.description || "",
                quantity: Number(item.quantity) || 0,
                unit: item.unit || "Hours",
                rate: Number(item.rate) || 0,
                discount: Number(item.discount) || 0,
                taxType: item.taxType || "cgst_sgst",
                taxRate: taxRate,
                amount: Number(item.amount) || 0,
                hsn: item.hsn || "",
                igst: igst,
                cgst: cgst,
                sgst: sgst,
                itemId: item.itemId,
              };
            }) || [];

            // Process cessList to match form format (ConfigureTaxCess format)
            const processedCessList = (quotation.cessList || []).map((cess) => ({
              name: cess.name || "",
              type: cess.name || "",
              value: String(cess.rate || 0),
              rate: cess.rate || 0,
              showInInvoice: cess.showInInvoice || false,
            }));

            // Process phases
            const processedPhases =
              quotation.phases?.map((phase) => ({
                name: phase.title || "",
                title: phase.title || "",
                percentage: Number(phase.percentage) || 0,
                dueDate: phase.dueDate
                  ? new Date(phase.dueDate).toISOString().split("T")[0]
                  : "",
              })) || [];

            const formValues: QuotationFormValues & { id?: string } = {
              quotationTitle: quotation.quotationTitle || "",
              quotationNumber: quotation.quotationNumber || "",
              date: quotation.date
                ? new Date(quotation.date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              dueDate: quotation.dueDate
                ? new Date(quotation.dueDate).toISOString().split("T")[0]
                : "",
              clientId:
                typeof quotation.clientId === "string"
                  ? quotation.clientId
                  : quotation.clientId?._id || "",
              clientDetails: clientDetails,
              businessDetails: businessDetails,
              taxType: quotation.taxType || "exclusive",
              taxConfiguration: determineTaxConfiguration(),
              items: processedItems,
              discountType: quotation.discountType || "flat",
              discountValue: Number(quotation.discountValue) || 0,
              shipping: Number(quotation.shipping) || 0,
              roundOff: quotation.roundOff || false,
              showHSN: quotation.showHSN || false,
              showUnit: quotation.showUnit || false,
              terms: quotation.terms || "",
              notes: quotation.notes || "",
              attachments: (quotation.attachments || []) as any,
              showSignature: quotation.showSignature || false,
              signature:quotation.signature ||"",
              phases: processedPhases,
              status: quotation.status,
              cessList: processedCessList,
              id: quotation.id || quotation._id,
            };

            setInitialValues(formValues);
          }
        }
      } catch (error) {
        console.error("Error loading quotation:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuotation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId]);

  if (loading) {
    return <div className="p-8 text-center">Loading quotation...</div>;
  }

  if (!initialValues) {
    return <div className="p-8 text-center">Quotation not found</div>;
  }
  const quotationNumber = initialValues?.quotationNumber;
  const handleUpdate = async (values: QuotationFormValues) => {
    setLoading(true);
    try {
      // Use the quotation's backend ID (_id)
      const quotationIdentifier = (initialValues as any).id;
      if (!quotationIdentifier) {
        throw new Error("Quotation ID not found");
      }

      // Convert cessList to proper API format
      const updatePayload: any = {
        quotationTitle: values.quotationTitle,
        date: values.date,
        dueDate: values.dueDate,
        clientId: values.clientId,
        clientDetails: values.clientDetails,
        businessDetails: values.businessDetails,
        taxType: values.taxType,
        items: values.items,
        discountType: values.discountType,
        discountValue: values.discountValue,
        shipping: values.shipping,
        roundOff: values.roundOff,
        showHSN: values.showHSN,
        showUnit: values.showUnit,
        terms: values.terms,
        notes: values.notes,
        signature:values.signature,
        showSignature: values.showSignature,
        phases: values.phases,
        cessList: values.cessList as any,
      };

      console.log("📤 Update payload:", updatePayload);

      const result = await useQuotationStore
        .getState()
        .updateQuotation(quotationIdentifier, updatePayload);

      console.log("✅ Update successful! Result:", result);

      // Wait a moment for the update to be processed
      setTimeout(() => {
        router.push("/finance/quotations");
      }, 500);
    } catch (error: any) {
      console.error("❌ Error updating quotation:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      alert(
        `Error updating quotation: ${
          error?.message || "Unknown error occurred"
        }`
      );
    } finally {
      setLoading(false);
    }
  };
  const onSendEmail = (quotationNumber: string) => {
    router.push(`/finance/quotations/email/${quotationNumber}`);
  };

  return (
    <QuotationForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      mockClients={clients}
      mockProducts={items}
      loading={loading}
      onSendEmail={() => onSendEmail(quotationId)}
    />
  );
}
