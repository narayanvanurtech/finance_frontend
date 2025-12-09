"use client";

import React, { useEffect, useState } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useDeliveryChallanStore } from "@/stores/financeStore/useDeliveryChallanStore";
import { toast } from "sonner";

import PremiumTemplate from "@/components/finance/PremiumTemplate";
import ClassicTemplate from "@/components/finance/ClassicTemplate";

export default function DeliveryChallanPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const challanId = params.id as string;

  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [challanData, setChallanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchChallanById = useDeliveryChallanStore((s) => s.fetchChallanById);
  const singleChallan = useDeliveryChallanStore((s) => s.singleChallan);

  const templates = [
    { label: "Premium", value: "premium" },
    { label: "Classic", value: "classic" },
  ];


  useEffect(() => {
    if (!challanId) return;

    (async () => {
      setLoading(true);
      await fetchChallanById(challanId);
    })();
  }, [challanId, fetchChallanById]);

  // 📌 Convert Delivery Challan → Template Format
  useEffect(() => {
    if (!singleChallan) {
      setLoading(false);
      return;
    }

    const client =
      typeof singleChallan.clientId === "object"
        ? singleChallan.clientId
        : null;

    // Format date to readable format (e.g., "Dec 04, 2025")
    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    };

    const mapped = {
      invoiceTitle: "Delivery Challan",
      invoiceNumber:
        singleChallan.deliveryChallanNumber ||
        singleChallan.challanNumber ||
        singleChallan._id?.slice(-6) ||
        "N/A",
      date: formatDate(singleChallan.date) || "",
      dueDate: null,

      // 👇 Data rearranged to fit template
      client: {
        name:
          client?.businessName ||
          singleChallan.clientDetails?.name ||
          "Unknown Client",
        gstin: client?.gstin || singleChallan.clientDetails?.gstin || "",
        email: client?.email || singleChallan.clientDetails?.email || "",
        contact: client?.phone || singleChallan.clientDetails?.contact || "",
        address: client?.address?.street
          ? `${client.address.street}, ${client.address.city}, ${client.address.state} - ${client.address.postalCode}`
          : singleChallan.clientDetails?.address || "",
      },

      items:
        singleChallan.items?.map((item: any) => ({
          name: item.name || item.itemName,
          description: item.description || "",
          qty: item.quantity,
          rate: item.rate,
          amount: item.amount,
          hsn: item.hsn || "-",
          unit: item.unit || "pcs",
          taxRate: item.igst || item.sgst || 0,
          discount: item.discount || 0,
        })) || [],

      subtotal: singleChallan.subtotal || 0,
      total: singleChallan.grandTotal || singleChallan.total || 0,
      discountValue: singleChallan.discountValue || 0,
      discountType: singleChallan.discountType || "flat",
      tax: singleChallan.taxAmount || 0,
      shipping: singleChallan.shipping || 0,
      notes: singleChallan.notes || "",
      terms: singleChallan.terms || "",
      attachments: singleChallan.attachments || [],

      // Transport details
      vehicleNumber: singleChallan.vehicleNumber,
      transportMode: singleChallan.transportMode,
      eWayBillNo: singleChallan.eWayBillNo,
      lrNumber: singleChallan.lrNumber,
      destination: singleChallan.destination,
    };

    setChallanData(mapped);
    setLoading(false);
  }, [singleChallan]);

  const getDoc = () => {
    if (!challanData) return null;

    return selectedTemplate === "premium" ? (
      <PremiumTemplate quotation={challanData} phases={[]} />
    ) : (
      <ClassicTemplate quotation={challanData} phases={[]} />
    );
  };

  if (loading)
    return (
      <div className="max-w-5xl mx-auto py-8 px-2 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delivery challan...</p>
        </div>
      </div>
    );

  if (!challanData) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-2 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Delivery challan not found</p>
          <Button
            onClick={() => router.push("/finance/delivery-challans")}
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
      {/* HEADER + ACTIONS same as Performa 🔥 */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back Button */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/finance/delivery-challans")}
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
                  key={selectedTemplate}
                  document={getDoc()!}
                  fileName={`delivery-challan-${challanData.invoiceNumber}.pdf`}
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
                  router.push(`/finance/delivery-challans/edit/${challanId}`)
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
            </div>
            <span className="text-xs text-gray-500">
              Use browser zoom or PDF toolbar to adjust view
            </span>
          </div>
          <div style={{ height: "calc(100vh - 240px)", minHeight: 600 }}>
            <PDFViewer
              key={selectedTemplate}
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
