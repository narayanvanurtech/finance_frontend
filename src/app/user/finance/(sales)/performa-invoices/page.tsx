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
import { useInvoiceStore } from "@/stores/financeStore/useInvoiceStore";
import Link from "next/link";

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
    case "accepted":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
          <FiCheckCircle className="inline" /> Accepted
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
          <FiXCircle className="inline" /> Rejected
        </span>
      );
    case "sent":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          <FiSend className="inline" /> Sent
        </span>
      );
    case "converted":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-800">
          Converted
        </span>
      );
    case "expired":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-800">
          Expired
        </span>
      );
    case "draft":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
          Draft
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

export default function InvoicesPage() {
  const allInvoices = useInvoiceStore((state) => state.invoices);
  const invoices = allInvoices.filter((inv) => inv.type === "performa");
  const isEmpty = invoices.length === 0;

  return (
    <div className="max-w-5xl mx-auto rounded-lg shadow p-4 sm:p-8 bg-[var(--color-card)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-[var(--color-card-foreground)]">
          Invoices
        </h1>
        <a
          href="/dashboard/performa-invoices/create"
          className="px-4 py-2 rounded transition bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/80"
        >
          + New Performa Invoice
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
                  No invoices found. <br />
                  <a
                    href="/dashboard/invoices/create"
                    className="text-[var(--color-primary)] underline"
                  >
                    Create your first invoice
                  </a>
                </td>
              </tr>
            ) : (
              invoices.map((inv, idx) => (
                <tr
                  key={inv.invoiceNumber || idx}
                  className="transition hover:bg-[var(--color-muted)]/40 focus-within:bg-[var(--color-muted)]/60"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-[var(--color-card-foreground)]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-card-foreground)]">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-muted)] text-[var(--color-muted-foreground)] font-bold text-sm">
                        {getInitials(inv.clientDetails?.name || "?")}
                      </span>
                      <span>{inv.clientDetails?.name || "-"}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-card-foreground)]">
                    {inv.date ? format(new Date(inv.date), "MMM d, yyyy") : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--color-card-foreground)]">
                    ₹
                    {typeof inv.items?.reduce === "function"
                      ? inv.items
                          .reduce(
                            (sum, item) => sum + (Number(item.amount) || 0),
                            0
                          )
                          .toLocaleString("en-IN", { minimumFractionDigits: 2 })
                      : "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(inv.status || "draft")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="p-2 rounded-full hover:bg-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          aria-label="Invoice actions"
                        >
                          <FiMoreVertical />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-2" align="end">
                        <div className="flex flex-col gap-1">
                          <a
                            href="#"
                            className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-primary)] text-sm"
                            aria-label="Preview Invoice"
                          >
                            Preview
                          </a>
                          {inv.status?.toLowerCase() === "accepted" && (
                            <Link
                              href={`/user/finance/invoices/create?fromPerformaInvoice=${inv._id}`}
                              className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-green-600 text-sm"
                              aria-label="Convert to Invoice"
                            >
                              Convert to Invoice
                            </Link>
                          )}
                          <Link
                            href={`/dashboard/performa-invoices/edit/${inv.invoiceNumber}`}
                            className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] text-sm"
                            aria-label="Edit Invoice"
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
