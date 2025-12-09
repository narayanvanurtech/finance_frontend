"use client";

import React from "react";
import dynamicImport from "next/dynamic";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import PremiumTemplate, {
  QuotationType,
  PhaseType,
} from "@/components/finance/PremiumTemplate";

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

import ClassicTemplate from "@/components/finance/ClassicTemplate";
import { useState } from "react";

// Mock data (same as before)
const quotation = {
  title: "Website Development Quotation",
  number: "QTN-00125",
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
    name: "My Business",
    gstin: "29ABCDE1234F1Z5",
    address: "456 Business Ave, City, State",
    contact: "+91 1234567890",
    email: "info@mybusiness.com",
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
  notes: "Thank you for considering us!",
  attachments: ["specs.pdf"],
  signature: null,
};

// Dummy phase-wise payment data
const phases = [
  { name: "Advance", dueDate: "2024-06-05", amount: 3000 },
  { name: "Development", dueDate: "2024-06-10", amount: 3000 },
  { name: "Final Payment", dueDate: "2024-06-15", amount: 1830 },
];

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#fff",
  },
  section: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  // Added missing styles below
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    justifyContent: "flex-start",
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  quotationInfo: {
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  quotationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  boxedSection: {
    border: "1 solid #eee",
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    backgroundColor: "#fafbfc",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tableSection: {
    marginBottom: 12,
  },
  summaryBox: {
    border: "1 solid #eee",
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    backgroundColor: "#f8f9fa",
    alignSelf: "flex-end",
    minWidth: 200,
  },
  shadedBox: {
    backgroundColor: "#f3f3f3",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  signatureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  label: {
    color: "#666",
    fontSize: 10,
  },
  value: {
    fontFamily: "Helvetica-Bold",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "11%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: "#f3f3f3",
    padding: 4,
    fontWeight: "bold",
  },
  tableCol: {
    width: "11%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 4,
  },
  tableColDesc: {
    width: "18%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  summaryLabel: {
    color: "#444",
  },
  summaryValue: {
    fontFamily: "Helvetica-Bold",
  },
  terms: {
    marginTop: 8,
    fontSize: 10,
    color: "#333",
  },
  notes: {
    marginTop: 8,
    fontSize: 10,
    color: "#333",
  },
  attachment: {
    fontSize: 10,
    color: "#1a56db",
    textDecoration: "underline",
  },
});

const templates = [
  { label: "Premium", value: "premium" },
  { label: "Classic", value: "classic" },
];

export default function QuotationPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const getDoc = () =>
    selectedTemplate === "premium" ? (
      <PremiumTemplate quotation={quotation} phases={phases} />
    ) : (
      <ClassicTemplate quotation={quotation} phases={phases} />
    );

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
          fileName={`quotation-${quotation.number}.pdf`}
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
