"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FiMoreHorizontal } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useDebitNotesList } from "@/hooks/useDebitNotesQueries";

export default function DebitNotesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Fetch debit notes using React Query
  const { debitNotes, pagination, isLoading, isError } = useDebitNotesList({
    page,
    limit,
  });

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Debit Notes
          </h1>
          <Button
            className="rounded-lg px-6 py-2 text-base font-semibold border border-[var(--color-primary)] hover:opacity-90 transition shadow-sm"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
            onClick={() => router.push("/finance/debit-notes/create")}
          >
            + Create Debit Note
          </Button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {isLoading ? (
            <div className="text-center text-gray-500 py-16 text-lg">
              Loading debit notes...
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 py-16 text-lg">
              Error loading debit notes.
            </div>
          ) : debitNotes.length === 0 ? (
            <div className="text-center text-gray-500 py-16 text-lg">
              No debit notes found.
            </div>
          ) : (
            <div className="overflow-x-auto md:overflow-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Number
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Vendor
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {debitNotes.map((note, idx) => {
                    const formattedDate = new Date(
                      note.debitNoteDate
                    ).toLocaleDateString("en-IN");
                    const totalAmount =
                      note.grandTotal ||
                      note.items?.reduce(
                        (sum, item) => sum + (Number(item.amount) || 0),
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
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-2 font-medium">
                          {note.debitNoteNumber}
                        </td>
                        <td className="px-4 py-2">{formattedDate}</td>
                        <td className="px-4 py-2">
                          {note.vendorDetails?.name || "N/A"}
                        </td>
                        <td className="px-4 py-2">{formattedAmount}</td>
                        <td className="px-4 py-2">
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
                        <td className="px-4 py-2">
                          <button
                            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            onClick={() =>
                              router.push(
                                `/user/finance/debit-notes/edit/${note._id}`
                              )
                            }
                          >
                            <FiMoreHorizontal className="text-xl text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * limit, pagination.totalItems)}
                </span>{" "}
                of <span className="font-medium">{pagination.totalItems}</span>{" "}
                results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
