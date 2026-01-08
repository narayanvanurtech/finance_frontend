"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useGetPurchaseOrders,
  useGetPurchaseOrderStats,
  useDeletePurchaseOrder,
  useBulkDeletePurchaseOrders,
  useUpdateApprovalStatus,
  useUpdatePurchaseOrder,
  useVendorAcknowledgment,
} from "@/hooks/usePurchaseOrderQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PurchaseOrderFilters, {
  SearchFilters,
} from "@/components/finance/purchase-order/PurchaseOrderFilters";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Send,
  Ban,
  CheckCheck,
  Mail,
  MessageCircle,
} from "lucide-react";

import { format } from "date-fns";
import type { PurchaseOrder } from "@/api/finance/purchaseOrderApi";
import DeletePurchaseOrderDialog from "@/components/finance/purchase-order/DeletePurchaseOrderDialog";

const statusColors = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-800",
  acknowledged: "bg-amber-100 text-amber-800",
  partial_delivery: "bg-purple-100 text-purple-800",
  complete: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

const approvalStatusColors = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
  revision_required: "bg-blue-100 text-blue-800",
};

const statusIcons = {
  draft: Clock,
  sent: FileText,
  acknowledged: CheckCircle,
  partial_delivery: Package,
  complete: CheckCircle,
  cancelled: XCircle,
};

