"use client";

import React, { useState, useCallback, useEffect } from "react";
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
import { useClientStore } from "@/stores/financeStore/useClientStore";

export interface SearchFilters {
  search?: string;
  status?: "draft" | "sent" | "acknowledged" | "disputed" | "resolved";
  resolutionStatus?:
    | "pending"
    | "refund_processed"
    | "adjustment_made"
    | "credit_applied"
    | "disputed";
  creditType?:
    | "quality_issue"
    | "quantity_shortage"
    | "damaged_goods"
    | "price_difference"
    | "return"
    | "refund"
    | "other";
  priority?: "low" | "medium" | "high" | "urgent";
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface CreditNoteFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
}

const CreditNoteFilters: React.FC<CreditNoteFiltersProps> = ({
  onSearch,
  onClear,
  loading,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch clients for filter dropdown
  const {
    clients,
    fetchClientsByUser,
    isLoading: clientsLoading,
  } = useClientStore();

  // Fetch clients on mount
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (companyId && clients.length === 0) {
      fetchClientsByUser(companyId);
    }
  }, []);

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: string | undefined
  ) => {
    const newFilters = { ...filters };

    // Remove key if value is empty, "all", or "default"
    if (!value || value === "" || value === "all" || value === "default") {
      delete newFilters[key];
    } else {
      newFilters[key] = value as any;
    }

    setFilters(newFilters);
  };

  const handleApplyFilters = useCallback(() => {
    // Clean up filters - remove empty strings, undefined values, and trim whitespace
    const cleanedFilters: SearchFilters = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "" && value !== "all" && value !== "default") {
        // Trim whitespace from string values
        const trimmedValue = typeof value === "string" ? value.trim() : value;

        // Only add if still has value after trimming
        if (trimmedValue && trimmedValue !== "") {
          cleanedFilters[key as keyof SearchFilters] = trimmedValue;
        }
      }
    });

    //console.log("🧹 Cleaned credit note filters being sent:", cleanedFilters);
    onSearch(cleanedFilters);
  }, [filters, onSearch]);

  // Auto-apply search filter with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search !== undefined) {
        handleApplyFilters();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters.search, handleApplyFilters]);

  const handleClearFilters = () => {
    setFilters({});
    onClear();
    setIsExpanded(false);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (!value || value.length === 0) return false;
    // Don't count default values as active filters
    if (key === "sortOrder" && value === "desc") return false;
    return true;
  });

  return (
    <Card className="p-4 mb-6">
      {/* Main Search Bar */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
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
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2"
          >
            <FiFilter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {
                  Object.entries(filters).filter(([key, value]) => {
                    if (!value || value.length === 0) return false;
                    if (key === "sortOrder" && value === "desc") return false;
                    return true;
                  }).length
                }
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex items-center space-x-2"
            >
              <FiX className="w-4 h-4" />
              <span>Clear</span>
            </Button>
          )}
          <Button
            onClick={handleApplyFilters}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FiSearch className="w-4 h-4" />
            <span>Apply Filters</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onSearch(filters)}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "status",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Status
                </label>
                <Select
                  value={filters.resolutionStatus || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "resolutionStatus",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Resolution Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resolution Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="refund_processed">
                      Refund Processed
                    </SelectItem>
                    <SelectItem value="adjustment_made">
                      Adjustment Made
                    </SelectItem>
                    <SelectItem value="credit_applied">
                      Credit Applied
                    </SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Type
                </label>
                <Select
                  value={filters.creditType || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "creditType",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Credit Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Credit Types</SelectItem>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <Select
                  value={filters.priority || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "priority",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <Select
                  value={filters.clientId || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "clientId",
                      value === "all" ? undefined : value
                    )
                  }
                  disabled={clientsLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        clientsLoading ? "Loading..." : "All Clients"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client: any) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date From
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) =>
                    handleFilterChange("dateFrom", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date To
                </label>
                <Input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <Select
                  value={filters.sortBy || "createdAt"}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Created At" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created At</SelectItem>
                    <SelectItem value="creditNoteDate">Date</SelectItem>
                    <SelectItem value="grandTotal">Amount</SelectItem>
                    <SelectItem value="creditNoteNumber">
                      Credit Note Number
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CreditNoteFilters;
