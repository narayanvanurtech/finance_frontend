"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  FiTrendingUp,
  FiFileText,
  FiCheckCircle,
  FiDollarSign,
  FiPercent,
  FiArrowRight,
  FiCreditCard,
} from "react-icons/fi";

interface PerformaInvoiceStatsProps {
  stats: {
    totalInvoices?: number;
    statusBreakdown?: Array<{
      _id?: string;
      count?: number;
      totalValue?: number;
    }>;
    totalRevenue?: number;
    acceptanceRate?: number;
    conversionRate?: number;
    paymentRate?: number;
    totalPaymentReceived?: number;
    period?: string;
  };
  loading?: boolean;
}

const PerformaInvoiceStats: React.FC<PerformaInvoiceStatsProps> = ({
  stats,
  loading,
}) => {
  //console.log("🎨 PerformaInvoiceStats Component - Received stats:", stats);
  //console.log("🎨 totalInvoices value:", stats?.totalInvoices);

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

  // Calculate total from status breakdown for display
  const totalValue = stats?.totalRevenue || 
    (stats?.statusBreakdown?.reduce((sum, item) => sum + (item.totalValue || 0), 0) || 0);

  // Format status name for display
  const formatStatusName = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Proforma Invoices
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalInvoices || 0}
              </p>
              {stats?.period && (
                <p className="text-xs text-gray-500 mt-1">
                  Last {stats.period}
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiFileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹
                {totalValue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Acceptance Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats?.acceptanceRate || 0).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats?.conversionRate || 0).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FiArrowRight className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Payment Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats?.paymentRate || 0).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiPercent className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Payment Received
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₹
                {(stats?.totalPaymentReceived || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <FiCreditCard className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Outstanding Amount
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₹
                {(totalValue - (stats?.totalPaymentReceived || 0)).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Status Breakdown */}
      {stats?.statusBreakdown && stats.statusBreakdown.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.statusBreakdown.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    {formatStatusName(item._id || "Unknown")}
                  </p>
                  <span className="text-sm font-bold text-gray-900">
                    {item.count || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Value: ₹
                  {(item.totalValue || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PerformaInvoiceStats;
