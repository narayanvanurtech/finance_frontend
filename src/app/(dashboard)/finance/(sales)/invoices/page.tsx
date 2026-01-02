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
  FiClock,
  FiDollarSign,
  FiAlertCircle,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import DeleteInvoiceDialog from "@/components/finance/invoice/DeleteInvoiceDialog";
import InvoiceStats from "@/components/finance/invoice/InvoiceStats";
import InvoiceFilters, {
  SearchFilters,
} from "@/components/finance/invoice/InvoiceFilters";
import type { InvoiceFormValues } from "@/components/finance/invoice/InvoiceForm";
import { useInvoiceStore } from "@/stores/financeStore/useInvoiceStore";

// Valid status transitions
const validTransitions = {
  draft: ["sent", "draft", "cancelled"],
  sent: ["paid", "partially_paid", "overdue", "cancelled", "draft"],
  paid: ["paid"],
  partially_paid: ["paid", "partially_paid", "overdue", "cancelled"],
  overdue: ["paid", "partially_paid", "overdue", "cancelled"],
  cancelled: ["cancelled", "draft"],
};

// Helper to check if a status transition is valid
const isValidTransition = (currentStatus: string, newStatus: string): boolean => {
  const normalizedCurrent = currentStatus || "draft";
  const allowedTransitions = validTransitions[normalizedCurrent as keyof typeof validTransitions];
  return allowedTransitions ? allowedTransitions.includes(newStatus) : false;
};

// Helper to get valid next statuses for a given current status
const getValidNextStatuses = (currentStatus: string): string[] => {
  const normalizedCurrent = currentStatus || "draft";
  return validTransitions[normalizedCurrent as keyof typeof validTransitions] || [];
};

