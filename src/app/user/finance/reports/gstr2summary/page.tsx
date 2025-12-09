"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Download,
  FileText,
  Filter,
  Search,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  ChevronDown,
  Info,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data for GSTR-2 Summary
const gstr2Data = {
  reportPeriod: {
    month: "December",
    year: "2024",
    gstin: "29ABCDE1234F1Z5",
    legalName: "ABC Private Limited",
  },
  summary: {
    totalPurchases: 1850000.00,
    totalTaxableValue: 1666666.67,
    totalTax: {
      cgst: 85333.33,
      sgst: 85333.33,
      igst: 12000.00,
      cess: 0.00,
      total: 182666.66,
    },
    totalInvoices: 89,
    exemptPurchases: 12000.00,
    nilRatedPurchases: 5500.00,
    eligibleITC: 175000.00,
    claimedITC: 170000.00,
    reversedITC: 5000.00,
  },
  breakdownByTaxRate: [
    {
      rate: "18%",
      taxableValue: 1200000.00,
      cgst: 108000.00,
      sgst: 108000.00,
      igst: 0.00,
      invoices: 45,
    },
    {
      rate: "12%",
      taxableValue: 350000.00,
      cgst: 21000.00,
      sgst: 21000.00,
      igst: 0.00,
      invoices: 23,
    },
    {
      rate: "5%",
      taxableValue: 100000.00,
      cgst: 2500.00,
      sgst: 2500.00,
      igst: 0.00,
      invoices: 15,
    },
    {
      rate: "28%",
      taxableValue: 16666.67,
      cgst: 2333.33,
      sgst: 2333.33,
      igst: 0.00,
      invoices: 6,
    },
  ],
  sections: [
    {
      section: "B2B",
      description: "Business to Business Purchases",
      taxableValue: 1550000.00,
      totalTax: 279000.00,
      invoices: 76,
      suppliers: 23,
      itcEligible: 270000.00,
      itcClaimed: 265000.00,
    },
    {
      section: "B2BUR",
      description: "B2B - Unregistered Suppliers",
      taxableValue: 85000.00,
      totalTax: 15300.00,
      invoices: 8,
      suppliers: 6,
      itcEligible: 0.00,
      itcClaimed: 0.00,
    },
    {
      section: "IMP_G",
      description: "Import of Goods",
      taxableValue: 25000.00,
      totalTax: 4500.00,
      invoices: 3,
      suppliers: 2,
      itcEligible: 4500.00,
      itcClaimed: 4500.00,
    },
    {
      section: "IMP_S",
      description: "Import of Services",
      taxableValue: 6666.67,
      totalTax: 1200.00,
      invoices: 2,
      suppliers: 1,
      itcEligible: 1200.00,
      itcClaimed: 1200.00,
    },
  ],
  hsnsummary: [
    {
      hsnCode: "8517",
      description: "Telephone sets & communication equipment",
      quantity: 800,
      uqc: "NOS",
      taxableValue: 900000.00,
      totalTax: 162000.00,
      rate: "18%",
      itcEligible: 155000.00,
      itcClaimed: 150000.00,
    },
    {
      hsnCode: "8471",
      description: "Automatic data processing machines",
      quantity: 45,
      uqc: "NOS",
      taxableValue: 350000.00,
      totalTax: 63000.00,
      rate: "18%",
      itcEligible: 60000.00,
      itcClaimed: 58000.00,
    },
    {
      hsnCode: "8528",
      description: "Monitors and projectors",
      quantity: 120,
      uqc: "NOS",
      taxableValue: 250000.00,
      totalTax: 30000.00,
      rate: "12%",
      itcEligible: 28000.00,
      itcClaimed: 28000.00,
    },
    {
      hsnCode: "8443",
      description: "Printing machinery",
      quantity: 15,
      uqc: "NOS",
      taxableValue: 66666.67,
      totalTax: 18666.67,
      rate: "28%",
      itcEligible: 18000.00,
      itcClaimed: 15000.00,
    },
  ],
  itcSummary: {
    openingBalance: 25000.00,
    itcAvailed: 170000.00,
    itcUtilized: 165000.00,
    itcReversed: 5000.00,
    closingBalance: 25000.00,
    itcIneligible: 7000.00,
    itcPending: 2000.00,
  },
  complianceStatus: {
    filingStatus: "Not Filed",
    dueDate: "2025-01-20",
    daysRemaining: 27,
    lastFiled: "2024-11-20",
    penalties: 0,
    notices: 0,
    reconciliationStatus: "Pending",
    mismatchedInvoices: 3,
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export default function GSTR2SummaryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("December 2024");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredHSNData = useMemo(() => {
    return gstr2Data.hsnsummary.filter(item =>
      item.hsnCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case "Filed":
        return "text-green-600 bg-green-50 border-green-200";
      case "Not Filed":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "Overdue":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case "Filed":
        return <CheckCircle className="w-4 h-4" />;
      case "Not Filed":
        return <AlertCircle className="w-4 h-4" />;
      case "Overdue":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GSTR-2 Summary Report</h1>
          <p className="text-gray-600 mt-1">
            Inward supplies and ITC summary for {gstr2Data.reportPeriod.month} {gstr2Data.reportPeriod.year}
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
            Generate GSTR-2
          </Button>
        </div>
      </div>

      {/* Business Information */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">GSTIN</label>
            <p className="text-lg font-semibold">{gstr2Data.reportPeriod.gstin}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Legal Name</label>
            <p className="text-lg font-semibold">{gstr2Data.reportPeriod.legalName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Return Period</label>
            <p className="text-lg font-semibold">{gstr2Data.reportPeriod.month} {gstr2Data.reportPeriod.year}</p>
          </div>
        </div>
      </Card>

      {/* Compliance Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Compliance Status</h2>
          <div className="flex gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getComplianceStatusColor(gstr2Data.complianceStatus.filingStatus)}`}>
              {getComplianceIcon(gstr2Data.complianceStatus.filingStatus)}
              {gstr2Data.complianceStatus.filingStatus}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium border bg-blue-50 text-blue-600 border-blue-200">
              Reconciliation: {gstr2Data.complianceStatus.reconciliationStatus}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Due Date</label>
            <p className="text-lg font-semibold">{gstr2Data.complianceStatus.dueDate}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Days Remaining</label>
            <p className="text-lg font-semibold text-orange-600">{gstr2Data.complianceStatus.daysRemaining} days</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Filed</label>
            <p className="text-lg font-semibold">{gstr2Data.complianceStatus.lastFiled}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Mismatched Invoices</label>
            <p className="text-lg font-semibold text-red-600">{gstr2Data.complianceStatus.mismatchedInvoices}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Pending Notices</label>
            <p className="text-lg font-semibold">{gstr2Data.complianceStatus.notices}</p>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Purchases</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(gstr2Data.summary.totalPurchases)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">8.3% from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tax</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(gstr2Data.summary.totalTax.total)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">5.7% from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">ITC Claimed</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(gstr2Data.summary.claimedITC)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-red-500">2.1% from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold text-orange-600">{formatNumber(gstr2Data.summary.totalInvoices)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">12.4% from last month</span>
          </div>
        </Card>
      </div>

      {/* ITC Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Input Tax Credit (ITC) Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-600">Opening Balance</p>
            <p className="text-lg font-bold text-blue-800">{formatCurrency(gstr2Data.itcSummary.openingBalance)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-600">ITC Availed</p>
            <p className="text-lg font-bold text-green-800">{formatCurrency(gstr2Data.itcSummary.itcAvailed)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-purple-600">ITC Utilized</p>
            <p className="text-lg font-bold text-purple-800">{formatCurrency(gstr2Data.itcSummary.itcUtilized)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-red-600">ITC Reversed</p>
            <p className="text-lg font-bold text-red-800">{formatCurrency(gstr2Data.itcSummary.itcReversed)}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-orange-600">ITC Ineligible</p>
            <p className="text-lg font-bold text-orange-800">{formatCurrency(gstr2Data.itcSummary.itcIneligible)}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-yellow-600">ITC Pending</p>
            <p className="text-lg font-bold text-yellow-800">{formatCurrency(gstr2Data.itcSummary.itcPending)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Closing Balance</p>
            <p className="text-lg font-bold text-gray-800">{formatCurrency(gstr2Data.itcSummary.closingBalance)}</p>
          </div>
        </div>
      </Card>

      {/* Tax Breakdown by Rate */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Tax Rate-wise Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold">Tax Rate</th>
                <th className="text-right p-3 font-semibold">Taxable Value</th>
                <th className="text-right p-3 font-semibold">CGST</th>
                <th className="text-right p-3 font-semibold">SGST</th>
                <th className="text-right p-3 font-semibold">IGST</th>
                <th className="text-right p-3 font-semibold">Total Tax</th>
                <th className="text-right p-3 font-semibold">Invoices</th>
              </tr>
            </thead>
            <tbody>
              {gstr2Data.breakdownByTaxRate.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{item.rate}</td>
                  <td className="p-3 text-right">{formatCurrency(item.taxableValue)}</td>
                  <td className="p-3 text-right">{formatCurrency(item.cgst)}</td>
                  <td className="p-3 text-right">{formatCurrency(item.sgst)}</td>
                  <td className="p-3 text-right">{formatCurrency(item.igst)}</td>
                  <td className="p-3 text-right font-semibold">{formatCurrency(item.cgst + item.sgst + item.igst)}</td>
                  <td className="p-3 text-right">{formatNumber(item.invoices)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 bg-gray-100 font-semibold">
                <td className="p-3">Total</td>
                <td className="p-3 text-right">{formatCurrency(gstr2Data.summary.totalTaxableValue)}</td>
                <td className="p-3 text-right">{formatCurrency(gstr2Data.summary.totalTax.cgst)}</td>
                <td className="p-3 text-right">{formatCurrency(gstr2Data.summary.totalTax.sgst)}</td>
                <td className="p-3 text-right">{formatCurrency(gstr2Data.summary.totalTax.igst)}</td>
                <td className="p-3 text-right">{formatCurrency(gstr2Data.summary.totalTax.total)}</td>
                <td className="p-3 text-right">{formatNumber(gstr2Data.summary.totalInvoices)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Section-wise Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Section-wise Summary</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {gstr2Data.sections.map((section, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{section.section}</h3>
                <span className="text-sm text-gray-500">{formatNumber(section.invoices)} invoices</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{section.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Taxable Value:</span>
                    <span className="font-medium text-sm">{formatCurrency(section.taxableValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Tax:</span>
                    <span className="font-medium text-sm">{formatCurrency(section.totalTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Suppliers:</span>
                    <span className="font-medium text-sm">{formatNumber(section.suppliers)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">ITC Eligible:</span>
                    <span className="font-medium text-sm">{formatCurrency(section.itcEligible)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">ITC Claimed:</span>
                    <span className="font-medium text-sm">{formatCurrency(section.itcClaimed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">ITC %:</span>
                    <span className="font-medium text-sm">
                      {section.itcEligible > 0 ? Math.round((section.itcClaimed / section.itcEligible) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* HSN Summary */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold">HSN-wise Summary</h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search HSN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export HSN
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold">HSN Code</th>
                <th className="text-left p-3 font-semibold">Description</th>
                <th className="text-right p-3 font-semibold">Quantity</th>
                <th className="text-center p-3 font-semibold">UQC</th>
                <th className="text-right p-3 font-semibold">Taxable Value</th>
                <th className="text-center p-3 font-semibold">Tax Rate</th>
                <th className="text-right p-3 font-semibold">Total Tax</th>
                <th className="text-right p-3 font-semibold">ITC Eligible</th>
                <th className="text-right p-3 font-semibold">ITC Claimed</th>
              </tr>
            </thead>
            <tbody>
              {filteredHSNData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{item.hsnCode}</td>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3 text-right">{formatNumber(item.quantity)}</td>
                  <td className="p-3 text-center">{item.uqc}</td>
                  <td className="p-3 text-right">{formatCurrency(item.taxableValue)}</td>
                  <td className="p-3 text-center">{item.rate}</td>
                  <td className="p-3 text-right font-semibold">{formatCurrency(item.totalTax)}</td>
                  <td className="p-3 text-right">{formatCurrency(item.itcEligible)}</td>
                  <td className="p-3 text-right">{formatCurrency(item.itcClaimed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
