"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FiMoreVertical, FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetAllCreditNotes, useGetCreditNoteStats, useDeleteCreditNote, useUpdateCreditNoteStatus, useApproveCreditNote, useDisputeCreditNote } from "../hooks/useCreditNoteQueries";
import type { CreditNote } from "../service/creditNoteApi";
import CreditNoteStats from "@/view/dashboard/finance/sales/creditNotes/components/CreditNoteStats";
import CreditNoteFilters, {
  SearchFilters,
} from "@/view/dashboard/finance/sales/creditNotes/components/CreditNoteFilters";

// Helper to get client initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function CreditNotesList() {
  const router = useRouter();
  const [currentFilters, setCurrentFilters] = useState<SearchFilters & { page?: number; limit?: number }>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error } = useGetAllCreditNotes({
    page: currentFilters.page,
    limit: currentFilters.limit,
    sortBy: currentFilters.sortBy,
    sortOrder: currentFilters.sortOrder,
    search: currentFilters.search,
    status: (currentFilters.status && currentFilters.status !== "all" ? currentFilters.status : undefined) as "draft" | "sent" | "acknowledged" | "disputed" | "resolved" | undefined,
    creditType: (currentFilters.creditType && currentFilters.creditType !== "all" ? currentFilters.creditType : undefined) as "quality_issue" | "quantity_shortage" | "damaged_goods" | "price_difference" | "return" | "refund" | "other" | undefined,
    startDate: currentFilters.dateFrom,
    endDate: currentFilters.dateTo,
  });
  const { data: statsData, isLoading: statsLoading } = useGetCreditNoteStats();
  const deleteMutation = useDeleteCreditNote();
  
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [creditNoteToDelete, setCreditNoteToDelete] = useState<CreditNote | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] = useState<CreditNote | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusNotes, setStatusNotes] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [disputeNotes, setDisputeNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const creditNotes = data?.data || [];
  const pagination = data?.pagination;

  // Mutations for actions on selected credit note
  const statusMutation = useUpdateCreditNoteStatus(selectedCreditNote?._id || "");
  const approveMutation = useApproveCreditNote(selectedCreditNote?._id || "");
  const disputeMutation = useDisputeCreditNote(selectedCreditNote?._id || "");

  // Handle search and filters
  const handleSearch = useCallback((filters: SearchFilters) => {
    setCurrentFilters({
      page: 1,
      limit: 10,
      ...filters,
    });
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setCurrentFilters({ page: 1, limit: 10 });
  }, []);

  const handleRowClick = (creditNoteId: string) => {
    router.push(`/finance/credit-notes/edit/${creditNoteId}`);
  };

  const handleDeleteClick = (note: CreditNote) => {
    setCreditNoteToDelete(note);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!creditNoteToDelete) return;

    try {
      await deleteMutation.mutateAsync(creditNoteToDelete._id);
      setDeleteConfirmOpen(false);
      setCreditNoteToDelete(null);
    } catch (error) {
      console.error("Error deleting credit note:", error);
    }
  };

  const handleApproveClick = (note: CreditNote) => {
    setSelectedCreditNote(note);
    setApproveNotes("");
    setApproveDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedCreditNote) return;
    try {
      setActionLoading(true);
      await approveMutation.mutateAsync({
        approvalNotes: approveNotes,
      });
      setApproveDialogOpen(false);
      setSelectedCreditNote(null);
      setApproveNotes("");
    } catch (error) {
      console.error("Error approving credit note:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisputeClick = (note: CreditNote) => {
    setSelectedCreditNote(note);
    setDisputeNotes("");
    setDisputeDialogOpen(true);
  };

  const handleConfirmDispute = async () => {
    if (!selectedCreditNote) return;
    try {
      setActionLoading(true);
      await disputeMutation.mutateAsync({
        notes: disputeNotes,
      });
      setDisputeDialogOpen(false);
      setSelectedCreditNote(null);
      setDisputeNotes("");
    } catch (error) {
      console.error("Error disputing credit note:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "disputed":
        return "bg-red-100 text-red-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "acknowledged":
        return "bg-purple-100 text-purple-800";
      case "draft":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return <FiCheckCircle className="w-4 h-4" />;
      case "disputed":
        return <FiXCircle className="w-4 h-4" />;
      case "acknowledged":
        return <FiCheckCircle className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credit Notes</h1>
          <p className="text-gray-600 mt-1">Manage and track your credit notes</p>
        </div>
        <Button
          className="rounded-lg px-6 py-2 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          onClick={() => router.push("/finance/credit-notes/create")}
        >
          + Create Credit Note
        </Button>
      </div>

      {/* Stats Section */}
      <CreditNoteStats
        stats={
          statsData?.data || {
            totalCreditNotes: 0,
            statusBreakdown: [],
            totalValue: 0,
            averageCreditNoteValue: 0,
            period: "all",
          }
        }
        loading={statsLoading}
      />

      {/* Filters Section */}
      <CreditNoteFilters
        onSearch={handleSearch}
        onClear={handleClearFilters}
        loading={isLoading}
      />

      {error && (
        <div className="mb-4 p-4 rounded bg-red-100 text-red-800 text-sm">
          Error: {error.message}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto p-4">
          {isLoading ? (
            <div className="py-12 text-center text-gray-600">
              Loading credit notes...
            </div>
          ) : creditNotes.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-lg">
              {Object.keys(currentFilters).some(k => k !== 'page' && k !== 'limit' && currentFilters[k as keyof SearchFilters]) ? (
                <>
                  No credit notes match your filters. <br />
                  <button
                    onClick={handleClearFilters}
                    className="text-blue-600 underline hover:text-blue-800 mt-2"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  No credit notes found. <br />
                  <button
                    onClick={() => router.push("/finance/credit-notes/create")}
                    className="text-blue-600 underline hover:text-blue-800 mt-2"
                  >
                    Create your first credit note
                  </button>
                </>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number
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
                {creditNotes.map((note: CreditNote, idx: number) => (
                  <tr
                    key={note._id || idx}
                    className="transition hover:bg-gray-50 focus-within:bg-gray-100"
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                      onClick={() => handleRowClick(note._id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-mono font-semibold text-sm">
                          {note.creditNoteNumber}
                        </span>
                        {note.reason && (
                          <span className="text-xs text-gray-600 mt-1 font-medium">
                            {note.reason}
                          </span>
                        )}
                      </div>
                    </td>

                    <td
                      className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                      onClick={() => handleRowClick(note._id)}
                    >
                      <div className="flex items-center gap-2 mt-1">
                        {note?.items && note?.items.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {note?.items.length} item
                            {note?.items.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {note.creditType && (
                          <span className="text-xs text-gray-500">
                            {note.creditType.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </td>

                    <td
                      className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                      onClick={() => handleRowClick(note._id)}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                          {getInitials(
                            (typeof note?.clientId === "object" &&
                              (note?.clientId as any)?.name) ||
                              note?.clientSnapshot?.name ||
                              "?"
                          )}
                        </span>
                        <span className="flex flex-col">
                          <span className="font-medium">
                            {(typeof note?.clientId === "object" &&
                              (note?.clientId as any)?.name) ||
                              note?.clientSnapshot?.name ||
                              "-"}
                          </span>
                          {typeof note?.clientId === "object" &&
                            (note?.clientId as any)?.email && (
                              <span className="text-xs text-gray-500">
                                {(note?.clientId as any)?.email}
                              </span>
                            )}
                        </span>
                      </span>
                    </td>

                    <td
                      className="px-6 py-4 whitespace-nowrap text-gray-900 cursor-pointer"
                      onClick={() => handleRowClick(note._id)}
                    >
                      <span>
                        {note.creditNoteDate
                          ? format(new Date(note.creditNoteDate), "MMM d, yyyy")
                          : "-"}
                      </span>
                    </td>

                    <td
                      className="px-6 py-4 whitespace-nowrap text-right text-gray-900 cursor-pointer"
                      onClick={() => handleRowClick(note._id)}
                    >
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-base">
                          ₹
                          {(note.grandTotal || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        {note.subtotal && note.subtotal !== note.grandTotal && (
                          <span className="text-xs text-gray-500">
                            Subtotal: ₹
                            {note.subtotal.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        )}
                        {note.totalTax && note.totalTax > 0 && (
                          <span className="text-xs text-gray-500">
                            Tax: ₹
                            {note.totalTax.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          note.status
                        )}`}
                      >
                        {getStatusIcon(note.status)}
                        {note.status || "draft"}
                      </span>
                    </td>

                    {/* Action Menu */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Popover
                        open={openPopoverId === note._id}
                        onOpenChange={(isOpen) =>
                          setOpenPopoverId(isOpen ? note._id : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                            aria-label="Credit note actions"
                          >
                            <FiMoreVertical />
                          </button>
                        </PopoverTrigger>

                        <PopoverContent className="w-44 p-2" align="end">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => {
                                handleRowClick(note._id);
                                setOpenPopoverId(null);
                              }}
                              className="px-3 py-2 text-sm text-left hover:bg-gray-100 rounded"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                router.push(
                                  `/finance/credit-notes/edit/${note._id}`
                                );
                                setOpenPopoverId(null);
                              }}
                              className="px-3 py-2 text-sm text-left hover:bg-gray-100 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Implement duplicate functionality
                                setOpenPopoverId(null);
                              }}
                              className="px-3 py-2 text-sm text-left hover:bg-gray-100 rounded"
                            >
                              Duplicate
                            </button>

                            {/* Approve Button - Only for Draft */}
                            {note.status === "draft" && (
                              <button
                                onClick={() => {
                                  handleApproveClick(note);
                                  setOpenPopoverId(null);
                                }}
                                className="px-3 py-2 text-sm text-left text-green-600 hover:bg-green-50 rounded"
                              >
                                Approve
                              </button>
                            )}

                            {/* Send Button - Only for Draft (transitions to Sent) */}
                            {note.status === "draft" && (
                              <button
                                onClick={() => {
                                  setSelectedCreditNote(note);
                                  setSelectedStatus("sent");
                                  setStatusNotes("");
                                  setStatusDialogOpen(true);
                                  setOpenPopoverId(null);
                                }}
                                className="px-3 py-2 text-sm text-left text-blue-600 hover:bg-blue-50 rounded"
                              >
                                Send
                              </button>
                            )}

                            {/* Mark as Acknowledged - Only for Sent */}
                            {note.status === "sent" && (
                              <button
                                onClick={() => {
                                  setSelectedCreditNote(note);
                                  setSelectedStatus("acknowledged");
                                  setStatusNotes("");
                                  setStatusDialogOpen(true);
                                  setOpenPopoverId(null);
                                }}
                                className="px-3 py-2 text-sm text-left text-purple-600 hover:bg-purple-50 rounded"
                              >
                                Mark as Acknowledged
                              </button>
                            )}

                            {/* Resolve Button - For Acknowledged or Disputed */}
                            {(note.status === "acknowledged" || note.status === "disputed") && (
                              <button
                                onClick={() => {
                                  setSelectedCreditNote(note);
                                  setSelectedStatus("resolved");
                                  setStatusNotes("");
                                  setStatusDialogOpen(true);
                                  setOpenPopoverId(null);
                                }}
                                className="px-3 py-2 text-sm text-left text-green-600 hover:bg-green-50 rounded"
                              >
                                Mark as Resolved
                              </button>
                            )}

                            {/* Dispute Button - Only for Non-Draft statuses */}
                            {note.status !== "draft" && note.status !== "disputed" && (
                              <button
                                onClick={() => {
                                  handleDisputeClick(note);
                                  setOpenPopoverId(null);
                                }}
                                className="px-3 py-2 text-sm text-left text-orange-600 hover:bg-orange-50 rounded"
                              >
                                Dispute
                              </button>
                            )}

                            <hr className="my-1" />
                            <button
                              onClick={() => {
                                handleDeleteClick(note);
                                setOpenPopoverId(null);
                              }}
                              className="px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Credit Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this credit note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {creditNoteToDelete && (
            <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Credit Note Number:</span>
                <span className="font-semibold">{creditNoteToDelete.creditNoteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">
                  ₹{(creditNoteToDelete.grandTotal || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Client:</span>
                <span className="font-semibold">
                  {(typeof creditNoteToDelete?.clientId === "object" &&
                    (creditNoteToDelete?.clientId as any)?.name) ||
                    creditNoteToDelete?.clientSnapshot?.name ||
                    "-"}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setCreditNoteToDelete(null);
              }}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Credit Note Status</DialogTitle>
            <DialogDescription>
              Change the status of this credit note
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded text-sm">
              Status will change to: <span className="font-semibold capitalize">{selectedStatus}</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Notes (Optional)
              </label>
              <Textarea
                placeholder="Add any notes about this status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="min-h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStatusDialogOpen(false);
                setStatusNotes("");
                setSelectedStatus("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedCreditNote) return;
                try {
                  setActionLoading(true);
                  await statusMutation.mutateAsync({
                    status: selectedStatus as "draft" | "sent" | "acknowledged" | "disputed" | "resolved",
                    notes: statusNotes,
                  });
                  setStatusDialogOpen(false);
                  setSelectedCreditNote(null);
                  setStatusNotes("");
                  setSelectedStatus("");
                } catch (error) {
                  console.error("Error updating status:", error);
                } finally {
                  setActionLoading(false);
                }
              }}
              disabled={actionLoading}
            >
              {actionLoading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Credit Note</DialogTitle>
            <DialogDescription>
              Approve this credit note and move it from draft status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded text-sm">
              This action will mark the credit note as approved.
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Approval Notes (Optional)
              </label>
              <Textarea
                placeholder="Add approval comments or conditions..."
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                className="min-h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveDialogOpen(false);
                setApproveNotes("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApprove}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? "Approving..." : "Approve Credit Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dispute Credit Note</DialogTitle>
            <DialogDescription>
              Mark this credit note as disputed and provide dispute details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 p-3 rounded text-sm">
              <p className="font-medium text-orange-900">Why Dispute?</p>
              <ul className="text-xs text-orange-800 mt-2 space-y-1 ml-4 list-disc">
                <li>Amount mismatch with invoice</li>
                <li>Items don't match the original invoice</li>
                <li>Duplicate credit note</li>
                <li>Other discrepancies</li>
              </ul>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Dispute Reason/Details (Required)
              </label>
              <Textarea
                placeholder="Explain why you are disputing this credit note..."
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                className="min-h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDisputeDialogOpen(false);
                setDisputeNotes("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDispute}
              disabled={actionLoading || !disputeNotes.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {actionLoading ? "Marking..." : "Mark as Disputed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
