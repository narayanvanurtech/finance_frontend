"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  FiTrendingUp,
  FiFileText,
  FiCheckCircle,
  FiTruck,
  FiPackage,
  FiClock,
  FiXCircle,
} from "react-icons/fi";

interface SalesOrderStatsProps {
  stats: {
    totalOrders?: number;
    draftOrders?: number;
    confirmedOrders?: number;
    processingOrders?: number;
    shippedOrders?: number;
    deliveredOrders?: number;
    cancelledOrders?: number;
    totalValue?: number;
    period?: string;
  };
  loading?: boolean;
  onStatClick?: (
    filterType: "all" | "draft" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  ) => void;
}

const SalesOrderStats: React.FC<SalesOrderStatsProps> = ({
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
                Total Orders
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalOrders || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiFileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("confirmed")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Confirmed
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.confirmedOrders || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("processing")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Processing
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.processingOrders || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("delivered")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Delivered
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.deliveredOrders || 0}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FiTruck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("draft")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.draftOrders || 0}
              </p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <FiClock className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("shipped")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shipped</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.shippedOrders || 0}
              </p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FiTruck className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("cancelled")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.cancelledOrders || 0}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <FiXCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(stats.totalValue || 0)}
              </p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <FiTrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalesOrderStats;
