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
import { on } from "events";

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
            // Merge business store details if available
            let businessDetails = quotation.businessDetails || {
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
                address: businessStoreDetails.country || "",
                contact: businessStoreDetails.phone || "",
                email: "",
              };
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

            const formValues: QuotationFormValues = {
              quotationTitle: quotation.quotationTitle,
              quotationNumber: quotation.quotationNumber,
              date: quotation.date
                ? new Date(quotation.date).toISOString().split("T")[0]
                : "",
              dueDate: quotation.dueDate
                ? new Date(quotation.dueDate).toISOString().split("T")[0]
                : "",
              clientId:
                typeof quotation.clientId === "string"
                  ? quotation.clientId
                  : quotation.clientId?._id || "",
              clientDetails: quotation.clientDetails || {
                name: "",
                gstin: "",
                address: "",
                contact: "",
                email: "",
              },
              businessDetails,
              taxType: quotation.taxType,
              taxConfiguration: determineTaxConfiguration(),
              items: quotation.items,
              discountType: quotation.discountType,
              discountValue: quotation.discountValue,
              shipping: quotation.shipping,
              roundOff: quotation.roundOff,
              showHSN: quotation.showHSN,
              showUnit: quotation.showUnit,
              terms: quotation.terms || "",
              notes: quotation.notes || "",
              attachments: quotation.attachments as any,
              showSignature: quotation.showSignature,
              phases:
                quotation.phases?.map((phase) => ({
                  ...phase,
                  dueDate: phase.dueDate
                    ? new Date(phase.dueDate).toISOString().split("T")[0]
                    : "",
                })) || [],
              status: quotation.status,
              cessList: (quotation.cessList || []) as any,
              _id: quotation._id,
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
  }, [quotationId, fetchQuotationById, businessStoreDetails]);

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
      const quotationIdentifier = (initialValues as any)._id;
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
