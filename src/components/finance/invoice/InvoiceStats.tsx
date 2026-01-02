"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  FiTrendingUp,
  FiFileText,
  FiCheckCircle,
  FiDollarSign,
  FiAlertCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";

interface InvoiceStatsProps {
  stats: {
    totalInvoices?: number;
    statusBreakdown?: Array<{
      status?: string;
      count?: number;
      percentage?: number;
    }>;
    totalRevenue?: number;
    paidAmount?: number;
    pendingAmount?: number;
    overdueInvoices?: number;
    overdueAmount?: number;
    period?: string;
  };
  loading?: boolean;
}

const InvoiceStats: React.FC<InvoiceStatsProps> = ({ stats, loading }) => {
  // Show overdue card if the fields are defined (even if 0)
  const hasOverdueData = stats.overdueInvoices !== undefined || stats.overdueAmount !== undefined;
  const gridCols = hasOverdueData ? "lg:grid-cols-5" : "lg:grid-cols-4";

  if (loading) {
    const cardCount = hasOverdueData ? 5 : 4;
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-4 mb-6`}>
        {[...Array(cardCount)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Main Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-4`}>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Invoices
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalInvoices || 0}
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
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹
                {(stats.totalRevenue || 0).toLocaleString("en-IN", {
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
              <p className="text-sm font-medium text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹
                {(stats.paidAmount || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
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
                Pending Amount
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₹
                {(stats.pendingAmount || 0).toLocaleString("en-IN", {
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

        {hasOverdueData && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Overdue Amount
                </p>
                <p className="text-2xl font-bold text-red-600">
                  ₹
                  {(stats.overdueAmount || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                {stats.overdueInvoices !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.overdueInvoices} invoice{stats.overdueInvoices !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Status Breakdown Section */}
      {stats.statusBreakdown && Array.isArray(stats.statusBreakdown) && stats.statusBreakdown.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Breakdown {stats.period && `(${stats.period})`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.statusBreakdown.map((status, index) => {
              const statusText = status.status || 'Unknown';
              const count = status.count || 0;
              const percentage = status.percentage || 0;
              
              // Get icon and color based on status
              const getStatusIcon = (status: string) => {
                switch (status.toLowerCase()) {
                  case 'paid':
                    return <FiCheckCircle className="w-5 h-5 text-green-600" />;
                  case 'overdue':
                    return <FiAlertCircle className="w-5 h-5 text-red-600" />;
                  case 'cancelled':
                    return <FiXCircle className="w-5 h-5 text-gray-600" />;
                  case 'sent':
                  case 'draft':
                    return <FiClock className="w-5 h-5 text-blue-600" />;
                  case 'partially_paid':
                    return <FiTrendingUp className="w-5 h-5 text-orange-600" />;
                  default:
                    return <FiFileText className="w-5 h-5 text-gray-600" />;
                }
              };

              const getStatusColor = (status: string) => {
                switch (status.toLowerCase()) {
                  case 'paid':
                    return 'bg-green-50 border-green-200';
                  case 'overdue':
                    return 'bg-red-50 border-red-200';
                  case 'cancelled':
                    return 'bg-gray-50 border-gray-200';
                  case 'sent':
                  case 'draft':
                    return 'bg-blue-50 border-blue-200';
                  case 'partially_paid':
                    return 'bg-orange-50 border-orange-200';
                  default:
                    return 'bg-gray-50 border-gray-200';
                }
              };

              return (
                <div
                  key={statusText || `status-${index}`}
                  className={`p-3 rounded-lg border ${getStatusColor(statusText)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(statusText)}
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {statusText.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {count}
                    </span>
                    {percentage > 0 && (
                      <span className="text-xs text-gray-500">
                        {percentage}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default InvoiceStats;
