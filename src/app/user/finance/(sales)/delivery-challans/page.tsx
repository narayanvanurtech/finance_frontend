"use client";

import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { FiMoreVertical, FiCheckCircle, FiXCircle, FiSend } from "react-icons/fi";
import { useDeliveryChallanStore } from '@/stores/financeStore/useDeliveryChallanStore';
import Link from 'next/link';

// Helper to get status color classes
const getStatusClasses = (status: string) => {
  switch (status) {
    case "Delivered":
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
    case "Delivered":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
          <FiCheckCircle className="inline" /> Delivered
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

export default function DeliveryChallanListPage() {
  const challans = useDeliveryChallanStore(state => state.challans);
  const isEmpty = challans.length === 0;
  return (
    <div className="max-w-5xl mx-auto rounded-lg shadow p-4 sm:p-8 bg-[var(--color-card)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-[var(--color-card-foreground)]">Delivery Challans</h1>
        <a
          href="/dashboard/delivery-challans/create"
          className="px-4 py-2 rounded transition bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/80"
        >
          + New Delivery Challan
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead className="bg-[var(--color-muted)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
            {isEmpty ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[var(--color-muted-foreground)] text-lg">
                  No delivery challans found. <br />
                  <a href="/dashboard/delivery-challans/create" className="text-[var(--color-primary)] underline">Create your first delivery challan</a>
                </td>
              </tr>
            ) : (
              challans.map((c, idx) => (
                <tr
                  key={c.quotationNumber || idx}
                  className="transition hover:bg-[var(--color-muted)]/40 focus-within:bg-[var(--color-muted)]/60"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-[var(--color-card-foreground)]">{c.quotationNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-card-foreground)]">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-muted)] text-[var(--color-muted-foreground)] font-bold text-sm">
                        {getInitials(c.clientDetails?.name || "?")}
                      </span>
                      <span>{c.clientDetails?.name || "-"}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-card-foreground)]">
                    {c.date ? format(new Date(c.date), "MMM d, yyyy") : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--color-card-foreground)]">
                    {typeof c.items?.length === 'number' ? c.items.length : 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge("Draft")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="p-2 rounded-full hover:bg-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          aria-label="Delivery Challan actions"
                        >
                          <FiMoreVertical />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-2" align="end">
                        <div className="flex flex-col gap-1">
                          <a href="#" className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-primary)] text-sm" aria-label="Preview Delivery Challan">Preview</a>
                          <Link href={`/dashboard/delivery-challans/edit/${c.quotationNumber}`} className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] text-sm" aria-label="Edit Delivery Challan">Edit</Link>
                          <a href="#" className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] text-sm" aria-label="Download PDF">Download PDF</a>
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
