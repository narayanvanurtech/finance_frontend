"use client";

import React, { useEffect, useState } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import PremiumTemplate from "@/components/finance/PremiumTemplate";
import ClassicTemplate from "@/components/finance/ClassicTemplate";
import EliteTemplate from "@/components/finance/EliteTemplate";
import { useParams, useRouter } from "next/navigation";
import quotationApi from "@/api/finance/quotationApi";
import { toast } from "sonner";

const templates = [
  { label: "Elite", value: "elite" },
  { label: "Premium", value: "premium" },
  { label: "Classic", value: "classic" },
];

export default function QuotationPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;
  console.log("Quotation ID from params:", quotationId);

  const [selectedTemplate, setSelectedTemplate] = useState("elite");
  const [quotationData, setQuotationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPhases, setShowPhases] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      if (!quotationId) {
        toast.error("Quotation ID is missing");
        router.push("/finance/quotations");
        return;
      }

      try {
        setLoading(true);

        const response = await quotationApi.getQuotationById(quotationId);

        if (response.success && response.data) {
          const quote = response.data;
          console.log("quote ..mvnkncnkjvnjkc",quote)
          console.log("API Response:", quote); // Debug log

          // Helper function to format address
          const formatAddress = (address: any): string => {
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

          // Transform API data to template format
          const transformedData = {
            title: quote.quotationTitle || "Quotation",
            number: quote.quotationNumber || "",
            date: quote.date || new Date().toISOString().split("T")[0],
            dueDate: quote.dueDate,
            client: {
              name:
                (typeof quote.clientId === "object"
                  ? (quote.clientId as any)?.name
                  : undefined) ||
                quote.clientDetails?.name ||
                "",
              gstin:
                (typeof quote.clientId === "object"
                  ? (quote.clientId as any)?.gstin
                  : undefined) ||
                quote.clientDetails?.gstin ||
                "",
              address: formatAddress(
                (typeof quote.clientId === "object"
                  ? (quote.clientId as any)?.address
                  : undefined) ||
                  quote.clientDetails?.address ||
                  ""
              ),
              contact:
                (typeof quote.clientId === "object"
                  ? quote.clientId?.phone
                  : undefined) ||
                quote.clientDetails?.contact ||
                "",
              email:
                (typeof quote.clientId === "object"
                  ? quote.clientId?.email
                  : undefined) ||
                quote.clientDetails?.email ||
                "",
            },
            business: {
              name: quote.businessDetails?.name || "",
              gstin: quote.businessDetails?.gstin || "",
              address: quote.businessDetails?.address || "",
              contact: quote.businessDetails?.contact || "",
              email: quote.businessDetails?.email || "",
            },
            items:
              quote.items?.map((item: any) => ({
                name: item.name || "",
                description: item.description || "",
                qty: item.quantity || 1,
                rate: item.rate || 0,
                discount: item.discount || 0,
                igst: item.taxRate || 18,
                amount: item.amount || 0,
                hsn: item.hsn || "",
                unit: item.unit || "pcs",
                cgstAmount: item.cgstAmount || 0,
                sgstAmount: item.sgstAmount || 0,
                igstAmount: item.igstAmount || 0,
              })) || [],
            subtotal: quote.subtotal || 0,
            discountType: quote.discountType || "flat",
            discountValue: quote.discountValue || 0,
            tax: quote.totalTax || 0,
            shipping: quote.shipping || 0,
            roundOff: quote.roundOff || false,
            total: quote.grandTotal || 0,
            terms: quote.terms || "",
            notes: quote.notes || "",
            attachments: quote.attachments || [],
            signature: quote.signature || null,
            phases: (quote.phases || []).map((phase: any) => ({
              name: phase.title || `Phase ${phase.name || ""}`,
              dueDate: phase.dueDate || "",
              amount:
                phase.amount ||
                ((quote.grandTotal || 0) * (phase.percentage || 0)) / 100 ||
                0,
            })),
          };

          console.log("Transformed Data:", transformedData); // Debug log

          setQuotationData(transformedData);
        } else {
          toast.error("Failed to load quotation");
          router.push("/finance/quotations");
        }
      } catch (error) {
        console.error("Error fetching quotation:", error);
        toast.error("Failed to load quotation");
        router.push("/finance/quotations");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [quotationId, router]);

  const getDoc = () => {
    if (!quotationData) return null;

    const phases = quotationData.phases || [];

    if (selectedTemplate === "elite") {
      return (
        <EliteTemplate
          quotation={quotationData}
          phases={phases}
          showPhases={showPhases}
        />
      );
    } else if (selectedTemplate === "premium") {
      return <PremiumTemplate quotation={quotationData} phases={phases} />;
    } else {
      return <ClassicTemplate quotation={quotationData} phases={phases} />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-2 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quotation...</p>
        </div>
      </div>
    );
  }

  if (!quotationData) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-2 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Quotation not found</p>
          <Button
            onClick={() => router.push("/finance/quotations")}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Actions */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back Button */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/finance/quotations")}
                className="flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </Button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Template Selector */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                {templates.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setSelectedTemplate(t.value)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      selectedTemplate === t.value
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Show Phases Toggle (Only for Elite template) */}
              {selectedTemplate === "elite" &&
                quotationData.phases?.length > 0 && (
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={showPhases}
                        onChange={(e) => setShowPhases(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 font-medium">
                        Show Phases
                      </span>
                    </label>
                  </div>
                )}

              {/* Print Button */}
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print
              </Button>

              {/* Download Button */}
              {getDoc() && (
                <PDFDownloadLink
                  key={`${selectedTemplate}-${showPhases}`}
                  document={getDoc()!}
                  fileName={`quotation-${quotationData.number}-${selectedTemplate}.pdf`}
                >
                  {({ loading }) => (
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      {loading ? "Preparing..." : "Download PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}

              {/* Edit Button */}
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/finance/quotations/edit/${quotationId}`)
                }
                className="flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b bg-gray-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-medium">PDF Preview</span>
              <span className="text-xs text-gray-400">
                (
                {selectedTemplate.charAt(0).toUpperCase() +
                  selectedTemplate.slice(1)}{" "}
                Template)
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Use browser zoom or PDF toolbar to adjust view
            </span>
          </div>
          <div style={{ height: "calc(100vh - 240px)", minHeight: 600 }}>
            <PDFViewer
              key={`${selectedTemplate}-${showPhases}`}
              width="100%"
              height="100%"
              showToolbar={true}
              className="border-0"
            >
              {getDoc()!}
            </PDFViewer>
          </div>
        </div>
      </div>
    </div>
  );
}
