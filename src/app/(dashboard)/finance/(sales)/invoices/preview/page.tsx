"use client";

import React from "react";
import dynamicImport from "next/dynamic";
import { Button } from "@/components/ui/button";
import PremiumTemplate from "@/components/finance/PremiumTemplate";
import ClassicTemplate from "@/components/finance/ClassicTemplate";
import { useState, useEffect } from "react";
import invoiceApi from "@/api/finance/invoiceApi";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

const PDFViewer = dynamicImport(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading PDF...
      </div>
    ),
  }
);

const PDFDownloadLink = dynamicImport(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <Button disabled>Loading...</Button> }
);

// Mock data for invoice preview
const invoice = {
  title: "Website Development Invoice",
  number: "INV-00125",
  date: "2024-06-01",
  dueDate: "2024-06-15",
  client: {
    name: "Acme Corp",
    gstin: "22AAAAA0000A1Z5",
    address: "123 Main St, City, State",
    contact: "John Doe",
    email: "john@acme.com",
  },
  business: {
    name: "Your Company Name",
    gstin: "29ABCDE1234F1Z5",
    address: "456 Business St, City, State",
    contact: "+1-234-567-8900",
    email: "info@yourcompany.com",
  },
  items: [
    {
      name: "Consulting",
      description: "Project consulting services",
      qty: 2,
      rate: 1000,
      discount: 0,
      igst: 18,
      amount: 2360,
      hsn: "9983",
      unit: "hrs",
    },
    {
      name: "Software License",
      description: "Annual license fee",
      qty: 1,
      rate: 5000,
      discount: 500,
      igst: 18,
      amount: 5310,
      hsn: "8523",
      unit: "pcs",
    },
  ],
  subtotal: 7000,
  discountType: "flat",
  discountValue: 500,
  tax: 1330,
  shipping: 0,
  roundOff: false,
  total: 7830,
  terms: "Payment due within 15 days.",
  notes: "Thank you for your business!",
  attachments: ["specs.pdf"],
  signature: null,
};

// Dummy phase-wise payment data
const phases = [
  { name: "Advance", dueDate: "2024-06-05", amount: 3000 },
  { name: "Development", dueDate: "2024-06-10", amount: 3000 },
  { name: "Final Payment", dueDate: "2024-06-15", amount: 1830 },
];

const templates = [
  { label: "Premium", value: "premium" },
  { label: "Classic", value: "classic" },
];

export default function InvoicePreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [invoiceNumber, setInvoiceNumber] = useState(invoice.number);

  useEffect(() => {
    // Fetch the preview invoice number from the API
    const fetchInvoiceNumber = async () => {
      try {
        const response = await invoiceApi.previewInvoiceNumber();
        if (response.success && response.data) {
          setInvoiceNumber(response.data.invoiceNumber);
        }
      } catch (error) {
        console.error("Failed to fetch invoice number:", error);
        toast.error("Failed to fetch invoice number preview");
      }
    };

    fetchInvoiceNumber();
  }, []);

  const getDoc = () => {
    const invoiceData = { ...invoice, number: invoiceNumber };
    return selectedTemplate === "premium" ? (
      <PremiumTemplate
        title={"Invoice"}
        quotation={invoiceData}
        phases={phases}
      />
    ) : (
      <ClassicTemplate
        title={"Invoice"}
        quotation={invoiceData}
        phases={phases}
      />
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 min-h-screen flex flex-col gap-6">
      <div className="flex gap-4 mb-4 items-center">
        <label className="font-medium">Template:</label>
        <select
          className="border rounded px-2 py-1"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          {templates.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <PDFDownloadLink
          key={selectedTemplate}
          document={getDoc()}
          fileName={`invoice-${invoiceNumber}.pdf`}
        >
          {({ loading }) => (
            <Button>{loading ? "Preparing PDF..." : "Download PDF"}</Button>
          )}
        </PDFDownloadLink>
      </div>
      <div
        className="border rounded shadow overflow-hidden"
        style={{ height: 900 }}
      >
        <PDFViewer key={selectedTemplate} width="100%" height={900} showToolbar>
          {getDoc()}
        </PDFViewer>
      </div>
    </div>
  );
}
