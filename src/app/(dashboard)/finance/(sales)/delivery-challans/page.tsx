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
  FiSend,
  FiXCircle,
  FiTrash2,
  FiEye,
  FiEdit2,
  FiDownload,
  FiCopy,
  FiClock,
} from "react-icons/fi";
import { useDeliveryChallanStore } from "@/stores/financeStore/useDeliveryChallanStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DeleteDeliveryChallanDialog from "@/components/finance/deliveryChallan/DeleteDeliveryChallanDialog";
import DeliveryChallanStats from "@/components/finance/deliveryChallan/DeliveryChallanStats";
import DeliveryChallanFilters, {
  SearchFilters,
} from "@/components/finance/deliveryChallan/DeliveryChallanFilters";

// Type Definitions
interface DeliveryChallan {
  _id?: string;
  deliveryChallanNumber?: string;
  clientId?:
    | {
        businessName?: string;
        email?: string;
        phone?: string;
      }
    | string;
  items?: any[];
  date?: string;
  status?: string;
}

// Status Badge
const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "sent":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          <FiSend className="inline" /> Sent
        </span>
      );
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
          <FiCheckCircle className="inline" /> Delivered
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
          <FiXCircle className="inline" /> Rejected
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

// Get Initials
const getInitials = (name: string) =>
  name
    ?.split(" ")
    ?.map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

