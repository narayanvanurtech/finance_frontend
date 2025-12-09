"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  FiTrendingUp,
  FiFileText,
  FiCheckCircle,
  FiDollarSign,
} from "react-icons/fi";

interface PerformaInvoiceStatsProps {
  stats: {
    totalInvoices?: number;
    statusBreakdown?: Array<{
      status?: string;
      count?: number;
      percentage?: number;
    }>;
    totalRevenue?: number;
    acceptedAmount?: number;
    pendingAmount?: number;
    period?: string;
  };
  loading?: boolean;
}

const PerformaInvoiceStats: React.FC<PerformaInvoiceStatsProps> = ({
  stats,
  loading,
}) => {
  console.log("🎨 PerformaInvoiceStats Component - Received stats:", stats);
  console.log("🎨 totalInvoices value:", stats?.totalInvoices);

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
              <p className="text-sm font-medium text-gray-600">
                Accepted Amount
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₹
                {(stats.acceptedAmount || 0).toLocaleString("en-IN", {
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
      </div>
    </div>
  );
};

export default PerformaInvoiceStats;
