"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  useGetPayoutReceiptStats,
  useGetPaymentBreakdown,
} from "@/hooks/usePaymentMadeQueries";
import { PayoutReceiptStats } from "@/api/finance/paymentMadeApi";
import {
  FiTrendingUp,
  FiDollarSign,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiPieChart,
  FiBarChart2,
  FiCalendar,
} from "react-icons/fi";
import { Input } from "@/components/ui/input";

export default function PaymentsMadeAnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetPayoutReceiptStats(
    dateRange.startDate && dateRange.endDate ? dateRange : undefined
  );

  const {
    data: breakdownData,
    isLoading: breakdownLoading,
    refetch: refetchBreakdown,
  } = useGetPaymentBreakdown(
    dateRange.startDate && dateRange.endDate ? dateRange : undefined
  );

  const stats: PayoutReceiptStats = statsData?.result || {
    _id: null,
    totalReceipts: 0,
    totalAmountPaid: 0,
    totalGrossAmount: 0,
    totalTdsDeducted: 0,
    totalTransactionCharges: 0,
    totalAllocatedAmount: 0,
    advancePayments: 0,
    advancePaymentsCount: 0,
    settlementPayments: 0,
    settlementPaymentsCount: 0,
  };
  const breakdown = breakdownData?.result || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    refetchStats();
    refetchBreakdown();
  };

  const handleClearFilters = () => {
    setDateRange({ startDate: "", endDate: "" });
    setTimeout(() => {
      refetchStats();
      refetchBreakdown();
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Payments Made Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your payment transactions
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiCalendar className="inline w-4 h-4 mr-1" />
              Start Date
            </label>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiCalendar className="inline w-4 h-4 mr-1" />
              End Date
            </label>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
            />
          </div>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Apply
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Clear
          </button>
        </div>
      </Card>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Main Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Receipts */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiFileText className="w-6 h-6 text-blue-600" />
                </div>
                <FiTrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Receipts
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalReceipts || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Payment transactions</p>
            </Card>

            {/* Gross Amount */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-green-600" />
                </div>
                <FiBarChart2 className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Gross Amount
              </p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(
                  stats.totalGrossAmount || stats.totalAmountPaid || 0
                )}
              </p>
              <p className="text-xs text-gray-500 mt-2">Total before deductions</p>
            </Card>

            {/* Amount Paid (Net) */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <FiPieChart className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Net Amount Paid
              </p>
              <p className="text-3xl font-bold text-emerald-600">
                {formatCurrency(stats.totalAmountPaid || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">After all deductions</p>
            </Card>

            {/* Allocated Amount */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiCreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <FiBarChart2 className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Allocated Amount
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(stats.totalAllocatedAmount || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">To purchase orders</p>
            </Card>
          </div>

          {/* Payment Type Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Advance Payments */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-yellow-600" />
                  Advance Payments
                </h3>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {stats.advancePaymentsCount || 0} payments
                </span>
              </div>
              <p className="text-4xl font-bold text-yellow-600 mb-2">
                {formatCurrency(stats.advancePayments || 0)}
              </p>
              <p className="text-sm text-gray-600">
                Payments made in advance without invoice allocation
              </p>
            </Card>

            {/* Settlement Payments */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                  Settlement Payments
                </h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {stats.settlementPaymentsCount || 0} payments
                </span>
              </div>
              <p className="text-4xl font-bold text-green-600 mb-2">
                {formatCurrency(stats.settlementPayments || 0)}
              </p>
              <p className="text-sm text-gray-600">
                Payments allocated against specific purchase orders
              </p>
            </Card>
          </div>

          {/* Deductions & Charges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TDS Deducted */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <FiFileText className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                TDS Deducted
              </p>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(stats.totalTdsDeducted || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Tax Deducted at Source
              </p>
            </Card>

            {/* Transaction Charges */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FiCreditCard className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Transaction Charges
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(stats.totalTransactionCharges || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Bank and payment gateway fees
              </p>
            </Card>
          </div>

          {/* Payment Method Breakdown */}
          {!breakdownLoading && breakdown.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiPieChart className="w-6 h-6 text-blue-600" />
                Payment Method Breakdown
              </h3>

              <div className="space-y-4">
                {breakdown.map((item, index) => {
                  const totalAmount = breakdown.reduce(
                    (sum, b) => sum + b.totalAmount,
                    0
                  );
                  const percentage =
                    totalAmount > 0 ? (item.totalAmount / totalAmount) * 100 : 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                            <FiCreditCard className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.paymentMethod}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.count} transaction{item.count > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-lg">
                            {formatCurrency(item.totalAmount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-900">
                    Total Across All Methods
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(
                      breakdown.reduce((sum, item) => sum + item.totalAmount, 0)
                    )}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
