"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  FiTrendingUp,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiSend,
  FiClock,
} from "react-icons/fi";

interface QuotationStatsProps {
  stats: {
    totalQuotations?: number;
    statusBreakdown?: Array<{
      _id?: string;
      count?: number;
      totalValue?: number;
    }>;
    acceptanceRate?: number;
    invoiceConversionRate?: number;
    proformaConversionRate?: number;
    period?: string;
  };
  loading?: boolean;
  onStatClick?: (
    filterType: "all" | "accepted" | "invoice" | "proforma"
  ) => void;
}

const QuotationStats: React.FC<QuotationStatsProps> = ({
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

  const getStatusIcon = (status: string) => {
    if (!status) return <FiFileText className="w-5 h-5 text-gray-500" />;

    switch (status.toLowerCase()) {
      case "draft":
        return <FiFileText className="w-5 h-5 text-gray-500" />;
      case "sent":
        return <FiSend className="w-5 h-5 text-blue-500" />;
      case "accepted":
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      case "expired":
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FiFileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return "text-gray-600";

    switch (status.toLowerCase()) {
      case "draft":
        return "text-gray-600";
      case "sent":
        return "text-blue-600";
      case "accepted":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "expired":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
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
                Total Quotations
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalQuotations || 0}
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

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("accepted")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Acceptance Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats.acceptanceRate || 0).toFixed(1)}%
              </p>
              {stats?.period && (
                <p className="text-xs text-gray-500 mt-1">
                  Last {stats.period}
                </p>
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("invoice")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Invoice Conversion
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats.invoiceConversionRate || 0).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("proforma")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Proforma Conversion
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats.proformaConversionRate || 0).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FiSend className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Status Breakdown */}
      {stats.statusBreakdown && Array.isArray(stats.statusBreakdown) && stats.statusBreakdown.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Breakdown {stats.period && `(${stats.period})`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.statusBreakdown
              .filter(status => status && typeof status === 'object' && status._id)
              .map((status, index) => {
                const statusText = status._id || 'Unknown';
                const totalValue = status.totalValue || 0;
                return (
                  <div
                    key={statusText || `status-${index}`}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(statusText)}
                        <p className={`text-sm font-medium capitalize ${getStatusColor(statusText)}`}>
                          {statusText}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {status.count || 0}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Value: ₹
                      {totalValue.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuotationStats;
