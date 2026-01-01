"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiSend,
  FiTrash2,
  FiChevronRight,
} from "react-icons/fi";
import { useQuotationStore } from "@/stores/financeStore/useQuotationStore";
import { Quotation } from "@/api/finance/quotationApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import QuotationStats from "@/components/finance/quotation/QuotationStats";
import QuotationFilters, {
  SearchFilters,
} from "@/components/finance/quotation/QuotationFilters";
import DeleteQuotationDialog from "@/components/finance/quotation/DeleteQuotationDialog";

// Helper to get status color classes
const getStatusClasses = (status: string) => {
  switch (status) {
    case "accepted":
      return "bg-[var(--color-success-bg)] text-[var(--color-primary-background)]";
    case "rejected":
      return "bg-[var(--color-destructive)] text-[var(--color-primary-foreground)]";
    case "sent":
      return "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]";
    default:
      return "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]";
  }
};

// Helper to get client initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Helper to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case "accepted":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
          <FiCheckCircle className="inline" /> Accepted
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
          <FiXCircle className="inline" /> Rejected
        </span>
      );
    case "sent":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          <FiSend className="inline" /> Sent
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-700">
          <FiXCircle className="inline" /> Cancelled
        </span>
      );
    case "converted":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">
          <FiCheckCircle className="inline" /> Converted
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
  }
};

