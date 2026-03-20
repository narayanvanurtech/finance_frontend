"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  FiMoreHorizontal,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiCopy,
} from "react-icons/fi";
import { FileText, Package, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useDebitNotesList,
  useDeleteDebitNote,
  useBulkDeleteDebitNotes,
  useGetDebitNoteStats,
  useApproveDebitNote,
  useResolveDebitNote,
  useDisputeDebitNote,
  useDuplicateDebitNote,
} from "@/hooks/useDebitNotesQueries";
import DebitNoteStats from "@/components/finance/debit-notes/DebitNoteStats";
import DebitNoteFilters, {
  DebitNoteSearchFilters,
} from "@/components/finance/debit-notes/DebitNoteFilters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DebitNotesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [currentFilters, setCurrentFilters] = useState<DebitNoteSearchFilters>(
    {}
  );
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  // Fetch debit notes using React Query
  const { debitNotes, pagination, isLoading, isError, refetch } =
    useDebitNotesList({
      page,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...currentFilters,
    });

  const { data: debitNoteStats, isLoading: debitNoteStatsPending } =
    useGetDebitNoteStats();

  const { mutate: deleteDebitNote } = useDeleteDebitNote();
  const { mutate: bulkDelete } = useBulkDeleteDebitNotes();
  const { mutate: approveDebitNote } = useApproveDebitNote();
  const { mutate: resolveDebitNote } = useResolveDebitNote();
  const { mutate: disputeDebitNote } = useDisputeDebitNote();
  const { mutate: duplicateDebitNote } = useDuplicateDebitNote();

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    debitNote: any | null;
    loading: boolean;
  }>({
    open: false,
    debitNote: null,
    loading: false,
  });

  // Bulk delete state
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState<{
    open: boolean;
    loading: boolean;
  }>({
    open: false,
    loading: false,
  });

  // Approve dialog state
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    debitNote: any | null;
    loading: boolean;
    notes: string;
  }>({
    open: false,
    debitNote: null,
    loading: false,
    notes: "",
  });

  // Resolve dialog state
  const [resolveDialog, setResolveDialog] = useState<{
    open: boolean;
    debitNote: any | null;
    loading: boolean;
    resolutionType: string;
    amount: string;
    notes: string;
  }>({
    open: false,
    debitNote: null,
    loading: false,
    resolutionType: "credit_note_received",
    amount: "",
    notes: "",
  });

  // Dispute dialog state
  const [disputeDialog, setDisputeDialog] = useState<{
    open: boolean;
    debitNote: any | null;
    loading: boolean;
    notes: string;
  }>({
    open: false,
    debitNote: null,
    loading: false,
    notes: "",
  });

  // Duplicate dialog state
  const [duplicateDialog, setDuplicateDialog] = useState<{
    open: boolean;
    debitNote: any | null;
    loading: boolean;
  }>({
    open: false,
    debitNote: null,
    loading: false,
  });

  // Handle filters
  const handleSearch = useCallback((filters: DebitNoteSearchFilters) => {
    //console.log("🔍 handleSearch called with filters:", filters);
    setCurrentFilters(filters);
    setPage(1); // React Query will auto-refetch when filters change
  }, []);

  const handleClearFilters = useCallback(() => {
    setCurrentFilters({});
    setPage(1);
  }, []);

  // Handle delete
  const handleDeleteClick = (debitNote: any) => {
    setDeleteDialog({
      open: true,
      debitNote,
      loading: false,
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteDialog.debitNote) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    deleteDebitNote(deleteDialog.debitNote._id, {
      onSuccess: () => {
        setDeleteDialog({ open: false, debitNote: null, loading: false });
        refetch();
      },
      onError: () => {
        setDeleteDialog((prev) => ({ ...prev, loading: false }));
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, debitNote: null, loading: false });
  };

  // Bulk selection handlers
  const toggleSelection = (noteId: string) => {
    setSelectedNotes((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const toggleSelectAll = () => {
    const allIds = debitNotes.map((note: any) => note._id);
    setSelectedNotes(selectedNotes.length === allIds.length ? [] : allIds);
  };

  const handleBulkDeleteClick = () => {
    if (selectedNotes.length === 0) return;
    setBulkDeleteDialog({ open: true, loading: false });
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedNotes.length === 0) return;

    setBulkDeleteDialog((p) => ({ ...p, loading: true }));

    bulkDelete(selectedNotes, {
      onSuccess: () => {
        setSelectedNotes([]);
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

  // Handle approve
  const handleApproveClick = (debitNote: any) => {
    setApproveDialog({
      open: true,
      debitNote,
      loading: false,
      notes: "",
    });
  };

  const handleApproveConfirm = () => {
    if (!approveDialog.debitNote) return;

    setApproveDialog((prev) => ({ ...prev, loading: true }));
    approveDebitNote(
      {
        debitNoteId: approveDialog.debitNote._id,
        data: { notes: approveDialog.notes || undefined },
      },
      {
        onSuccess: () => {
          setApproveDialog({
            open: false,
            debitNote: null,
            loading: false,
            notes: "",
          });
          refetch();
        },
        onError: () => {
          setApproveDialog((prev) => ({ ...prev, loading: false }));
        },
      }
    );
  };

  const handleApproveCancel = () => {
    setApproveDialog({
      open: false,
      debitNote: null,
      loading: false,
      notes: "",
    });
  };

  // Handle resolve
  const handleResolveClick = (debitNote: any) => {
    setResolveDialog({
      open: true,
      debitNote,
      loading: false,
      resolutionType: "credit_note_received",
      amount: debitNote.grandTotal?.toString() || "",
      notes: "",
    });
  };

  const handleResolveConfirm = () => {
    if (!resolveDialog.debitNote) return;

    setResolveDialog((prev) => ({ ...prev, loading: true }));
    resolveDebitNote(
      {
        debitNoteId: resolveDialog.debitNote._id,
        data: {
          resolutionType: resolveDialog.resolutionType as any,
          amount: parseFloat(resolveDialog.amount),
          notes: resolveDialog.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          setResolveDialog({
            open: false,
            debitNote: null,
            loading: false,
            resolutionType: "credit_note_received",
            amount: "",
            notes: "",
          });
          refetch();
        },
        onError: () => {
          setResolveDialog((prev) => ({ ...prev, loading: false }));
        },
      }
    );
  };

  const handleResolveCancel = () => {
    setResolveDialog({
      open: false,
      debitNote: null,
      loading: false,
      resolutionType: "credit_note_received",
      amount: "",
      notes: "",
    });
  };

  // Handle dispute
  const handleDisputeClick = (debitNote: any) => {
    setDisputeDialog({
      open: true,
      debitNote,
      loading: false,
      notes: "",
    });
  };

  const handleDisputeConfirm = () => {
    if (!disputeDialog.debitNote || !disputeDialog.notes.trim()) return;

    setDisputeDialog((prev) => ({ ...prev, loading: true }));
    disputeDebitNote(
      {
        debitNoteId: disputeDialog.debitNote._id,
        data: { notes: disputeDialog.notes },
      },
      {
        onSuccess: () => {
          setDisputeDialog({
            open: false,
            debitNote: null,
            loading: false,
            notes: "",
          });
          refetch();
        },
        onError: () => {
          setDisputeDialog((prev) => ({ ...prev, loading: false }));
        },
      }
    );
  };

  const handleDisputeCancel = () => {
    setDisputeDialog({
      open: false,
      debitNote: null,
      loading: false,
      notes: "",
    });
  };

  // Handle duplicate
  const handleDuplicateClick = (debitNote: any) => {
    setDuplicateDialog({
      open: true,
      debitNote,
      loading: false,
    });
  };

  const handleDuplicateConfirm = () => {
    if (!duplicateDialog.debitNote) return;

    setDuplicateDialog((prev) => ({ ...prev, loading: true }));
    duplicateDebitNote(duplicateDialog.debitNote._id, {
      onSuccess: (response) => {
        setDuplicateDialog({ open: false, debitNote: null, loading: false });
        refetch();
        if (response.data?._id) {
          router.push(`/finance/debit-notes`);
        }
      },
      onError: () => {
        setDuplicateDialog((prev) => ({ ...prev, loading: false }));
      },
    });
  };

  const handleDuplicateCancel = () => {
    setDuplicateDialog({ open: false, debitNote: null, loading: false });
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  if (isLoading && debitNotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiRefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Debit Notes</h1>
          <p className="text-gray-600">Manage vendor debit notes</p>
        </div>

        <a
          href="/finance/debit-notes/create"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
        >
          + Create Debit Note
        </a>
      </div>

      {/* STATS SECTION */}
      {debitNoteStats && (
        <DebitNoteStats stats={debitNoteStats.data} loading={isLoading} />
      )}

      {/* Filters Section */}
      <DebitNoteFilters
        onSearch={handleSearch}
        onClear={handleClearFilters}
        loading={isLoading}
      />

      {/* BULK ACTION BAR */}
      {selectedNotes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex justify-between">
          <span className="text-blue-800 font-medium">
            {selectedNotes.length} selected
          </span>

          <button
            onClick={handleBulkDeleteClick}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* DEBIT NOTES TABLE */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Debit Notes</h2>
          <p className="text-gray-500 text-sm">
            {pagination ? pagination.totalItems : 0} total debit notes
          </p>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center text-gray-500 py-16 text-lg">
              Loading debit notes...
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 py-16 text-lg">
              Error loading debit notes.
            </div>
          ) : debitNotes?.length === 0 ? (
            <div className="text-center text-gray-500 py-16 text-lg">
              No debit notes found.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedNotes.length > 0 &&
                        selectedNotes.length === debitNotes.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Resolution
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
                {debitNotes.map((note: any, idx: number) => {
                  const formattedDate = new Date(
                    note.debitNoteDate
                  ).toLocaleDateString("en-IN");
                  const totalAmount =
                    note.grandTotal ||
                    note.items?.reduce(
                      (sum: number, item: any) =>
                        sum + (Number(item.amount) || 0),
                      0
                    ) ||
                    0;
                  const formattedAmount = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(totalAmount);

                  return (
                    <tr
                      key={note._id || idx}
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() =>
                        router.push(`/finance/debit-notes/edit/${note._id}`)
                      }
                    >
                      {/* Checkbox */}
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNotes.includes(note._id)}
                          onChange={() => toggleSelection(note._id)}
                          className="w-4 h-4"
                        />
                      </td>

                      {/* Debit Note Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-blue-600 font-semibold">
                          {note.debitNoteNumber}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">{formattedDate}</td>

                      {/* Vendor */}
                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {note.vendorSnapshot?.name || "N/A"}
                        </div>
                      </td>

                      {/* Debit Type */}
                      <td className="px-6 py-4">
                        <span className="capitalize text-sm">
                          {note.debitType?.replace(/_/g, " ") || "N/A"}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded font-semibold ${
                            note.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : note.priority === "medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {note.priority || "low"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            note.status === "sent"
                              ? "bg-blue-100 text-blue-700"
                              : note.status === "applied"
                              ? "bg-green-100 text-green-700"
                              : note.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {note.status || "draft"}
                        </span>
                      </td>

                      {/* Resolution Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            note.resolutionStatus === "resolved"
                              ? "bg-green-100 text-green-700"
                              : note.resolutionStatus === "partial"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {note.resolutionStatus || "pending"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right font-semibold">
                        {formattedAmount}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-full hover:bg-gray-100">
                              <FiMoreHorizontal className="h-4 w-4 text-gray-600" />
                            </button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/finance/debit-notes/edit/${note._id}`
                                )
                              }
                            >
                              <FiEdit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleApproveClick(note)}
                              disabled={note.status === "applied"}
                            >
                              <FiCheck className="h-4 w-4 mr-2 text-green-600" />{" "}
                              Approve
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleResolveClick(note)}
                              disabled={note.resolutionStatus === "resolved"}
                            >
                              <FiCheck className="h-4 w-4 mr-2 text-blue-600" />{" "}
                              Resolve
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDisputeClick(note)}
                            >
                              <FiAlertTriangle className="h-4 w-4 mr-2 text-amber-600" />{" "}
                              Dispute
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDuplicateClick(note)}
                            >
                              <FiCopy className="h-4 w-4 mr-2 text-blue-600" />{" "}
                              Duplicate
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteClick(note)}
                            >
                              <FiTrash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* PAGINATION */}
      {!isLoading && debitNotes.length > 0 && pagination && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Items per page:</label>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="px-3 py-1 border rounded bg-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

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
              of {pagination.totalItems} notes
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((pageNum) => {
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 border rounded ${
                          page === pageNum
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <span key={pageNum} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      {deleteDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-3">Delete Debit Note?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{deleteDialog.debitNote?.debitNoteNumber}</strong>? This
              action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                disabled={deleteDialog.loading}
              >
                {deleteDialog.loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE DIALOG */}
      {bulkDeleteDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-3">Confirm Bulk Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedNotes.length} debit note
              {selectedNotes.length > 1 ? "s" : ""}? This action cannot be
              undone.
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

      {/* APPROVE DIALOG */}
      {approveDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-3">Approve Debit Note</h2>
            <p className="text-gray-600 mb-4">
              Approve{" "}
              <strong>{approveDialog.debitNote?.debitNoteNumber}</strong>?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={approveDialog.notes}
                onChange={(e) =>
                  setApproveDialog((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Verified and approved"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleApproveCancel}
                className="px-4 py-2 border rounded-lg"
                disabled={approveDialog.loading}
              >
                Cancel
              </button>

              <button
                onClick={handleApproveConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
                disabled={approveDialog.loading}
              >
                {approveDialog.loading ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE DIALOG */}
      {resolveDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-3">Resolve Debit Note</h2>
            <p className="text-gray-600 mb-4">
              Mark{" "}
              <strong>{resolveDialog.debitNote?.debitNoteNumber}</strong> as
              resolved
            </p>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Type
                </label>
                <select
                  value={resolveDialog.resolutionType}
                  onChange={(e) =>
                    setResolveDialog((prev) => ({
                      ...prev,
                      resolutionType: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="credit_note_received">
                    Credit Note Received
                  </option>
                  <option value="refund_received">Refund Received</option>
                  <option value="adjustment_made">Adjustment Made</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={resolveDialog.amount}
                  onChange={(e) =>
                    setResolveDialog((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  placeholder="Amount"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={resolveDialog.notes}
                  onChange={(e) =>
                    setResolveDialog((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Credit note received from vendor"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleResolveCancel}
                className="px-4 py-2 border rounded-lg"
                disabled={resolveDialog.loading}
              >
                Cancel
              </button>

              <button
                onClick={handleResolveConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                disabled={resolveDialog.loading || !resolveDialog.amount}
              >
                {resolveDialog.loading ? "Resolving..." : "Resolve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE DIALOG */}
      {disputeDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-3">Dispute Debit Note</h2>
            <p className="text-gray-600 mb-4">
              Raise a dispute for{" "}
              <strong>{disputeDialog.debitNote?.debitNoteNumber}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dispute Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={disputeDialog.notes}
                onChange={(e) =>
                  setDisputeDialog((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Vendor disagreed on quantity"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleDisputeCancel}
                className="px-4 py-2 border rounded-lg"
                disabled={disputeDialog.loading}
              >
                Cancel
              </button>

              <button
                onClick={handleDisputeConfirm}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg"
                disabled={disputeDialog.loading || !disputeDialog.notes.trim()}
              >
                {disputeDialog.loading ? "Submitting..." : "Raise Dispute"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DUPLICATE DIALOG */}
      {duplicateDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-3">Duplicate Debit Note</h2>
            <p className="text-gray-600 mb-6">
              Create a duplicate of{" "}
              <strong>{duplicateDialog.debitNote?.debitNoteNumber}</strong>?
              This will create a new debit note with the same details.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleDuplicateCancel}
                className="px-4 py-2 border rounded-lg"
                disabled={duplicateDialog.loading}
              >
                Cancel
              </button>

              <button
                onClick={handleDuplicateConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                disabled={duplicateDialog.loading}
              >
                {duplicateDialog.loading ? "Duplicating..." : "Duplicate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
