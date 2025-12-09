import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export interface PaymentReceiptType {
  receiptNo: string;
  date: string;
  paymentType: string;
  client: {
    name: string;
    gstin: string;
    address: string;
    contact: string;
    email: string;
  };
  paymentRecords: Array<{
    paymentMethod: string;
    depositedTo: string;
    amountReceived: number;
    referenceId?: string;
    notes?: string;
  }>;
  allocations: Array<{
    invoiceId: string;
    amount: number;
  }>;
  totalAmount: number;
  notes: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#fff",
  },
  // Header
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #2563eb",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 8,
  },
  receiptInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  receiptNo: {
    fontSize: 11,
    color: "#374151",
  },
  date: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "bold",
  },
  // Client Section
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  clientBox: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 4,
    border: "1 solid #d1d5db",
  },
  clientName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  clientDetail: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  // Table
  table: {
    marginTop: 10,
    border: "1 solid #d1d5db",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottom: "1 solid #d1d5db",
    padding: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e5e7eb",
    padding: 8,
  },
  tableCell: {
    fontSize: 9,
    color: "#111827",
  },
  // Summary Box
  summaryBox: {
    marginTop: 20,
    backgroundColor: "#eff6ff",
    border: "2 solid #2563eb",
    borderRadius: 6,
    padding: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563eb",
  },
  badge: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "6 12",
    borderRadius: 12,
    fontSize: 10,
    fontWeight: "bold",
  },
  // Notes
  notesBox: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
  },
  notesText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1 solid #e5e7eb",
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

interface Props {
  receipt: PaymentReceiptType;
}

export default function PaymentReceiptTemplate({ receipt }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PAYMENT RECEIPT</Text>
          <View style={styles.receiptInfo}>
            <Text style={styles.receiptNo}>
              Receipt No: {receipt.receiptNo}
            </Text>
            <Text style={styles.date}>
              Date: {new Date(receipt.date).toLocaleDateString("en-IN")}
            </Text>
          </View>
        </View>

        {/* Client Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Received From</Text>
          <View style={styles.clientBox}>
            <Text style={styles.clientName}>{receipt.client.name}</Text>
            {receipt.client.email && (
              <Text style={styles.clientDetail}>
                Email: {receipt.client.email}
              </Text>
            )}
            {receipt.client.contact && (
              <Text style={styles.clientDetail}>
                Phone: {receipt.client.contact}
              </Text>
            )}
            {receipt.client.gstin && (
              <Text style={styles.clientDetail}>
                GSTIN: {receipt.client.gstin}
              </Text>
            )}
            {receipt.client.address && (
              <Text style={styles.clientDetail}>
                Address: {receipt.client.address}
              </Text>
            )}
          </View>
        </View>

        {/* Payment Details Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "40%" }]}>
                Payment Method
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "30%" }]}>
                Reference
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: "30%", textAlign: "right" },
                ]}
              >
                Amount
              </Text>
            </View>
            {receipt.paymentRecords.map((record, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={{ width: "40%" }}>
                  <Text style={styles.tableCell}>{record.paymentMethod}</Text>
                  {record.depositedTo && (
                    <Text
                      style={[
                        styles.tableCell,
                        { fontSize: 8, color: "#6b7280", marginTop: 2 },
                      ]}
                    >
                      to {record.depositedTo}
                    </Text>
                  )}
                </View>
                <Text style={[styles.tableCell, { width: "30%" }]}>
                  {record.referenceId || "-"}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: "30%", textAlign: "right", fontWeight: "bold" },
                  ]}
                >
                  ₹{record.amountReceived.toLocaleString("en-IN")}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total Amount Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Total Amount Received</Text>
              <Text style={styles.summaryAmount}>
                ₹{receipt.totalAmount.toLocaleString("en-IN")}
              </Text>
            </View>
            <Text style={styles.badge}>{receipt.paymentType}</Text>
          </View>
        </View>

        {/* Invoice Allocations */}
        {receipt.allocations && receipt.allocations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Applied To Invoices</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: "60%" }]}>
                  Invoice ID
                </Text>
                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: "40%", textAlign: "right" },
                  ]}
                >
                  Amount Applied
                </Text>
              </View>
              {receipt.allocations.map((allocation, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: "60%" }]}>
                    {allocation.invoiceId}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { width: "40%", textAlign: "right" },
                    ]}
                  >
                    ₹{allocation.amount.toLocaleString("en-IN")}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        {receipt.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{receipt.notes}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is a computer-generated receipt and does not require a
            signature.
          </Text>
          <Text style={[styles.footerText, { marginTop: 4 }]}>
            Generated on {new Date().toLocaleDateString("en-IN")} at{" "}
            {new Date().toLocaleTimeString("en-IN")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
