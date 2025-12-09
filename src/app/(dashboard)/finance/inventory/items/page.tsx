"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useItemStore } from "@/stores/financeStore/useItemStore";
import { useCategoryStore } from "@/stores/financeStore/useCategoryStore";
import { useSubcategoryStore } from "@/stores/financeStore/useSubcategoryStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Trash2,
  XCircle,
  List,
  Grid3x3,
  MoreHorizontal,
  ChevronDown,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Package,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { FileText, FilePlus2, ShoppingCart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Item } from "@/api/finance/itemApi";

function AllItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  // Store hooks
  const {
    items,
    loading,
    error,
    pagination,
    getAllItems,
    deleteItem,
    bulkDeleteItems,
    clearError,
    setFilters,
    setSorting,
  } = useItemStore();

  const { categories, fetchCategories } = useCategoryStore();
  const { subcategories, fetchSubcategories } = useSubcategoryStore();

  // URL params
  const subcategoryId = searchParams.get("subcategoryId");
  const categoryId = searchParams.get("categoryId");

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSubcategory, setFilterSubcategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStockStatus, setFilterStockStatus] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortByLocal] = useState("createdAt");
  const [sortOrder, setSortOrderLocal] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Fetch data on component mount
  useEffect(() => {
    if (user?.companyId) {
      fetchCategories();
      fetchSubcategories();
      loadItems();
    }
  }, [user?.companyId]);

  // Load items when filters or sorting change
  useEffect(() => {
    if (user?.companyId) {
      // Debounce search to avoid excessive API calls
      const timeoutId = setTimeout(
        () => {
          loadItems();
        },
        searchTerm ? 500 : 0
      ); // 500ms delay for search, immediate for other filters

      return () => clearTimeout(timeoutId);
    }
  }, [
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    filterCategory,
    filterSubcategory,
    filterType,
    filterStockStatus,
    searchTerm,
    user?.companyId,
    categories,
    subcategories,
  ]);

  const loadItems = async () => {
    try {
      const filters: any = {};

      // Handle category filtering
      if (categoryId) {
        filters.categoryId = categoryId;
      } else if (filterCategory !== "all") {
        const category = categories.find((cat) => cat.name === filterCategory);
        if (category) filters.categoryId = category._id;
      }

      // Handle subcategory filtering
      if (subcategoryId) {
        filters.subcategoryId = subcategoryId;
      } else if (filterSubcategory !== "all") {
        const subcategory = subcategories.find(
          (sub) => sub.name === filterSubcategory
        );
        if (subcategory) filters.subcategoryId = subcategory._id;
      }

      // Handle item type filtering
      if (filterType !== "all") {
        filters.type = filterType;
      }

      // Handle stock status filtering
      if (filterStockStatus === "lowStock") {
        filters.lowStock = "true";
      } else if (filterStockStatus === "outOfStock") {
        filters.outOfStock = "true";
      }

      // Handle search - use search parameter for general search
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      await getAllItems({
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder,
        filters,
      });
    } catch (error) {
      console.error("Failed to load items:", error);
    }
  };

  // Get filter context info
  const filterCategoryName = categoryId
    ? categories.find((cat) => cat._id === categoryId)?.name
    : filterCategory !== "all"
    ? filterCategory
    : null;

  const filterSubcategoryName = subcategoryId
    ? subcategories.find((sub) => sub._id === subcategoryId)?.name
    : filterSubcategory !== "all"
    ? filterSubcategory
    : null;

  // Selection handlers
  const allSelected =
    items.length > 0 && items.every((item) => selectedItems.includes(item._id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item._id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Action handlers
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    try {
      await bulkDeleteItems(selectedItems);
      setSelectedItems([]);
      toast.success(`Successfully deleted ${selectedItems.length} item(s)`);
      loadItems(); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete items");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      toast.success("Item deleted successfully");
      loadItems(); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleBulkInvoice = () => {
    const itemsToInvoice = items.filter((item) =>
      selectedItems.includes(item._id)
    );
    if (itemsToInvoice.length === 0) {
      toast.error("Please select at least one item to create an invoice.");
      return;
    }
    localStorage.setItem("bulkInvoiceItems", JSON.stringify(itemsToInvoice));
    router.push("/finance/invoices/create");
  };

  const handleSortChange = (newSortBy: string) => {
    const newSortOrder =
      newSortBy === sortBy && sortOrder === "desc" ? "asc" : "desc";
    setSortByLocal(newSortBy);
    setSortOrderLocal(newSortOrder);
    setSorting(newSortBy, newSortOrder);
    setCurrentPage(1);
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Statistics calculation
  const stats = useMemo(() => {
    return {
      totalItems: pagination?.totalItems || items.length,
      totalValue: items.reduce(
        (sum, item) => sum + (Number(item.sellingPrice) || 0),
        0
      ),
      lowStockItems: items.filter(
        (item) =>
          item.trackInventory &&
          (item.currentStock || 0) <= (item.lowStockThreshold || 0)
      ).length,
      outOfStockItems: items.filter(
        (item) => item.trackInventory && (item.currentStock || 0) === 0
      ).length,
    };
  }, [items, pagination]);

  // Helper function to get no results message
  const getNoResultsMessage = () => {
    const hasFilters =
      filterCategory !== "all" ||
      filterSubcategory !== "all" ||
      filterType !== "all" ||
      filterStockStatus !== "all" ||
      searchTerm;

    if (hasFilters) {
      if (searchTerm) {
        return {
          title: `No items found for "${searchTerm}"`,
          subtitle: "Try adjusting your search terms or filters.",
          showAddButton: false,
        };
      } else {
        return {
          title: "No items match your filters",
          subtitle: "Try adjusting your filter criteria to see more results.",
          showAddButton: false,
        };
      }
    } else {
      return {
        title: "No items found",
        subtitle: "Get started by creating your first item.",
        showAddButton: true,
      };
    }
  };

  if (loading && items.length === 0) {
    return (
      <div
        className="max-w-[98vw] w-full mx-auto p-6"
        style={{ background: "var(--color-card)" }}
      >
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, idx) => (
                <div key={idx} className="h-24 bg-gray-200 rounded"></div>
              ))}
          </div>
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, idx) => (
                <div key={idx} className="h-16 bg-gray-200 rounded"></div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full"
      style={{ background: "var(--color-background)", minHeight: "100vh" }}
    >
      <div
        className="max-w-[98vw] w-full mx-auto p-6"
        style={{
          background: "var(--color-card)",
          color: "var(--color-card-foreground)",
        }}
      >
        {/* Breadcrumb & Filter Context */}
        {(filterCategoryName || filterSubcategoryName) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800">
                {filterSubcategoryName ? (
                  <>
                    Viewing items in subcategory:{" "}
                    <span className="font-semibold">
                      {filterSubcategoryName}
                    </span>
                  </>
                ) : filterCategoryName ? (
                  <>
                    Viewing items in category:{" "}
                    <span className="font-semibold">{filterCategoryName}</span>
                  </>
                ) : null}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/finance/inventory/items")}
                className="ml-auto text-blue-600 hover:text-blue-800"
              >
                Clear Filter
              </Button>
            </div>
          </div>
        )}

        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">
                Inventory Items
              </h1>
              <p className="text-[var(--color-muted-foreground)]">
                Manage your product inventory and track stock levels
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => loadItems()}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Link href="/finance/inventory/items/create">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Items */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Items
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {stats.totalItems}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Value */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Value
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    ₹{stats.totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-100">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Low Stock */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Low Stock</p>
                  <p className="text-2xl font-semibold text-yellow-600 mt-1">
                    {stats.lowStockItems}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-100">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Out of Stock */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Out of Stock
                  </p>
                  <p className="text-2xl font-semibold text-red-600 mt-1">
                    {stats.outOfStockItems}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-red-100">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search items by name, SKU, description, HSN..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10"
              />
              {loading && searchTerm && (
                <RefreshCw className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearch("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <XCircle className="w-4 h-4 text-gray-400" />
                </Button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-3"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-3"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </div>

            {/* Filters Toggle */}
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filterCategory !== "all" ||
                filterSubcategory !== "all" ||
                filterType !== "all" ||
                filterStockStatus !== "all" ||
                searchTerm) && (
                <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {
                    [
                      filterCategory !== "all",
                      filterSubcategory !== "all",
                      filterType !== "all",
                      filterStockStatus !== "all",
                      searchTerm,
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </Button>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={filterStockStatus === "lowStock" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilterStockStatus(
                  filterStockStatus === "lowStock" ? "all" : "lowStock"
                );
                setCurrentPage(1);
              }}
              className="flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Low Stock
            </Button>
            <Button
              variant={
                filterStockStatus === "outOfStock" ? "default" : "outline"
              }
              size="sm"
              onClick={() => {
                setFilterStockStatus(
                  filterStockStatus === "outOfStock" ? "all" : "outOfStock"
                );
                setCurrentPage(1);
              }}
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Out of Stock
            </Button>
            <Button
              variant={filterType === "goods" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilterType(filterType === "goods" ? "all" : "goods");
                setCurrentPage(1);
              }}
              className="flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Goods
            </Button>
            <Button
              variant={filterType === "service" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilterType(filterType === "service" ? "all" : "service");
                setCurrentPage(1);
              }}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Services
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                  style={{
                    background: "var(--color-background)",
                    color: "var(--color-foreground)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <select
                  value={filterSubcategory}
                  onChange={(e) => {
                    setFilterSubcategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                  style={{
                    background: "var(--color-background)",
                    color: "var(--color-foreground)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <option value="all">All Subcategories</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory._id} value={subcategory.name}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                  style={{
                    background: "var(--color-background)",
                    color: "var(--color-foreground)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="goods">Goods</option>
                  <option value="service">Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Status
                </label>
                <select
                  value={filterStockStatus}
                  onChange={(e) => {
                    setFilterStockStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                  style={{
                    background: "var(--color-background)",
                    color: "var(--color-foreground)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <option value="all">All Stock Status</option>
                  <option value="lowStock">Low Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    handleSortChange(field);
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                  style={{
                    background: "var(--color-background)",
                    color: "var(--color-foreground)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="sellingPrice-desc">Price High-Low</option>
                  <option value="sellingPrice-asc">Price Low-High</option>
                  <option value="currentStock-desc">Stock High-Low</option>
                  <option value="currentStock-asc">Stock Low-High</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="md:col-span-2 lg:col-span-4 flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterCategory("all");
                    setFilterSubcategory("all");
                    setFilterType("all");
                    setFilterStockStatus("all");
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-blue-800 font-medium text-sm">
                  {selectedItems.length} item
                  {selectedItems.length > 1 ? "s" : ""} selected
                </span>

                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                        Bulk Actions <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuItem
                        onClick={handleBulkInvoice}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        Create Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          toast.info("Sales Order feature coming soon")
                        }
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <FilePlus2 className="w-4 h-4" />
                        Sales Order
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          toast.info("Purchase Order feature coming soon")
                        }
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Purchase Order
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <button
                    className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors duration-200 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300"
                    onClick={handleClearSelection}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(filterCategory !== "all" ||
          filterSubcategory !== "all" ||
          filterType !== "all" ||
          filterStockStatus !== "all" ||
          searchTerm) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                <Search className="w-3 h-3" />
                <span>Search: "{searchTerm}"</span>
                <button
                  onClick={() => handleSearch("")}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </div>
            )}
            {filterCategory !== "all" && (
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                <span>Category: {filterCategory}</span>
                <button
                  onClick={() => setFilterCategory("all")}
                  className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </div>
            )}
            {filterSubcategory !== "all" && (
              <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                <span>Subcategory: {filterSubcategory}</span>
                <button
                  onClick={() => setFilterSubcategory("all")}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </div>
            )}
            {filterType !== "all" && (
              <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                <span>Type: {filterType}</span>
                <button
                  onClick={() => setFilterType("all")}
                  className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </div>
            )}
            {filterStockStatus !== "all" && (
              <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                <span>
                  Stock:{" "}
                  {filterStockStatus === "lowStock"
                    ? "Low Stock"
                    : "Out of Stock"}
                </span>
                <button
                  onClick={() => setFilterStockStatus("all")}
                  className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterCategory("all");
                setFilterSubcategory("all");
                setFilterType("all");
                setFilterStockStatus("all");
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-auto text-red-600"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Items Display */}
        {viewMode === "list" ? (
          <ItemsTable
            items={items}
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onSelectAll={handleSelectAll}
            allSelected={allSelected}
            onDeleteItem={handleDeleteItem}
            loading={loading}
            getNoResultsMessage={getNoResultsMessage}
          />
        ) : (
          <ItemsGrid
            items={items}
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onDeleteItem={handleDeleteItem}
            loading={loading}
            getNoResultsMessage={getNoResultsMessage}
          />
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, pagination.totalItems)} of{" "}
              {pagination.totalItems} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage || loading}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage || loading}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(pagination.totalPages, prev + 1)
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Items Table Component
function ItemsTable({
  items,
  selectedItems,
  onSelectItem,
  onSelectAll,
  allSelected,
  onDeleteItem,
  loading,
  getNoResultsMessage,
}: {
  items: Item[];
  selectedItems: string[];
  onSelectItem: (id: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  onDeleteItem: (id: string) => void;
  loading: boolean;
  getNoResultsMessage: () => {
    title: string;
    subtitle: string;
    showAddButton: boolean;
  };
}) {
  if (loading && items.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="min-w-full">
          <thead className="bg-[var(--color-muted)]">
            <tr>
              {Array(8)
                .fill(0)
                .map((_, idx) => (
                  <th key={idx} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {Array(5)
              .fill(0)
              .map((_, idx) => (
                <tr key={idx}>
                  {Array(8)
                    .fill(0)
                    .map((_, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] shadow-sm">
      <table className="min-w-full divide-y divide-[var(--color-border)]">
        <thead className="bg-[var(--color-muted)]">
          <tr>
            <th className="px-4 py-3 text-left w-12">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="rounded border-gray-300"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Item
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              HSN/SAC
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Unit
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center">
                  <Package className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {getNoResultsMessage().title}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {getNoResultsMessage().subtitle}
                  </p>
                  {getNoResultsMessage().showAddButton && (
                    <Link href="/finance/inventory/items/create">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-[var(--color-muted)]/50 transition-colors"
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item._id)}
                    onChange={() => onSelectItem(item._id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {item.category?.name || "Uncategorized"}
                    </span>
                    {item.subcategory?.name && (
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {item.subcategory.name}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-semibold text-gray-900">
                    ₹{Number(item.sellingPrice || 0).toLocaleString()}
                  </div>
                  {item.costPrice && (
                    <div className="text-sm text-gray-500">
                      Cost: ₹{Number(item.costPrice).toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {item.hsn || "-"}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {item.unit || "-"}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      !item.isArchived
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {!item.isArchived ? "Active" : "Archived"}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <Popover>
                    <PopoverTrigger>
                      <Button variant="ghost" size="sm" type="button">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-40 p-2">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/finance/inventory/items/view/${item._id}`}
                          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </Link>
                        <Link
                          href={`/finance/inventory/items/edit/${item._id}`}
                          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item._id)}
                          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-red-100 text-sm text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Items Grid Component
function ItemsGrid({
  items,
  selectedItems,
  onSelectItem,
  onDeleteItem,
  loading,
  getNoResultsMessage,
}: {
  items: Item[];
  selectedItems: string[];
  onSelectItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  loading: boolean;
  getNoResultsMessage: () => {
    title: string;
    subtitle: string;
    showAddButton: boolean;
  };
}) {
  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array(8)
          .fill(0)
          .map((_, idx) => (
            <div key={idx} className="border rounded-lg p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {items.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {getNoResultsMessage().title}
          </h3>
          <p className="text-gray-500 mb-4">{getNoResultsMessage().subtitle}</p>
          {getNoResultsMessage().showAddButton && (
            <Link href="/finance/inventory/items/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </Link>
          )}
        </div>
      ) : (
        items.map((item) => (
          <div
            key={item._id}
            className={`relative border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg ${
              selectedItems.includes(item._id)
                ? "ring-2 ring-blue-500 border-blue-500"
                : "border-[var(--color-border)]"
            }`}
            style={{ background: "var(--color-card)" }}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3 z-10">
              <input
                type="checkbox"
                checked={selectedItems.includes(item._id)}
                onChange={() => onSelectItem(item._id)}
                className="rounded border-gray-300"
              />
            </div>

            {/* Actions Popover */}
            <div className="absolute top-3 right-3 z-10">
              <Popover>
                <PopoverTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    type="button"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-40 p-2">
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/finance/inventory/items/${item._id}`}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    <Link
                      href={`/finance/inventory/items/${item._id}/edit`}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item._id)}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-red-100 text-sm text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Item Image */}
            <div className="aspect-square bg-gray-50 flex items-center justify-center">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-16 h-16 text-gray-400" />
              )}
            </div>

            {/* Item Details */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {item.description}
              </p>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Price</span>
                  <span className="font-semibold">
                    ₹{Number(item.sellingPrice || 0).toLocaleString()}
                  </span>
                </div>
                {item.hsn && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">HSN</span>
                    <span className="text-xs">{item.hsn}</span>
                  </div>
                )}
                {item.unit && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Unit</span>
                    <span className="text-xs">{item.unit}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {item.category?.name || "Uncategorized"}
                </span>
                <span
                  className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    !item.isArchived
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {!item.isArchived ? "Active" : "Archived"}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function AllItemsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <AllItemsContent />
    </Suspense>
  );
}
