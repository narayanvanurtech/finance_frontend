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
  FiTrash2,
  FiSend,
  FiCheckCircle,
  FiXCircle,
  FiChevronRight,
} from "react-icons/fi";
import { usePerformaInvoiceStore } from "@/stores/financeStore/usePerformaInvoiceStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import DeletePerformaInvoiceDialog from "@/components/finance/performa-invoice/DeletePerformaInvoiceDialog";
import PerformaInvoiceStats from "@/components/finance/performa-invoice/PerformaInvoiceStats";
import PerformaInvoiceFilters from "@/components/finance/performa-invoice/PerformaInvoiceFilters";
import type { PerformaInvoiceFormValues } from "@/components/finance/performa-invoice/PerformaInvoiceForm";
import type { SearchFilters } from "@/components/finance/performa-invoice/PerformaInvoiceFilters";
import axiosInstance from "@/utils/axios";
import { handleSendEmail } from "@/api/sendEmailApi";

// Helper to get client initials
const getInitials = (name: string) => {
  return name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Helper to get status badge
const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
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
    case "converted":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">
          <FiCheckCircle className="inline" /> Converted
        </span>
      );
    case "expired":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-800">
          Expired
        </span>
      );
    case "draft":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
          Draft
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
          {status || "Draft"}
        </span>
      );
  }
};

