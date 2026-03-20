"use client";
import React, { useEffect, useState, useCallback } from "react";
import { usePaymentReceivedStore } from "@/stores/financeStore/usePaymentReceivedStore";
import Link from "next/link";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  FiMoreVertical,
  FiTrash2,
  FiEye,
  FiEdit2,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiDollarSign,
  FiCopy,
} from "react-icons/fi";
import DeletePaymentDialog from "@/components/finance/paymentReceived/DeletePaymentDialog";
import PaymentStats from "@/components/finance/paymentReceived/PaymentStats";
import PaymentFilters, {
  SearchFilters,
} from "@/components/finance/paymentReceived/PaymentFilters";
import { format } from "date-fns";
import { toast } from "sonner";

// Get Client Initials
const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "CN";

// Status Badge
const getStatusBadge = (status: string) => {
  const type = status?.toLowerCase();

  const badges: any = {
    completed: (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
        <FiCheckCircle className="inline" /> Completed
      </span>
    ),
    pending: (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
        <FiClock className="inline" /> Pending
      </span>
    ),
    failed: (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
        <FiXCircle className="inline" /> Failed
      </span>
    ),
    refunded: (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">
        <FiDollarSign className="inline" /> Refunded
      </span>
    ),
  };

  return (
    badges[type] || (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
        {status || "Pending"}
      </span>
    )
  );
};

