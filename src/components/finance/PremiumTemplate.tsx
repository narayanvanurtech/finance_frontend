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

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#fff",
  },
  // Header Section
  headerBorder: {
    border: "2 solid #000",
    marginBottom: 0,
  },
  headerTitle: {
    backgroundColor: "#d3d3d3",
    textAlign: "center",
    padding: 4,
    fontSize: 12,
    fontWeight: "bold",
    borderBottom: "1 solid #000",
  },
  headerContent: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  logoSection: {
    width: "20%",
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRight: "1 solid #000",
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    border: "2 solid #0066cc",
  },
  companySection: {
    width: "80%",
    padding: 8,
    alignItems: "center",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#cc0000",
    marginBottom: 2,
  },
  companyTagline: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 8,
    textAlign: "center",
    marginBottom: 1,
  },
  // Buyer and Invoice Info Row
  infoRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  buyerSection: {
    width: "50%",
    padding: 6,
    borderRight: "1 solid #000",
  },
  invoiceSection: {
    width: "50%",
    padding: 6,
  },
  buyerTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 3,
  },
  buyerName: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
  },
  buyerDetail: {
    fontSize: 8,
    marginBottom: 1,
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    borderBottom: "1 solid #000",
    paddingBottom: 2,
  },
  invoiceLabel: {
    fontSize: 8,
    width: "50%",
  },
  invoiceValue: {
    fontSize: 8,
    fontWeight: "bold",
    width: "50%",
    textAlign: "left",
  },
  // Items Table
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottom: "1 solid #000",
    borderTop: "1 solid #000",
    fontWeight: "bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  slCol: {
    width: "5%",
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  descCol: {
    width: "30%",
    padding: 4,
    borderRight: "1 solid #000",
  },
  gstCol: {
    width: "8%",
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  qtyCol: {
    width: "8%",
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  rateCol: {
    width: "12%",
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "right",
  },
  amountCol: {
    width: "12%",
    padding: 4,
    textAlign: "right",
  },
  itemName: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 7,
    fontStyle: "italic",
  },
  // Tax Summary Rows
  taxSummarySection: {
    borderBottom: "1 solid #000",
  },
  taxRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  taxLabelCol: {
    width: "63%",
    padding: 4,
    borderRight: "1 solid #000",
  },
  taxValueCol: {
    width: "12%",
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "right",
    fontSize: 8,
  },
  emptyCol: {
    width: "12%",
    padding: 4,
    borderRight: "1 solid #000",
  },
  totalAmountCol: {
    width: "12%",
    padding: 4,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 9,
  },
  // Total Section
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottom: "1 solid #000",
    fontWeight: "bold",
  },
  totalLabelCol: {
    width: "51%",
    padding: 6,
    textAlign: "center",
    borderRight: "1 solid #000",
    fontSize: 9,
  },
  totalQtyCol: {
    width: "8%",
    padding: 6,
    textAlign: "center",
    borderRight: "1 solid #000",
    fontSize: 9,
  },
  totalPriceCol: {
    width: "29%",
    padding: 6,
    textAlign: "right",
    borderRight: "1 solid #000",
    fontSize: 10,
  },
  totalFinalCol: {
    width: "12%",
    padding: 6,
    textAlign: "right",
    fontSize: 10,
  },
  // Amount in Words
  amountWordsRow: {
    borderBottom: "1 solid #000",
    padding: 6,
  },
  amountWordsLabel: {
    fontSize: 8,
    marginBottom: 2,
  },
  amountWords: {
    fontSize: 9,
    fontWeight: "bold",
  },
  // Footer Section
  footerRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  qrSection: {
    width: "30%",
    padding: 8,
    borderRight: "1 solid #000",
    alignItems: "center",
    justifyContent: "center",
  },
  qrImage: {
    width: 80,
    height: 80,
    marginBottom: 4,
  },
  qrLabel: {
    fontSize: 7,
    textAlign: "center",
  },
  taxBreakdownSection: {
    width: "40%",
    padding: 8,
    borderRight: "1 solid #000",
  },
  taxBreakdownRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
    fontSize: 7,
  },
  taxBreakdownLabel: {
    width: "40%",
    padding: 2,
    borderRight: "1 solid #000",
  },
  taxBreakdownValue: {
    width: "60%",
    textAlign: "right",
    padding: 2,
  },
  taxBreakdownCell: {
    padding: 2,
    borderRight: "1 solid #000",
  },
  bankDetailsSection: {
    width: "30%",
    padding: 8,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bankDetail: {
    fontSize: 7,
    marginBottom: 1,
  },
  // Declaration and Terms
  declarationRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  declarationSection: {
    width: "70%",
    padding: 8,
    borderRight: "1 solid #000",
  },
  signatureSection: {
    width: "30%",
    padding: 8,
    alignItems: "flex-end",
  },
  declarationTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 3,
  },
  declarationText: {
    fontSize: 7,
    marginBottom: 1,
  },
  termsTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 6,
    marginBottom: 3,
  },
  termText: {
    fontSize: 7,
    marginBottom: 1,
  },
  signatureLabel: {
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 20,
  },
  // Final Footer
  jurisdictionRow: {
    textAlign: "center",
    padding: 4,
    fontSize: 8,
    fontWeight: "bold",
    borderBottom: "1 solid #000",
  },
  computerGeneratedRow: {
    textAlign: "center",
    padding: 4,
    fontSize: 7,
  },
});