export default function PerformaInvoicesPage() {
  const router = useRouter();
  const allPerformaInvoices = usePerformaInvoiceStore(
    (state) => state.performaInvoices,
  );
  const pagination = usePerformaInvoiceStore((state) => state.pagination);
  const fetchPerformaInvoices = usePerformaInvoiceStore(
    (state) => state.fetchPerformaInvoices,
  );
  const searchPerformaInvoices = usePerformaInvoiceStore(
    (state) => state.searchPerformaInvoices,
  );
  const getPerformaInvoiceStats = usePerformaInvoiceStore(
    (state) => state.getPerformaInvoiceStats,
  );
  const duplicatePerformaInvoice = usePerformaInvoiceStore(
    (state) => state.duplicatePerformaInvoice,
  );
  const deletePerformaInvoice = usePerformaInvoiceStore(
    (state) => state.deletePerformaInvoice,
  );
  const updatePerformaInvoiceStatus = usePerformaInvoiceStore(
    (state) => state.updatePerformaInvoiceStatus,
  );
  const convertToInvoice = usePerformaInvoiceStore(
    (state) => state.convertToInvoice,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [showConvertMenu, setShowConvertMenu] = useState<string | null>(null);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    invoice: PerformaInvoiceFormValues | null;
    loading: boolean;
  }>({
    open: false,
    invoice: null,
    loading: false,
  });

  // Bulk delete state
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState<{
    open: boolean;
    loading: boolean;
  }>({
    open: false,
    loading: false,
  });
  const bulkAction = usePerformaInvoiceStore((state) => state.bulkAction);

  // Stats state
  const [stats, setStats] = useState<{
    totalInvoices: number;
    statusBreakdown: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    totalRevenue: number;
    acceptedAmount: number;
    pendingAmount: number;
    period: string;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if there are active filters
        const hasActiveFilters = Object.values(currentFilters).some(
          (value) => value && value.length > 0,
        );

        if (hasActiveFilters) {
          // Use search with filters
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

          await searchPerformaInvoices(params);
        } else {
          // No filters, fetch all
          await fetchPerformaInvoices(currentPage, itemsPerPage);
        }
      } catch (err: any) {
        setError(
          `Failed to load performa invoices: ${err?.message || "Unknown error"}`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isMounted) {
      loadInvoices().then(() => {
        // Load stats AFTER invoices are loaded
        loadStats();
      });
    }
  }, [
    fetchPerformaInvoices,
    searchPerformaInvoices,
    currentPage,
    itemsPerPage,
    isMounted,
    currentFilters,
  ]);

  const handleSendPerformaInvoiceEmail = async (performanceInvoiceId: string) => {
         router.push(`/finance/performa-invoices/email/${performanceInvoiceId}`)
  };

  // Load statistics
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const statsData = await getPerformaInvoiceStats("30");
      //console.log("📊 Performa Invoice Stats Data received:", statsData);

      // Get actual count from store if stats API returns 0
      const actualCount = allPerformaInvoices?.length || 0;

      // Ensure we have a valid stats object with default values
      const safeStats = {
        totalInvoices:
          statsData?.totalPerformaInvoices ||
          statsData?.totalInvoices ||
          statsData?.total ||
          actualCount,
        statusBreakdown: Array.isArray(statsData?.statusBreakdown)
          ? statsData.statusBreakdown
          : [],
        totalRevenue:
          typeof statsData?.totalRevenue === "number"
            ? statsData.totalRevenue
            : typeof statsData?.totalValue === "number"
              ? statsData.totalValue
              : 0,
        acceptedAmount:
          typeof statsData?.acceptedAmount === "number"
            ? statsData.acceptedAmount
            : 0,
        pendingAmount:
          typeof statsData?.pendingAmount === "number"
            ? statsData.pendingAmount
            : 0,
        period: statsData?.period || "30 days",
      };
      //console.log("✅ Safe Stats being set:", safeStats);
      setStats(safeStats);
    } catch (error) {
      console.error("Failed to load stats:", error);
      // Set default stats on error with actual count from store
      const actualCount = allPerformaInvoices?.length || 0;
      setStats({
        totalInvoices: actualCount,
        statusBreakdown: [],
        totalRevenue: 0,
        acceptedAmount: 0,
        pendingAmount: 0,
        period: "30 days",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Log when store data changes
  useEffect(() => {
    //console.log("📊 Invoices in store updated:", allPerformaInvoices.length);
  }, [allPerformaInvoices]);

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

  const handleDuplicate = async (invoiceId: string) => {
    try {
      await duplicatePerformaInvoice(invoiceId);
      setCurrentPage(1); // Reset to page 1 after duplication
      setItemsPerPage(10);
      // Refresh stats after duplication
      loadStats();
    } catch (error) {
      setError(
        `Failed to duplicate performa invoice: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  };

  const handleStatusChange = async (invoiceId: string, status: string) => {
    try {
      await updatePerformaInvoiceStatus(invoiceId, status);
      setOpenPopoverId(null);
      // Refresh stats after status change
      loadStats();
    } catch (error) {
      console.error("Failed to update performa invoice status:", error);
    }
  };

  const handleConvertToInvoice = async (invoice: PerformaInvoiceFormValues) => {
    if (!invoice._id) return;

    try {
      // Prepare the data from the performa invoice
      const convertData = {
        invoiceNumber:
          invoice.performaInvoiceNumber || invoice.invoiceNumber || "",
        invoiceDate: invoice.date || new Date().toISOString(),
        dueDate:
          invoice.dueDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        invoiceType: "demo", // You can adjust this based on your needs
      };

      // Convert to invoice (this will also update status to "converted" in the store)
      await convertToInvoice(invoice._id, convertData);

      // Refresh stats
      loadStats();
      toast.success("Performa Invoice converted to Invoice successfully");
      // router.push("/finance/invoices");
    } catch (error) {
      console.error("Failed to convert to invoice:", error);
      toast.error("Failed to convert performa invoice to invoice");
    }
  };

  const handleDeleteClick = (invoice: PerformaInvoiceFormValues) => {
    setDeleteDialog({
      open: true,
      invoice,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.invoice) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      const invoiceId = (deleteDialog.invoice as any)._id;
      if (invoiceId) {
        await deletePerformaInvoice(invoiceId);
        setDeleteDialog({ open: false, invoice: null, loading: false });
        // Refresh stats after deletion
        loadStats();
      }
    } catch (error) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, invoice: null, loading: false });
  };

  const handleRowClick = (invoiceId: string) => {
    router.push(`/finance/performa-invoices/edit/${invoiceId}`);
  };

  // Bulk delete handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select performa invoices that can be deleted (draft only)
      const deletableIds = validInvoices
        .filter((inv) => inv?.status === "draft")
        .map((inv) => inv._id)
        .filter(Boolean) as string[];
      setSelectedInvoices(deletableIds);
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (
    invoiceId: string,
    checked: boolean,
    invoice?: PerformaInvoiceFormValues,
  ) => {
    // Only allow selecting draft invoices
    if (invoice && invoice.status !== "draft") {
      return;
    }
    if (checked) {
      setSelectedInvoices([...selectedInvoices, invoiceId]);
    } else {
      setSelectedInvoices(selectedInvoices.filter((id) => id !== invoiceId));
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedInvoices.length === 0) return;

    // Check if any selected performa invoice is not deletable (only draft can be deleted)
    const nonDeletableCount = validInvoices.filter(
      (inv) =>
        selectedInvoices.includes(inv?._id || "") && inv?.status !== "draft",
    ).length;

    if (nonDeletableCount > 0) {
      toast.error(
        `Cannot delete ${nonDeletableCount} performa invoice(s). Only draft performa invoices can be deleted.`,
      );
      return;
    }

    setBulkDeleteDialog({ open: true, loading: false });
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedInvoices.length === 0) return;

    setBulkDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await bulkAction("delete", selectedInvoices);
      setSelectedInvoices([]);
      setBulkDeleteDialog({ open: false, loading: false });
      // Refresh stats after deletion
      loadStats();
    } catch (error) {
      setBulkDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialog({ open: false, loading: false });
  };

  const invoices = allPerformaInvoices || [];
  const isEmpty = invoices.length === 0;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  // Filter out any null or undefined invoices
  const validInvoices = invoices.filter(
    (inv): inv is PerformaInvoiceFormValues => inv != null,
  );

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Performa Invoices
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track your performa invoices
            </p>
          </div>
          <a
            href="/finance/performa-invoices/create"
            className="px-4 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          >
            + New Performa Invoice
          </a>
        </div>

        {/* Stats Section */}
        <PerformaInvoiceStats
          stats={
            stats || {
              totalInvoices: 0,
              statusBreakdown: [],
              totalRevenue: 0,
              acceptedAmount: 0,
              pendingAmount: 0,
              period: "30 days",
            }
          }
          loading={statsLoading}
        />

        {/* Filters Section */}
        <PerformaInvoiceFilters
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={isLoading}
        />

        {/* Bulk Actions Bar */}
        {selectedInvoices.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-900 font-medium">
                {selectedInvoices.length} performa invoice
                {selectedInvoices.length > 1 ? "s" : ""} selected
              </span>
              <button
                onClick={handleBulkDeleteClick}
                disabled={
                  selectedInvoices.length === 0 ||
                  validInvoices.filter(
                    (inv) =>
                      selectedInvoices.includes(inv?._id || "") &&
                      inv?.status === "draft",
                  ).length === 0
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* {error && (
          <div className="mb-4 p-4 rounded bg-red-100 text-red-800 text-sm">
            {error}
          </div>
        )} */}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto p-4">
            {isLoading ? (
              <div className="py-12 text-center text-gray-600">
                Loading performa invoices...
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedInvoices.length === validInvoices.length &&
                          validInvoices.length > 0
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proforma Invoice
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
                        colSpan={8}
                        className="py-12 text-center text-gray-500 text-lg"
                      >
                        No performa invoices found. <br />
                        <a
                          href="/finance/performa-invoices/create"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          Create your first performa invoice
                        </a>
                      </td>
                    </tr>
                  ) : (
                    validInvoices.map((inv: PerformaInvoiceFormValues, idx) => (
                      <tr
                        key={inv._id || idx}
                        className="transition hover:bg-gray-50 focus-within:bg-gray-100"
                      >
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(inv._id || "")}
                            onChange={(e) =>
                              handleSelectInvoice(
                                inv._id || "",
                                e.target.checked,
                                inv,
                              )
                            }
                            disabled={inv?.status !== "draft"}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() => handleRowClick(inv._id!)}
                        >
                          <div className="flex flex-col">
                            <span className="font-mono font-semibold text-sm">
                              {inv.invoiceNumber}
                            </span>
                            {inv.invoiceTitle && (
                              <span className="text-xs text-gray-600 mt-1 font-medium">
                                {inv.invoiceTitle}
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() => handleRowClick(inv._id!)}
                        >
                          <div className="flex items-center gap-2 mt-1">
                            {inv?.items && inv?.items.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {inv?.items.length} item
                                {inv?.items.length !== 1 ? "s" : ""}
                              </span>
                            )}
                            {(inv as any)?.createdBy?.name && (
                              <span className="text-xs text-gray-500">
                                by {(inv as any)?.createdBy.name}
                              </span>
                            )}
                          </div>
                        </td>

                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() => handleRowClick(inv._id!)}
                        >
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                              {getInitials(
                                (typeof inv?.clientId === "object" &&
                                  (inv?.clientId as any)?.email) ||
                                  inv?.clientDetails?.name ||
                                  "?",
                              )}
                            </span>
                            <span className="flex flex-col">
                              <span className="font-medium">
                          {inv?.clientId?.name}
                              </span>

                              {typeof inv?.clientId === "object" &&
                                (inv?.clientId as any)?.phone && (
                                  <span className="text-xs text-gray-500">
                                    {(inv?.clientId as any)?.phone}
                                  </span>
                                )}
                            </span>
                          </span>
                        </td>

                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() => handleRowClick(inv._id!)}
                        >
                          <div className="flex flex-col">
                            <span>
                              {inv.date
                                ? format(new Date(inv.date), "MMM d, yyyy")
                                : "-"}
                            </span>
                            {inv.dueDate && (
                              <span className="text-xs text-gray-500">
                                Due:{" "}
                                {format(new Date(inv.dueDate), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                        </td>

                        <td
                          className="px-6 py-4 whitespace-nowrap text-right text-gray-900 cursor-pointer"
                          onClick={() => handleRowClick(inv._id!)}
                        >
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-base">
                              ₹
                              {(
                                inv?.grandTotal ??
                                inv?.subtotal ??
                                0
                              ).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            {inv?.subtotal &&
                              inv?.subtotal !== inv?.grandTotal && (
                                <span className="text-xs text-gray-500">
                                  Subtotal: ₹
                                  {inv?.subtotal.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              )}
                            {inv?.totalTax && inv?.totalTax > 0 && (
                              <span className="text-xs text-gray-500">
                                Tax: ₹
                                {inv?.totalTax.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            )}
                            {inv?.discountValue && inv?.discountValue > 0 && (
                              <span className="text-xs text-red-600">
                                Discount:{" "}
                                {inv?.discountType === "flat" ? "₹" : ""}
                                {inv?.discountValue}
                                {inv?.discountType === "percentage" ? "%" : ""}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ⭐ STATUS BADGE */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(inv.status || "draft")}
                            {(inv?.convertedToInvoice ||
                              inv?.status === "converted") && (
                              <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full w-fit">
                                → Invoice
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ⭐ ACTION MENU */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Popover
                            open={openPopoverId === inv._id}
                            onOpenChange={(isOpen) =>
                              setOpenPopoverId(isOpen ? inv._id || null : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                                aria-label="Performa Invoice actions"
                              >
                                <FiMoreVertical />
                              </button>
                            </PopoverTrigger>

                            <PopoverContent className="w-44 p-2" align="end">
                              <div className="flex flex-col gap-1">
                                <Link
                                  href={`/finance/performa-invoices/preview/${inv._id}`}
                                  onClick={() => setOpenPopoverId(null)}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-blue-600 text-sm"
                                  aria-label="Preview Performa Invoice"
                                >
                                  Preview
                                </Link>

                                <Link
                                  href={`/finance/performa-invoices/edit/${inv._id}`}
                                  onClick={() => setOpenPopoverId(null)}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm"
                                  aria-label="Edit Performa Invoice"
                                >
                                  Edit
                                </Link>
                                <button
                                  onClick={() => {
                                    handleSendPerformaInvoiceEmail(inv._id);
                                  }}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left"
                                  aria-label="Send"
                                >
                                  Send Email
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicate(inv._id!);
                                    setOpenPopoverId(null);
                                  }}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left"
                                  aria-label="Duplicate Performa Invoice"
                                >
                                  Duplicate
                                </button>

                                {/* ⭐ CONVERT TO INVOICE (only for accepted status and not yet converted) */}
                                {inv?.status === "accepted" &&
                                  !inv?.convertedToInvoice && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleConvertToInvoice(inv);
                                        setOpenPopoverId(null);
                                      }}
                                      className="px-3 py-2 rounded hover:bg-gray-100 text-green-600 text-sm text-left"
                                      aria-label="Convert to Invoice"
                                    >
                                      Convert to Invoice
                                    </button>
                                  )}

                                {/* ⭐ SEND */}
                                {inv?.status === "draft" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(inv._id!, "sent");
                                      setOpenPopoverId(null);
                                    }}
                                    className="px-3 py-2 rounded hover:bg-gray-100 text-blue-600 text-sm text-left"
                                    aria-label="Send Performa Invoice"
                                  >
                                    Send
                                  </button>
                                )}

                                {/* ⭐ ACCEPT / REJECT */}
                                {inv?.status === "sent" && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(
                                          inv._id!,
                                          "accepted",
                                        );
                                        setOpenPopoverId(null);
                                      }}
                                      className="px-3 py-2 rounded hover:bg-gray-100 text-green-600 text-sm text-left"
                                      aria-label="Accept Performa Invoice"
                                    >
                                      Accept
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(
                                          inv._id!,
                                          "rejected",
                                        );
                                        setOpenPopoverId(null);
                                      }}
                                      className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left"
                                      aria-label="Reject Performa Invoice"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}

                                {/* ⭐ DELETE - Only for draft status */}
                                {inv?.status === "draft" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(inv);
                                      setOpenPopoverId(null);
                                    }}
                                    className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left flex items-center gap-2"
                                    aria-label="Delete Performa Invoice"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                    Delete
                                  </button>
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
            )}
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
                {pagination.total} performa invoices
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
                  {Array.from(
                    { length: pagination.pages },
                    (_, i) => i + 1,
                  ).map((page) => {
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
                  })}
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
      </div>

      <DeletePerformaInvoiceDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        invoice={deleteDialog.invoice}
        loading={deleteDialog.loading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      {bulkDeleteDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Bulk Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedInvoices.length} performa
              invoice
              {selectedInvoices.length > 1 ? "s" : ""}? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleBulkDeleteCancel}
                disabled={bulkDeleteDialog.loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                disabled={bulkDeleteDialog.loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {bulkDeleteDialog.loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    Delete {selectedInvoices.length} Performa Invoice
                    {selectedInvoices.length > 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