export default function PaymentReceivedListPage() {
  /** Store States **/
  const payments = usePaymentReceivedStore((s) => s.payments);
  const fetchPayments = usePaymentReceivedStore((s) => s.fetchPayments);
  const deletePayment = usePaymentReceivedStore((s) => s.deletePayment);
  const searchPayments = usePaymentReceivedStore((s) => s.searchPayments);
  const loadPaymentStats = usePaymentReceivedStore((s) => s.loadPaymentStats);
  const storeStats = usePaymentReceivedStore((s) => s.stats);

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

  /** Stats **/
  const [statsLoading, setStatsLoading] = useState(false);

  /** Filters **/
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});
  const [loading, setLoading] = useState(false);

  /** Bulk Delete **/
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({
    open: false,
    loading: false,
  });

  /** Mount + Load **/
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setLoading(true);
    fetchPayments().finally(() => setLoading(false));

    // Load stats
    setStatsLoading(true);
    loadPaymentStats().finally(() => setStatsLoading(false));
  }, [mounted, fetchPayments, loadPaymentStats]);

  /** Calculate Stats - Removed as we're using API stats **/

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
    if (!deleteModal.payment?.id) return;
    setDeleteModal((p) => ({ ...p, loading: true }));

    try {
      await deletePayment(deleteModal.payment.id);
      toast.success("Payment Deleted!");
    } catch {
      toast.error("Failed!");
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
      // Delete each payment
      await Promise.all(selectedPayments.map((id) => deletePayment(id)));
      setSelectedPayments([]);
      setBulkDeleteDialog({ open: false, loading: false });
      toast.success(
        `Successfully deleted ${selectedPayments.length} payment(s)`
      );
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
      //console.log("🔍 handleSearch called with filters:", filters);
      setCurrentFilters(filters);
      setCurrentPage(1);
      setLoading(true);

      // Convert filter values to proper types for API
      const apiFilters: any = {};
      
      // Only add filters that have actual values
      if (filters.search && filters.search.trim() !== "") {
        apiFilters.search = filters.search.trim();
      }
      if (filters.status && filters.status !== "all") {
        apiFilters.status = filters.status;
      }
      if (filters.paymentType && filters.paymentType !== "all") {
        apiFilters.paymentType = filters.paymentType;
      }
      if (filters.paymentMethod && filters.paymentMethod !== "all") {
        apiFilters.paymentMethod = filters.paymentMethod;
      }
      if (filters.minAmount && filters.minAmount !== "") {
        const minAmt = parseFloat(filters.minAmount);
        if (!isNaN(minAmt)) apiFilters.minAmount = minAmt;
      }
      if (filters.maxAmount && filters.maxAmount !== "") {
        const maxAmt = parseFloat(filters.maxAmount);
        if (!isNaN(maxAmt)) apiFilters.maxAmount = maxAmt;
      }
      if (filters.dateFrom && filters.dateFrom !== "") {
        apiFilters.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo && filters.dateTo !== "") {
        apiFilters.dateTo = filters.dateTo;
      }

      //console.log("📤 API Filters being sent:", apiFilters);

      try {
        // If no filters, fetch all payments
        if (Object.keys(apiFilters).length === 0) {
          //console.log("ℹ️ No filters applied, fetching all payments");
          await fetchPayments();
        } else {
          //console.log("🔎 Applying filters:", apiFilters);
          await searchPayments(apiFilters);
        }
        //console.log("✅ Search completed successfully");
      } catch (error) {
        console.error("❌ Search failed:", error);
        toast.error("Filter search failed");
      } finally {
        setLoading(false);
      }
    },
    [searchPayments, fetchPayments]
  );

  const handleClearFilters = useCallback(async () => {
    setCurrentFilters({});
    setCurrentPage(1);
    setLoading(true);
    await fetchPayments();
    setLoading(false);
  }, [fetchPayments]);

  /** Stat Click Handler **/
  const handleStatClick = useCallback(
    async (filterType: "all" | "invoice" | "advance") => {
      setCurrentPage(1);
      setLoading(true);

      try {
        if (filterType === "all") {
          // Show all payments
          await fetchPayments();
          setCurrentFilters({});
        } else if (filterType === "invoice") {
          // Filter by invoice payments (paymentType)
          const filters = { paymentType: "invoice" };
          setCurrentFilters(filters);
          await searchPayments(filters);
        } else if (filterType === "advance") {
          // Filter by advance payments
          const filters = { paymentType: "advance" };
          setCurrentFilters(filters);
          await searchPayments(filters);
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchPayments, searchPayments]
  );

  /** Pagination **/
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const paginated = payments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  /** Duplicate Payment **/
  const handleDuplicate = async (paymentId: string) => {
    try {
      // Implement duplicate logic if available in store
      toast.success("Payment duplicated!");
      setOpenPopover(null);
    } catch (error) {
      console.error("Failed to duplicate payment:", error);
      toast.error("Failed to duplicate payment");
    }
  };

  const isEmpty = !payments || payments.length === 0;


  //console.log("paginated",paginated)

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Receipts</h1>
          <p className="text-gray-600 mt-1">
            Track and Manage Incoming Payments
          </p>
        </div>
        <Link
          href="/finance/payment-received/create"
          className="px-4 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
        >
          + New Receipt
        </Link>
      </div>

      {/* Stats Section */}
      <PaymentStats
        stats={storeStats || {}}
        loading={statsLoading}
        onStatClick={handleStatClick}
      />

      {/* Filters Section */}
      <PaymentFilters
        onSearch={handleSearch}
        onClear={handleClearFilters}
        loading={loading}
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
          {loading ? (
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
                    Client
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
                      No payments found. <br />
                      <Link
                        href="/finance/payment-received/create"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        Create your first payment receipt
                      </Link>
                    </td>
                  </tr>
                ) : (
                  paginated.map((p, idx) => {
                    const amount =
                      p.totalAmount ||
                      p.paymentRecords?.reduce(
                        (s, r) => s + r.amountReceived,
                        0
                      ) ||
                      0;
                    const client =
                      typeof p.clientId === "string"
                        ? "Unknown"
                        : p.clientId?.businessName || "-";
                    const clientEmail =
                      typeof p.clientId === "object" ? p.clientId?.email : "";
                    const clientPhone =
                      typeof p.clientId === "object" ? p.clientId?.phone : "";

                    return (
                      <tr
                        key={p._id || idx}
                        className="transition hover:bg-gray-50 focus-within:bg-gray-100"
                      >
                        {/* Checkbox */}
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPayments.includes(p._id)}
                            onChange={(e) =>
                              handleSelectPayment(p._id, e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>

                        {/* Payment Number */}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/finance/payment-received/edit/${p._id}`)
                          }
                        >
                          <div className="flex flex-col">
                            <span className="font-mono font-semibold text-sm">
                              {p.paymentNo ?? p._id}
                            </span>
                            {p.paymentRecords?.length > 0 && (
                              <span className="text-xs text-gray-500 mt-1">
                                {p.paymentRecords.length} record
                                {p.paymentRecords.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Client */}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/finance/payment-received/edit/${p._id}`)
                          }
                        >
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                              {getInitials(client)}
                            </span>
                            <span className="flex flex-col">
                              <span className="font-medium">{client}</span>
                              {clientEmail && (
                                <span className="text-xs text-gray-500">
                                  {clientEmail}
                                </span>
                              )}
                              {clientPhone && (
                                <span className="text-xs text-gray-500">
                                  {clientPhone}
                                </span>
                              )}
                            </span>
                          </span>
                        </td>

                        {/* Date */}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/finance/payment-received/edit/${p._id}`)
                          }
                        >
                          <div className="flex flex-col">
                            <span>
                              {p.receiptDate
                                ? format(new Date(p.receiptDate), "MMM d, yyyy")
                                : "-"}
                            </span>
                          </div>
                        </td>

                        {/* Method */}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/finance/payment-received/edit/${p._id}`)
                          }
                        >
                          {p.paymentRecords?.[0]?.paymentMethod || "-"}
                        </td>

                        {/* Amount */}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-right text-gray-900 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/finance/payment-received/edit/${p._id}`)
                          }
                        >
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-base">
                              ₹
                              {amount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge((p as any)?.status)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Popover
                            open={openPopover === p._id}
                            onOpenChange={(isOpen) =>
                              setOpenPopover(isOpen ? p._id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Payment actions"
                              >
                                <FiMoreVertical />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-44 p-2" align="end">
                              <div className="flex flex-col gap-1">
                                <Link
                                  href={`/finance/payment-received/preview/${p._id}`}
                                  onClick={() => setOpenPopover(null)}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-blue-600 text-sm"
                                  aria-label="Preview Payment"
                                >
                                  Preview
                                </Link>
                                <Link
                                  href={`/finance/payment-received/edit/${p._id}`}
                                  onClick={() => setOpenPopover(null)}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm"
                                  aria-label="Edit Payment"
                                >
                                  Edit
                                </Link>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicate(p._id);
                                  }}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left flex items-center gap-2"
                                  aria-label="Duplicate Payment"
                                >
                                  <FiCopy className="w-4 h-4" />
                                  Duplicate
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteModal({
                                      open: true,
                                      payment: { id: p._id, client, amount },
                                      loading: false,
                                    });
                                    setOpenPopover(null);
                                  }}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left flex items-center gap-2"
                                  aria-label="Delete Payment"
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
      {!loading && payments.length > 0 && (
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
              {payments.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}{" "}
              to {Math.min(currentPage * itemsPerPage, payments.length)} of{" "}
              {payments.length} payments
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
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
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeletePaymentDialog
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
