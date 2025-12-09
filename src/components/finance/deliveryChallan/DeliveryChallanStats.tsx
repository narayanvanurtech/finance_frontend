"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  FiFileText,
  FiCheckCircle,
  FiSend,
  FiXCircle,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";

interface DeliveryChallanStatsProps {
  stats: {
    totalChallans?: number;
    totalValue?: number;
    draftChallans?: number;
    sentChallans?: number;
    deliveredChallans?: number;
    rejectedChallans?: number;
    period?: string;
  };
  loading?: boolean;
  onStatClick?: (
    filterType: "all" | "draft" | "sent" | "delivered" | "rejected"
  ) => void;
}

const DeliveryChallanStats: React.FC<DeliveryChallanStatsProps> = ({
  stats,
  loading,
  onStatClick,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("all")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Challans
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalChallans || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiFileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats.totalValue?.toLocaleString("en-IN") || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("draft")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.draftChallans || 0}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FiClock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("sent")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.sentChallans || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiSend className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("delivered")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.deliveredChallans || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStatClick?.("rejected")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.rejectedChallans || 0}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FiXCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryChallanStats;
