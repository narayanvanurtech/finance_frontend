"use client";

import React, { useEffect, useState } from "react";
import dynamicImport from "next/dynamic";
import { Button } from "@/components/ui/button";
import PremiumTemplate from "@/components/finance/PremiumTemplate";
import ClassicTemplate from "@/components/finance/ClassicTemplate";
import quotationApi from "@/api/finance/quotationApi";
import { useParams } from "next/navigation";

export const dynamic = "force-dynamic";

const PDFViewer = dynamicImport(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

const PDFDownloadLink = dynamicImport(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

export default function QuotationPreviewPage() {
  const { quotationId } = useParams();

  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");

  //console.log("Quotation 987654356789 :====>",quotation)

  useEffect(() => {
    const fetchQuotationById = async () => {
      try {
        const res = await quotationApi.getQuotationById(quotationId);

        //console.log("API RESPONSE:", res.data);

        // ✅ Adjust this if your API structure is different
        const quotationData = res.data;
          //console.log("quotation Data ..... ",quotationData)
        setQuotation(quotationData);
      } catch (error) {
        console.error("Error fetching quotation:", error);
      } finally {
        setLoading(false);
      }
    };

    if (quotationId) {
      fetchQuotationById();
    }
  }, [quotationId]);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading quotation preview...
      </div>
    );
  }

  // ✅ Not found state
  if (!quotation) {
    return (
      <div className="flex items-center justify-center h-screen">
        Quotation not found
      </div>
    );
  }

  // ✅ Map backend fields to template format
  const mappedQuotation = {
    title: quotation.quotationTitle,
    number: quotation.quotationNumber,
    date: quotation.date,
    dueDate: quotation.dueDate,
    client: quotation.clientDetails || {},
    business: quotation.businessDetails || {},
    items: quotation.items || [],
    subtotal: quotation.subtotal,
    discountType: quotation.discountType,
    discountValue: quotation.discountValue,
    shipping: quotation.shipping,
    total: quotation.grandTotal,
    terms: quotation.terms,
    notes: quotation.notes || "",
    attachments: quotation.attachments || [],
    signature: quotation.signature,
    showSignature: quotation.showSignature,
  };

  //console.log("MAPPED QUOTATION:", mappedQuotation);
  //console.log("SIGNATURE VALUE:", mappedQuotation.signature);

  const getDoc = () =>
    selectedTemplate === "premium" ? (
      <PremiumTemplate quotation={mappedQuotation} />
    ) : (
      <ClassicTemplate quotation={mappedQuotation} />
    );

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 flex flex-col gap-6">
      <div className="flex gap-4 items-center">
        <label className="font-medium">Template:</label>

        <select
          className="border rounded px-2 py-1"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          <option value="classic">Classic</option>
          <option value="premium">Premium</option>
        </select>

        <PDFDownloadLink
          key={selectedTemplate}
          document={getDoc()}
          fileName={`${mappedQuotation.number}.pdf`}
        >
          {({ loading }) => (
            <Button>
              {loading ? "Preparing PDF..." : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      <div
        className="border rounded shadow overflow-hidden"
        style={{ height: 900 }}
      >
        <PDFViewer width="100%" height={900}>
          {getDoc()}
        </PDFViewer>
      </div>
    </div>
  );
}