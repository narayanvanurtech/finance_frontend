"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiCopy,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Import hooks
import {
  useGetPayoutReceipts,
  useDeletePayoutReceipt,
  useGetPayoutReceiptStats,
} from "@/hooks/usePaymentMadeQueries";

// Import components
import PaymentMadeStats from "@/components/finance/paymentMade/PaymentMadeStats";
import PaymentMadeFilters, {
  SearchFilters,
} from "@/components/finance/paymentMade/PaymentMadeFilters";
import DeletePaymentMadeDialog from "@/components/finance/paymentMade/DeletePaymentMadeDialog";

// Get Vendor Initials
const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "VN";

// Payment Type Badge
const getPaymentTypeBadge = (type: string) => {
  const paymentType = type?.toLowerCase();

  if (paymentType === "payment") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
        <FiCheckCircle className="inline" /> Payment
      </span>
    );
  } else if (paymentType === "advance") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
        <FiClock className="inline" /> Advance
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
      {type || "Unknown"}
    </span>
  );
};

export default function PaymentsMadeListPage() {
  /** UI States **/
  const [mounted, setMounted] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    payment: null as any,
    loading: false,
  });

  /** Pagination **/
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /** Filters **/
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  /** Bulk Delete **/
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({
    open: false,
    loading: false,
  });

  /** Queries **/
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    refetch: refetchPayments,
  } = useGetPayoutReceipts({
    page: currentPage,
    limit: itemsPerPage,
    ...currentFilters,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetPayoutReceiptStats();

  const deletePaymentMutation = useDeletePayoutReceipt();

  const payments = paymentsData?.result?.receipts || [];
  const stats = statsData?.result || {};
  const pagination = paymentsData?.result?.pagination;

  /** Mount + Load **/
  useEffect(() => {
    setMounted(true);
  }, []);

  /** Bulk Selection **/
  const handleSelectAll = (checked: boolean) =>
    checked
      ? setSelectedPayments(payments.map((p) => p._id))
      : setSelectedPayments([]);

  const handleSelectPayment = (id: string, checked: boolean) =>
    setSelectedPayments((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id)
    );

  /** Single Delete **/
  const handleDelete = async () => {
    if (!deleteModal.payment?._id) return;
    setDeleteModal((p) => ({ ...p, loading: true }));

    try {
      await deletePaymentMutation.mutateAsync(deleteModal.payment._id);
      toast.success("Payment Deleted!");
      refetchPayments();
      refetchStats();
    } catch (error) {
      toast.error("Failed to delete payment!");
    }

    setDeleteModal({ open: false, payment: null, loading: false });
  };

  /** Bulk Delete **/
  const handleBulkDeleteClick = () => {
    if (selectedPayments.length === 0) return;
    setBulkDeleteDialog({ open: true, loading: false });
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedPayments.length === 0) return;

    setBulkDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await Promise.all(
        selectedPayments.map((id) => deletePaymentMutation.mutateAsync(id))
      );
      setSelectedPayments([]);
      setBulkDeleteDialog({ open: false, loading: false });
      toast.success(
        `Successfully deleted ${selectedPayments.length} payment(s)`
      );
      refetchPayments();
      refetchStats();
    } catch (error) {
      setBulkDeleteDialog((prev) => ({ ...prev, loading: false }));
      toast.error("Failed to delete payments");
    }
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialog({ open: false, loading: false });
  };

  /** Handle Filters **/
  const handleSearch = useCallback(
    async (filters: SearchFilters) => {
      console.log("🔍 handleSearch called with filters:", filters);
      setCurrentFilters(filters);
      setCurrentPage(1);
      refetchPayments();
    },
    [refetchPayments]
  );

  const handleClearFilters = useCallback(async () => {
    setCurrentFilters({});
    setCurrentPage(1);
    refetchPayments();
  }, [refetchPayments]);

  /** Stat Click Handler **/
  const handleStatClick = useCallback(
    async (filterType: "all" | "payment" | "advance") => {
      setCurrentPage(1);

      if (filterType === "all") {
        setCurrentFilters({});
      } else if (filterType === "payment") {
        setCurrentFilters({ paymentType: "Payment" });
      } else if (filterType === "advance") {
        setCurrentFilters({ paymentType: "Advance" });
      }
      
      refetchPayments();
    },
    [refetchPayments]
  );

  /** Pagination **/
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const isEmpty = !payments || payments.length === 0;

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments Made</h1>
          <p className="text-gray-600 mt-1">
            Track and Manage Outgoing Payments
          </p>
        </div>
        <Link
          href="/finance/payments-made/create"
          className="px-4 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
        >
          + New Payment
        </Link>
      </div>

      {/* Stats Section */}
      <PaymentMadeStats
        stats={stats}
        loading={statsLoading}
        onStatClick={handleStatClick}
      />

      {/* Filters Section */}
      <PaymentMadeFilters
        onSearch={handleSearch}
        onClear={handleClearFilters}
        loading={paymentsLoading}
      />

      {/* Bulk Actions Bar */}
      {selectedPayments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              {selectedPayments.length} payment
              {selectedPayments.length > 1 ? "s" : ""} selected
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

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto p-4">
          {paymentsLoading ? (
            <div className="py-12 text-center text-gray-600">
              Loading payments...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedPayments.length === payments.length &&
                        payments.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
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
                      No payments found. <br />
                      <Link
                        href="/finance/payments-made/create"
                        className="text-blue-600 underline mt-2 inline-block"
                      >
                        Create your first payment
                      </Link>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, idx) => {
                    const vendor =
                      typeof payment.vendorId === "string"
                        ? "Unknown"
                        : payment.vendorId?.name || "-";
                    const vendorEmail =
                      typeof payment.vendorId === "object"
                        ? payment.vendorId?.email
                        : "";
                    const vendorPhone =
                      typeof payment.vendorId === "object"
                        ? payment.vendorId?.phone
                        : "";

                    const primaryMethod =
                      payment.paymentRecords?.[0]?.paymentMethod || "N/A";

                    return (
                      <tr
                        key={payment._id || idx}
                        className="transition hover:bg-gray-50 focus-within:bg-gray-100"
                      >
                        {/* Checkbox */}
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedPayments.includes(payment._id)}
                            onChange={(e) =>
                              handleSelectPayment(payment._id, e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>

                        {/* Payment Number */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-3">
                              <FiDollarSign />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {payment.receiptNo || "-"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {payment.purpose || "No purpose"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Vendor */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-xs mr-3">
                              {getInitials(vendor)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {vendor}
                              </div>
                              {vendorEmail && (
                                <div className="text-xs text-gray-500">
                                  {vendorEmail}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(payment.receiptDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(payment.receiptDate).toLocaleDateString(
                              "en-IN",
                              { weekday: "short" }
                            )}
                          </div>
                        </td>

                        {/* Method */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded capitalize">
                            {primaryMethod}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            ₹{payment.totalAmount?.toLocaleString() || 0}
                          </div>
                          {payment.paymentRecords?.length > 1 && (
                            <div className="text-xs text-gray-500">
                              {payment.paymentRecords.length} records
                            </div>
                          )}
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentTypeBadge(payment.paymentType)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Popover
                            open={openPopover === payment._id}
                            onOpenChange={(open) =>
                              setOpenPopover(open ? payment._id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <button className="p-2 rounded hover:bg-gray-100 transition">
                                <FiMoreVertical className="w-5 h-5 text-gray-600" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-48 p-2"
                              align="end"
                            >
                              <div className="flex flex-col gap-1">
                                <Link
                                  href={`/finance/payments-made/${payment._id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 transition"
                                  onClick={() => setOpenPopover(null)}
                                >
                                  <FiEye className="w-4 h-4" />
                                  View Details
                                </Link>
                                <Link
                                  href={`/finance/payments-made/edit/${payment._id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 transition"
                                  onClick={() => setOpenPopover(null)}
                                >
                                  <FiEdit className="w-4 h-4" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => {
                                    setDeleteModal({
                                      open: true,
                                      payment: payment,
                                      loading: false,
                                    });
                                    setOpenPopover(null);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-red-50 text-red-600 transition"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {!paymentsLoading && payments.length > 0 && pagination && (
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
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} payments
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
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => {
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
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
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeletePaymentMadeDialog
        open={deleteModal.open}
        onClose={() =>
          setDeleteModal({ open: false, payment: null, loading: false })
        }
        onConfirm={handleDelete}
        loading={deleteModal.loading}
        payment={deleteModal.payment}
      />

      {/* Bulk Delete Confirmation Dialog */}
      {bulkDeleteDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Bulk Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedPayments.length} payment
              {selectedPayments.length > 1 ? "s" : ""}? This action cannot be
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
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    Delete {selectedPayments.length} Payment
                    {selectedPayments.length > 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