export default function DeliveryChallanListPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const challans = useDeliveryChallanStore(
    (state: any) => state.challans
  ) as DeliveryChallan[];
  const pagination = useDeliveryChallanStore((state: any) => state.pagination);
  const loading = useDeliveryChallanStore((state: any) => state.loading);
  const fetchChallans = useDeliveryChallanStore(
    (state: any) => state.fetchChallans
  );
  const setCompanyId = useDeliveryChallanStore(
    (state: any) => state.setCompanyId
  );
  const deleteChallan = useDeliveryChallanStore(
    (state: any) => state.deleteChallan
  );
  const duplicateChallan = useDeliveryChallanStore(
    (state: any) => state.duplicateChallan
  );
  const updateChallanStatus = useDeliveryChallanStore(
    (state: any) => state.updateChallanStatus
  );
  const bulkAction = useDeliveryChallanStore((state: any) => state.bulkAction);
  const searchChallans = useDeliveryChallanStore(
    (state: any) => state.searchChallans
  );
  const getChallanStats = useDeliveryChallanStore(
    (state: any) => state.getChallanStats
  );

  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  // Delete Dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    challan: DeliveryChallan | null;
    loading: boolean;
  }>({
    open: false,
    challan: null,
    loading: false,
  });

  // Stats state
  const [stats, setStats] = useState<{
    totalChallans: number;
    totalValue: number;
    draftChallans: number;
    sentChallans: number;
    deliveredChallans: number;
    rejectedChallans: number;
    period: string;
  }>({
    totalChallans: 0,
    totalValue: 0,
    draftChallans: 0,
    sentChallans: 0,
    deliveredChallans: 0,
    rejectedChallans: 0,
    period: "30 days",
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  // Bulk Delete
  const [selectedChallans, setSelectedChallans] = useState<string[]>([]);
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
      if (getChallanStats) {
        const response = await getChallanStats(user.companyId, "30");
        console.log("📊 Stats Response:", response);

        // Parse backend response structure
        const statsData = response?.data || response;
        const statusBreakdown = statsData?.statusBreakdown || [];

        // Extract counts from statusBreakdown array
        const draftCount =
          statusBreakdown.find((s: any) => s._id === "draft")?.count || 0;
        const sentCount =
          statusBreakdown.find((s: any) => s._id === "sent")?.count || 0;
        const deliveredCount =
          statusBreakdown.find((s: any) => s._id === "delivered")?.count || 0;
        const rejectedCount =
          statusBreakdown.find((s: any) => s._id === "rejected")?.count || 0;

        setStats({
          totalChallans: statsData?.totalDeliveryChallans || 0,
          totalValue: statsData?.totalValue || 0,
          draftChallans: draftCount,
          sentChallans: sentCount,
          deliveredChallans: deliveredCount,
          rejectedChallans: rejectedCount,
          period: statsData?.period || "30 days",
        });
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [user?.companyId, getChallanStats]);

  useEffect(() => {
    if (user?.companyId && mounted) {
      console.log("🔄 Setting companyId and fetching...");
      if (setCompanyId) {
        setCompanyId(user.companyId);
      }

      // Check if there are active filters
      const hasActiveFilters = Object.values(currentFilters).some(
        (value) => value && typeof value === "string" && value.length > 0
      );

      if (hasActiveFilters && searchChallans) {
        const params: any = {
          page: currentPage,
          limit: itemsPerPage,
        };

        if (currentFilters.search) params.search = currentFilters.search;
        if (currentFilters.status) params.status = currentFilters.status;
        if (currentFilters.sortBy) params.sortBy = currentFilters.sortBy;
        if (currentFilters.sortOrder)
          params.sortOrder = currentFilters.sortOrder;
        if (currentFilters.dateFrom) params.dateFrom = currentFilters.dateFrom;
        if (currentFilters.dateTo) params.dateTo = currentFilters.dateTo;

        searchChallans(user.companyId, params);
      } else {
        fetchChallans(currentPage, itemsPerPage);
      }

      loadStats();
    }
  }, [user?.companyId, mounted, currentPage, itemsPerPage, currentFilters]);

  // Handle search and filters
  const handleSearch = useCallback((filters: SearchFilters) => {
    setCurrentFilters(filters);
    setCurrentPage(1);
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setCurrentFilters({});
    setCurrentPage(1);
  }, []);

  // Handle stat card clicks
  const handleStatClick = useCallback(
    (filterType: "all" | "draft" | "sent" | "delivered" | "rejected") => {
      let filters: SearchFilters = {};

      if (filterType !== "all") {
        filters = { status: filterType };
      }

      setCurrentFilters(filters);
      setCurrentPage(1);
    },
    []
  );

  // Debug
  useEffect(() => {
    if (challans.length > 0) {
      console.log("📦 Delivery Challans Data:", challans);
      console.log("📋 First Challan Structure:", challans[0]);
    }
  }, [challans]);

  const isEmpty = !challans || challans.length === 0;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  // Duplicate Handler
  const handleDuplicate = async (challanId: string) => {
    try {
      if (duplicateChallan) {
        await duplicateChallan(challanId);
        toast.success("Delivery Challan duplicated!");
      }
      setOpenPopoverId(null);
    } catch (error) {
      console.error("Failed to duplicate delivery challan:", error);
      toast.error("Failed to duplicate");
    }
  };

  // Status Change Handler
  const handleStatusChange = async (challanId: string, status: string) => {
    try {
      if (updateChallanStatus) {
        await updateChallanStatus(challanId, status);
        toast.success(`Status updated to ${status}!`);
      }
      setOpenPopoverId(null);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  // Delete Handlers
  const handleDeleteClick = (challan: any) => {
    setDeleteDialog({
      open: true,
      challan,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.challan?._id) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      if (deleteChallan) {
        await deleteChallan(deleteDialog.challan._id);
        toast.success("Delivery Challan deleted!");
      }
      setDeleteDialog({ open: false, challan: null, loading: false });
      // Refresh stats after deletion
      loadStats();
    } catch (error) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
      toast.error("Failed to delete");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, challan: null, loading: false });
  };

  // Bulk Selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select challans that can be deleted (draft only)
      const deletableIds = challans
        .filter((challan: DeliveryChallan) => challan?.status === "draft")
        .map((challan: DeliveryChallan) => challan._id)
        .filter(Boolean) as string[];
      setSelectedChallans(deletableIds);
    } else {
      setSelectedChallans([]);
    }
  };

  const handleSelectChallan = (challanId: string, checked: boolean) => {
    if (checked) {
      setSelectedChallans([...selectedChallans, challanId]);
    } else {
      setSelectedChallans(selectedChallans.filter((id) => id !== challanId));
    }
  };

  // Bulk Delete Handlers
  const handleBulkDeleteClick = () => {
    if (selectedChallans.length === 0) return;

    // Check if any selected challan is not deletable
    const nonDeletableCount = challans.filter(
      (challan: DeliveryChallan) =>
        selectedChallans.includes(challan?._id || "") &&
        challan?.status !== "draft"
    ).length;

    if (nonDeletableCount > 0) {
      toast.error(
        `Cannot delete ${nonDeletableCount} challan(s). Only draft challans can be deleted.`
      );
      return;
    }

    setBulkDeleteDialog({ open: true, loading: false });
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedChallans.length === 0) return;

    setBulkDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      if (bulkAction) {
        await bulkAction("delete", selectedChallans);
      }
      setSelectedChallans([]);
      setBulkDeleteDialog({ open: false, loading: false });
      toast.success(
        `Successfully deleted ${selectedChallans.length} challan(s)`
      );
      // Refresh stats after bulk deletion
      loadStats();
    } catch (error) {
      setBulkDeleteDialog((prev) => ({ ...prev, loading: false }));
      toast.error("Failed to delete challans");
    }
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialog({ open: false, loading: false });
  };

  // Download PDF Handler
  const handleDownloadPDF = async (challanId: string) => {
    try {
      toast.success("Downloading PDF...");
      // Implement PDF download logic here
      setOpenPopoverId(null);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  const totalPages =
    pagination?.pages || Math.ceil(challans.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Delivery Challans
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track your delivery challans
          </p>
        </div>
        <Link
          href="/finance/delivery-challans/create"
          className="px-4 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
        >
          + New Delivery Challan
        </Link>
      </div>

      {/* Stats Section */}
      <DeliveryChallanStats
        stats={stats}
        loading={statsLoading}
        onStatClick={handleStatClick}
      />

      {/* Filters Section */}
      <DeliveryChallanFilters
        onSearch={handleSearch}
        onClear={handleClearFilters}
        loading={loading}
      />

      {/* Bulk Actions Bar */}
      {selectedChallans.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              {selectedChallans.length} challan
              {selectedChallans.length > 1 ? "s" : ""} selected
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
              Loading delivery challans...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedChallans.length === challans.length &&
                        challans.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Challan No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                      No delivery challans found. <br />
                      <Link
                        href="/finance/delivery-challans/create"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        Create your first delivery challan
                      </Link>
                    </td>
                  </tr>
                ) : (
                  challans.map((challan: DeliveryChallan, idx: number) => {
                    const challanNumber =
                      challan?.deliveryChallanNumber || "N/A";
                    const clientData =
                      typeof challan?.clientId === "object"
                        ? challan?.clientId
                        : null;
                    const clientName =
                      clientData?.businessName || clientData?.email || "-";
                    const clientEmail = clientData?.email || "";
                    const clientPhone = clientData?.phone || "";

                    return (
                      <tr
                        key={challan?._id || idx}
                        className="transition hover:bg-gray-50 focus-within:bg-gray-100"
                      >
                        {/* Checkbox */}
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedChallans.includes(
                              challan?._id || ""
                            )}
                            onChange={(e) =>
                              handleSelectChallan(
                                challan._id || "",
                                e.target.checked
                              )
                            }
                            disabled={challan?.status !== "draft"}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </td>

                        {/* Challan Number */}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/finance/delivery-challans/edit/${challan?._id}`)
                          }
                        >
                          <div className="flex flex-col">
                            <span className="font-mono font-semibold text-sm">
                              {challanNumber}
                            </span>
                          </div>
                        </td>

                        {/* Client */}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/finance/delivery-challans/edit/${challan?._id}`)
                          }
                        >
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                              {getInitials(clientName)}
                            </span>
                            <span className="flex flex-col">
                              <span className="font-medium">{clientName}</span>
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

                        {/* Details */}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/finance/delivery-challans/edit/${challan?._id}`)
                          }
                        >
                          <div className="flex items-center gap-2">
                            {challan?.items && challan?.items.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {challan?.items.length} item
                                {challan?.items.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/finance/delivery-challans/edit/${challan?._id}`)
                          }
                        >
                          <div className="flex flex-col">
                            <span>
                              {challan?.date
                                ? format(new Date(challan.date), "MMM d, yyyy")
                                : "-"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(challan?.status || "draft")}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Popover
                            open={openPopoverId === challan?._id}
                            onOpenChange={(isOpen) =>
                              setOpenPopoverId(
                                isOpen ? challan?._id || null : null
                              )
                            }
                          >
                            <PopoverTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Challan actions"
                              >
                                <FiMoreVertical />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-44 p-2" align="end">
                              <div className="flex flex-col gap-1">
                                <Link
                                  href={`/finance/delivery-challans/preview/${challan?._id}`}
                                  onClick={() => setOpenPopoverId(null)}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-blue-600 text-sm"
                                  aria-label="Preview Challan"
                                >
                                  Preview
                                </Link>
                                <Link
                                  href={`/finance/delivery-challans/edit/${challan?._id}`}
                                  onClick={() => setOpenPopoverId(null)}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm"
                                  aria-label="Edit Challan"
                                >
                                  Edit
                                </Link>
                                {duplicateChallan && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDuplicate(challan._id!);
                                    }}
                                    className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left"
                                    aria-label="Duplicate Challan"
                                  >
                                    Duplicate
                                  </button>
                                )}
                                {/* <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadPDF(challan._id!);
                                  }}
                                  className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left"
                                  aria-label="Download PDF"
                                >
                                  Download PDF
                                </button> */}

                                {/* Status Change - Only for draft */}
                                {challan?.status === "draft" && (
                                  <>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        const id = challan?._id;
                                        if (id) {
                                          await handleStatusChange(id, "sent");
                                        }
                                      }}
                                      className="px-3 py-2 rounded hover:bg-gray-100 text-blue-600 text-sm text-left flex items-center gap-2"
                                    >
                                      <FiSend className="w-4 h-4" />
                                      Mark as Sent
                                    </button>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        const id = challan?._id;
                                        if (id) {
                                          await handleStatusChange(
                                            id,
                                            "cancelled"
                                          );
                                        }
                                      }}
                                      className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left flex items-center gap-2"
                                    >
                                      <FiXCircle className="w-4 h-4" />
                                      Cancel Challan
                                    </button>
                                  </>
                                )}

                                {/* Mark as Delivered - Only for sent */}
                                {challan?.status === "sent" && (
                                  <>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        const id = challan?._id;
                                        if (id) {
                                          await handleStatusChange(
                                            id,
                                            "delivered"
                                          );
                                        }
                                      }}
                                      className="px-3 py-2 rounded hover:bg-gray-100 text-green-600 text-sm text-left flex items-center gap-2"
                                    >
                                      <FiCheckCircle className="w-4 h-4" />
                                      Mark as Delivered
                                    </button>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        const id = challan?._id;
                                        if (id) {
                                          await handleStatusChange(
                                            id,
                                            "cancelled"
                                          );
                                        }
                                      }}
                                      className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left flex items-center gap-2"
                                    >
                                      <FiXCircle className="w-4 h-4" />
                                      Cancel Challan
                                    </button>
                                  </>
                                )}

                                {/* Delete - Only for draft, rejected and cancelled */}
                                {(challan?.status === "draft" ||
                                  challan?.status === "rejected" ||
                                  challan?.status === "cancelled") && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(challan);
                                      setOpenPopoverId(null);
                                    }}
                                    className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left flex items-center gap-2"
                                    aria-label="Delete Challan"
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
      {!loading && challans.length > 0 && (
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
              {challans.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}{" "}
              to {Math.min(currentPage * itemsPerPage, challans.length)} of{" "}
              {pagination?.total || challans.length} challans
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

      {/* Delete Confirmation Dialog */}
      <DeleteDeliveryChallanDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        challan={deleteDialog.challan}
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
              Are you sure you want to delete {selectedChallans.length} delivery
              challan
              {selectedChallans.length > 1 ? "s" : ""}? This action cannot be
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
                    Delete {selectedChallans.length} Challan
                    {selectedChallans.length > 1 ? "s" : ""}
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
