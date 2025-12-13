"use client";
import { useEffect, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
  const router = useRouter();
  const [showSendMenu, setShowSendMenu] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: purchaseOrdersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPurchaseOrders({
    page: currentPage,
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    search: debouncedSearchTerm.trim() || undefined,
  });

  // Force refetch when debounced search term changes
  useEffect(() => {
    console.log(
      "🔄 Debounced search changed, refetching...",
      debouncedSearchTerm
    );
    refetch();
  }, [debouncedSearchTerm, refetch]);

  const { data: statsData } = useGetPurchaseOrderStats();

  const { mutate: deletePurchaseOrder, isPending: isDeleting } =
    useDeletePurchaseOrder();
  const { mutate: bulkDelete, isPending: isBulkDeleting } =
    useBulkDeletePurchaseOrders();

  const purchaseOrders = purchaseOrdersData?.result?.purchaseOrders || [];
  const pagination = purchaseOrdersData?.result?.pagination;
  const stats = statsData?.result;

  // 🔍 Debug: Check what data we're getting
  console.log("📊 Search Debug:", {
    searchTerm,
    debouncedSearchTerm,
    searchParam: debouncedSearchTerm.trim() || undefined,
    filters: {
      page: currentPage,
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
      search: debouncedSearchTerm.trim() || undefined,
    },
    purchaseOrders: purchaseOrders,
    count: purchaseOrders.length,
    isLoading,
    isError,
    error,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    purchaseOrder: PurchaseOrder | null;
    loading: boolean;
  }>({
    open: false,
    purchaseOrder: null,
    loading: false,
  });

  const [bulkDeleteDialog, setBulkDeleteDialog] = useState<{
    open: boolean;
    loading: boolean;
  }>({
    open: false,
    loading: false,
  });

  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean;
    purchaseOrder: PurchaseOrder | null;
    action: "approved" | "rejected" | null;
    loading: boolean;
  }>({
    open: false,
    purchaseOrder: null,
    action: null,
    loading: false,
  });

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    purchaseOrder: PurchaseOrder | null;
    newStatus:
      | "draft"
      | "approved"
      | "acknowledged"
      | "received"
      | "cancelled"
      | null;
    loading: boolean;
  }>({
    open: false,
    purchaseOrder: null,
    newStatus: null,
    loading: false,
  });

  const [acknowledgmentDialog, setAcknowledgmentDialog] = useState<{
    open: boolean;
    purchaseOrder: PurchaseOrder | null;
    vendorComments: string;
    loading: boolean;
  }>({
    open: false,
    purchaseOrder: null,
    vendorComments: "",
    loading: false,
  });

  const { mutate: updateApprovalStatus } = useUpdateApprovalStatus();
  const { mutate: updatePurchaseOrder } = useUpdatePurchaseOrder();
  const { mutate: vendorAcknowledgment } = useVendorAcknowledgment();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleSelection = (poId: string) => {
    setSelectedPOs((prev) =>
      prev.includes(poId) ? prev.filter((id) => id !== poId) : [...prev, poId]
    );
  };

  const toggleSelectAll = () => {
    const allowedPOs = purchaseOrders
      .filter((po) => po.status === "draft" || po.status === "cancelled")
      .map((po) => po._id);

    setSelectedPOs(selectedPOs.length === allowedPOs.length ? [] : allowedPOs);
  };

  const handleBulkDeleteClick = () => {
    const invalid = selectedPOs.filter((id) => {
      const po = purchaseOrders.find((p) => p._id === id);
      return po && !["draft", "cancelled"].includes(po.status);
    });

    if (invalid.length > 0) {
      alert("Only draft or cancelled purchase orders can be deleted.");
      return;
    }

    setBulkDeleteDialog({ open: true, loading: false });
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedPOs.length === 0) return;

    setBulkDeleteDialog((prev) => ({ ...prev, loading: true }));

    bulkDelete(selectedPOs, {
      onSuccess: () => {
        setSelectedPOs([]);
        setBulkDeleteDialog({ open: false, loading: false });
        refetch();
      },
      onError: () => {
        setBulkDeleteDialog((prev) => ({ ...prev, loading: false }));
      },
    });
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialog({ open: false, loading: false });
  };
  const handleDeleteClick = (purchaseOrder: PurchaseOrder) => {
    setDeleteDialog({
      open: true,
      purchaseOrder,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.purchaseOrder) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    // 📌 Use React Query mutation for delete
    deletePurchaseOrder(deleteDialog.purchaseOrder._id, {
      onSuccess: () => {
        setDeleteDialog({ open: false, purchaseOrder: null, loading: false });
        refetch(); // 📌 Refetch data after delete
      },
      onError: () => {
        setDeleteDialog((prev) => ({ ...prev, loading: false }));
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, purchaseOrder: null, loading: false });
  };

  const handleApprovalClick = (
    purchaseOrder: PurchaseOrder,
    action: "approved" | "rejected"
  ) => {
    setApprovalDialog({
      open: true,
      purchaseOrder,
      action,
      loading: false,
    });
  };

  const handleApprovalConfirm = async () => {
    if (!approvalDialog.purchaseOrder || !approvalDialog.action) return;

    setApprovalDialog((prev) => ({ ...prev, loading: true }));

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
          setApprovalDialog((prev) => ({ ...prev, loading: false }));
        },
      }
    );
  };

  const handleApprovalCancel = () => {
    setApprovalDialog({
      open: false,
      purchaseOrder: null,
      action: null,
      loading: false,
    });
  };

  const handleStatusChange = (
    purchaseOrder: PurchaseOrder,
    newStatus: "draft" | "approved" | "acknowledged" | "received" | "cancelled"
  ) => {
    setStatusDialog({
      open: true,
      purchaseOrder,
      newStatus,
      loading: false,
    });
  };

  const handleStatusConfirm = async () => {
    if (!statusDialog.purchaseOrder || !statusDialog.newStatus) return;

    setStatusDialog((prev) => ({ ...prev, loading: true }));

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
        onError: () => {
          setStatusDialog((prev) => ({ ...prev, loading: false }));
        },
      }
    );
  };

  const handleStatusCancel = () => {
    setStatusDialog({
      open: false,
      purchaseOrder: null,
      newStatus: null,
      loading: false,
    });
  };

  const handleAcknowledgmentClick = (purchaseOrder: PurchaseOrder) => {
    setAcknowledgmentDialog({
      open: true,
      purchaseOrder,
      vendorComments: "",
      loading: false,
    });
  };

  const handleAcknowledgmentConfirm = async () => {
    if (!acknowledgmentDialog.purchaseOrder) return;

    setAcknowledgmentDialog((prev) => ({ ...prev, loading: true }));

    vendorAcknowledgment(
      {
        purchaseOrderId: acknowledgmentDialog.purchaseOrder._id,
        data: { vendorComments: acknowledgmentDialog.vendorComments },
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
        onError: () => {
          setAcknowledgmentDialog((prev) => ({ ...prev, loading: false }));
        },
      }
    );
  };

  const handleAcknowledgmentCancel = () => {
    setAcknowledgmentDialog({
      open: false,
      purchaseOrder: null,
      vendorComments: "",
      loading: false,
    });
  };

  const calculateTotalAmount = (po: PurchaseOrder) => {
    const itemsTotal = po.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.rate;
      const discountAmount =
        item.discountType === "percentage"
          ? (itemTotal * (item.discount || 0)) / 100
          : item.discount || 0;
      return sum + (itemTotal - discountAmount);
    }, 0);

    const discountAmount =
      po.discountType === "percentage"
        ? (itemsTotal * (po.discountValue || 0)) / 100
        : po.discountValue || 0;

    return itemsTotal - discountAmount + (po.shipping || 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (isLoading && !purchaseOrders.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage your purchase orders and track vendor deliveries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg transition border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 shadow-sm flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <a
            href="/finance/purchase-orders/create"
            className="px-4 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 shadow-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Purchase Order
          </a>
        </div>
      </div>

      {stats && (
        <>
          {/* Main Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total POs</h3>
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalPOs}
              </div>
              <p className="text-xs text-gray-500">All purchase orders</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">
                  Total Value
                </h3>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatCurrency(stats.totalValue)}
              </div>
              <p className="text-xs text-gray-500">
                Avg: {stats.avgValue ? formatCurrency(stats.avgValue) : "N/A"}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">
                  Acknowledged
                </h3>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.acknowledgedPOs}
              </div>
              <p className="text-xs text-gray-500">Confirmed by vendors</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">
                  Pending Approval
                </h3>
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.pendingApproval}
              </div>
              <p className="text-xs text-gray-500">Awaiting approval</p>
            </div>
          </div>

          {/* Detailed Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status Distribution */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Status Distribution
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">
                      Draft
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.draftPOs}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-blue-50 rounded hover:bg-blue-100 transition">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium text-blue-700">
                      Sent
                    </span>
                  </div>
                  <span className="text-sm font-bold text-blue-900">
                    {stats.sentPOs}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-amber-50 rounded hover:bg-amber-100 transition">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-medium text-amber-700">
                      Acknowledged
                    </span>
                  </div>
                  <span className="text-sm font-bold text-amber-900">
                    {stats.acknowledgedPOs}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-green-50 rounded hover:bg-green-100 transition">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium text-green-700">
                      Complete
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-900">
                    {stats.completePOs}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-red-50 rounded hover:bg-red-100 transition">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-medium text-red-700">
                      Cancelled
                    </span>
                  </div>
                  <span className="text-sm font-bold text-red-900">
                    {stats.cancelledPOs}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval Status */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Approval Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-amber-50 rounded hover:bg-amber-100 transition">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-medium text-amber-700">
                      Pending
                    </span>
                  </div>
                  <span className="text-sm font-bold text-amber-900">
                    {stats.pendingApproval}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-green-50 rounded hover:bg-green-100 transition">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium text-green-700">
                      Approved
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-900">
                    {stats.approved}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-red-50 rounded hover:bg-red-100 transition">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-medium text-red-700">
                      Rejected
                    </span>
                  </div>
                  <span className="text-sm font-bold text-red-900">
                    {stats.rejected}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                    <span>Progress</span>
                    <span className="font-semibold">
                      {stats.totalPOs > 0
                        ? Math.round((stats.approved / stats.totalPOs) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats.totalPOs > 0
                            ? (stats.approved / stats.totalPOs) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 📌 POINT 15: Filters and Search - React Query auto-refetches on state change */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              placeholder="Search purchase orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="partial_delivery">Partial Delivery</option>
            <option value="complete">Complete</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[140px]"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPOs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              {selectedPOs.length} purchase order(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDeleteClick}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedPOs([])}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Purchase Orders
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {pagination ? `${pagination.totalItems} total purchase orders` : ""}
          </p>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedPOs.length > 0 &&
                      selectedPOs.length ===
                        purchaseOrders.filter((po) =>
                          ["draft", "cancelled"].includes(po.status)
                        ).length
                    }
                    onChange={(e) => {
                      toggleSelectAll();
                    }}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PO Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor Ack.
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
              {/* � POINT 16: Map purchase orders from React Query data */}
              {purchaseOrders.length > 0 ? (
                purchaseOrders.map((po: PurchaseOrder) => {
                  const StatusIcon =
                    statusIcons[po.status as keyof typeof statusIcons];
                  return (
                    <tr
                      key={po._id}
                      className="transition hover:bg-gray-50 focus-within:bg-gray-100"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedPOs.includes(po._id)}
                          disabled={!["draft", "cancelled"].includes(po.status)}
                          onChange={() => toggleSelection(po._id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/finance/purchase-orders/edit/${po._id}`
                            );
                          }}
                          className="font-mono font-semibold text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1"
                        >
                          {po.purchaseOrderNumber}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {typeof po.vendorId === "string"
                              ? po.vendorId
                              : po.vendorDetails?.name || "N/A"}
                          </div>
                          {typeof po.vendorId === "object" &&
                            po.vendorId.email && (
                              <div className="text-sm text-gray-500">
                                {po.vendorId.email}
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {format(
                            new Date(po.purchaseOrderDate),
                            "MMM dd, yyyy"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                            statusColors[po.status as keyof typeof statusColors]
                          }`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {po.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                            priorityColors[
                              po.priority as keyof typeof priorityColors
                            ]
                          }`}
                        >
                          {po.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {po.approvalStatus && (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                              approvalStatusColors[
                                po.approvalStatus as keyof typeof approvalStatusColors
                              ]
                            }`}
                          >
                            {po.approvalStatus.replace("_", " ")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {po.status === "acknowledged" ||
                        po.status === "received" ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs font-medium text-green-700">
                              Acknowledged
                            </span>
                          </div>
                        ) : po.status === "approved" ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-medium text-amber-700">
                              Pending
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">
                              Not Sent
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-semibold text-base text-gray-900">
                          {formatCurrency(calculateTotalAmount(po))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                              aria-label="Purchase order actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                            {/* Send Button with Submenu - Shows First */}
                            <div className="relative">
                              <DropdownMenuItem
                                className="text-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowSendMenu(
                                    showSendMenu === po._id ? null : po._id
                                  );
                                }}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                <span className="flex-1">Send</span>
                                <ChevronRight
                                  className={`h-4 w-4 transition-transform ${
                                    showSendMenu === po._id ? "rotate-90" : ""
                                  }`}
                                />
                              </DropdownMenuItem>

                              {/* Send Submenu */}
                              {showSendMenu === po._id && (
                                <div className="ml-4 mt-1 space-y-1">
                                  {/* Approval Options if pending */}
                                  {po.approvalStatus === "pending" && (
                                    <>
                                      <DropdownMenuItem
                                        className="text-green-600"
                                        onClick={() => {
                                          handleApprovalClick(po, "approved");
                                          setShowSendMenu(null);
                                        }}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => {
                                          handleApprovalClick(po, "rejected");
                                          setShowSendMenu(null);
                                        }}
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {/* Vendor Acknowledgment if approved/sent */}
                                  {po.status === "approved" && (
                                    <DropdownMenuItem
                                      className="text-amber-600"
                                      onClick={() => {
                                        handleAcknowledgmentClick(po);
                                        setShowSendMenu(null);
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Vendor Acknowledgment
                                    </DropdownMenuItem>
                                  )}

                                  {/* Mark as Received if acknowledged */}
                                  {po.status === "acknowledged" && (
                                    <DropdownMenuItem
                                      className="text-green-600"
                                      onClick={() => {
                                        handleStatusChange(po, "received");
                                        setShowSendMenu(null);
                                      }}
                                    >
                                      <CheckCheck className="h-4 w-4 mr-2" />
                                      Mark as Received
                                    </DropdownMenuItem>
                                  )}

                                  {/* Cancel Order if not cancelled */}
                                  {po.status !== "cancelled" && (
                                    <DropdownMenuItem
                                      className="text-orange-600"
                                      onClick={() => {
                                        handleStatusChange(po, "cancelled");
                                        setShowSendMenu(null);
                                      }}
                                    >
                                      <Ban className="h-4 w-4 mr-2" />
                                      Cancel Order
                                    </DropdownMenuItem>
                                  )}

                                  {/* Send via Email */}
                                  <DropdownMenuItem
                                    className="text-blue-600"
                                    onClick={() => {
                                      console.log("Send via Email:", po._id);
                                      setShowSendMenu(null);
                                    }}
                                  >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Via Email
                                  </DropdownMenuItem>

                                  {/* Send via WhatsApp */}
                                  <DropdownMenuItem
                                    className="text-green-600"
                                    onClick={() => {
                                      console.log("Send via WhatsApp:", po._id);
                                      setShowSendMenu(null);
                                    }}
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Via WhatsApp
                                  </DropdownMenuItem>
                                </div>
                              )}
                            </div>

                            <DropdownMenuSeparator />

                            {/* Edit Option */}
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/finance/purchase-orders/edit/${po._id}`
                                )
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Delete Option */}
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteClick(po)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      "No purchase orders found"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📌 POINT 17: Pagination with React Query */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 📌 POINT 18: Error Display from React Query */}
      {isError && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error.message || "An error occurred"}</span>
          </div>
        </div>
      )}

      {/* 📌 POINT 19: Empty State */}
      {!isLoading && purchaseOrders.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Purchase Orders Found
              </h3>
              <p className="text-gray-600 mb-4">
                {debouncedSearchTerm
                  ? "No purchase orders match your search criteria."
                  : "Get started by creating your first purchase order."}
              </p>
              {!debouncedSearchTerm && (
                <a
                  href="/finance/purchase-orders/create"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Create Purchase Order
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Purchase Order Dialog */}
      <DeletePurchaseOrderDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        purchaseOrder={deleteDialog.purchaseOrder}
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
              Are you sure you want to delete {selectedPOs.length} purchase
              order
              {selectedPOs.length > 1 ? "s" : ""}? This action cannot be undone.
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
                    <Trash2 className="w-4 h-4" />
                    Delete {selectedPOs.length} Purchase Order
                    {selectedPOs.length > 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Status Confirmation Dialog */}
      {approvalDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {approvalDialog.action === "approved"
                ? "Approve Purchase Order"
                : "Reject Purchase Order"}
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              {approvalDialog.action === "approved" ? "approve" : "reject"}{" "}
              purchase order{" "}
              <span className="font-semibold">
                {approvalDialog.purchaseOrder?.purchaseOrderNumber}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleApprovalCancel}
                disabled={approvalDialog.loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalConfirm}
                disabled={approvalDialog.loading}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${
                  approvalDialog.action === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {approvalDialog.loading ? (
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
                    Processing...
                  </>
                ) : (
                  <>
                    {approvalDialog.action === "approved" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {approvalDialog.action === "approved"
                      ? "Approve"
                      : "Reject"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Dialog */}
      {statusDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {statusDialog.newStatus === "received" && "Mark as Received"}
              {statusDialog.newStatus === "cancelled" && "Cancel Order"}
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              {statusDialog.newStatus === "received" &&
                "mark this order as received"}
              {statusDialog.newStatus === "cancelled" && "cancel this order"}?
              <br />
              <span className="font-semibold mt-2 block">
                PO: {statusDialog.purchaseOrder?.purchaseOrderNumber}
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleStatusCancel}
                disabled={statusDialog.loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusConfirm}
                disabled={statusDialog.loading}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${
                  statusDialog.newStatus === "received"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {statusDialog.loading ? (
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
                    Processing...
                  </>
                ) : (
                  <>
                    {statusDialog.newStatus === "received" && (
                      <CheckCheck className="w-4 h-4" />
                    )}
                    {statusDialog.newStatus === "cancelled" && (
                      <Ban className="w-4 h-4" />
                    )}
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Acknowledgment Dialog */}
      {acknowledgmentDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Vendor Acknowledgment
            </h2>
            <p className="text-gray-600 mb-4">
              Confirm vendor acknowledgment for purchase order{" "}
              <span className="font-semibold">
                {acknowledgmentDialog.purchaseOrder?.purchaseOrderNumber}
              </span>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Comments (Optional)
              </label>
              <textarea
                value={acknowledgmentDialog.vendorComments}
                onChange={(e) =>
                  setAcknowledgmentDialog((prev) => ({
                    ...prev,
                    vendorComments: e.target.value,
                  }))
                }
                placeholder="Enter any comments from vendor..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleAcknowledgmentCancel}
                disabled={acknowledgmentDialog.loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledgmentConfirm}
                disabled={acknowledgmentDialog.loading}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
              >
                {acknowledgmentDialog.loading ? (
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
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Acknowledge
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
