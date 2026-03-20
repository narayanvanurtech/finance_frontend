"use client";

import React, { useEffect, useState } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import PremiumTemplate from "@/components/finance/PremiumTemplate";
import ClassicTemplate from "@/components/finance/ClassicTemplate";
import EliteTemplate from "@/components/finance/EliteTemplate";
import { useParams, useRouter } from "next/navigation";
import salesOrderApi from "@/api/finance/salesOrderApi";
import { toast } from "sonner";

const templates = [
  { label: "Elite", value: "elite" },
  { label: "Premium", value: "premium" },
  { label: "Classic", value: "classic" },
];

export default function SalesOrderPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  console.log("Sales Order ID from params:", orderId);

  const [selectedTemplate, setSelectedTemplate] = useState("elite");
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesOrder = async () => {
      if (!orderId) {
        toast.error("Sales Order ID is missing");
        router.push("/finance/sales-orders");
        return;
      }

      try {
        setLoading(true);

        // Get companyId from localStorage or your state management
        const companyId = localStorage.getItem("currentCompanyId") || "";
        if (!companyId) {
          toast.error("Company ID is missing");
          router.push("/finance/sales-orders");
          return;
        }

        const response = await salesOrderApi.getSalesOrderById(
          orderId,
          companyId
        );

        if (response.success && response.data) {
          const order = response.data;

          console.log("API Response:", order); // Debug log

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
            title: order.orderTitle || "Sales Order",
            number: order.orderNumber || "",
            date: order.orderDate || new Date().toISOString().split("T")[0],
            dueDate: order.deliveryDate,
            client: {
              name:
                (typeof order.clientId === "object"
                  ? (order.clientId as any)?.name
                  : undefined) ||
                order.clientDetails?.name ||
                "",
              gstin:
                (typeof order.clientId === "object"
                  ? (order.clientId as any)?.gstin
                  : undefined) ||
                order.clientDetails?.gstin ||
                "",
              address: formatAddress(
                (typeof order.clientId === "object"
                  ? (order.clientId as any)?.address
                  : undefined) ||
                  order.clientDetails?.address ||
                  ""
              ),
              contact:
                (typeof order.clientId === "object"
                  ? order.clientId?.phone
                  : undefined) ||
                order.clientDetails?.contact ||
                "",
              email:
                (typeof order.clientId === "object"
                  ? order.clientId?.email
                  : undefined) ||
                order.clientDetails?.email ||
                "",
            },
            business: {
              name: order.businessDetails?.name || "",
              gstin: order.businessDetails?.gstin || "",
              address: order.businessDetails?.address || "",
              contact: order.businessDetails?.contact || "",
              email: order.businessDetails?.email || "",
            },
            items:
              order.items?.map((item: any) => ({
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
            subtotal: order.subtotal || 0,
            discountType: order.discountType || "flat",
            discountValue: order.discountValue || 0,
            tax: order.totalTax || 0,
            shipping: order.shipping || 0,
            roundOff: order.roundOff || false,
            total: order.grandTotal || 0,
            terms: order.terms || "",
            notes: order.notes || "",
            attachments: order.attachments || [],
            showSignature:order.showSignature || false,
            signature: order.signature || "",
            phases: [],
          };

          console.log("Transformed Data:", transformedData); // Debug log

          setOrderData(transformedData);
        } else {
          toast.error("Failed to load sales order");
          router.push("/finance/sales-orders");
        }
      } catch (error) {
        console.error("Error fetching sales order:", error);
        toast.error("Failed to load sales order");
        router.push("/finance/sales-orders");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesOrder();
  }, [orderId, router]);

  const getDoc = () => {
    if (!orderData) return null;

    const phases = orderData.phases || [];

    if (selectedTemplate === "elite") {
      return (
        <EliteTemplate
          quotation={orderData}
          phases={phases}
          showPhases={true}
        />
      );
    }

    if (selectedTemplate === "premium") {
      return <PremiumTemplate quotation={orderData} phases={phases} />;
    } else {
      return <ClassicTemplate quotation={orderData} phases={phases} />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-2 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales order...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-2 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Sales order not found</p>
          <Button
            onClick={() => router.push("/finance/sales-orders")}
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
                onClick={() => router.push("/finance/sales-orders")}
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
                  fileName={`sales-order-${orderData.number}.pdf`}
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
                  router.push(`/finance/sales-orders/edit/${orderId}`)
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
