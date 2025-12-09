"use client";

import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiSend,
} from "react-icons/fi";
import { useQuotationStore } from "@/stores/financeStore/useQuotationStore";
import Link from "next/link";

// Helper to get status color classes
const getStatusClasses = (status: string) => {
  switch (status) {
    case "Accepted":
      return "bg-[var(--color-success-bg)] text-[var(--color-primary-background)]";
    case "Rejected":
      return "bg-[var(--color-destructive)] text-[var(--color-primary-foreground)]";
    case "Sent":
      return "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]";
    default:
      return "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]";
  }
};

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
  switch (status) {
    case "Accepted":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
          <FiCheckCircle className="inline" /> Accepted
        </span>
      );
    case "Rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
          <FiXCircle className="inline" /> Rejected
        </span>
      );
    case "Sent":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          <FiSend className="inline" /> Sent
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
          {status}
        </span>
      );
  }
};

export default function QuotationListPage() {
  const quotations = useQuotationStore((state) => state.quotations);
  const isEmpty = quotations?.length === 0;
  return (
    <div className="max-w-5xl mx-auto rounded-lg shadow p-4 sm:p-8 bg-[var(--color-card)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-[var(--color-card-foreground)]">
          Quotations
        </h1>
        <a
          href="/dashboard/quotations/create"
          className="px-4 py-2 rounded transition bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/80"
        >
          + New Quotation
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead className="bg-[var(--color-muted)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
            {isEmpty ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-[var(--color-muted-foreground)] text-lg"
                >
                  No quotations found. <br />
                  <a
                    href="/dashboard/quotation/create"
                    className="text-[var(--color-primary)] underline"
                  >
                    Create your first quotation
                  </a>
                </td>
              </tr>
            ) : (
              quotations.map((q, idx) => (
                <tr
                  key={q.quotationNumber || idx}
                  className="transition hover:bg-[var(--color-muted)]/40 focus-within:bg-[var(--color-muted)]/60"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-[var(--color-card-foreground)]">
                    {q.quotationNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-card-foreground)]">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-muted)] text-[var(--color-muted-foreground)] font-bold text-sm">
                        {getInitials(q.clientDetails?.name || "?")}
                      </span>
                      <span>{q.clientDetails?.name || "-"}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-card-foreground)]">
                    {q.date ? format(new Date(q.date), "MMM d, yyyy") : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--color-card-foreground)]">
                    {/* Calculate total amount if available, else show 0 */}₹
                    {typeof q.items?.reduce === "function"
                      ? q.items
                          .reduce(
                            (sum, item) => sum + (Number(item.amount) || 0),
                            0
                          )
                          .toLocaleString("en-IN", { minimumFractionDigits: 2 })
                      : "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Status is not in the form, so show Draft by default */}
                    {getStatusBadge("Draft")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="p-2 rounded-full hover:bg-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          aria-label="Quotation actions"
                        >
                          <FiMoreVertical />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-2" align="end">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/user/finance/quotations/preview/${q._id}`}
                            className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-primary)] text-sm"
                            aria-label="Preview Quotation"
                            target="_blank"
                          >
                            Preview
                          </Link>
                          <Link
                            href={`/user/finance/quotations/edit/${q.quotationNumber}`}
                            className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] text-sm"
                            aria-label="Edit Quotation"
                          >
                            Edit
                          </Link>
                          <a
                            href="#"
                            className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] text-sm"
                            aria-label="Download PDF"
                          >
                            Download PDF
                          </a>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