function PremiumTemplate({
  title = "Quotation",
  quotation,
  phases,
}: {
  title?: string;
  quotation: QuotationType;
  phases: PhaseType[];
}) {

  
  console.log("📄 PREMIUM QUOTATION DATA → ", quotation);
  console.log("📄 PREMIUM PHASES → ", phases);

  // Calculate totals
  const totalQty = quotation.items.reduce((sum, item) => sum + item.qty, 0);
  const subtotalBeforeTax = quotation.items.reduce(
    (sum, item) => sum + (item.qty * item.rate - item.discount),
    0
  );

  // Calculate tax components
  const cgstTotal = quotation.items.reduce((sum, item) => {
    return sum + (item.cgstAmount || 0);
  }, 0);
  const sgstTotal = quotation.items.reduce((sum, item) => {
    return sum + (item.sgstAmount || 0);
  }, 0);
  const igstTotal = quotation.items.reduce((sum, item) => {
    return sum + (item.igstAmount || 0);
  }, 0);

  const roundOffAmount = quotation?.roundOff
    ? Math.round(quotation.total) - quotation.total
    : 0;
  const finalTotal = quotation?.roundOff
    ? Math.round(quotation.total)
    : quotation?.total ? quotation.total : 0;

  // Convert number to words (simplified version)
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBorder}>
          {/* Header Title */}
          <View style={styles.headerTitle}>
            <Text>PROFORMA INVOICE</Text>
          </View>

          {/* Company Info with Logo */}
          <View style={styles.headerContent}>
            <View style={styles.logoSection}>
              <Image src="/venurtechLogo.png" style={styles.logo} />
            </View>
            <View style={styles.companySection}>
              <Text style={styles.companyName}>
                {quotation.business?.name || "VANURTECH MEDIA PVT. LTD."}
              </Text>
              <Text style={styles.companyTagline}>
                [ Deals in : Apps, CRMs, Website, MERN Stack ]
              </Text>
              <Text style={styles.companyAddress}>
                {quotation.business?.address || "Plot No 376, Gobindaprasad"}
              </Text>
              <Text style={styles.companyAddress}>
                Cuttack Road, G.G.P Colony
              </Text>
              <Text style={styles.companyAddress}>
                Khorda, Bhubaneswar, India, 751025
              </Text>
              <Text style={styles.companyAddress}>Odisha - 751025, India</Text>
              <Text style={styles.companyAddress}>
                GSTIN/UIN: {quotation.business?.gstin || "21AAJCV7420K1Z9"}
              </Text>
              <Text style={styles.companyAddress}>
                State Name : Odisha, Code : 21
              </Text>
              <Text style={styles.companyAddress}>
                Contact :{" "}
                {quotation.business?.contact || "7077004890,7978874959"}
              </Text>
              <Text style={styles.companyAddress}>
                E-Mail :{" "}
                {quotation.business?.email || "vanurtechmediaofficial@gmail.com"}
              </Text>
            </View>
          </View>

          {/* Buyer and Invoice Info */}
          <View style={styles.infoRow}>
            {/* Buyer Section */}
            <View style={styles.buyerSection}>
              <Text style={styles.buyerTitle}>Buyer (Bill to)</Text>
              <Text style={styles.buyerName}>{quotation.client.name}</Text>
              <Text style={styles.buyerDetail}>{quotation.client.address}</Text>
              <Text style={styles.buyerDetail}>
                GSTIN/UIN : {quotation.client.gstin}
              </Text>
              <Text style={styles.buyerDetail}>
                State Name : Odisha, Code : 21
              </Text>
              <Text style={styles.buyerDetail}>
                Contact person : {quotation.client.name}
              </Text>
              <Text style={styles.buyerDetail}>
                Contact : {quotation.client.contact}
              </Text>
              <Text style={styles.buyerDetail}>
                Email : {quotation.client.email}
              </Text>
            </View>

            {/* Invoice Details */}
            <View style={styles.invoiceSection}>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Invoice No.</Text>
                <Text style={styles.invoiceValue}>{quotation.number}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Dated</Text>
                <Text style={styles.invoiceValue}>
                  {new Date(quotation.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Mode/Terms of Payment</Text>
                <Text style={styles.invoiceValue}></Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Buyer's Order No.</Text>
                <Text style={styles.invoiceValue}></Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Dated</Text>
                <Text style={styles.invoiceValue}></Text>
              </View>
              <View style={[styles.invoiceRow, { borderBottom: 0 }]}>
                <Text style={styles.invoiceLabel}>Terms of Delivery</Text>
                <Text style={styles.invoiceValue}></Text>
              </View>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.slCol}>Sl No.</Text>
              <Text style={styles.descCol}>Description of Goods</Text>
              <Text style={styles.gstCol}>GST Rate</Text>
              <Text style={styles.qtyCol}>Quantity</Text>
              <Text style={styles.rateCol}>Rate (incl. of Tax)</Text>
              <Text style={styles.rateCol}>Rate</Text>
              <Text style={styles.qtyCol}>per</Text>
              <Text style={styles.amountCol}>Amount</Text>
            </View>

            {/* Table Rows */}
            {quotation.items.map((item, idx) => (
              <View style={styles.tableRow} key={idx}>
                <Text style={styles.slCol}>{idx + 1}</Text>
                <View style={styles.descCol}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  )}
                </View>
                <Text style={styles.gstCol}>{item.igst} %</Text>
                <Text style={styles.qtyCol}>
                  {item.qty} {item.unit}
                </Text>
                <Text style={styles.rateCol}>
                  {(item.rate * (1 + item.igst / 100)).toFixed(2)}
                </Text>
                <Text style={styles.rateCol}>{item.rate.toFixed(2)}</Text>
                <Text style={styles.qtyCol}>{item.unit}</Text>
                <Text style={styles.amountCol}>{item.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Tax Summary Rows */}
          <View style={styles.taxSummarySection}>
            {/* Empty Row for Subtotal */}
            <View style={styles.taxRow}>
              <Text style={styles.taxLabelCol}></Text>
              <Text style={styles.emptyCol}></Text>
              <Text style={styles.emptyCol}></Text>
              <Text style={styles.totalAmountCol}>
                {subtotalBeforeTax.toFixed(2)}
              </Text>
            </View>

            {/* CGST Row */}
            <View style={styles.taxRow}>
              <Text style={styles.taxLabelCol}>CGST 9 %</Text>
              <Text style={styles.emptyCol}></Text>
              <Text style={styles.taxValueCol}>9 %</Text>
              <Text style={styles.totalAmountCol}>{cgstTotal.toFixed(2)}</Text>
            </View>

            {/* SGST Row */}
            <View style={styles.taxRow}>
              <Text style={styles.taxLabelCol}>SGST 9 %</Text>
              <Text style={styles.emptyCol}></Text>
              <Text style={styles.taxValueCol}>9 %</Text>
              <Text style={styles.totalAmountCol}>{sgstTotal.toFixed(2)}</Text>
            </View>

            {/* Additional Tax Rows if needed */}
            <View style={styles.taxRow}>
              <Text style={styles.taxLabelCol}>CGST 2.5 %</Text>
              <Text style={styles.emptyCol}></Text>
              <Text style={styles.taxValueCol}>2.50 %</Text>
              <Text style={styles.totalAmountCol}>0.00</Text>
            </View>

            <View style={styles.taxRow}>
              <Text style={styles.taxLabelCol}>SGST 2.5 %</Text>
              <Text style={styles.emptyCol}></Text>
              <Text style={styles.taxValueCol}>2.50 %</Text>
              <Text style={styles.totalAmountCol}>0.00</Text>
            </View>

            {/* Round Off Row */}
            <View style={styles.taxRow}>
              <Text style={styles.taxLabelCol}>Less : Round Off</Text>
              <Text style={styles.emptyCol}></Text>
              <Text style={styles.emptyCol}></Text>
              <Text style={styles.totalAmountCol}>
                {roundOffAmount >= 0 ? "" : "(-)"}
                {Math.abs(roundOffAmount).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Total Row */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelCol}>Total</Text>
            <Text style={styles.totalQtyCol}>{totalQty} PCS</Text>
            <Text style={styles.totalPriceCol}></Text>
            <Text style={styles.totalFinalCol}>₹ {finalTotal.toFixed(2)}</Text>
          </View>

          {/* Amount in Words */}
          <View style={styles.amountWordsRow}>
            <Text style={styles.amountWordsLabel}>
              Amount Chargeable (in words)
            </Text>
            <Text style={styles.amountWords}>{amountInWords}</Text>
          </View>

          {/* Footer with QR, Tax Breakdown, and Bank Details */}
          <View style={styles.footerRow}>
            {/* QR Code Section */}
            <View style={styles.qrSection}>
              <Image src="/scanToPay.png" style={styles.qrImage} />
              <Text style={styles.qrLabel}>Scan to pay</Text>
            </View>

            {/* Tax Breakdown */}
            <View style={styles.taxBreakdownSection}>
              {/* Header Row 1 */}
              <View style={styles.taxBreakdownRow}>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", fontWeight: "bold" },
                  ]}
                >
                  Taxable
                </Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", fontWeight: "bold", textAlign: "center" },
                  ]}
                >
                  CGST
                </Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", fontWeight: "bold", textAlign: "center" },
                  ]}
                >
                  SGST/UTGST
                </Text>
                <Text
                  style={[
                    {
                      width: "25%",
                      fontWeight: "bold",
                      textAlign: "right",
                      padding: 2,
                    },
                  ]}
                >
                  Total
                </Text>
              </View>
              {/* Header Row 2 */}
              <View style={styles.taxBreakdownRow}>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", fontWeight: "bold" },
                  ]}
                >
                  Value
                </Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", fontWeight: "bold", textAlign: "center" },
                  ]}
                >
                  Rate
                </Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", fontWeight: "bold", textAlign: "center" },
                  ]}
                >
                  Rate
                </Text>
                <Text
                  style={[
                    {
                      width: "25%",
                      fontWeight: "bold",
                      textAlign: "right",
                      padding: 2,
                    },
                  ]}
                >
                  Tax Amount
                </Text>
              </View>

              {/* Sub Header Row */}
              <View style={styles.taxBreakdownRow}>
                <Text
                  style={[styles.taxBreakdownCell, { width: "25%" }]}
                ></Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", textAlign: "center" },
                  ]}
                >
                  Amount
                </Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", textAlign: "center" },
                  ]}
                >
                  Amount
                </Text>
                <Text
                  style={[{ width: "25%", textAlign: "right", padding: 2 }]}
                ></Text>
              </View>

              {/* Data Row - Rates */}
              <View style={styles.taxBreakdownRow}>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", textAlign: "left" },
                  ]}
                >
                  {subtotalBeforeTax.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", textAlign: "center" },
                  ]}
                >
                  9%
                </Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", textAlign: "center" },
                  ]}
                >
                  9%
                </Text>
                <Text
                  style={[{ width: "25%", textAlign: "right", padding: 2 }]}
                ></Text>
              </View>

              {/* Data Row - Amounts */}
              <View style={styles.taxBreakdownRow}>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", textAlign: "left" },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", textAlign: "center" },
                  ]}
                >
                  {cgstTotal.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", textAlign: "center" },
                  ]}
                >
                  {sgstTotal.toFixed(2)}
                </Text>
                <Text
                  style={[{ width: "25%", textAlign: "right", padding: 2 }]}
                ></Text>
              </View>

              {/* Total Label Row */}
              <View style={styles.taxBreakdownRow}>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", fontWeight: "bold" },
                  ]}
                >
                  Total:
                </Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", textAlign: "center" },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", textAlign: "center" },
                  ]}
                ></Text>
                <Text
                  style={[{ width: "25%", textAlign: "right", padding: 2 }]}
                ></Text>
              </View>

              {/* Total Values Row */}
              <View style={[styles.taxBreakdownRow, { borderBottom: 0 }]}>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", textAlign: "left", fontWeight: "bold" },
                  ]}
                >
                  {subtotalBeforeTax.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", textAlign: "center", fontWeight: "bold" },
                  ]}
                >
                  {cgstTotal.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.taxBreakdownCell,
                    { width: "25%", textAlign: "center", fontWeight: "bold" },
                  ]}
                >
                  {sgstTotal.toFixed(2)}
                </Text>
                <Text
                  style={[
                    {
                      width: "25%",
                      textAlign: "right",
                      padding: 2,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {(cgstTotal + sgstTotal).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Bank Details */}
            <View style={styles.bankDetailsSection}>
              <Text style={styles.sectionTitle}>
                Company's Bank Details A/C Holder's Name : VANURTECH MEDIA PVT.
                LTD.
              </Text>
              <Text style={styles.bankDetail}>Bank Name : ICICI Bank</Text>
              <Text style={styles.bankDetail}>A/c No. : 006105002368</Text>
              <Text style={styles.bankDetail}>
                Branch & IFS Code : Bhubaneswar & ICIC0000061
              </Text>
              <Text
                style={[
                  styles.bankDetail,
                  { fontWeight: "bold", marginTop: 4 },
                ]}
              >
                for VANURTECH MEDIA PVT. LTD.
              </Text>
            </View>
          </View>

          {/* Tax Amount in Words */}
          <View style={styles.amountWordsRow}>
            <Text style={styles.amountWordsLabel}>Tax Amount (in words) :</Text>
            <Text style={styles.amountWords}>
              INR {numberToWords(Math.floor(cgstTotal + sgstTotal))} paise Only
            </Text>
          </View>

          {/* Declaration and Signature */}
          <View style={styles.declarationRow}>
            <View style={styles.declarationSection}>
              <Text style={styles.declarationTitle}>Declaration</Text>
              <Text style={styles.declarationText}>
                We declare that this invoice shows the actual price of the
              </Text>
              <Text style={styles.declarationText}>
                services described and that all particulars are true and
                correct.
              </Text>
              <Text style={styles.termsTitle}>PAYMENT TERMS :-</Text>
              <Text style={styles.termText}>
                * Payment must be cleared within the same calendar month of
                invoice date.
              </Text>
              <Text style={styles.termText}>
                * Delay beyond this will attract interest @10% per day until
                payment.
              </Text>
            </View>
            <View style={styles.signatureSection}>
              <Text style={styles.signatureLabel}>Authorised Signatory</Text>
            </View>
          </View>

          {/* Jurisdiction */}
          <View style={styles.jurisdictionRow}>
            <Text>SUBJECT TO BHUBANESWAR JURISDICTION</Text>
          </View>

          {/* Computer Generated */}
          <View style={styles.computerGeneratedRow}>
            <Text>This is a Computer Generated Invoice</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default PremiumTemplate;
