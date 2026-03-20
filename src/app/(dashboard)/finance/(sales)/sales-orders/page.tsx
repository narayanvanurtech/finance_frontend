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
  FiClock,
  FiTruck,
  FiPackage,
  FiXCircle,
  FiTrash2,
  FiChevronRight,
} from "react-icons/fi";
import { useSalesOrderStore } from "@/stores/financeStore/useSalesOrderStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DeleteSalesOrderDialog from "@/components/finance/salesOrder/DeleteSalesOrderDialog";
import SalesOrderStats from "@/components/finance/salesOrder/SalesOrderStats";
import SalesOrderFilters, {
  SearchFilters,
} from "@/components/finance/salesOrder/SalesOrderFilters";
import axiosInstance from "@/utils/axios";
import { handleSendEmail } from "@/api/sendEmailApi";

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
  switch (status?.toLowerCase()) {
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
          <FiCheckCircle className="inline" /> Confirmed
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          <FiPackage className="inline" /> Processing
        </span>
      );
    case "shipped":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">
          <FiTruck className="inline" /> Shipped
        </span>
      );
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
          <FiCheckCircle className="inline" /> Delivered
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
          <FiXCircle className="inline" /> Cancelled
        </span>
      );
    case "draft":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
          <FiClock className="inline" /> Draft
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

