"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

export interface QuotationType {
  title: string;
  number: string;
  date: string;
  dueDate: string;
  client: {
    name: string;
    gstin: string;
    address: string;
    contact: string;
    email: string;
  };
  business: {
    name: string;
    gstin: string;
    address: string;
    contact: string;
    email: string;
  };
  items: Array<{
    name: string;
    description: string;
    qty: number;
    rate: number;
    discount: number;
    igst: number;
    amount: number;
    hsn: string;
    unit: string;
    cgstAmount?: number;
    sgstAmount?: number;
    igstAmount?: number;
  }>;
  subtotal: number;
  discountType: string;
  discountValue: number;
  tax: number;
  shipping: number;
  roundOff: boolean;
  total: number;
  terms: string;
  notes: string;
  attachments: string[];
  signature: string | null;
}

export interface PhaseType {
  name: string;
  dueDate: string;
  amount: number;
}

export type DocumentType = "quotation" | "invoice" | "proforma";

const DOC_LABELS: Record<
  DocumentType,
  { title: string; number: string; date: string; summary: string }
> = {
  quotation: {
    title: "Quotation",
    number: "Quotation Number",
    date: "Quotation Date",
    summary: "Quotation Summary",
  },
  invoice: {
    title: "Invoice",
    number: "Invoice Number",
    date: "Invoice Date",
    summary: "Invoice Summary",
  },
  proforma: {
    title: "Proforma Invoice",
    number: "Proforma Invoice Number",
    date: "Proforma Invoice Date",
    summary: "Proforma Invoice Summary",
  },
};

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 8,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Modern Gradient Header
  headerSection: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundColor: "#667eea",
    padding: 20,
    marginBottom: 0,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  logoArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    border: "2 solid #ffffff",
  },
  companyDetails: {
    maxWidth: 300,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 2,
  },
  companyTagline: {
    fontSize: 7,
    color: "#e0e7ff",
    marginBottom: 3,
    fontStyle: "italic",
  },
  companyAddress: {
    fontSize: 6.5,
    color: "#ddd6fe",
    lineHeight: 1.3,
    marginBottom: 1,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  // Content Area
  contentSection: {
    padding: 15,
    paddingTop: 12,
  },
  // Party Details Section
  partiesRow: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 10,
  },
  partyCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    padding: 10,
    border: "1 solid #e2e8f0",
  },
  cardTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingBottom: 3,
  },
  clientName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  detailLine: {
    fontSize: 7,
    color: "#475569",
    marginBottom: 2,
    lineHeight: 1.3,
  },
  detailLabel: {
    fontWeight: "bold",
    color: "#64748b",
  },
  invoiceDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    paddingBottom: 3,
    borderBottom: "1 solid #e2e8f0",
  },
  detailLabelSmall: {
    fontSize: 7,
    color: "#64748b",
    fontWeight: "bold",
  },
  detailValue: {
    fontSize: 7,
    color: "#1e293b",
    fontWeight: "bold",
  },
  // Items Table
  itemsTable: {
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 6,
    overflow: "hidden",
    border: "1 solid #e2e8f0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#667eea",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottom: "1 solid #f1f5f9",
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },
  // Column Widths
  colNum: { width: "5%", textAlign: "center" },
  colDesc: { width: "28%", paddingRight: 8 },
  colHsn: { width: "10%", textAlign: "center" },
  colQty: { width: "8%", textAlign: "center" },
  colRate: { width: "12%", textAlign: "right" },
  colTax: { width: "10%", textAlign: "center" },
  colDiscount: { width: "12%", textAlign: "right" },
  colAmount: { width: "15%", textAlign: "right" },
  cellText: {
    fontSize: 7,
    color: "#334155",
  },
  itemName: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 6.5,
    color: "#64748b",
    fontStyle: "italic",
    lineHeight: 1.3,
  },
  // Summary Section
  summarySection: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  leftSummary: {
    flex: 1,
  },
  rightSummary: {
    width: 240,
  },
  // Payment Phases
  phasesCard: {
    backgroundColor: "#fefce8",
    borderRadius: 6,
    border: "1 solid #fde047",
    marginBottom: 8,
    overflow: "hidden",
  },
  phasesHeader: {
    backgroundColor: "#fef08a",
    padding: 6,
    borderBottom: "1 solid #fde047",
  },
  phasesTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#713f12",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  phaseTableHeader: {
    flexDirection: "row",
    backgroundColor: "#fffbeb",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottom: "1 solid #fde68a",
  },
  phaseHeaderText: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#78350f",
    textTransform: "uppercase",
  },
  phaseDataRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottom: "1 solid #fef3c7",
  },
  phaseCell: {
    fontSize: 7,
    color: "#451a03",
  },
  phaseCol1: { width: "50%" },
  phaseCol2: { width: "25%", textAlign: "center" },
  phaseCol3: { width: "25%", textAlign: "right", fontWeight: "bold" },
  // Tax Breakdown Card
  taxBreakdownCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 6,
    border: "1 solid #bfdbfe",
    padding: 8,
    marginBottom: 8,
  },
  taxBreakdownTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  taxBreakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottom: "1 solid #dbeafe",
  },
  taxLabel: {
    fontSize: 7,
    color: "#1e3a8a",
  },
  taxValue: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  // Amount in Words
  amountWordsCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 6,
    border: "1 solid #86efac",
    padding: 8,
    marginBottom: 8,
  },
  wordsLabel: {
    fontSize: 6.5,
    color: "#166534",
    marginBottom: 2,
    fontWeight: "bold",
  },
  wordsText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#14532d",
  },
  // Additional Info Card
  additionalInfoCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    border: "1 solid #fde047",
    padding: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: 6.5,
    color: "#78350f",
  },
  infoValue: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#78350f",
  },
  // Summary Calculations
  summaryCard: {
    borderRadius: 6,
    overflow: "hidden",
    border: "1 solid #e2e8f0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottom: "1 solid #f1f5f9",
  },
  summaryLabel: {
    fontSize: 7.5,
    color: "#475569",
  },
  summaryValue: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#0f172a",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#667eea",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  // Footer Section
  footerSection: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  footerCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    padding: 8,
    border: "1 solid #e2e8f0",
  },
  footerCardTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    paddingBottom: 2,
  },
  footerText: {
    fontSize: 6.5,
    color: "#475569",
    marginBottom: 1.5,
    lineHeight: 1.3,
  },
  footerTextBold: {
    fontSize: 6.5,
    color: "#1e293b",
    fontWeight: "bold",
    marginBottom: 1.5,
    lineHeight: 1.3,
  },
  // QR Code
  qrContainer: {
    alignItems: "center",
    paddingVertical: 4,
  },
  qrCode: {
    width: 60,
    height: 60,
    marginBottom: 4,
  },
  qrLabel: {
    fontSize: 6.5,
    color: "#64748b",
    fontWeight: "bold",
  },
  // Signature
  signatureContainer: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  signatureImg: {
    width: 70,
    height: 30,
    marginBottom: 3,
  },
  signatureLine: {
    width: 80,
    borderTop: "1 solid #94a3b8",
    marginTop: 15,
    marginBottom: 3,
  },
  signatureText: {
    fontSize: 6.5,
    color: "#475569",
    textAlign: "center",
  },
  // Terms Section
  termsCard: {
    backgroundColor: "#fef2f2",
    borderRadius: 6,
    border: "1 solid #fecaca",
    padding: 8,
  },
  termsTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#991b1b",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  termItem: {
    fontSize: 6,
    color: "#7f1d1d",
    marginBottom: 2,
    lineHeight: 1.3,
  },
  // Notes Section
  notesCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    border: "1 solid #fde047",
    padding: 8,
    marginTop: 6,
  },
  notesTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  notesText: {
    fontSize: 6,
    color: "#78350f",
    lineHeight: 1.3,
  },
  // Bottom Bar
  bottomBar: {
    marginTop: 12,
    backgroundColor: "#667eea",
    paddingVertical: 6,
    textAlign: "center",
  },
  bottomText: {
    fontSize: 6.5,
    color: "#e0e7ff",
  },
});

