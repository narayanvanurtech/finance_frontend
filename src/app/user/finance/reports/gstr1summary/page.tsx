"use client";

import React, { useState } from "react";
import {
  Calendar,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data for GSTR-1 Summary
const gstr1SummaryData = [
  {
    description: "Taxable outward supplies made to registered persons (including UIN-holders)",
    igstAmount: 0.00,
    cgstAmount: 0.00,
    sgstAmount: 0.00,
    taxableAmount: 0.00,
  },
  {
    description: "Taxable outward inter-State supplies to un-registered persons where the invoice value is more than Rs 1 lakh",
    igstAmount: 0.00,
    cgstAmount: 0.00,
    sgstAmount: 0.00,
    taxableAmount: 0.00,
  },
  {
    description: "Taxable outward supplies to consumer",
    igstAmount: 0.00,
    cgstAmount: 0.00,
    sgstAmount: 0.00,
    taxableAmount: 0.00,
  },
  {
    description: "Zero rated supplies and Deemed Exports",
    igstAmount: 0.00,
    cgstAmount: 0.00,
    sgstAmount: 0.00,
    taxableAmount: 0.00,
  },
  {
    description: "Nil rated, Exempted and non GST outward supplies",
    igstAmount: 0.00,
    cgstAmount: 0.00,
    sgstAmount: 0.00,
    taxableAmount: 0.00,
  },
  {
    description: "HSN-wise summary of outward supplies",
    igstAmount: 0.00,
    cgstAmount: 0.00,
    sgstAmount: 0.00,
    taxableAmount: 0.00,
  },
  {
    description: "Details of Credit Notes/Debit Notes and Refund Vouchers",
    igstAmount: 0.00,
    cgstAmount: 0.00,
    sgstAmount: 0.00,
    taxableAmount: 0.00,
  },
  {
    description: "Details of Credit Notes/Debit Notes and Refund Vouchers (Unregistered)",
    igstAmount: 0.00,
    cgstAmount: 0.00,
    sgstAmount: 0.00,
    taxableAmount: 0.00,
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function GSTR1SummaryPage() {
  const [fromDate, setFromDate] = useState("2024-12-01");
  const [toDate, setToDate] = useState("2024-12-31");

  // Calculate totals
  const totals = gstr1SummaryData.reduce(
    (acc, item) => ({
      igstAmount: acc.igstAmount + item.igstAmount,
      cgstAmount: acc.cgstAmount + item.cgstAmount,
      sgstAmount: acc.sgstAmount + item.sgstAmount,
      taxableAmount: acc.taxableAmount + item.taxableAmount,
    }),
    { igstAmount: 0, cgstAmount: 0, sgstAmount: 0, taxableAmount: 0 }
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GSTR-1 Summary Report</h1>
          <p className="text-gray-600 mt-1">
            Outward supplies summary report
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generate GSTR-1
          </Button>
        </div>
      </div>

      {/* Date Range Selection */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reporting Period
            </label>
            <div className="flex gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <Button className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Apply Filter
          </Button>
        </div>
      </Card>

      {/* GSTR-1 Summary Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">GSTR-1 Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-semibold">Description</th>
                <th className="text-right p-4 font-semibold">IGST Amount</th>
                <th className="text-right p-4 font-semibold">CGST Amount</th>
                <th className="text-right p-4 font-semibold">SGST Amount</th>
                <th className="text-right p-4 font-semibold">Taxable Amount</th>
              </tr>
            </thead>
            <tbody>
              {gstr1SummaryData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{item.description}</td>
                  <td className="p-4 text-right">{formatCurrency(item.igstAmount)}</td>
                  <td className="p-4 text-right">{formatCurrency(item.cgstAmount)}</td>
                  <td className="p-4 text-right">{formatCurrency(item.sgstAmount)}</td>
                  <td className="p-4 text-right">{formatCurrency(item.taxableAmount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 bg-gray-100 font-semibold">
                <td className="p-4">Total</td>
                <td className="p-4 text-right">{formatCurrency(totals.igstAmount)}</td>
                <td className="p-4 text-right">{formatCurrency(totals.cgstAmount)}</td>
                <td className="p-4 text-right">{formatCurrency(totals.sgstAmount)}</td>
                <td className="p-4 text-right">{formatCurrency(totals.taxableAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
