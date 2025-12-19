"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  FiTrendingUp,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiCreditCard,
} from "react-icons/fi";
import { useGetPaymentBreakdown } from "@/hooks/usePaymentMadeQueries";

interface PaymentMadeStatsProps {
  stats: {
    _id?: null;
    totalReceipts?: number;
    totalAmountPaid?: number;
    totalTdsDeducted?: number;
    totalTransactionCharges?: number;
    advancePayments?: number;
    settlementPayments?: number;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-xs text-gray-500 mt-1">All payment receipts</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiFileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Amount Paid
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalAmountPaid || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total payments made</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-green-600" />
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
              <p className="text-xs text-gray-500 mt-1">Tax deductions</p>
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
              <p className="text-xs text-gray-500 mt-1">Total charges</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Type Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("advance")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Advance Payments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.advancePayments || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Payments in advance</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiClock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("payment")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Settlement Payments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.settlementPayments || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Settled payments</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Payment</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  (stats.totalAmountPaid || 0) -
                    (stats.totalTdsDeducted || 0) -
                    (stats.totalTransactionCharges || 0)
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">After deductions</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <PaymentMethodBreakdown />
    </div>
  );
};

// Payment Method Breakdown Component
const PaymentMethodBreakdown: React.FC = () => {
  const { data: breakdownData, isLoading } = useGetPaymentBreakdown();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Method Breakdown
        </h3>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const breakdown = breakdownData?.result || [];

  if (breakdown.length === 0) {
    return null;
  }

  // Payment method icons and colors
  const getMethodIcon = (method: string) => {
    const icons: Record<string, any> = {
      "Bank Transfer": { icon: FiDollarSign, color: "blue" },
      Cash: { icon: FiDollarSign, color: "green" },
      Cheque: { icon: FiFileText, color: "purple" },
      UPI: { icon: FiCreditCard, color: "orange" },
      "Credit Card": { icon: FiCreditCard, color: "red" },
      "Debit Card": { icon: FiCreditCard, color: "indigo" },
      "NEFT/RTGS": { icon: FiDollarSign, color: "teal" },
      IMPS: { icon: FiDollarSign, color: "pink" },
      "Net Banking": { icon: FiDollarSign, color: "cyan" },
    };
    return icons[method] || { icon: FiDollarSign, color: "gray" };
  };

  const totalAmount = breakdown.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Payment Method Breakdown
        </h3>
        <span className="text-sm text-gray-500">
          Total: {formatCurrency(totalAmount)}
        </span>
      </div>

      <div className="space-y-3">
        {breakdown.map((item, index) => {
          const { icon: Icon, color } = getMethodIcon(item.paymentMethod);
          const percentage =
            totalAmount > 0 ? (item.totalAmount / totalAmount) * 100 : 0;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-${color}-100 rounded-lg`}>
                    <Icon className={`w-4 h-4 text-${color}-600`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.paymentMethod}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.count} payments
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PaymentMadeStats;