function EliteTemplate({
  documentType = "quotation",
  quotation,
  phases = [],
  showPhases = true,
}: {
  documentType?: DocumentType;
  quotation: QuotationType;
  phases?: PhaseType[];
  showPhases?: boolean;
}) {
  const labels = DOC_LABELS[documentType];
  // Calculate totals
  const totalQty = quotation.items.reduce((sum, item) => sum + item.qty, 0);
  const totalDiscount = quotation.items.reduce(
    (sum, item) => sum + item.discount,
    0
  );
  const subtotalBeforeTax = quotation.items.reduce(
    (sum, item) => sum + item.qty * item.rate - item.discount,
    0
  );

  const cgstTotal = quotation.items.reduce(
    (sum, item) => sum + (item.cgstAmount || 0),
    0
  );
  const sgstTotal = quotation.items.reduce(
    (sum, item) => sum + (item.sgstAmount || 0),
    0
  );
  const igstTotal = quotation.items.reduce(
    (sum, item) => sum + (item.igstAmount || 0),
    0
  );

  console.log("quotation.....details",quotation)

  const roundOffAmount = quotation?.roundOff
    ? Math.round(quotation.total) - quotation.total
    : 0;
  const finalTotal = quotation?.roundOff
    ? Math.round(quotation.total)
    : quotation?.total || 0;

  // Number to Words
  const numberToWords = (num: number): string => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    if (num === 0) return "Zero";

    let words = "";
    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const hundreds = Math.floor((num % 1000) / 100);
    const remainder = num % 100;

    if (crores > 0) words += ones[crores] + " Crore ";
    if (lakhs > 0)
      words +=
        (lakhs < 10
          ? ones[lakhs]
          : tens[Math.floor(lakhs / 10)] + " " + ones[lakhs % 10]) + " Lakh ";
    if (thousands > 0)
      words +=
        (thousands < 10
          ? ones[thousands]
          : tens[Math.floor(thousands / 10)] + " " + ones[thousands % 10]) +
        " Thousand ";
    if (hundreds > 0) words += ones[hundreds] + " Hundred ";

    if (remainder >= 10 && remainder < 20) {
      words += teens[remainder - 10] + " ";
    } else {
      if (Math.floor(remainder / 10) > 0)
        words += tens[Math.floor(remainder / 10)] + " ";
      if (remainder % 10 > 0) words += ones[remainder % 10] + " ";
    }

    return words.trim();
  };

  const amountInWords = `INR ${numberToWords(Math.floor(finalTotal))} Only`;

  console.log("preview",quotation)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Modern Gradient Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <View style={styles.logoArea}>
              <Image src="/venurtechLogo.png" style={styles.companyLogo} />
              <View style={styles.companyDetails}>
                <Text style={styles.companyName}>
                  {quotation.business?.name || "VANURTECH MEDIA PVT. LTD."}
                </Text>
                <Text style={styles.companyTagline}>
                  Deals in: Apps, CRMs, Website, MERN Stack Development
                </Text>
                <Text style={styles.companyAddress}>
                  {quotation.business?.address ||
                    "Plot No 376, Gobindaprasad, Cuttack Road"}
                </Text>
                <Text style={styles.companyAddress}>
                  G.G.P Colony, Khorda, Bhubaneswar - 751025, Odisha, India
                </Text>
                <Text style={styles.companyAddress}>
                  GSTIN: {quotation.business?.gstin || "21AAJCV7420K1Z9"} |
                  State: Odisha (Code: 21)
                </Text>
                <Text style={styles.companyAddress}>
                  Contact:{" "}
                  {quotation.business?.contact || "7077004890, 7978874959"} |
                  Email:{" "}
                  {quotation.business?.email ||
                    "vanurtechmediaofficial@gmail.com"}
                </Text>
              </View>
            </View>
            <Text style={styles.invoiceTitle}>{labels.title}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Party Details */}
          <View style={styles.partiesRow}>
            {/* Bill To */}
            <View style={styles.partyCard}>
              <Text style={styles.cardTitle}>BILL TO</Text>
              <Text style={styles.clientName}>{quotation.client.name}</Text>
              <Text style={styles.detailLine}>{quotation.client.address}</Text>
              <Text style={styles.detailLine}>
                <Text style={styles.detailLabel}>GSTIN:</Text>{" "}
                {quotation.client.gstin}
              </Text>
              <Text style={styles.detailLine}>
                <Text style={styles.detailLabel}>Contact:</Text>{" "}
                {quotation.client.contact}
              </Text>
              <Text style={styles.detailLine}>
                <Text style={styles.detailLabel}>Email:</Text>{" "}
                {quotation.client.email}
              </Text>
              <Text style={styles.detailLine}>
                <Text style={styles.detailLabel}>State:</Text> Odisha, Code: 21
              </Text>
            </View>

            {/* Invoice Details */}
            <View style={styles.partyCard}>
              <Text style={styles.cardTitle}>{labels.title} DETAILS</Text>
              <View style={styles.invoiceDetailRow}>
                <Text style={styles.detailLabelSmall}>{labels.number}</Text>
                <Text style={styles.detailValue}>{quotation.number}</Text>
              </View>
              <View style={styles.invoiceDetailRow}>
                <Text style={styles.detailLabelSmall}>{labels.date}</Text>
                <Text style={styles.detailValue}>
                  {new Date(quotation.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <View style={styles.invoiceDetailRow}>
                <Text style={styles.detailLabelSmall}>Due Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(quotation.dueDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <View style={[styles.invoiceDetailRow, { borderBottom: 0 }]}>
                <Text style={styles.detailLabelSmall}>Payment Terms</Text>
                <Text style={styles.detailValue}>Within calendar month</Text>
              </View>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.itemsTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNum]}>SL</Text>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>
                Description of Goods/Services
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colHsn]}>
                HSN/SAC
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
              <Text style={[styles.tableHeaderCell, styles.colTax]}>GST %</Text>
              <Text style={[styles.tableHeaderCell, styles.colDiscount]}>
                Discount
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>
                Amount (₹)
              </Text>
            </View>

            {quotation.items.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowAlt : {},
                ]}
              >
                <Text style={[styles.cellText, styles.colNum]}>{idx + 1}</Text>
                <View style={styles.colDesc}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  )}
                </View>
                <Text style={[styles.cellText, styles.colHsn]}>{item.hsn}</Text>
                <Text style={[styles.cellText, styles.colQty]}>
                  {item.qty} {item.unit}
                </Text>
                <Text style={[styles.cellText, styles.colRate]}>
                  ₹{(item.rate || 0).toFixed(2)}
                </Text>
                <Text style={[styles.cellText, styles.colTax]}>
                  {item.igst || 0}%
                </Text>
                <Text style={[styles.cellText, styles.colDiscount]}>
                  ₹{(item.discount || 0).toFixed(2)}
                </Text>
                <Text style={[styles.cellText, styles.colAmount]}>
                  ₹{(item.amount || 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Summary Section */}
          <View style={styles.summarySection}>
            <View style={styles.leftSummary}>
              {/* Additional Summary Info */}
              <View style={styles.additionalInfoCard}>
                <Text style={styles.infoTitle}>{labels.summary}</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Items:</Text>
                  <Text style={styles.infoValue}>
                    {quotation.items.length} item(s)
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Quantity:</Text>
                  <Text style={styles.infoValue}>
                    {totalQty} {quotation.items[0]?.unit || "PCS"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Discount:</Text>
                  <Text style={styles.infoValue}>
                    ₹{totalDiscount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Taxable Amount:</Text>
                  <Text style={styles.infoValue}>
                    ₹{subtotalBeforeTax.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Payment Phases - Phase Wise Breakdown */}
              {showPhases && phases && phases.length > 0 && (
                <View style={styles.phasesCard}>
                  <View style={styles.phasesHeader}>
                    <Text style={styles.phasesTitle}>
                      PHASE-WISE PAYMENT SCHEDULE
                    </Text>
                  </View>
                  <View style={styles.phaseTableHeader}>
                    <Text style={[styles.phaseHeaderText, styles.phaseCol1]}>
                      Phase Name
                    </Text>
                    <Text style={[styles.phaseHeaderText, styles.phaseCol2]}>
                      Due Date
                    </Text>
                    <Text style={[styles.phaseHeaderText, styles.phaseCol3]}>
                      Amount (₹)
                    </Text>
                  </View>
                  {phases.map((phase, idx) => (
                    <View key={idx} style={styles.phaseDataRow}>
                      <Text style={[styles.phaseCell, styles.phaseCol1]}>
                        {phase.name || `Phase ${idx + 1}`}
                      </Text>
                      <Text style={[styles.phaseCell, styles.phaseCol2]}>
                        {phase.dueDate
                          ? new Date(phase.dueDate).toLocaleDateString("en-GB")
                          : "N/A"}
                      </Text>
                      <Text style={[styles.phaseCell, styles.phaseCol3]}>
                        ₹{Number(phase.amount || 0).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Tax Breakdown */}
              <View style={styles.taxBreakdownCard}>
                <Text style={styles.taxBreakdownTitle}>TAX BREAKDOWN</Text>
                {cgstTotal > 0 && (
                  <View style={styles.taxBreakdownRow}>
                    <Text style={styles.taxLabel}>CGST @ 9%</Text>
                    <Text style={styles.taxValue}>₹{cgstTotal.toFixed(2)}</Text>
                  </View>
                )}
                {sgstTotal > 0 && (
                  <View style={styles.taxBreakdownRow}>
                    <Text style={styles.taxLabel}>SGST @ 9%</Text>
                    <Text style={styles.taxValue}>₹{sgstTotal.toFixed(2)}</Text>
                  </View>
                )}
                {igstTotal > 0 && (
                  <View style={styles.taxBreakdownRow}>
                    <Text style={styles.taxLabel}>IGST @ 18%</Text>
                    <Text style={styles.taxValue}>₹{igstTotal.toFixed(2)}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.taxBreakdownRow,
                    { borderBottom: 0, paddingTop: 8 },
                  ]}
                >
                  <Text
                    style={[
                      styles.taxLabel,
                      { fontWeight: "bold", fontSize: 9 },
                    ]}
                  >
                    Total Tax Amount
                  </Text>
                  <Text style={[styles.taxValue, { fontSize: 10 }]}>
                    ₹{(cgstTotal + sgstTotal + igstTotal).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Amount in Words */}
              <View style={styles.amountWordsCard}>
                <Text style={styles.wordsLabel}>AMOUNT IN WORDS:</Text>
                <Text style={styles.wordsText}>{amountInWords}</Text>
              </View>

              {/* Notes if available */}
              {quotation.notes && (
                <View style={styles.notesCard}>
                  <Text style={styles.notesTitle}>NOTES</Text>
                  <Text style={styles.notesText}>{quotation.notes}</Text>
                </View>
              )}
            </View>

            {/* Summary Calculations */}
            <View style={styles.rightSummary}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    ₹{subtotalBeforeTax.toFixed(2)}
                  </Text>
                </View>
                {totalDiscount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Discount</Text>
                    <Text style={styles.summaryValue}>
                      - ₹{totalDiscount.toFixed(2)}
                    </Text>
                  </View>
                )}
                {cgstTotal > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>CGST (9%)</Text>
                    <Text style={styles.summaryValue}>
                      ₹{cgstTotal.toFixed(2)}
                    </Text>
                  </View>
                )}
                {sgstTotal > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>SGST (9%)</Text>
                    <Text style={styles.summaryValue}>
                      ₹{sgstTotal.toFixed(2)}
                    </Text>
                  </View>
                )}
                {igstTotal > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>IGST (18%)</Text>
                    <Text style={styles.summaryValue}>
                      ₹{igstTotal.toFixed(2)}
                    </Text>
                  </View>
                )}
                {quotation.shipping > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Shipping Charges</Text>
                    <Text style={styles.summaryValue}>
                      ₹{quotation.shipping.toFixed(2)}
                    </Text>
                  </View>
                )}
                {quotation.roundOff && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Round Off</Text>
                    <Text style={styles.summaryValue}>
                      {roundOffAmount >= 0 ? "+" : ""}₹
                      {roundOffAmount.toFixed(2)}
                    </Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Grand Total</Text>
                  <Text style={styles.totalValue}>
                    ₹{finalTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            {/* QR Code */}
            <View style={styles.footerCard}>
              <Text style={styles.footerCardTitle}>SCAN TO PAY</Text>
              <View style={styles.qrContainer}>
                <Image src="/scanToPay.png" style={styles.qrCode} />
                <Text style={styles.qrLabel}>UPI Payment</Text>
              </View>
            </View>

            {/* Bank Details */}
            <View style={styles.footerCard}>
              <Text style={styles.footerCardTitle}>BANK DETAILS</Text>
              <Text style={styles.footerTextBold}>
                VANURTECH MEDIA PVT. LTD.
              </Text>
              <Text style={styles.footerText}>Bank: ICICI Bank</Text>
              <Text style={styles.footerText}>Account No: 006105002368</Text>
              <Text style={styles.footerText}>IFSC Code: ICIC0000061</Text>
              <Text style={styles.footerText}>Branch: Bhubaneswar, Odisha</Text>
              <Text style={styles.footerText}>Account Type: Current</Text>
            </View>

            {/* Terms */}
            <View style={styles.footerCard}>
              <View style={styles.termsCard}>
                <Text style={styles.termsTitle}>PAYMENT TERMS</Text>
                <Text style={styles.termItem}>
                  {`• Payment within same calendar month of ${labels.title} date`}
                </Text>
                <Text style={styles.termItem}>
                  • Delay will attract interest @10% per day
                </Text>
                <Text style={styles.termItem}>
                  • Subject to Bhubaneswar jurisdiction
                </Text>
                <Text style={styles.termItem}>
                  • Goods once sold will not be taken back
                </Text>
                {quotation.terms && (
                  <Text style={styles.termItem}>• {quotation.terms}</Text>
                )}
              </View>
            </View>

            {/* Signature */}
            <View style={styles.footerCard}>
              <Text style={styles.footerCardTitle}>AUTHORIZATION</Text>
              <View style={styles.signatureContainer}>
                {quotation.signature && (
                  <Image
                    src={quotation.signature}
                    style={styles.signatureImg}
                  />
                )}
                <View style={styles.signatureLine} />
                <Text style={styles.signatureText}>Authorized Signatory</Text>
                <Text
                  style={[
                    styles.signatureText,
                    { marginTop: 2, fontWeight: "bold" },
                  ]}
                >
                  for {quotation.business?.name || "VANURTECH MEDIA"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <Text style={styles.bottomText}>
            This is a Computer Generated Invoice • No Signature Required • Thank
            You for Your Business
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default EliteTemplate;
