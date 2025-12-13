"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  FiTrendingUp,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiFileText,
} from "react-icons/fi";

interface PaymentMadeStatsProps {
  stats: {
    totalPayments?: number;
    totalAmount?: number;
    totalTdsDeducted?: number;
    totalTransactionCharges?: number;
    paymentMethodBreakdown?: {
      method: string;
      count: number;
      amount: number;
    }[];
  };
  loading?: boolean;
  onStatClick?: (filterType: "all" | "payment" | "advance") => void;
}

const PaymentMadeStats: React.FC<PaymentMadeStatsProps> = ({
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
                Total Payments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalPayments || 0}
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

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">TDS Deducted</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalTdsDeducted || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tax deductions
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Transaction Charges
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalTransactionCharges || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Total charges
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-red-600" />
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
                  stats.totalPayments && stats.totalPayments > 0
                    ? (stats.totalAmount || 0) / stats.totalPayments
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
              <p className="text-sm font-medium text-gray-600">Net Payment</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(
                  (stats.totalAmount || 0) -
                    (stats.totalTdsDeducted || 0) -
                    (stats.totalTransactionCharges || 0)
                )}
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
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(stats.totalAmount || 0)}
              </p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FiDollarSign className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      {stats.paymentMethodBreakdown && stats.paymentMethodBreakdown.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Method Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stats.paymentMethodBreakdown.map((method, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="text-xs font-medium text-gray-600 uppercase">
                  {method.method || "Unknown"}
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {method.count || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(method.amount || 0)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PaymentMadeStats;
