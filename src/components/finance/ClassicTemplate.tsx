"use client";
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// ---------- PAYMENT RECEIPT TEMPLATE ----------
const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  companyInfo: { flex: 1 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  box: {
    border: "1 solid #ddd",
    padding: 10,
    borderRadius: 4,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
  table: {
    width: "100%",
    border: "1 solid #ddd",
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #ddd",
  },
  col: { padding: 6, flexGrow: 1 },
  colSmall: { padding: 6, width: "25%" },
  valueBold: { fontFamily: "Helvetica-Bold" },
  summaryBox: {
    alignSelf: "flex-end",
    width: 220,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 4,
    marginTop: 10,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
});

// ---------- COMPONENT ----------
const ClassicPaymentReceipt = ({ receipt }: any) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={styles.companyInfo}>
            <Text style={styles.title}>PAYMENT RECEIPT</Text>
            <Text>
              Receipt No:{" "}
              <Text style={styles.valueBold}>{receipt?.receiptNo}</Text>
            </Text>
            <Text>
              Date: <Text style={styles.valueBold}>{receipt?.date}</Text>
            </Text>
          </View>
        </View>

        {/* CLIENT SECTION */}
        <View style={styles.box}>
          <Text style={styles.sectionTitle}>Received From</Text>
          <Text>
            Name: <Text style={styles.valueBold}>{receipt?.client.name}</Text>
          </Text>
          {receipt?.client.address && (
            <Text>Address: {receipt?.client.address}</Text>
          )}
          {receipt?.client.email && <Text>Email: {receipt?.client.email}</Text>}
          {receipt?.client.contact && (
            <Text>Phone: {receipt?.client.contact}</Text>
          )}
          {receipt?.client.gstin && <Text>GSTIN: {receipt?.client.gstin}</Text>}
        </View>

        {/* PAYMENT RECORDS TABLE */}
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.table}>
          <View style={[styles.row, { backgroundColor: "#f3f3f3" }]}>
            <Text style={styles.colSmall}>Mode</Text>
            <Text style={styles.colSmall}>Reference</Text>
            <Text style={styles.colSmall}>Notes</Text>
            <Text style={styles.colSmall}>Amount ₹</Text>
          </View>
          {receipt?.paymentRecords?.map((p: any, i: number) => (
            <View style={styles.row} key={i}>
              <Text style={styles.colSmall}>{p.paymentMethod}</Text>
              <Text style={styles.colSmall}>{p.referenceId || "-"}</Text>
              <Text style={styles.colSmall}>{p.notes || "-"}</Text>
              <Text style={styles.colSmall}>
                {Number(p.amountReceived).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* ALLOCATIONS IF AVAILABLE */}
        {receipt?.allocations?.length > 0 && (
          <>
            <Text style={{ ...styles.sectionTitle, marginTop: 12 }}>
              Invoice Allocation
            </Text>
            <View style={styles.table}>
              <View style={[styles.row, { backgroundColor: "#f3f3f3" }]}>
                <Text style={styles.col}>Invoice ID</Text>
                <Text style={styles.colSmall}>Allocated ₹</Text>
              </View>
              {receipt?.allocations.map((a: any, i: number) => (
                <View style={styles.row} key={i}>
                  <Text style={styles.col}>{a.invoiceId}</Text>
                  <Text style={styles.colSmall}>
                    {Number(a.allocatedAmount || 0).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* SUMMARY TOTAL */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text>Total Received</Text>
            <Text style={styles.valueBold}>
              ₹{receipt?.totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* NOTES */}
        {receipt?.notes && (
          <View style={[styles.box, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>{receipt?.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ClassicPaymentReceipt;