// Helper to get client initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function InvoicesPage() {
  const router = useRouter();
  const allInvoices = useInvoiceStore((state) => state.invoices);
  const pagination = useInvoiceStore((state) => state.pagination);
  const fetchInvoices = useInvoiceStore((state) => state.fetchInvoices);
  const searchInvoices = useInvoiceStore((state) => state.searchInvoices);
  const getInvoiceStats = useInvoiceStore((state) => state.getInvoiceStats);
  const duplicateInvoice = useInvoiceStore((state) => state.duplicateInvoice);
  const deleteInvoice = useInvoiceStore((state) => state.deleteInvoice);
  const updateInvoiceStatus = useInvoiceStore(
    (state) => state.updateInvoiceStatus
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    invoice: InvoiceFormValues | null;
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
  const bulkAction = useInvoiceStore((state) => state.bulkAction);

  // Stats state
  const [stats, setStats] = useState<{
    totalInvoices: number;
    statusBreakdown: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    totalRevenue: number;
    paidAmount: number;
    pendingAmount: number;
    overdueInvoices?: number;
    overdueAmount?: number;
    period: string;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  // Load statistics
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const statsData = await getInvoiceStats("30");
      
      const statusBreakdown = Array.isArray(statsData?.statusBreakdown)
        ? statsData.statusBreakdown.map((item: any) => ({
            status: item._id || item.status || "unknown",
            count: item.count || 0,
            percentage:
              statsData?.totalInvoices > 0
                ? Math.round((item.count / statsData.totalInvoices) * 100)
                : 0,
          }))
        : [];

      // Calculate totalRevenue from statusBreakdown, paymentBreakdown, or use totalValue
      const totalRevenue =
        typeof statsData?.totalRevenue === "number"
          ? statsData.totalRevenue
          : typeof statsData?.totalValue === "number"
          ? statsData.totalValue
          : Array.isArray(statsData?.statusBreakdown) && statsData.statusBreakdown.length > 0
          ? statsData.statusBreakdown.reduce(
              (sum: number, item: any) => sum + (item.totalValue || 0),
              0
            )
          : Array.isArray(statsData?.paymentBreakdown)
          ? statsData.paymentBreakdown.reduce(
              (sum: number, item: any) => sum + (item.totalValue || 0),
              0
            )
          : 0;

      // Calculate paidAmount from paymentBreakdown where _id is "paid"
      const paidAmount = Array.isArray(statsData?.paymentBreakdown)
        ? statsData.paymentBreakdown
            .filter((item: any) => item._id === "paid")
            .reduce((sum: number, item: any) => sum + (item.totalPaid || 0), 0)
        : 0;

      // Calculate pendingAmount from paymentBreakdown where _id is "unpaid", "partial", or "overdue"
      const pendingAmount = Array.isArray(statsData?.paymentBreakdown)
        ? statsData.paymentBreakdown
            .filter(
              (item: any) =>
                item._id === "unpaid" || item._id === "partial" || item._id === "overdue"
            )
            .reduce(
              (sum: number, item: any) => sum + (item.totalValue || 0),
              0
            )
        : 0;

      // Extract overdue information from API response
      const overdueInvoices = typeof statsData?.overdueInvoices === "number"
        ? statsData.overdueInvoices
        : 0;
      
      const overdueAmount = typeof statsData?.overdueAmount === "number"
        ? statsData.overdueAmount
        : 0;

      // Ensure we have a valid stats object with default values
      const safeStats = {
        totalInvoices: statsData?.totalInvoices || 0,
        statusBreakdown,
        totalRevenue,
        paidAmount,
        pendingAmount,
        overdueInvoices,
        overdueAmount,
        period: statsData?.period || "30 days",
      };
      
      setStats(safeStats);
    } catch (error) {
      console.error("Failed to load stats:", error);
      // Set default stats on error
      setStats({
        totalInvoices: 0,
        statusBreakdown: [],
        totalRevenue: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueInvoices: 0,
        overdueAmount: 0,
        period: "30 days",
      });
    } finally {
      setStatsLoading(false);
    }
  }, [getInvoiceStats]);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if there are active filters
        const hasActiveFilters = Object.values(currentFilters).some(
          (value) => value && value.length > 0
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

          await searchInvoices(params);
        } else {
          // No filters, fetch all
          await fetchInvoices(currentPage, itemsPerPage);
        }
      } catch (err: any) {
        setError(`Failed to load invoices: ${err?.message || "Unknown error"}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
    loadStats();
  }, [
    fetchInvoices,
    searchInvoices,
    currentPage,
    itemsPerPage,
    currentFilters,
    loadStats,
  ]);

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
      await duplicateInvoice(invoiceId);
      setCurrentPage(1); // Reset to page 1 after duplication
      setItemsPerPage(10);
      // Refresh stats after duplication
      loadStats();
    } catch (error) {
      setError(
        `Failed to duplicate invoice: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: string, currentStatus?: string) => {
    try {
      // Find the invoice to get its current status
      const invoice = invoices.find((inv) => (inv as any)._id === invoiceId);
      const invoiceStatus = currentStatus || invoice?.status || "draft";
      
      // Validate the transition
      if (!isValidTransition(invoiceStatus, newStatus)) {
        toast.error(
          `Invalid status transition: Cannot change from "${invoiceStatus}" to "${newStatus}"`
        );
        return;
      }

      await updateInvoiceStatus(invoiceId, newStatus);
      setOpenPopoverId(null);
      // Refresh stats after status change
      loadStats();
    } catch (error) {
      console.error("Failed to update invoice status:", error);
      toast.error("Failed to update invoice status");
    }
  };

  const handleDeleteClick = (invoice: InvoiceFormValues) => {
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
        await deleteInvoice(invoiceId);
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
    router.push(`/finance/invoices/edit/${invoiceId}`);
  };

  // Bulk delete handlers - Only for draft invoices
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select draft invoices
      const draftIds = invoices
        .filter(
          (inv) =>
            inv?.status === "draft" || !inv?.status
        )
        .map((inv) => (inv as any)._id)
        .filter(Boolean);
      setSelectedInvoices(draftIds);
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    // Only allow selecting draft invoices
    const invoice = invoices.find((inv) => (inv as any)._id === invoiceId);
    if (invoice && invoice?.status !== "draft" && invoice?.status) {
      return; // Don't allow selecting non-draft invoices
    }
    
    if (checked) {
      setSelectedInvoices([...selectedInvoices, invoiceId]);
    } else {
      setSelectedInvoices(selectedInvoices.filter((id) => id !== invoiceId));
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedInvoices.length === 0) return;

    // Check if any selected invoice is not a draft
    const nonDraftCount = invoices.filter(
      (inv) =>
        selectedInvoices.includes((inv as any)._id) &&
        inv?.status !== "draft" &&
        inv?.status
    ).length;

    if (nonDraftCount > 0) {
      toast.error(
        `Cannot delete ${nonDraftCount} invoice(s). Only draft invoices can be deleted.`
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

  const invoices = allInvoices || [];
  const isEmpty = invoices.length === 0;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-1">Manage and track your invoices</p>
          </div>
          <a
            href="/finance/invoices/create"
            className="px-4 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          >
            + New Invoice
          </a>
        </div>

        {/* Stats Section */}
        <InvoiceStats
          stats={
            stats ?? {
              totalInvoices: 0,
              statusBreakdown: [],
              totalRevenue: 0,
              paidAmount: 0,
              pendingAmount: 0,
              overdueInvoices: 0,
              overdueAmount: 0,
              period: "30 days",
            }
          }
          loading={statsLoading}
        />

        {/* Filters Section */}
        <InvoiceFilters
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={isLoading}
        />

        {/* Bulk Actions Bar */}
        {selectedInvoices.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-900 font-medium">
                {selectedInvoices.length} invoice
                {selectedInvoices.length > 1 ? "s" : ""} selected
              </span>
              <button
                onClick={handleBulkDeleteClick}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded bg-red-100 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto p-4">
            {isLoading ? (
              <div className="py-12 text-center text-gray-600">
                Loading invoices...
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          (() => {
                            const draftInvoices = invoices.filter(
                              (inv) => inv?.status === "draft" || !inv?.status
                            );
                            return (
                              draftInvoices.length > 0 &&
                              draftInvoices.every((inv) =>
                                selectedInvoices.includes((inv as any)._id)
                              )
                            );
                          })()
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
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
                        No invoices found. <br />
                        <a
                          href="/finance/invoices/create"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          Create your first invoice
                        </a>
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv, idx) => (
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
                            checked={selectedInvoices.includes(
                              (inv as any)._id
                            )}
                            onChange={(e) =>
                              handleSelectInvoice(
                                (inv as any)._id,
                                e.target.checked
                              )
                            }
                            disabled={
                              // Only enable for draft invoices, explicitly disable for paid, cancelled, and all other statuses
                              inv?.status === "paid" || 
                              (inv?.status as string) === "cancelled" ||
                              (inv?.status !== "draft" && inv?.status !== undefined)
                            }
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
                                  "?"
                              )}
                            </span>
                            <span className="flex flex-col">
                              <span className="font-medium">
                                {(typeof inv?.clientId === "object" &&
                                  (inv?.clientId as any)?.email) ||
                                  inv?.clientDetails?.name ||
                                  "-"}
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
                                (inv as any)?.grandTotal ||
                                (inv as any)?.total ||
                                0
                              ).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            {(inv as any)?.subtotal &&
                              (inv as any)?.subtotal !==
                                (inv as any)?.grandTotal && (
                                <span className="text-xs text-gray-500">
                                  Subtotal: ₹
                                  {(inv as any)?.subtotal.toLocaleString(
                                    "en-IN",
                                    {
                                      minimumFractionDigits: 2,
                                    }
                                  )}
                                </span>
                              )}
                            {(inv as any)?.totalTax &&
                              (inv as any)?.totalTax > 0 && (
                                <span className="text-xs text-gray-500">
                                  Tax: ₹
                                  {(inv as any)?.totalTax.toLocaleString(
                                    "en-IN",
                                    {
                                      minimumFractionDigits: 2,
                                    }
                                  )}
                                </span>
                              )}
                            {(inv as any)?.discountValue &&
                              (inv as any)?.discountValue > 0 && (
                                <span className="text-xs text-red-600">
                                  Discount:{" "}
                                  {(inv as any)?.discountType === "flat"
                                    ? "₹"
                                    : ""}
                                  {(inv as any)?.discountValue}
                                  {(inv as any)?.discountType === "percentage"
                                    ? "%"
                                    : ""}
                                </span>
                              )}
                          </div>
                        </td>

                        {/* ⭐ STATUS BADGE */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {inv?.status === "paid" && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                                <FiCheckCircle /> Paid
                              </span>
                            )}

                            {(inv?.status as string) === "partially_paid" && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                                <FiDollarSign /> Partially Paid
                              </span>
                            )}

                            {(inv?.status as string) === "overdue" && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                                <FiAlertCircle /> Overdue
                              </span>
                            )}

                            {inv?.status === "sent" && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                                <FiSend /> Sent
                              </span>
                            )}

                            {(inv?.status as string) === "cancelled" && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
                                <FiXCircle /> Cancelled
                              </span>
                            )}

                            {(inv?.status === "draft" || !inv?.status) && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
                                Draft
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ⭐ ACTION MENU */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Popover
                            open={openPopoverId === (inv as any)._id}
                            onOpenChange={(isOpen) =>
                              setOpenPopoverId(isOpen ? (inv as any)._id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                                aria-label="Invoice actions"
                              >
                                <FiMoreVertical />
                              </button>
                            </PopoverTrigger>

                            <PopoverContent className="w-44 p-2" align="end">
                              <div className="flex flex-col gap-1">
                                <Link
                                  href={`/finance/invoices/preview/${inv._id}`}
                                  onClick={() => setOpenPopoverId(null)}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-blue-600 text-sm"
                                  aria-label="Preview Invoice"
                                >
                                  Preview
                                </Link>

                                <Link
                                  href={`/finance/invoices/edit/${inv._id}`}
                                  onClick={() => setOpenPopoverId(null)}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm"
                                  aria-label="Edit Invoice"
                                >
                                  Edit
                                </Link>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicate(inv._id!);
                                    setOpenPopoverId(null);
                                  }}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left"
                                  aria-label="Duplicate Invoice"
                                >
                                  Duplicate
                                </button>

                                {/* Status transition buttons based on valid transitions */}
                                {(() => {
                                  const currentStatus = inv?.status || "draft";
                                  const validNextStatuses = getValidNextStatuses(currentStatus);
                                  const statusLabels: Record<string, string> = {
                                    sent: "Send",
                                    paid: "Mark as Paid",
                                    partially_paid: "Mark as Partially Paid",
                                    overdue: "Mark as Overdue",
                                    cancelled: "Cancel",
                                    draft: "Mark as Draft",
                                  };
                                  const statusColors: Record<string, string> = {
                                    sent: "text-blue-600",
                                    paid: "text-green-600",
                                    partially_paid: "text-yellow-600",
                                    overdue: "text-red-600",
                                    cancelled: "text-gray-600",
                                    draft: "text-gray-600",
                                  };

                                  // Filter out the current status and show only transitions
                                  return validNextStatuses
                                    .filter((status) => status !== currentStatus)
                                    .map((status) => (
                                      <button
                                        key={status}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusChange(inv._id!, status, currentStatus);
                                          setOpenPopoverId(null);
                                        }}
                                        className={`px-3 py-2 rounded hover:bg-gray-100 ${statusColors[status] || "text-gray-700"} text-sm text-left`}
                                        aria-label={`Change status to ${status}`}
                                      >
                                        {statusLabels[status] || status}
                                      </button>
                                    ));
                                })()}

                                {/* ⭐ DELETE - Only for draft and cancelled status */}
                                {(inv?.status === "draft" ||
                                  !inv?.status ||
                                  (inv?.status as string) === "cancelled") && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(inv);
                                      setOpenPopoverId(null);
                                    }}
                                    className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left flex items-center gap-2"
                                    aria-label="Delete Invoice"
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
                {pagination.total} invoices
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
                    (_, i) => i + 1
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

      <DeleteInvoiceDialog
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
              Are you sure you want to delete {selectedInvoices.length} invoice
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
                    Delete {selectedInvoices.length} Invoice
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
