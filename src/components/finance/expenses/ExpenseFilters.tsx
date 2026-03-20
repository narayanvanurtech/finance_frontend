"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import { useGetVendors } from "@/hooks/useVendorQueries";

interface ExpenseFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
}

export interface SearchFilters {
  search?: string;
  paymentStatus?: "pending" | "partial" | "paid";
  priority?: "low" | "medium" | "high";
  purchaseType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  vendorId?: string;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  onSearch,
  onClear,
  loading,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch vendors for filter dropdown
  const { data: vendorsResponse, isLoading: vendorsLoading } = useGetVendors();

  const vendors = useMemo(
    () =>
      (vendorsResponse?.result?.vendors || []).map((v: any) => ({
        ...v,
        name:
          typeof v.name === "object"
            ? `${v.name.streetAddress || ""}, ${v.name.city || ""}, ${
                v.name.state || ""
              }`.trim()
            : v.name,
      })),
    [vendorsResponse]
  );

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: string | undefined
  ) => {
    const newFilters = { ...filters };

    // Remove key if value is empty, "all", or "default"
    if (!value || value === "" || value === "all" || value === "default") {
      delete newFilters[key];
    } else {
      // Type-safe assignment for specific keys
      if (key === "sortOrder" && (value === "asc" || value === "desc")) {
        newFilters[key] = value;
      } else if (
        key === "paymentStatus" &&
        (value === "pending" || value === "partial" || value === "paid")
      ) {
        newFilters[key] = value;
      } else if (
        key === "priority" &&
        (value === "low" || value === "medium" || value === "high")
      ) {
        newFilters[key] = value;
      } else if (
        key !== "sortOrder" &&
        key !== "paymentStatus" &&
        key !== "priority"
      ) {
        newFilters[key] = value as any;
      }
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

    //console.log("🧹 Cleaned filters being sent:", cleanedFilters);
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
    if (key === "paymentStatus" && value === "all") return false;
    if (key === "priority" && value === "all") return false;
    if (key === "purchaseType" && value === "all") return false;
    if (key === "sortBy" && value === "default") return false;
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
              placeholder="Search expenses by number, vendor, or type..."
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
                    if (key === "paymentStatus" && value === "all")
                      return false;
                    if (key === "priority" && value === "all") return false;
                    if (key === "purchaseType" && value === "all") return false;
                    if (key === "sortBy" && value === "default") return false;
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
                  Payment Status
                </label>
                <Select
                  value={filters.paymentStatus || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "paymentStatus",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
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
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor
                </label>
                <Select
                  value={filters.vendorId || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "vendorId",
                      value === "all" ? undefined : value
                    )
                  }
                  disabled={vendorsLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        vendorsLoading ? "Loading..." : "All Vendors"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {vendors.map((vendor: any) => (
                      <SelectItem key={vendor._id} value={vendor._id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Type
                </label>
                <Select
                  value={filters.purchaseType || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "purchaseType",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="goods">Goods</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date From
                </label>
                <Input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date To
                </label>
                <Input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <Select
                  value={filters.sortBy || "default"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "sortBy",
                      value === "default" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="billDate">Date</SelectItem>
                    <SelectItem value="grandTotal">Amount</SelectItem>
                    <SelectItem value="billNumber">Bill Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <Select
                  value={filters.sortOrder || "desc"}
                  onValueChange={(value) =>
                    handleFilterChange("sortOrder", value as "asc" | "desc")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Descending" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
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

export default ExpenseFilters;