export default function PurchaseOrdersPage() {
  /** Pagination **/
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /** Filters **/
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);

  const router = useRouter();
  const [showSendMenu, setShowSendMenu] = useState<string | null>(null);

  const {
    data: purchaseOrdersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPurchaseOrders({
    page: currentPage,
    limit: itemsPerPage,
    ...currentFilters,
  });

  const { data: statsData } = useGetPurchaseOrderStats();

  const { mutate: deletePurchaseOrder } = useDeletePurchaseOrder();
  const { mutate: bulkDelete } = useBulkDeletePurchaseOrders();

  const purchaseOrders = purchaseOrdersData?.result?.purchaseOrders || [];
  const pagination = purchaseOrdersData?.result?.pagination;

  const stats = statsData?.result;

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    purchaseOrder: null as PurchaseOrder | null,
    loading: false,
  });

  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({
    open: false,
    loading: false,
  });

  const [approvalDialog, setApprovalDialog] = useState({
    open: false,
    purchaseOrder: null as PurchaseOrder | null,
    action: null as "approved" | "rejected" | null,
    loading: false,
  });

  const [statusDialog, setStatusDialog] = useState({
    open: false,
    purchaseOrder: null as PurchaseOrder | null,
    newStatus: null as
      | "draft"
      | "sent"
      | "acknowledged"
      | "partial_delivery"
      | "complete"
      | "cancelled"
      | null,
    loading: false,
  });

  const [acknowledgmentDialog, setAcknowledgmentDialog] = useState({
    open: false,
    purchaseOrder: null as PurchaseOrder | null,
    vendorComments: "",
    loading: false,
  });

  const { mutate: updateApprovalStatus } = useUpdateApprovalStatus();
  const { mutate: updatePurchaseOrder } = useUpdatePurchaseOrder();
  const { mutate: vendorAcknowledgment } = useVendorAcknowledgment();
  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination && page > pagination.totalPages)) return;
    setCurrentPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const toggleSelection = (poId: string) => {
    setSelectedPOs((prev) =>
      prev.includes(poId) ? prev.filter((id) => id !== poId) : [...prev, poId]
    );
  };

  const toggleSelectAll = () => {
    const valid = purchaseOrders.filter((po) =>
      ["draft", "cancelled"].includes(po.status)
    );
    const allIds = valid.map((p) => p._id);

    setSelectedPOs(selectedPOs.length === allIds.length ? [] : allIds);
  };

  const handleBulkDeleteClick = () => {
    if (selectedPOs.length === 0) return;
    setBulkDeleteDialog({ open: true, loading: false });
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedPOs.length === 0) return;

    setBulkDeleteDialog((p) => ({ ...p, loading: true }));

    bulkDelete(selectedPOs, {
      onSuccess: () => {
        setSelectedPOs([]);
        setBulkDeleteDialog({ open: false, loading: false });
        refetch();
      },
      onError: () => {
        setBulkDeleteDialog((p) => ({ ...p, loading: false }));
      },
    });
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialog({ open: false, loading: false });
  };

  /** Handle Filters **/
  const handleSearch = useCallback((filters: SearchFilters) => {
    console.log("🔍 handleSearch called with filters:", filters);
    setCurrentFilters(filters);
    setCurrentPage(1); // React Query will auto-refetch when filters change
  }, []);

  const handleClearFilters = useCallback(() => {
    setCurrentFilters({});
    setCurrentPage(1); // React Query will auto-refetch when filters change
  }, []);

  const calculateTotalAmount = (po: PurchaseOrder) => {
    const itemsTotal = po.items.reduce((sum, item) => {
      const total = item.rate * item.quantity;
      const discount =
        item.discountType === "percentage"
          ? (total * (item.discount || 0)) / 100
          : item.discount || 0;

      return sum + (total - discount);
    }, 0);

    const orderDiscount =
      po.discountType === "percentage"
        ? (itemsTotal * (po.discountValue || 0)) / 100
        : po.discountValue || 0;

    return itemsTotal - orderDiscount + (po.shipping || 0);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  if (isLoading && purchaseOrders.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-gray-600">Manage all purchase orders</p>
        </div>

        <a
          href="/finance/purchase-orders/create"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Purchase Order
        </a>
      </div>

      {/* STATS SECTION */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total POs */}
          <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Total POs
                </p>
                <p className="text-2xl font-bold text-[var(--color-foreground)] mt-1">
                  {stats.totalPOs}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Acknowledged */}
          <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Acknowledged
                </p>
                <p className="text-2xl font-bold text-[var(--color-foreground)] mt-1">
                  {stats.acknowledgedPOs}
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <CheckCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Completed
                </p>
                <p className="text-2xl font-bold text-[var(--color-foreground)] mt-1">
                  {stats.completePOs}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Pending Approval */}
          <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Pending Approval
                </p>
                <p className="text-2xl font-bold text-[var(--color-foreground)] mt-1">
                  {stats.pendingApproval}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <PurchaseOrderFilters
        onSearch={handleSearch}
        onClear={handleClearFilters}
        loading={isLoading}
      />

      {/* BULK ACTION BAR */}
      {selectedPOs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex justify-between">
          <span className="text-blue-800 font-medium">
            {selectedPOs.length} selected
          </span>

          <button
            onClick={handleBulkDeleteClick}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Delete Selected
          </button>
        </div>
      )}
      {/* PURCHASE ORDERS TABLE */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Purchase Orders</h2>
          <p className="text-gray-500 text-sm">
            {pagination ? pagination.totalItems : 0} total purchase orders
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedPOs.length > 0 &&
                      selectedPOs.length ===
                        purchaseOrders.filter((po) =>
                          ["draft", "cancelled"].includes(po.status)
                        ).length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4"
                  />
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  PO No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Approval
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-gray-500">
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((po) => {
                  const StatusIcon =
                    statusIcons[po.status as keyof typeof statusIcons];

                  return (
                    <tr
                      key={po._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        router.push(`/finance/purchase-orders/edit/${po._id}`)
                      }
                    >
                      {/* Checkbox */}
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPOs.includes(po._id)}
                          disabled={!["draft", "cancelled"].includes(po.status)}
                          onChange={() => toggleSelection(po._id)}
                          className="w-4 h-4 disabled:opacity-40"
                        />
                      </td>

                      {/* PO Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-blue-600 font-semibold">
                          {po.purchaseOrderNumber}
                        </span>
                      </td>

                      {/* Vendor */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">
                            {(() => {
                              if (typeof po.vendorId === "string") {
                                return po.vendorId;
                              }
                              const vendorName = po.vendorDetails?.name;
                              if (!vendorName) return "N/A";
                              if (typeof vendorName === "object") {
                                const nameObj = vendorName as any;
                                const parts = [
                                  nameObj.streetAddress,
                                  nameObj.city,
                                  nameObj.state,
                                  nameObj.postalCode,
                                  nameObj.country,
                                ].filter(Boolean);
                                return parts.length > 0
                                  ? parts.join(", ")
                                  : "N/A";
                              }
                              return vendorName;
                            })()}
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {format(
                            new Date(po.purchaseOrderDate),
                            "MMM dd, yyyy"
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                            statusColors[po.status as keyof typeof statusColors]
                          }`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {po.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded font-semibold ${
                            priorityColors[
                              po.priority as keyof typeof priorityColors
                            ]
                          }`}
                        >
                          {po.priority}
                        </span>
                      </td>

                      {/* Approval Status */}
                      <td className="px-6 py-4">
                        {po.approvalStatus && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              approvalStatusColors[
                                po.approvalStatus as keyof typeof approvalStatusColors
                              ]
                            }`}
                          >
                            {po.approvalStatus.replace("_", " ")}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right font-semibold">
                        {formatCurrency(calculateTotalAmount(po))}
                      </td>

                      {/* ACTION MENU */}
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-full hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4 text-gray-600" />
                            </button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-56">
                            {/* Edit */}
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/finance/purchase-orders/edit/${po._id}`
                                )
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Status Updates */}
                            {po.status !== "sent" && po.status !== "complete" && po.status !== "cancelled" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setStatusDialog({
                                    open: true,
                                    purchaseOrder: po,
                                    newStatus: "sent",
                                    loading: false,
                                  });
                                }}
                              >
                                <FileText className="h-4 w-4 mr-2" /> Mark as Sent
                              </DropdownMenuItem>
                            )}

                            {/* Vendor Acknowledgment - Only show when status is "sent" */}
                            {po.status === "sent" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setAcknowledgmentDialog({
                                    open: true,
                                    purchaseOrder: po,
                                    vendorComments: "",
                                    loading: false,
                                  });
                                }}
                                className="text-amber-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" /> Vendor Acknowledgment
                              </DropdownMenuItem>
                            )}

                            {po.status !== "acknowledged" && po.status !== "complete" && po.status !== "cancelled" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setStatusDialog({
                                    open: true,
                                    purchaseOrder: po,
                                    newStatus: "acknowledged",
                                    loading: false,
                                  });
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" /> Mark as Acknowledged
                              </DropdownMenuItem>
                            )}

                            {po.status !== "partial_delivery" && po.status !== "complete" && po.status !== "cancelled" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setStatusDialog({
                                    open: true,
                                    purchaseOrder: po,
                                    newStatus: "partial_delivery",
                                    loading: false,
                                  });
                                }}
                              >
                                <Package className="h-4 w-4 mr-2" /> Mark as Partial Delivery
                              </DropdownMenuItem>
                            )}

                            {po.status !== "complete" && po.status !== "cancelled" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setStatusDialog({
                                    open: true,
                                    purchaseOrder: po,
                                    newStatus: "complete",
                                    loading: false,
                                  });
                                }}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" /> Mark as Complete
                              </DropdownMenuItem>
                            )}

                            {po.status !== "cancelled" && po.status !== "complete" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setStatusDialog({
                                    open: true,
                                    purchaseOrder: po,
                                    newStatus: "cancelled",
                                    loading: false,
                                  });
                                }}
                                className="text-orange-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" /> Mark as Cancelled
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {/* Delete */}
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  purchaseOrder: po,
                                  loading: false,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* PAGINATION — same as Payments Made */}
      {!isLoading && purchaseOrders.length > 0 && pagination && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items Per Page */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="px-3 py-1 border rounded bg-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Info */}
            <div className="text-sm text-gray-600">
              Showing{" "}
              {Math.min(
                (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
                pagination.totalItems
              )}{" "}
              to{" "}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              of {pagination.totalItems} orders
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              {/* Prev */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>

              {/* Page Numbers */}
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
                            : "bg-white"
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
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      <DeletePurchaseOrderDialog
        open={deleteDialog.open}
        purchaseOrder={deleteDialog.purchaseOrder}
        loading={deleteDialog.loading}
        onClose={() =>
          setDeleteDialog({ open: false, purchaseOrder: null, loading: false })
        }
        onConfirm={() => {
          if (!deleteDialog.purchaseOrder) return;
          setDeleteDialog((p) => ({ ...p, loading: true }));

          deletePurchaseOrder(deleteDialog.purchaseOrder._id, {
            onSuccess: () => {
              setDeleteDialog({
                open: false,
                purchaseOrder: null,
                loading: false,
              });
              refetch();
            },
            onError: () => {
              setDeleteDialog((p) => ({ ...p, loading: false }));
            },
          });
        }}
      />

      {/* BULK DELETE DIALOG */}
      {bulkDeleteDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-3">Confirm Bulk Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedPOs.length} purchase
              order(s)? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleBulkDeleteCancel}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleBulkDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                disabled={bulkDeleteDialog.loading}
              >
                {bulkDeleteDialog.loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL STATUS DIALOG */}
      {approvalDialog.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-3">
              {approvalDialog.action === "approved" ? "Approve" : "Reject"}{" "}
              Purchase Order
            </h2>

            <p className="text-gray-600 mb-6">
              Are you sure you want to {approvalDialog.action}{" "}
              <strong>
                {approvalDialog.purchaseOrder?.purchaseOrderNumber}
              </strong>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setApprovalDialog({
                    open: false,
                    purchaseOrder: null,
                    action: null,
                    loading: false,
                  })
                }
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                className={`px-4 py-2 rounded-lg text-white ${
                  approvalDialog.action === "approved"
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
                disabled={approvalDialog.loading}
                onClick={() => {
                  if (!approvalDialog.purchaseOrder || !approvalDialog.action)
                    return;

                  setApprovalDialog((p) => ({ ...p, loading: true }));

                  updateApprovalStatus(
                    {
                      purchaseOrderId: approvalDialog.purchaseOrder._id,
                      data: { approvalStatus: approvalDialog.action },
                    },
                    {
                      onSuccess: () => {
                        setApprovalDialog({
                          open: false,
                          purchaseOrder: null,
                          action: null,
                          loading: false,
                        });
                        refetch();
                      },
                      onError: () => {
                        setApprovalDialog((p) => ({ ...p, loading: false }));
                      },
                    }
                  );
                }}
              >
                {approvalDialog.loading
                  ? "Processing..."
                  : approvalDialog.action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS CHANGE DIALOG */}
      {statusDialog.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-3">
              {statusDialog.newStatus === "sent" && "Mark as Sent"}
              {statusDialog.newStatus === "acknowledged" && "Mark as Acknowledged"}
              {statusDialog.newStatus === "partial_delivery" && "Mark as Partial Delivery"}
              {statusDialog.newStatus === "complete" && "Mark as Complete"}
              {statusDialog.newStatus === "cancelled" && "Cancel Purchase Order"}
            </h2>

            <p className="text-gray-600 mb-6">
              Are you sure you want to change the status of{" "}
              <strong>{statusDialog.purchaseOrder?.purchaseOrderNumber}</strong>
              {" "}to <strong className="capitalize">{statusDialog.newStatus?.replace("_", " ")}</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setStatusDialog({
                    open: false,
                    purchaseOrder: null,
                    newStatus: null,
                    loading: false,
                  })
                }
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                className={`px-4 py-2 rounded-lg text-white ${
                  statusDialog.newStatus === "complete"
                    ? "bg-green-600"
                    : statusDialog.newStatus === "cancelled"
                    ? "bg-orange-600"
                    : statusDialog.newStatus === "acknowledged"
                    ? "bg-amber-600"
                    : statusDialog.newStatus === "partial_delivery"
                    ? "bg-purple-600"
                    : "bg-blue-600"
                }`}
                disabled={statusDialog.loading}
                onClick={() => {
                  if (!statusDialog.purchaseOrder || !statusDialog.newStatus)
                    return;

                  setStatusDialog((p) => ({ ...p, loading: true }));

                  updatePurchaseOrder(
                    {
                      purchaseOrderId: statusDialog.purchaseOrder._id,
                      data: { status: statusDialog.newStatus },
                    },
                    {
                      onSuccess: () => {
                        setStatusDialog({
                          open: false,
                          purchaseOrder: null,
                          newStatus: null,
                          loading: false,
                        });
                        refetch();
                      },
                      onError: () =>
                        setStatusDialog((p) => ({ ...p, loading: false })),
                    }
                  );
                }}
              >
                {statusDialog.loading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR ACKNOWLEDGMENT */}
      {acknowledgmentDialog.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-3">Vendor Acknowledgment</h2>

            <p className="mb-3 text-gray-600">
              Confirm acknowledgment for{" "}
              <strong>
                {acknowledgmentDialog.purchaseOrder?.purchaseOrderNumber}
              </strong>
            </p>

            <textarea
              className="w-full border rounded-lg p-2 mb-4"
              rows={3}
              placeholder="Vendor comments..."
              value={acknowledgmentDialog.vendorComments}
              onChange={(e) =>
                setAcknowledgmentDialog((prev) => ({
                  ...prev,
                  vendorComments: e.target.value,
                }))
              }
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setAcknowledgmentDialog({
                    open: false,
                    purchaseOrder: null,
                    vendorComments: "",
                    loading: false,
                  })
                }
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-amber-600 text-white rounded-lg"
                disabled={acknowledgmentDialog.loading}
                onClick={() => {
                  if (!acknowledgmentDialog.purchaseOrder) return;

                  setAcknowledgmentDialog((p) => ({ ...p, loading: true }));

                  vendorAcknowledgment(
                    {
                      purchaseOrderId: acknowledgmentDialog.purchaseOrder._id,
                      data: {
                        vendorComments: acknowledgmentDialog.vendorComments,
                      },
                    },
                    {
                      onSuccess: () => {
                        setAcknowledgmentDialog({
                          open: false,
                          purchaseOrder: null,
                          vendorComments: "",
                          loading: false,
                        });
                        refetch();
                      },
                      onError: () =>
                        setAcknowledgmentDialog((p) => ({
                          ...p,
                          loading: false,
                        })),
                    }
                  );
                }}
              >
                {acknowledgmentDialog.loading ? "Processing..." : "Acknowledge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
