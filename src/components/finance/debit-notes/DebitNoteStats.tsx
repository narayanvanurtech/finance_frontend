"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  FiFileText,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiTag,
} from "react-icons/fi";

interface DebitNoteStatsProps {
  stats: {
    overview: {
      _id: null;
      totalDebitNotes: number;
      totalAmount: number;
      resolvedAmount: number;
      pendingAmount: number;
      statusBreakdown: Array<{
        status: string;
        resolutionStatus: string;
      }>;
    };
    statusBreakdown: Array<{
      _id: string;
      count: number;
      totalAmount: number;
    }>;
    resolutionBreakdown: Array<{
      _id: string;
      count: number;
      totalAmount: number;
    }>;
    debitTypeBreakdown: Array<{
      _id: string;
      count: number;
      totalAmount: number;
    }>;
  };
  loading?: boolean;
}

const DebitNoteStats: React.FC<DebitNoteStatsProps> = ({ stats, loading }) => {
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

  // Get counts from breakdowns
  const pendingCount =
    stats.resolutionBreakdown.find((item) => item._id === "pending")?.count ||
    0;
  const resolvedCount =
    stats.resolutionBreakdown.find((item) => item._id === "resolved")?.count ||
    0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Debit Notes */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Total Debit Notes
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.overview.totalDebitNotes}
            </p>
            <p className="text-xs text-gray-500 mt-1">All debit notes</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <FiFileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Total Amount */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-indigo-600">
              {formatCurrency(stats.overview.totalAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total debit value</p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg">
            <FiDollarSign className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </Card>

      {/* Pending Resolution */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Pending Resolution
            </p>
            <p className="text-2xl font-bold text-amber-600">
              {formatCurrency(stats.overview.pendingAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {pendingCount} pending note{pendingCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="p-3 bg-amber-100 rounded-lg">
            <FiClock className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </Card>

      {/* Resolved Amount */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Resolved Amount
            </p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.overview.resolvedAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {resolvedCount} resolved note{resolvedCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <FiCheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DebitNoteStats;
