"use client";

import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { FiMoreVertical } from "react-icons/fi";
import { useInvoiceStore } from "@/stores/financeStore/useInvoiceStore";
import Link from "next/link";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function InvoicesPage() {
  const allInvoices = useInvoiceStore((state) => state.invoices);
  const invoices = allInvoices.filter((inv) => inv.type === "invoice");
  const isEmpty = invoices.length === 0;

  return (
    <div className="max-w-5xl mx-auto rounded-lg shadow p-4 sm:p-8 bg-[var(--color-card)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-[var(--color-card-foreground)]">
          Invoices
        </h1>
        {/* ✅ Use Link instead of <a> for internal navigation */}
        <Link
          href="/finance/invoices/create"
          className="px-4 py-2 rounded transition bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/80"
        >
          + New Invoice
        </Link>
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
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
            {isEmpty ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-[var(--color-muted-foreground)] text-lg"
                >
                  No invoices found. <br />
                  {/* ✅ Link instead of <a> */}
                  <Link
                    href="/finance/invoices/create"
                    className="text-[var(--color-primary)] underline"
                  >
                    Create your first invoice
                  </Link>
                </td>
              </tr>
            ) : (
              invoices.map((inv, idx) => (
                <tr
                  key={(inv as any)._id || inv.invoiceNumber || idx}
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
                    {inv.date
                      ? format(new Date(inv.date), "MMM d, yyyy")
                      : "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--color-card-foreground)]">
                    ₹
                    {typeof inv.items?.reduce === "function"
                      ? inv.items
                          .reduce(
                            (sum, item) => sum + (Number(item.amount) || 0),
                            0
                          )
                          .toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })
                      : "0.00"}
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
                          {/* ✅ Consistent base path + fixed typo */}
                          <Link
                            href={`/finance/invoices/preview/${(inv as any)._id}`}
                            className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-primary)] text-sm"
                          >
                            Preview
                          </Link>
                          <Link
                            href={`/finance/invoices/edit/${(inv as any)._id}`}
                            className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] text-sm"
                          >
                            Edit
                          </Link>
                          {/* TODO: wire up real PDF download */}
                          <button
                            className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] text-sm text-left"
                            onClick={() => {
                              // handle PDF download here
                            }}
                          >
                            Download PDF
                          </button>
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