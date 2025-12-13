"use client";

import React, { useState } from "react";
import {
  usePurchasesList,
  useDeletePurchase,
  useUpdatePaymentStatus,
} from "@/hooks/usePurchaseExpenseQueries";
import { useRouter } from "next/navigation";
import {
  FiMoreVertical,
  FiTrash2,
  FiEdit,
  FiEye,
  FiDollarSign,
  FiPackage,
} from "react-icons/fi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import DeleteExpenseDialog from "@/components/finance/expenses/DeleteExpenseDialog";
import UpdatePaymentStatusDialog from "@/components/finance/expenses/UpdatePaymentStatusDialog";
import type { ExpenseFormValues } from "@/components/finance/expenses/ExpenseForm";

export default function ExpensesListPage() {
  const { purchases, isLoading, pagination, refetch, isError, error } =
    usePurchasesList();
  const { mutate: deletePurchase, isPending: isDeleting } = useDeletePurchase();
  const { mutate: updatePaymentStatus, isPending: isUpdatingPayment } =
    useUpdatePaymentStatus();
  const router = useRouter();

  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    expense: any | null;
    loading: boolean;
  }>({
    open: false,
    expense: null,
    loading: false,
  });

  // Bulk delete state
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState<{
    open: boolean;
    loading: boolean;
  }>({
    open: false,
    loading: false,
  });

  // Debug: Log purchases when they load
  React.useEffect(() => {

    if (purchases && purchases.length > 0) {
      console.log("First purchase:", purchases[0]);
    } else {
      console.log("⚠️ No purchases data available");
    }
    console.log("=========================");
  }, [purchases, isLoading, isError, error]);

  const handleDeleteClick = (expense: any) => {
    setDeleteDialog({
      open: true,
      expense,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.expense) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    deletePurchase(deleteDialog.expense._id, {
      onSuccess: () => {
        setDeleteDialog({ open: false, expense: null, loading: false });
      },
      onError: () => {
        setDeleteDialog((prev) => ({ ...prev, loading: false }));
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, expense: null, loading: false });
  };

  // Bulk delete handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = purchases
        .map((purchase: any) => purchase._id)
        .filter(Boolean);
      setSelectedExpenses(allIds);
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleSelectExpense = (expenseId: string, checked: boolean) => {
    if (checked) {
      setSelectedExpenses([...selectedExpenses, expenseId]);
    } else {
      setSelectedExpenses(selectedExpenses.filter((id) => id !== expenseId));
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedExpenses.length > 0) {
      setBulkDeleteDialog({ open: true, loading: false });
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedExpenses.length === 0) return;

    setBulkDeleteDialog((prev) => ({ ...prev, loading: true }));
    // Delete each expense
    try {
      for (const id of selectedExpenses) {
        await new Promise((resolve, reject) => {
          deletePurchase(id, {
            onSuccess: resolve,
            onError: reject,
          });
        });
      }
      setSelectedExpenses([]);
      setBulkDeleteDialog({ open: false, loading: false });
    } catch (error) {
      setBulkDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialog({ open: false, loading: false });
  };

  const handlePaymentStatusClick = (purchase: any) => {
    setSelectedPurchase(purchase);
    setShowPaymentDialog(true);
    setOpenPopoverId(null);
  };

  const handlePaymentStatusUpdate = (
    status: "pending" | "partial" | "paid",
    paidAmount?: number
  ) => {
    if (!selectedPurchase) return;

    updatePaymentStatus(
      {
        purchaseId: selectedPurchase._id,
        data: {
          paymentStatus: status,
          paidAmount: paidAmount || 0,
        },
      },
      {
        onSuccess: () => {
          setShowPaymentDialog(false);
          setSelectedPurchase(null);
        },
      }
    );
  };

  const handleDeliveryStatusClick = (purchase: any) => {
    setSelectedPurchase(purchase);
    setShowDeliveryDialog(true);
    setOpenPopoverId(null);
  };

  const handleStatusChange = async (purchaseId: string, status: string) => {
    // TODO: Implement status update API call
    console.log(`Update status for ${purchaseId} to ${status}`);
    setOpenPopoverId(null);
    // You can add your API call here
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Manage and track your expenses</p>
        </div>
        <a
          href="/finance/expenses/create"
          className="px-4 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
        >
          + New Expense
        </a>
      </div>

      {/* Bulk Actions Bar */}
      {selectedExpenses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              {selectedExpenses.length} expense
              {selectedExpenses.length > 1 ? "s" : ""} selected
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

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto p-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading expenses...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait...</p>
            </div>
          ) : isError ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-red-600 font-semibold mb-2">
                Error loading expenses
              </p>
              <p className="text-gray-500 text-sm mb-4">
                {error?.message || "Failed to fetch data from server"}
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : !purchases || purchases.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-lg">
              No expenses found. <br />
              <a
                href="/finance/expenses/create"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Create your first expense
              </a>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedExpenses.length === purchases.length &&
                        purchases.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expense No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.map((purchase: any) => {
                  const total =
                    purchase.grandTotal || purchase.totalAmount || 0;
                  return (
                    <tr
                      key={purchase._id}
                      onClick={() =>
                        router.push(`/finance/expenses/edit/${purchase._id}`)
                      }
                      className="transition hover:bg-gray-50 focus-within:bg-gray-100 cursor-pointer"
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedExpenses.includes(purchase._id)}
                          onChange={(e) =>
                            handleSelectExpense(purchase._id, e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-sm text-gray-900">
                          {purchase.billNumber || purchase.purchaseNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {purchase.vendorId?.name ||
                            purchase.vendorId?.email ||
                            "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">
                          {new Date(purchase.billDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize text-gray-900">
                          {purchase.purchaseType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                            purchase.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : purchase.priority === "medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {purchase.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                            purchase.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : purchase.paymentStatus === "partial"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {purchase.paymentStatus || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-semibold text-base text-gray-900">
                          ₹{total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Popover
                          open={openPopoverId === purchase._id}
                          onOpenChange={(isOpen) =>
                            setOpenPopoverId(isOpen ? purchase._id : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                              aria-label="Expense actions"
                            >
                              <FiMoreVertical />
                            </button>
                          </PopoverTrigger>

                          <PopoverContent className="w-44 p-2" align="end">
                            <div className="flex flex-col gap-1">
                              <Link
                                href={`/finance/expenses/edit/${purchase._id}`}
                                onClick={() => {
                                  console.log("Editing purchase:", purchase);
                                  console.log("Purchase ID:", purchase._id);
                                  setOpenPopoverId(null);
                                }}
                                className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm flex items-center gap-2"
                                aria-label="Edit Expense"
                              >
                                <FiEdit className="w-4 h-4" />
                                Edit
                              </Link>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePaymentStatusClick(purchase);
                                }}
                                className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left flex items-center gap-2"
                                aria-label="Update Payment Status"
                              >
                                <FiDollarSign className="w-4 h-4" />
                                Payment Status
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeliveryStatusClick(purchase);
                                }}
                                className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left flex items-center gap-2"
                                aria-label="Update Delivery Status"
                              >
                                <FiPackage className="w-4 h-4" />
                                Delivery Status
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(purchase);
                                  setOpenPopoverId(null);
                                }}
                                className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left flex items-center gap-2"
                                aria-label="Delete Expense"
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
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Update Payment Status Dialog */}
      <UpdatePaymentStatusDialog
        open={showPaymentDialog}
        onClose={() => {
          setShowPaymentDialog(false);
          setSelectedPurchase(null);
        }}
        onConfirm={handlePaymentStatusUpdate}
        expense={selectedPurchase}
        loading={isUpdatingPayment}
      />

      {/* Delete Expense Dialog */}
      <DeleteExpenseDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        expense={deleteDialog.expense}
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
              Are you sure you want to delete {selectedExpenses.length} expense
              {selectedExpenses.length > 1 ? "s" : ""}? This action cannot be
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
                    Delete {selectedExpenses.length} Expense
                    {selectedExpenses.length > 1 ? "s" : ""}
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