export default function QuotationListPage() {
  const router = useRouter();
  const {
    quotations,
    pagination,
    fetchQuotations,
    deleteQuotation,
    duplicateQuotation,
    updateQuotationStatus,
    searchQuotations,
    getQuotationStats,
    convertToInvoice,
    convertToProformaInvoice,
  } = useQuotationStore();

  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [stats, setStats] = useState<{
    totalQuotations: number;
    statusBreakdown: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    conversionRate: number;
    invoiceConversionRate: number;
    proformaConversionRate: number;
    period: string;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [showConvertMenu, setShowConvertMenu] = useState<string | null>(null);
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    quotation: Quotation | null;
    quotationId: string | null; // Store ID separately to avoid issues
    loading: boolean;
  }>({
    open: false,
    quotation: null,
    quotationId: null,
    loading: false,
  });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({
    open: false,
    loading: false,
  });
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch quotations based on filters
  useEffect(() => {
    const loadQuotations = async () => {
      if (!isMounted) return;

      try {
        setIsLoading(true);
        setError(null);

        // Check if there are active filters
        const hasActiveFilters = Object.values(currentFilters).some(
          (value) => value && value.length > 0
        );

        if (hasActiveFilters) {
          const params: any = {
            page: currentPage,
            limit: itemsPerPage,
          };

          if (currentFilters.search) params.search = currentFilters.search;
          if (currentFilters.status) params.status = currentFilters.status;
          if (currentFilters.sortBy) params.sortBy = currentFilters.sortBy;
          if (currentFilters.sortOrder)
            params.sortOrder = currentFilters.sortOrder;
          if (currentFilters.dateFrom)
            params.dateFrom = currentFilters.dateFrom;
          if (currentFilters.dateTo) params.dateTo = currentFilters.dateTo;

          await searchQuotations(params);
        } else {
          await fetchQuotations(currentPage, itemsPerPage);
        }
      } catch (err: any) {
        setError(
          `Failed to load quotations: ${err?.message || "Unknown error"}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isMounted) {
      loadQuotations().then(() => {
        loadStats();
      });
    }
  }, [
    fetchQuotations,
    searchQuotations,
    currentPage,
    itemsPerPage,
    isMounted,
    currentFilters,
  ]);

  // Load statistics
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const statsData = await getQuotationStats("30");
      const safeStats = {
        totalQuotations: statsData?.totalQuotations || 0,
        statusBreakdown: Array.isArray(statsData?.statusBreakdown)
          ? statsData.statusBreakdown
          : [],
        conversionRate:
          typeof statsData?.conversionRate === "number"
            ? statsData.conversionRate
            : 0,
        invoiceConversionRate:
          typeof statsData?.invoiceConversionRate === "number"
            ? statsData.invoiceConversionRate
            : 0,
        proformaConversionRate:
          typeof statsData?.proformaConversionRate === "number"
            ? statsData.proformaConversionRate
            : 0,
        period: statsData?.period || "30 days",
      };
      setStats(safeStats);
    } catch (error) {
      setStats({
        totalQuotations: 0,
        statusBreakdown: [],
        conversionRate: 0,
        invoiceConversionRate: 0,
        proformaConversionRate: 0,
        period: "30 days",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle search and filters
  const handleSearch = useCallback((filters: SearchFilters) => {
    setCurrentFilters(filters);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setCurrentFilters({});
    setCurrentPage(1); // Reset to first page when clearing
  }, []);

  // Handle stat card clicks
  const handleStatClick = useCallback(
    (filterType: "all" | "accepted" | "invoice" | "proforma") => {
      let filters: SearchFilters = {};

      switch (filterType) {
        case "all":
          // Clear all filters to show all quotations
          filters = {};
          break;
        case "accepted":
          // Show accepted quotations
          filters = { status: "accepted" };
          break;
        case "invoice":
          // Show accepted quotations (which can be converted to invoice)
          filters = { status: "accepted" };
          break;
        case "proforma":
          // Show accepted quotations (which can be converted to proforma)
          filters = { status: "accepted" };
          break;
      }

      setCurrentFilters(filters);
    },
    []
  );

  // Handle delete quotation
  const handleDeleteClick = (quotation: Quotation) => {
    // Extract ID immediately to ensure we have it
    const quotationId = quotation?._id || quotation?.id;
    
    console.log("Delete clicked for quotation:", quotation);
    console.log("Quotation _id:", quotation?._id, "Type:", typeof quotation?._id);
    console.log("Quotation id:", quotation?.id, "Type:", typeof quotation?.id);
    console.log("Extracted quotationId:", quotationId);
    
    if (!quotationId) {
      console.error("Cannot delete: Quotation ID is missing", quotation);
      toast.error("Cannot delete: Quotation ID not found");
      return;
    }
    
    // Store both quotation object and ID separately
    setDeleteDialog({
      open: true,
      quotation,
      quotationId: String(quotationId).trim(),
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    // Use the stored quotationId directly - more reliable than extracting from object
    const quotationId = deleteDialog.quotationId;
    
    if (!quotationId || quotationId.trim() === '') {
      console.error("Delete confirm: No quotationId in dialog state");
      toast.error("Quotation ID is missing. Please refresh the page and try again.");
      setDeleteDialog({ open: false, quotation: null, quotationId: null, loading: false });
      return;
    }

    const cleanId = quotationId.trim();
    
    // Validate MongoDB ObjectId format (24 hex characters)
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(cleanId)) {
      console.error("Invalid ObjectId format:", cleanId, "Length:", cleanId.length);
      toast.error("Invalid quotation ID format. Please refresh the page and try again.");
      return;
    }

    console.log("Deleting quotation with ID:", cleanId);

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteQuotation(cleanId);
      setDeleteDialog({ open: false, quotation: null, quotationId: null, loading: false });
      
      // Remove from selected quotations if it was selected
      setSelectedQuotations((prev) => prev.filter((id) => id !== cleanId));
      
      // Refresh the list
      const hasActiveFilters = Object.values(currentFilters).some(
        (value) => value && value.length > 0
      );

      if (hasActiveFilters) {
        const params: any = {
          page: currentPage,
          limit: itemsPerPage,
        };

        if (currentFilters.search) params.search = currentFilters.search;
        if (currentFilters.status) params.status = currentFilters.status;
        if (currentFilters.sortBy) params.sortBy = currentFilters.sortBy;
        if (currentFilters.sortOrder) params.sortOrder = currentFilters.sortOrder;
        if (currentFilters.dateFrom) params.dateFrom = currentFilters.dateFrom;
        if (currentFilters.dateTo) params.dateTo = currentFilters.dateTo;

        await searchQuotations(params);
      } else {
        await fetchQuotations(currentPage, itemsPerPage);
      }
      
      loadStats();
    } catch (error: any) {
      console.error("Delete failed:", error);
      console.error("Error details:", error?.response?.data);
      const errorMessage = error?.response?.data?.message || "Failed to delete quotation";
      toast.error(errorMessage);
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, quotation: null, quotationId: null, loading: false });
  };

  const handleDuplicate = async (quotationId: string) => {
    try {
      await duplicateQuotation(quotationId);
      setCurrentPage(1); // Reset to page 1 after duplication
      setItemsPerPage(10);
      loadStats();
    } catch (error) {
      console.error("Failed to duplicate quotation:", error);
    }
  };

  const handleStatusChange = async (quotationId: string, status: string) => {
    try {
      // Find the quotation to check current status
      const quotation = quotations.find(
        (q) => q?._id === quotationId || q?.id === quotationId
      );

      // Prevent unnecessary API call if status hasn't changed
      if (quotation?.status === status) {
        return;
      }

      // Update status - store will update local state immediately for optimistic UI update
      await updateQuotationStatus(quotationId, status);
      
      // Refresh stats to reflect the status change
      loadStats();
      
      // Optionally refresh quotations list after a delay to ensure backend consistency
      // The store update should be enough for immediate UI feedback
      setTimeout(async () => {
        try {
          const hasActiveFilters = Object.values(currentFilters).some(
            (value) => value && value.length > 0
          );

          if (hasActiveFilters) {
            const params: any = {
              page: currentPage,
              limit: itemsPerPage,
            };

            if (currentFilters.search) params.search = currentFilters.search;
            if (currentFilters.status) params.status = currentFilters.status;
            if (currentFilters.sortBy) params.sortBy = currentFilters.sortBy;
            if (currentFilters.sortOrder)
              params.sortOrder = currentFilters.sortOrder;
            if (currentFilters.dateFrom)
              params.dateFrom = currentFilters.dateFrom;
            if (currentFilters.dateTo) params.dateTo = currentFilters.dateTo;

            await searchQuotations(params);
          } else {
            await fetchQuotations(currentPage, itemsPerPage);
          }
        } catch (refreshError) {
          console.error("Failed to refresh quotations:", refreshError);
        }
      }, 500); // Small delay to let backend process, but store update is immediate
    } catch (error) {
      console.error("Failed to update quotation status:", error);
      // Refresh to get current state in case of error
      try {
        const hasActiveFilters = Object.values(currentFilters).some(
          (value) => value && value.length > 0
        );

        if (hasActiveFilters) {
          const params: any = {
            page: currentPage,
            limit: itemsPerPage,
          };

          if (currentFilters.search) params.search = currentFilters.search;
          if (currentFilters.status) params.status = currentFilters.status;
          if (currentFilters.sortBy) params.sortBy = currentFilters.sortBy;
          if (currentFilters.sortOrder)
            params.sortOrder = currentFilters.sortOrder;
          if (currentFilters.dateFrom)
            params.dateFrom = currentFilters.dateFrom;
          if (currentFilters.dateTo) params.dateTo = currentFilters.dateTo;

          await searchQuotations(params);
        } else {
          await fetchQuotations(currentPage, itemsPerPage);
        }
      } catch (refreshError) {
        console.error("Failed to refresh after error:", refreshError);
      }
    }
  };

  const handleConvertToInvoice = async (quotationId: string) => {
    try {
      await convertToInvoice(quotationId);
      loadStats();
      router.push("/finance/invoices");
    } catch (error) {
      console.error("Failed to convert to invoice:", error);
    }
  };

  const handleConvertToProforma = async (quotationId: string) => {
    try {
      await convertToProformaInvoice(quotationId);
      loadStats();
      router.push("/finance/performa-invoices");
    } catch (error) {
      console.error("Failed to convert to proforma invoice:", error);
    }
  };

  const handleRowClick = (quotationId: string) => {
    router.push(`/finance/quotations/edit/${quotationId}`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select quotations that can be deleted (draft only)
      const deletableIds = quotations
        .filter((q) => q?.status === "draft")
        .map((q) => q?._id || q?.id || "")
        .filter(Boolean);
      setSelectedQuotations(deletableIds);
    } else {
      setSelectedQuotations([]);
    }
  };

  const handleSelectQuotation = (quotationId: string, checked: boolean, quotation?: Quotation) => {
    // Only allow selecting draft quotations
    if (quotation && quotation.status !== "draft") {
      return;
    }
    if (checked) {
      setSelectedQuotations((prev) => [...prev, quotationId]);
    } else {
      setSelectedQuotations((prev) => prev.filter((id) => id !== quotationId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedQuotations.length === 0) return;

    // Check if any selected quotation is not deletable (only draft can be deleted)
    const nonDeletableCount = quotations.filter(
      (q) =>
        selectedQuotations.includes(q?._id || q?.id || "") &&
        q?.status !== "draft"
    ).length;

    if (nonDeletableCount > 0) {
      toast.error(
        `Cannot delete ${nonDeletableCount} quotation(s). Only draft quotations can be deleted.`
      );
      return;
    }

    setBulkDeleteDialog({ open: true, loading: false });
  };

  const confirmBulkDelete = async () => {
    setBulkDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      // Filter out any invalid/empty IDs before deleting
      const validIds = selectedQuotations.filter((id) => id && id.trim().length > 0);
      
      if (validIds.length === 0) {
        toast.error("No valid quotation IDs to delete");
        setBulkDeleteDialog((prev) => ({ ...prev, loading: false }));
        return;
      }

      await Promise.all(validIds.map((id) => deleteQuotation(id.trim())));
      setSelectedQuotations([]);
      setBulkDeleteDialog({ open: false, loading: false });
      
      // Refresh the list
      const hasActiveFilters = Object.values(currentFilters).some(
        (value) => value && value.length > 0
      );

      if (hasActiveFilters) {
        const params: any = {
          page: currentPage,
          limit: itemsPerPage,
        };

        if (currentFilters.search) params.search = currentFilters.search;
        if (currentFilters.status) params.status = currentFilters.status;
        if (currentFilters.sortBy) params.sortBy = currentFilters.sortBy;
        if (currentFilters.sortOrder) params.sortOrder = currentFilters.sortOrder;
        if (currentFilters.dateFrom) params.dateFrom = currentFilters.dateFrom;
        if (currentFilters.dateTo) params.dateTo = currentFilters.dateTo;

        await searchQuotations(params);
      } else {
        await fetchQuotations(currentPage, itemsPerPage);
      }
      
      loadStats();
    } catch (error) {
      console.error("Failed to delete quotations:", error);
      setBulkDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSendEmailClick = (quotation: Quotation) => {
    setOpenPopoverId(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const isEmpty = quotations.length === 0;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto rounded-lg shadow p-4 sm:p-8 bg-[var(--color-card)]">
        <div className="text-center py-8">Loading quotations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto rounded-lg shadow p-4 sm:p-8 bg-[var(--color-card)]">
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your sales quotations
          </p>
        </div>
        <a
          href="/finance/quotations/create"
          className="px-4 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
        >
          + New Quotation
        </a>
      </div>

      {/* Stats Section */}
      <QuotationStats
        stats={
          stats || {
            totalQuotations: 0,
            statusBreakdown: [],
            conversionRate: 0,
            invoiceConversionRate: 0,
            proformaConversionRate: 0,
            period: "30 days",
          }
        }
        loading={statsLoading}
        onStatClick={handleStatClick}
      />

      {/* Filters Section */}
      <QuotationFilters
        onSearch={handleSearch}
        onClear={handleClearFilters}
        loading={isLoading}
      />

      {/* Bulk Actions Bar */}
      {selectedQuotations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedQuotations.length} quotation
            {selectedQuotations.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedQuotations([])}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Clear Selection
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={
                selectedQuotations.length === 0 ||
                quotations.filter(
                  (q) =>
                    selectedQuotations.includes(q?._id || q?.id || "") &&
                    q?.status === "draft"
                ).length === 0
              }
              className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTrash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto p-4 [&_td]:align-middle [&_th]:align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedQuotations.length === quotations.length &&
                      quotations.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quotation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isEmpty ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-gray-500 text-lg"
                  >
                    No quotations found. <br />
                    <a
                      href="/finance/quotations/create"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Create your first quotation
                    </a>
                  </td>
                </tr>
              ) : (
                quotations.map((q, idx) => (
                  <tr
                    key={q?._id || q?.id || idx}
                    className="transition hover:bg-gray-50 focus-within:bg-gray-100"
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedQuotations.includes(
                          q?._id || q?.id || ""
                        )}
                        onChange={(e) =>
                          handleSelectQuotation(
                            q?._id || q?.id || "",
                            e.target.checked,
                            q
                          )
                        }
                        disabled={q?.status !== "draft"}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                      onClick={() => handleRowClick(q?._id || q?.id || "")}
                    >
                      <div className="flex flex-col">
                        <span className="font-mono font-semibold text-sm">
                          {q?.quotationNumber || "-"}
                        </span>
                        {q?.quotationTitle && (
                          <span className="text-xs text-gray-600 mt-1 font-medium">
                            {q?.quotationTitle}
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                      onClick={() => handleRowClick(q?._id || q?.id || "")}
                    >
                      <div className="flex items-center gap-2 mt-1">
                        {q?.items && q?.items.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {q?.items.length} item
                            {q?.items.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {q?.createdBy?.name && (
                          <span className="text-xs text-gray-500">
                            by {q?.createdBy.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                      onClick={() => handleRowClick(q?._id || q?.id || "")}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                          {getInitials(
                            (typeof q?.clientId === "object" &&
                              q?.clientId?.email) ||
                              q?.clientDetails?.name ||
                              q?.createdBy?.name ||
                              "?"
                          )}
                        </span>
                        <span className="flex flex-col">
                          <span className="font-medium">
                            {(typeof q?.clientId === "object" &&
                              q?.clientId?.email) ||
                              q?.clientDetails?.name ||
                              q?.createdBy?.name ||
                              "-"}
                          </span>
                          {typeof q?.clientId === "object" &&
                            q?.clientId?.phone && (
                              <span className="text-xs text-gray-500">
                                {q?.clientId.phone}
                              </span>
                            )}
                        </span>
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                      onClick={() => handleRowClick(q?._id || q?.id || "")}
                    >
                      <div className="flex flex-col">
                        <span>
                          {q?.date
                            ? format(new Date(q?.date), "MMM d, yyyy")
                            : "-"}
                        </span>
                        {q?.dueDate && (
                          <span className="text-xs text-gray-500">
                            Due: {format(new Date(q?.dueDate), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right text-gray-900 cursor-pointer"
                      onClick={() => handleRowClick(q?._id || q?.id || "")}
                    >
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-base">
                          ₹
                          {(q?.grandTotal || q?.total || 0).toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 }
                          )}
                        </span>
                        {q?.subtotal && q?.subtotal !== q?.grandTotal && (
                          <span className="text-xs text-gray-500">
                            Subtotal: ₹
                            {q?.subtotal.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        )}
                        {q?.totalTax && q?.totalTax > 0 && (
                          <span className="text-xs text-gray-500">
                            Tax: ₹
                            {q?.totalTax.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        )}
                        {q?.discountValue && q?.discountValue > 0 && (
                          <span className="text-xs text-red-600">
                            Discount: {q?.discountType === "flat" ? "₹" : ""}
                            {q?.discountValue}
                            {q?.discountType === "percentage" ? "%" : ""}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(q?.status || "draft")}
                        {q?.phases && q?.phases.length > 0 && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full w-fit">
                            {q?.phases.length} Phase
                            {q?.phases.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {q?.convertedToInvoice && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full w-fit">
                            → Invoice
                          </span>
                        )}
                        {q?.convertedToProformaInvoice && (
                          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full w-fit">
                            → Proforma
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Popover
                        open={openPopoverId === (q?._id || q?.id)}
                        onOpenChange={(isOpen) =>
                          setOpenPopoverId(
                            isOpen ? q?._id || q?.id || null : null
                          )
                        }
                      >
                        <PopoverTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                            aria-label="Quotation actions"
                          >
                            <FiMoreVertical />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-2" align="end">
                          <div className="flex flex-col gap-1">
                            <Link
                              href={`/finance/quotations/preview/${
                                q?._id || q?.id
                              }`}
                              onClick={() => setOpenPopoverId(null)}
                              className="px-3 py-2 rounded hover:bg-gray-100 text-blue-600 text-sm"
                              aria-label="Preview Quotation"
                            >
                              Preview
                            </Link>
                            <Link
                              href={`/finance/quotations/edit/${
                                q?._id || q?.id
                              }`}
                              onClick={() => setOpenPopoverId(null)}
                              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm"
                              aria-label="Edit Quotation"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const id = q?._id || q?.id;
                                if (id) handleDuplicate(id);
                                setOpenPopoverId(null);
                              }}
                              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left"
                              aria-label="Duplicate Quotation"
                            >
                              Duplicate
                            </button>

                            {q?.status === "accepted" && (
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const id = q?._id || q?.id;
                                    setShowConvertMenu(
                                      showConvertMenu === id ? null : id || null
                                    );
                                  }}
                                  className="w-full px-3 py-2 rounded hover:bg-gray-100 text-purple-600 text-sm text-left flex items-center justify-between"
                                  aria-label="Convert to"
                                >
                                  <span>Convert to</span>
                                  <FiChevronRight
                                    className={`transition-transform ${
                                      showConvertMenu === (q?._id || q?.id)
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  />
                                </button>
                                {showConvertMenu === (q?._id || q?.id) && (
                                  <div className="ml-4 mt-1 space-y-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const id = q?._id || q?.id;
                                        if (id) handleConvertToInvoice(id);
                                        setShowConvertMenu(null);
                                        setOpenPopoverId(null);
                                      }}
                                      className="w-full px-3 py-2 rounded hover:bg-gray-100 text-green-600 text-sm text-left"
                                      aria-label="Convert to Invoice"
                                    >
                                      Invoice
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const id = q?._id || q?.id;
                                        if (id) handleConvertToProforma(id);
                                        setShowConvertMenu(null);
                                        setOpenPopoverId(null);
                                      }}
                                      className="w-full px-3 py-2 rounded hover:bg-gray-100 text-purple-600 text-sm text-left"
                                      aria-label="Convert to Proforma Invoice"
                                    >
                                      Proforma Invoice
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            {q?.status === "draft" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const id = q?._id || q?.id;
                                  if (id) handleStatusChange(id, "sent");
                                  setOpenPopoverId(null);
                                }}
                                className="px-3 py-2 rounded hover:bg-gray-100 text-blue-600 text-sm text-left"
                                aria-label="Send Quotation"
                              >
                                Send
                              </button>
                            )}
                            {q?.status === "sent" && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const id = q?._id || q?.id;
                                    if (id) handleStatusChange(id, "accepted");
                                    setOpenPopoverId(null);
                                  }}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-green-600 text-sm text-left"
                                  aria-label="Accept Quotation"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const id = q?._id || q?.id;
                                    if (id) handleStatusChange(id, "rejected");
                                    setOpenPopoverId(null);
                                  }}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left"
                                  aria-label="Reject Quotation"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const id = q?._id || q?.id;
                                    if (id) handleStatusChange(id, "cancelled");
                                    setOpenPopoverId(null);
                                  }}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-orange-600 text-sm text-left flex items-center gap-2"
                                  aria-label="Cancel Quotation"
                                >
                                  <FiXCircle className="w-4 h-4" />
                                  Cancel
                                </button>
                              </>
                            )}
                            {q?.status === "draft" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Extract ID directly from the quotation object
                                  const id = q?._id || q?.id;
                                  if (!id) {
                                    console.error("Cannot delete: No ID found in quotation", q);
                                    toast.error("Cannot delete: Quotation ID not found");
                                    return;
                                  }
                                  handleDeleteClick(q);
                                  setOpenPopoverId(null);
                                }}
                                className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left flex items-center gap-2"
                                aria-label="Delete Quotation"
                              >
                                <FiTrash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                            {q?.status === "accepted" &&
                              !q?.convertedToInvoice &&
                              !q?.convertedToProformaInvoice && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const id = q?._id || q?.id;
                                    if (id) handleStatusChange(id, "cancelled");
                                    setOpenPopoverId(null);
                                  }}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-orange-600 text-sm text-left flex items-center gap-2"
                                  aria-label="Cancel Quotation"
                                >
                                  <FiXCircle className="w-4 h-4" />
                                  Cancel
                                </button>
                              )}
                            {q?.status === "converted" && (
                              <div className="px-3 py-2 text-xs text-gray-500 italic">
                                Cannot modify - Already converted
                              </div>
                            )}
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
      </div>

      {/* Pagination Controls */}
      {!isLoading && pagination && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-900"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination info */}
            <div className="text-sm text-gray-600">
              Showing{" "}
              {pagination.total === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}{" "}
              to {Math.min(currentPage * itemsPerPage, pagination.total)} of{" "}
              {pagination.total} quotations
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 border rounded ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteQuotationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        quotation={deleteDialog.quotation}
        loading={deleteDialog.loading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      {bulkDeleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Bulk Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedQuotations.length}{" "}
              quotation{selectedQuotations.length > 1 ? "s" : ""}? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setBulkDeleteDialog({ open: false, loading: false })
                }
                disabled={bulkDeleteDialog.loading}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={bulkDeleteDialog.loading}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {bulkDeleteDialog.loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {bulkDeleteDialog.loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