export default function SalesOrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const salesOrders = useSalesOrderStore((state) => state.salesOrders);
  const pagination = useSalesOrderStore((state) => state.pagination);
  const loading = useSalesOrderStore((state) => state.loading);
  const fetchSalesOrders = useSalesOrderStore(
    (state) => state.fetchSalesOrders,
  );
  const setCompanyId = useSalesOrderStore((state) => state.setCompanyId);
  const duplicateSalesOrder = useSalesOrderStore(
    (state) => state.duplicateSalesOrder,
  );
  const deleteSalesOrder = useSalesOrderStore(
    (state) => state.deleteSalesOrder,
  );

  const convertToInvoice = useSalesOrderStore(
    (state) => state.convertToInvoice,
  );

  const updateSalesOrderStatus = useSalesOrderStore(
    (state) => state.updateSalesOrderStatus,
  );
  const bulkAction = useSalesOrderStore((state) => state.bulkAction);
  const searchSalesOrders = useSalesOrderStore(
    (state) => state.searchSalesOrders,
  );
  const getSalesOrderStats = useSalesOrderStore(
    (state) => state.getSalesOrderStats,
  );

  const [mounted, setMounted] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [showConvertMenu, setShowConvertMenu] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    order: any | null;
    loading: boolean;
  }>({
    open: false,
    order: null,
    loading: false,
  });

  // Stats state
  const [stats, setStats] = useState<{
    totalOrders: number;
    draftOrders: number;
    confirmedOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalValue: number;
    period: string;
  }>({
    totalOrders: 0,
    draftOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalValue: 0,
    period: "30 days",
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  // Bulk delete state
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState<{
    open: boolean;
    loading: boolean;
  }>({
    open: false,
    loading: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load statistics
  const loadStats = useCallback(async () => {
    if (!user?.companyId) return;

    setStatsLoading(true);
    try {
      const statsData = await getSalesOrderStats(user.companyId, "30");
      console.log("📊 Raw Stats Data:", statsData); // Debug ke liye

      // API response ke actual field names ko UI ke expected field names se map karein
      setStats({
        totalOrders: statsData?.totalSalesOrders ?? statsData?.totalOrders ?? 0,
        draftOrders: statsData?.draftCount ?? statsData?.draftOrders ?? 0,
        confirmedOrders:
          statsData?.confirmedCount ?? statsData?.confirmedOrders ?? 0,
        processingOrders:
          statsData?.processingCount ?? statsData?.processingOrders ?? 0,
        shippedOrders: statsData?.shippedCount ?? statsData?.shippedOrders ?? 0,
        deliveredOrders:
          statsData?.deliveredCount ?? statsData?.deliveredOrders ?? 0,
        cancelledOrders:
          statsData?.cancelledCount ?? statsData?.cancelledOrders ?? 0,
        totalValue: statsData?.totalValue ?? 0,
        period: statsData?.period ?? "30 days",
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [user?.companyId, getSalesOrderStats]);

  useEffect(() => {
    if (user?.companyId && mounted) {
      console.log("🔄 Setting companyId and fetching...");
      setCompanyId(user.companyId);

      // Check if there are active filters
      const hasActiveFilters = Object.values(currentFilters).some(
        (value) => value && value.length > 0,
      );

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

      // Always use searchSalesOrders (it handles both filtered and unfiltered cases)
      searchSalesOrders(user.companyId, params);

      loadStats();
    }
  }, [
    user?.companyId,
    mounted,
    currentPage,
    itemsPerPage,
    currentFilters,
    setCompanyId,
    searchSalesOrders,
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

  // Handle stat card clicks
  const handleStatClick = useCallback(
    (
      filterType:
        | "all"
        | "draft"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled",
    ) => {
      let filters: SearchFilters = {};

      if (filterType !== "all") {
        filters = { status: filterType };
      }

      setCurrentFilters(filters);
      setCurrentPage(1);
    },
    [],
  );

  const isEmpty = !salesOrders || salesOrders.length === 0;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const handleDuplicate = async (orderId: string) => {
    try {
      await duplicateSalesOrder(orderId);
      setOpenPopoverId(null);
    } catch (error) {
      console.error("Failed to duplicate sales order:", error);
    }
  };

  // Valid status transitions
  const validTransitions: Record<string, string[]> = {
    draft: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [], // Terminal state
    cancelled: [], // Terminal state
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      // Find the order to check current status
      const order = salesOrders.find((o) => o._id === orderId);
      if (!order) {
        toast.error("Order not found");
        return;
      }

      const currentStatus = order.status || "draft";
      const allowedTransitions = validTransitions[currentStatus] || [];

      // Check if transition is valid
      if (!allowedTransitions.includes(status)) {
        toast.error(
          `Cannot change status from ${currentStatus} to ${status}. Valid transitions: ${
            allowedTransitions.length > 0
              ? allowedTransitions.join(", ")
              : "none (terminal state)"
          }`,
        );
        return;
      }

      await updateSalesOrderStatus(orderId, status);
      setOpenPopoverId(null);
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error("Failed to update sales order status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleConvertToInvoice = async (orderId: string) => {
    try {
      await convertToInvoice(orderId);
      // The store will update the local state to show convertedToInvoice: true
    } catch (error) {
      console.error("Failed to convert to invoice:", error);
      toast.error("Failed to convert to invoice");
    }
  };

  const handleConvertToProforma = async (orderId: string) => {
    try {
      toast.success("Converting to Proforma Invoice...");
      // Navigate to create proforma invoice page with salesOrderId as query param
      router.push(`/finance/performa-invoices/create?salesOrderId=${orderId}`);
    } catch (error) {
      console.error("Failed to convert to proforma invoice:", error);
      toast.error("Failed to convert to proforma invoice");
    }
  };

  const handleDeleteClick = (order: any) => {
    console.log("clickdelete", order);

    setDeleteDialog({
      open: true,
      order,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.order || !user?.companyId) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      const orderId = deleteDialog.order._id;
      if (orderId) {
        await deleteSalesOrder(orderId, user.companyId);
        setDeleteDialog({ open: false, order: null, loading: false });
        // Refresh stats after deletion
        loadStats();
      }
    } catch (error) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, order: null, loading: false });
  };

  // Bulk delete handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select sales orders that are in draft status
      const draftOrderIds = salesOrders
        .filter((order) => order?.status === "draft")
        .map((order) => order._id)
        .filter(Boolean) as string[];
      setSelectedOrders(draftOrderIds);
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedOrders.length === 0) return;

    // Check if any selected sales order is not draft
    const nonDraftCount = salesOrders.filter(
      (order) =>
        selectedOrders.includes(order?._id || "") && order?.status !== "draft",
    ).length;

    if (nonDraftCount > 0) {
      toast.error(
        `Cannot delete ${nonDraftCount} sales order(s). Only draft sales orders can be deleted.`,
      );
      return;
    }

    setBulkDeleteDialog({ open: true, loading: false });
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedOrders.length === 0) return;

    setBulkDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await bulkAction("delete", selectedOrders);
      setSelectedOrders([]);
      setBulkDeleteDialog({ open: false, loading: false });
      toast.success(
        `Successfully deleted ${selectedOrders.length} sales order(s)`,
      );
      // Refresh stats after bulk deletion
      loadStats();
    } catch (error) {
      setBulkDeleteDialog((prev) => ({ ...prev, loading: false }));
      toast.error("Failed to delete sales orders");
    }
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialog({ open: false, loading: false });
  };

  //send Email
  const handleSaleOrdersSendEmail = async (salesOrderId: string) => {
      router.push(`/finance/sales-orders/email/${salesOrderId}`)
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your sales orders
          </p>
        </div>
        <a
          href="/finance/sales-orders/create"
          className="px-4 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
        >
          + New Sales Order
        </a>
      </div>

      {/* Stats Section */}
      <SalesOrderStats
        stats={stats}
        loading={statsLoading}
        onStatClick={handleStatClick}
      />

      {/* Filters Section */}
      <SalesOrderFilters
        onSearch={handleSearch}
        onClear={handleClearFilters}
        loading={loading}
      />

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              {selectedOrders.length} sales order
              {selectedOrders.length > 1 ? "s" : ""} selected
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
          {loading ? (
            <div className="py-12 text-center text-gray-600">
              Loading sales orders...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedOrders.length === salesOrders.length &&
                        salesOrders.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Order
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
                      No sales orders found. <br />
                      <a
                        href="/finance/sales-orders/create"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        Create your first sales order
                      </a>
                    </td>
                  </tr>
                ) : (
                  salesOrders.map((order, idx) => {
                    const isEditDisabled =
                      order?.status === "confirmed" ||
                      order?.status === "cancelled" ||
                      order?.status === "shipped" ||
                      order?.status === "delivered";
                    const orderNumber =
                      (order as any)?.salesOrderNumber ||
                      order?.orderNumber ||
                      "N/A";
                    const clientName =
                      (order as any)?.client?.businessName ||
                      order?.clientDetails?.name ||
                      "-";
                    const clientEmail =
                      (order as any)?.client?.email ||
                      (typeof order?.clientId === "object" &&
                        (order?.clientId as any)?.email) ||
                      "";
                    const clientPhone =
                      (order as any)?.client?.phone ||
                      (typeof order?.clientId === "object" &&
                        (order?.clientId as any)?.phone) ||
                      "";
                    const creatorName =
                      (order as any)?.creator?.name ||
                      (order as any)?.createdBy?.name ||
                      "";

                    return (
                      <tr
                        key={order?._id || idx}
                        className="transition hover:bg-gray-50 focus-within:bg-gray-100"
                      >
                        {/* Checkbox */}
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order?._id || "")}
                            onChange={(e) =>
                              handleSelectOrder(
                                order._id || "",
                                e.target.checked,
                              )
                            }
                            disabled={order?.status !== "draft"}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </td>

                        {/* Sales Order Number */}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/finance/sales-orders/edit/${order?._id}`)
                          }
                        >
                          <div className="flex flex-col">
                            <span className="font-mono font-semibold text-sm">
                              {orderNumber}
                            </span>
                            {order?.orderTitle && (
                              <span className="text-xs text-gray-600 mt-1 font-medium">
                                {order.orderTitle}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Details */}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/finance/sales-orders/edit/${order?._id}`)
                          }
                        >
                          <div className="flex items-center gap-2">
                            {order?.items && order?.items.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {order?.items.length} item
                                {order?.items.length !== 1 ? "s" : ""}
                              </span>
                            )}
                            {
                              <span className="text-xs text-gray-500">
                                by {creatorName}
                              </span>
                            }
                          </div>
                        </td>

                        {/* Client */}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/finance/sales-orders/edit/${order?._id}`)
                          }
                        >
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                              {getInitials(
                                (typeof order?.clientId === "object" &&
                                  (order?.clientId as any)?.email) ||
                                  order?.clientDetails?.name ||
                                  "?",
                              )}
                            </span>
                            <span className="flex flex-col">
                              <span className="font-medium">
                               {order?.clientId?.name}
                              </span>
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
                            (window.location.href = `/finance/sales-orders/edit/${order?._id}`)
                          }
                        >
                          <div className="flex flex-col">
                            <span>
                              {order?.orderDate
                                ? format(
                                    new Date(order.orderDate),
                                    "MMM d, yyyy",
                                  )
                                : "-"}
                            </span>
                            {order?.deliveryDate && (
                              <span className="text-xs text-gray-500">
                                Due:{" "}
                                {format(
                                  new Date(order.deliveryDate),
                                  "MMM d, yyyy",
                                )}
                              </span>
                            )}
                            {(order as any)?.expectedDeliveryDate &&
                              !order?.deliveryDate && (
                                <span className="text-xs text-gray-500">
                                  Expected:{" "}
                                  {format(
                                    new Date(
                                      (order as any).expectedDeliveryDate,
                                    ),
                                    "MMM d, yyyy",
                                  )}
                                </span>
                              )}
                          </div>
                        </td>

                        {/* Amount */}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-right text-gray-900 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/finance/sales-orders/edit/${order?._id}`)
                          }
                        >
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-base">
                              ₹
                              {(() => {
                                const gt = order?.grandTotal;
                                const t = order?.total;
                                const ta = (order as any)?.totalAmount;
                                const amount = gt ?? t ?? ta ?? 0;

                                return typeof amount === "number"
                                  ? amount.toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                    })
                                  : "0.00";
                              })()}
                            </span>
                            {order?.subtotal &&
                              order?.subtotal !==
                                (order?.grandTotal || order?.total) && (
                                <span className="text-xs text-gray-500">
                                  Subtotal: ₹
                                  {order.subtotal.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              )}
                            {order?.totalTax && order?.totalTax > 0 && (
                              <span className="text-xs text-gray-500">
                                Tax: ₹
                                {order.totalTax.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {/* If converted → show Converted to Invoice instead of Confirmed */}
                            {(order as any)?.convertedToInvoice ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                                <FiCheckCircle className="inline" /> Converted
                              </span>
                            ) : (
                              getStatusBadge(order?.status || "draft")
                            )}

                            {/* Existing invoice tag - keep it as it is */}
                            {(order as any)?.convertedToInvoice && (
                              <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full w-fit">
                                → Invoice
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Popover
                            open={openPopoverId === order?._id}
                            onOpenChange={(isOpen) =>
                              setOpenPopoverId(
                                isOpen ? order?._id || null : null,
                              )
                            }
                          >
                            <PopoverTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Sales order actions"
                              >
                                <FiMoreVertical />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-44 p-2" align="end">
                              <div className="flex flex-col gap-1">
                                <Link
                                  href={`/finance/sales-orders/preview/${order?._id}`}
                                  onClick={() => setOpenPopoverId(null)}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-blue-600 text-sm"
                                  aria-label="Preview Sales Order"
                                >
                                  Preview
                                </Link>
                                <Link
                                  href={
                                    isEditDisabled
                                      ? "#"
                                      : `/finance/sales-orders/edit/${order?._id}`
                                  }
                                  onClick={(e) => {
                                    if (isEditDisabled) {
                                      e.preventDefault();
                                      return;
                                    }
                                    setOpenPopoverId(null);
                                  }}
                                  className={`px-3 py-2 rounded text-sm text-left ${
                                    isEditDisabled
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "hover:bg-gray-100 text-gray-700"
                                  }`}
                                  aria-disabled={isEditDisabled}
                                >
                                  Edit
                                </Link>

                                 <button
                              onClick={() => {
                                
                                handleSaleOrdersSendEmail(order._id);
                              }}
                              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left"
                              aria-label="Send"
                            >
                              Send Email
                            </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicate(order._id!);
                                  }}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left"
                                  aria-label="Duplicate Sales Order"
                                >
                                  Duplicate
                                </button>

                                {/* Confirm - Only for draft status */}
                                {order?.status === "draft" && (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const id = order?._id;

                                      if (id) {
                                        await handleStatusChange(
                                          id,
                                          "confirmed",
                                        );
                                      }

                                      setOpenPopoverId(null);
                                      setShowConvertMenu(null);
                                    }}
                                    className="px-3 py-2 rounded hover:bg-gray-100 text-green-600 text-sm text-left flex items-center gap-2"
                                  >
                                    Confirm
                                  </button>
                                )}

                                {/* Additional Status Transitions */}
                                {order?.status === "confirmed" && (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const id = order?._id;
                                      if (id) {
                                        await handleStatusChange(
                                          id,
                                          "processing",
                                        );
                                      }
                                      setOpenPopoverId(null);
                                    }}
                                    className="px-3 py-2 rounded hover:bg-gray-100 text-blue-600 text-sm text-left"
                                  >
                                    Mark as Processing
                                  </button>
                                )}

                                {order?.status === "processing" && (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const id = order?._id;
                                      if (id) {
                                        await handleStatusChange(id, "shipped");
                                      }
                                      setOpenPopoverId(null);
                                    }}
                                    className="px-3 py-2 rounded hover:bg-gray-100 text-purple-600 text-sm text-left"
                                  >
                                    Mark as Shipped
                                  </button>
                                )}

                                {order?.status === "shipped" && (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const id = order?._id;
                                      if (id) {
                                        await handleStatusChange(
                                          id,
                                          "delivered",
                                        );
                                      }
                                      setOpenPopoverId(null);
                                    }}
                                    className="px-3 py-2 rounded hover:bg-gray-100 text-green-600 text-sm text-left"
                                  >
                                    Mark as Delivered
                                  </button>
                                )}

                                {/* Cancel option - available for draft, confirmed, processing */}
                                {(order?.status === "draft" ||
                                  order?.status === "confirmed" ||
                                  order?.status === "processing") && (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const id = order?._id;
                                      if (id) {
                                        await handleStatusChange(
                                          id,
                                          "cancelled",
                                        );
                                      }
                                      setOpenPopoverId(null);
                                    }}
                                    className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left"
                                  >
                                    Cancel Order
                                  </button>
                                )}

                                {/* Convert - Only for confirmed and processing status */}
                                {(order?.status === "confirmed" ||
                                  order?.status === "processing") &&
                                  (order.convertedToInvoice ? (
                                    <div className="px-3 py-2 text-xs text-gray-500 italic">
                                      Cannot modify - Already converted
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const id = order?._id;
                                          setShowConvertMenu(
                                            showConvertMenu === id
                                              ? null
                                              : id || null,
                                          );
                                        }}
                                        className="w-full px-3 py-2 rounded hover:bg-gray-100 text-purple-600 text-sm text-left flex items-center justify-between"
                                        aria-label="Convert to"
                                      >
                                        <span>Convert to</span>
                                        <FiChevronRight
                                          className={`transition-transform ${
                                            showConvertMenu === order?._id
                                              ? "rotate-90"
                                              : ""
                                          }`}
                                        />
                                      </button>
                                      {showConvertMenu === order?._id && (
                                        <div className="ml-4 mt-1 space-y-1">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const id = order?._id;
                                              if (id)
                                                handleConvertToInvoice(id);
                                              setShowConvertMenu(null);
                                              setOpenPopoverId(null);
                                            }}
                                            className="w-full px-3 py-2 rounded hover:bg-gray-100 text-green-600 text-sm text-left"
                                            aria-label="Convert to Invoice"
                                          >
                                            Invoice
                                          </button>
                                          {/* <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const id = order?._id;
                                            if (id) handleConvertToProforma(id);
                                            setShowConvertMenu(null);
                                            setOpenPopoverId(null);
                                          }}
                                          className="w-full px-3 py-2 rounded hover:bg-gray-100 text-purple-600 text-sm text-left"
                                          aria-label="Convert to Proforma Invoice"
                                        >
                                          Proforma Invoice
                                        </button> */}
                                        </div>
                                      )}
                                    </div>
                                  ))}

                                {/* Delete - Only for draft status */}
                                {order?.status === "draft" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(order);
                                      setOpenPopoverId(null);
                                    }}
                                    className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left flex items-center gap-2"
                                    aria-label="Delete Sales Order"
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
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && pagination && (
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
              {pagination.total} sales orders
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
                  },
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
      <DeleteSalesOrderDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        order={deleteDialog.order}
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
              Are you sure you want to delete {selectedOrders.length} sales
              order
              {selectedOrders.length > 1 ? "s" : ""}? This action cannot be
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
                    Delete {selectedOrders.length} Sales Order
                    {selectedOrders.length > 1 ? "s" : ""}
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
