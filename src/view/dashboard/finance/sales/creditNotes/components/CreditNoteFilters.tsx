"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FiSearch, FiFilter, FiX, FiRefreshCw } from "react-icons/fi";

interface CreditNoteFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
}

export interface SearchFilters {
  search?: string;
  status?: string;
  creditType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

const CreditNoteFilters: React.FC<CreditNoteFiltersProps> = ({
  onSearch,
  onClear,
  loading,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: string | undefined
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onSearch(filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onClear();
    setIsExpanded(false);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (!value || value.length === 0) return false;
    if (key === "status" && value === "all") return false;
    if (key === "creditType" && value === "all") return false;
    if (key === "sortBy" && value === "default") return false;
    if (key === "sortOrder" && value === "desc") return false;
    return true;
  });

  return (
    <Card className="p-4 mb-6">
      {/* Main Search Bar */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search credit notes by number, client, or reason..."
              className="pl-10"
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleApplyFilters();
                }
              }}
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleApplyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            <FiSearch className="w-4 h-4" />
            Search
          </Button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
            disabled={loading}
          >
            <FiFilter className="w-5 h-5" />
          </button>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) =>
                  handleFilterChange("status", value || undefined)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Credit Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Type
              </label>
              <Select
                value={filters.creditType || ""}
                onValueChange={(value) =>
                  handleFilterChange("creditType", value || undefined)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="quality_issue">Quality Issue</SelectItem>
                  <SelectItem value="quantity_shortage">
                    Quantity Shortage
                  </SelectItem>
                  <SelectItem value="damaged_goods">Damaged Goods</SelectItem>
                  <SelectItem value="price_difference">
                    Price Difference
                  </SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <Select
                value={filters.sortBy || ""}
                onValueChange={(value) =>
                  handleFilterChange("sortBy", value || undefined)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <Select
                value={filters.sortOrder || "desc"}
                onValueChange={(value) =>
                  handleFilterChange("sortOrder", value as "asc" | "desc")
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Descending" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <Input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) =>
                  handleFilterChange("dateFrom", e.target.value || undefined)
                }
                disabled={loading}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <Input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) =>
                  handleFilterChange("dateTo", e.target.value || undefined)
                }
                disabled={loading}
              />
            </div>

            {/* Filter Actions */}
            <div className="flex gap-2 items-end">
              <Button
                onClick={handleApplyFilters}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Apply
              </Button>
              {hasActiveFilters && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  disabled={loading}
                >
                  <FiX className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CreditNoteFilters;
