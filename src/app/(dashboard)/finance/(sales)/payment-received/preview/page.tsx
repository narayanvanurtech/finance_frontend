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

// Mock data for payment receipt
const paymentReceipt = {
  title: "Payment Receipt",
  number: "PR-00125",
  date: "2024-12-05",
  dueDate: "",
  client: {
    name: "Acme Corp",
    gstin: "22AAAAA0000A1Z5",
    address: "123 Main St, City, State",
    contact: "+91 9876543210",
    email: "john@acme.com",
  },
  business: {
    name: "Your Company Name",
    gstin: "29ABCDE1234F1Z5",
    address: "456 Business Park, Delhi",
    contact: "+91 1234567890",
    email: "info@yourcompany.com",
  },
  items: [
    {
      name: "Cash Payment",
      description: "Payment received via cash",
      qty: 1,
      rate: 50000,
      discount: 0,
      igst: 0,
      amount: 50000,
      hsn: "-",
      unit: "payment",
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
    },
    {
      name: "Bank Transfer",
      description: "Payment received via NEFT - Ref: TXN123456",
      qty: 1,
      rate: 25000,
      discount: 0,
      igst: 0,
      amount: 25000,
      hsn: "-",
      unit: "payment",
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
    },
  ],
  subtotal: 75000,
  discountType: "flat",
  discountValue: 0,
  tax: 0,
  shipping: 0,
  roundOff: false,
  total: 75000,
  terms: "Payment received with thanks.",
  notes: "Thank you for your payment!",
  attachments: [],
  signature: null,
};

// Payment receipts typically don't have phase-wise payment
const phases: PhaseType[] = [];

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

export default function PaymentReceivedPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const getDoc = () =>
    selectedTemplate === "premium" ? (
      <PremiumTemplate quotation={paymentReceipt} phases={phases} />
    ) : (
      <ClassicTemplate quotation={paymentReceipt} phases={phases} />
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
          fileName={`payment-receipt-${paymentReceipt.number}.pdf`}
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
