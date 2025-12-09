"use client";

import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { FiMoreVertical } from "react-icons/fi";
import { useSalesOrderStore } from "@/stores/financeStore/useSalesOrderStore";
import Link from "next/link";

// Helper to get client initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function SalesOrdersPage() {
  const allSalesOrders = useSalesOrderStore((state) => state.salesOrders);
  const isEmpty = allSalesOrders.length === 0;
  return (
    <div className="max-w-5xl mx-auto rounded-lg shadow p-4 sm:p-8 bg-[var(--color-card)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-[var(--color-card-foreground)]">
          Sales Orders
        </h1>
        <a
          href="/dashboard/sales-orders/create"
          className="px-4 py-2 rounded transition bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/80"
        >
          + New Sales Order
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
                Order Date
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
                  No sales orders found. <br />
                  <a
                    href="/dashboard/sales-orders/create"
                    className="text-[var(--color-primary)] underline"
                  >
                    Create your first sales order
                  </a>
                </td>
              </tr>
            ) : (
              allSalesOrders.map((order, idx) => (
                <tr
                  key={order.orderNumber || idx}
                  className="transition hover:bg-[var(--color-muted)]/40 focus-within:bg-[var(--color-muted)]/60"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-[var(--color-card-foreground)]">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-card-foreground)]">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-muted)] text-[var(--color-muted-foreground)] font-bold text-sm">
                        {getInitials(order.clientDetails?.name || "?")}
                      </span>
                      <span>{order.clientDetails?.name || "-"}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-card-foreground)]">
                    {order.orderDate
                      ? format(new Date(order.orderDate), "MMM d, yyyy")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--color-card-foreground)]">
                    ₹
                    {typeof order.items?.reduce === "function"
                      ? order.items
                          .reduce(
                            (sum, item) => sum + (Number(item.amount) || 0),
                            0
                          )
                          .toLocaleString("en-IN", { minimumFractionDigits: 2 })
                      : "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="p-2 rounded-full hover:bg-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          aria-label="Sales order actions"
                        >
                          <FiMoreVertical />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-2" align="end">
                        <div className="flex flex-col gap-1">
                          <a
                            href="#"
                            className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-primary)] text-sm"
                            aria-label="Preview Sales Order"
                          >
                            Preview
                          </a>
                          <Link
                            href={`/dashboard/sales-orders/edit/${order.orderNumber}`}
                            className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] text-sm"
                            aria-label="Edit Sales Order"
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
