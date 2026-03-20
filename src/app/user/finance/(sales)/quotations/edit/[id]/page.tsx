"use client";

import React, { useState, useEffect } from "react";
import QuotationForm, {
  QuotationFormValues,
} from "@/finance/quotation/QuotationForm";
import { useQuotationStore } from "@/financeStore/useQuotationStore";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/financeStore/useClientStore";
import { useItemStore } from "@/financeStore/useItemStore";
import { useBussinessStore } from "@/financeStore/useBussinessStore";

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const { clients } = useClientStore();
  const { quotations, updateQuotation, fetchQuotationById } =
    useQuotationStore();
  const { items } = useItemStore();
  const [loading, setLoading] = useState(true);
  const [quotation, setQuotation] = useState<any>(null);
  const { details: businessStoreDetails } = useBussinessStore();

  // Get quotation number from URL (id param)
  const quotationNumber = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const loadQuotation = async () => {
      try {
        // First try to find in store
        let foundQuotation = quotations.find(
          (q: any) => q.quotationNumber === quotationNumber
        );

        // If not found in store, fetch from API using the quotation number as ID
        if (!foundQuotation) {
          console.log("Quotation not found in store, fetching from API...");
          const result = await fetchQuotationById(quotationNumber);
          if (result) foundQuotation = result;
        }

        console.log("Loaded quotation:", foundQuotation);
        setQuotation(foundQuotation);
      } catch (error) {
        console.error("Error loading quotation:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuotation();
  }, [quotationNumber, quotations, fetchQuotationById]);

  if (loading) {
    return <div className="p-8 text-center">Loading quotation...</div>;
  }

  if (!quotation) {
    return <div className="p-8 text-center">Quotation not found</div>;
  }

  // Map business details from store if not present in quotation
  const mappedBusinessDetails = businessStoreDetails
    ? {
        name: businessStoreDetails.businessName,
        gstin: businessStoreDetails.gstNumber || "",
        address: businessStoreDetails.website || "",
        contact: businessStoreDetails.phone,
        email: "",
      }
    : {
        name: "",
        gstin: "",
        address: "",
        contact: "",
        email: "",
      };

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

  // Safely parse client details
  const parseClientDetails = () => {
    // If clientDetails exists and is an object, use it
    if (
      quotation.clientDetails &&
      typeof quotation.clientDetails === "object"
    ) {
      return {
        name: quotation.clientDetails.name || "",
        gstin: quotation.clientDetails.gstin || "",
        address: quotation.clientDetails.address || "",
        contact: quotation.clientDetails.contact || "",
        email: quotation.clientDetails.email || "",
      };
    }

    // If it's a string (JSON), parse it
    if (typeof quotation.clientDetails === "string") {
      try {
        const parsed = JSON.parse(quotation.clientDetails);
        return {
          name: parsed.name || "",
          gstin: parsed.gstin || "",
          address: parsed.address || "",
          contact: parsed.contact || "",
          email: parsed.email || "",
        };
      } catch (e) {
        console.error("Error parsing client details:", e);
      }
    }

    // Default empty client details
    return {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    };
  };

  // Safely parse business details
  const parseBusinessDetails = () => {
    // If businessDetails exists and is an object, use it
    if (
      quotation.businessDetails &&
      typeof quotation.businessDetails === "object"
    ) {
      return quotation.businessDetails;
    }

    // If it's a string (JSON), parse it
    if (typeof quotation.businessDetails === "string") {
      try {
        return JSON.parse(quotation.businessDetails);
      } catch (e) {
        console.error("Error parsing business details:", e);
      }
    }

    // Fallback to mapped business details from store
    return mappedBusinessDetails;
  };

  // Safely parse attachments
  const parseAttachments = () => {
    // If attachments exists and is an array, use it
    if (Array.isArray(quotation.attachments)) {
      return quotation.attachments;
    }

    // If it's a string (JSON), parse it
    if (typeof quotation.attachments === "string") {
      try {
        const parsed = JSON.parse(quotation.attachments);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Error parsing attachments:", e);
      }
    }

    // Default empty array
    return [];
  };

  // Map quotation data to form values with all required fields
  const initialValues: QuotationFormValues = {
    ...quotation,
    businessDetails: parseBusinessDetails(),
    clientDetails: parseClientDetails(),
    taxConfiguration: determineTaxConfiguration(),
    cessList: quotation.cessList || [],
    discountType: quotation.discountType || "flat",
    discountValue: quotation.discountValue || 0,
    shipping: quotation.shipping || 0,
    roundOff: quotation.roundOff !== undefined ? quotation.roundOff : false,
    showHSN: quotation.showHSN !== undefined ? quotation.showHSN : false,
    showUnit: quotation.showUnit !== undefined ? quotation.showUnit : false,
    terms: quotation.terms || "",
    notes: quotation.notes || "",
    attachments: parseAttachments(),
    showSignature:
      quotation.showSignature !== undefined ? quotation.showSignature : false,
    phases: quotation.phases || [],
  };

  // DETAILED DEBUGGING
  console.log("🔍 RAW QUOTATION DATA:", quotation);
  console.log("🔍 RAW clientDetails type:", typeof quotation.clientDetails);
  console.log("🔍 RAW clientDetails value:", quotation.clientDetails);
  console.log("🔍 RAW attachments type:", typeof quotation.attachments);
  console.log("🔍 RAW attachments value:", quotation.attachments);
  console.log("🔍 RAW showSignature type:", typeof quotation.showSignature);
  console.log("🔍 RAW showSignature value:", quotation.showSignature);

  console.log("\n📝 PARSED Initial Values:", initialValues);
  console.log("📎 PARSED Attachments:", initialValues.attachments);
  console.log("✍️ PARSED Signature:", initialValues.showSignature);
  console.log("👤 PARSED Client Details:", initialValues.clientDetails);
  console.log("🏢 PARSED Business Details:", initialValues.businessDetails);

  const handleUpdate = async (values: QuotationFormValues) => {
    setLoading(true);
    try {
      await updateQuotation(values.quotationNumber, values as any);
      router.push("/dashboard/quotations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <QuotationForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      mockClients={clients}
      mockProducts={items}
      loading={loading}
    />
  );
}
