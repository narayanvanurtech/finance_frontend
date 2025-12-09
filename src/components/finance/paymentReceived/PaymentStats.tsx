"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  FiTrendingUp,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiCreditCard,
  FiFileText,
} from "react-icons/fi";

interface PaymentStatsProps {
  stats: {
    totalReceipts?: number;
    totalAmount?: number;
    totalInvoicePayments?: number;
    totalReceiptAmount?: number;
    totalAdvancePayments?: number;
    totalAdvanceAmount?: number;
  };
  loading?: boolean;
  onStatClick?: (
    filterType: "all" | "invoice" | "advance"
  ) => void;
}

const PaymentStats: React.FC<PaymentStatsProps> = ({
  stats,
  loading,
  onStatClick,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("all")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Receipts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalReceipts || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(stats.totalAmount || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiFileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("invoice")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Invoice Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalInvoicePayments || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(stats.totalReceiptAmount || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("advance")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Advance Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalAdvancePayments || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(stats.totalAdvanceAmount || 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Average Payment
              </p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(
                  stats.totalReceipts && stats.totalReceipts > 0
                    ? (stats.totalAmount || 0) / stats.totalReceipts
                    : 0
                )}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiDollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Invoice Rate</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalReceipts && stats.totalReceipts > 0
                  ? Math.round(
                      ((stats.totalInvoicePayments || 0) / stats.totalReceipts) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FiTrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(stats.totalAmount || 0)}
              </p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FiCreditCard className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentStats;
