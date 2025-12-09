"use client";
import React from "react";
import { usePaymentReceivedStore } from "@/stores/financeStore/usePaymentReceivedStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentReceivedListPage() {
  const payments = usePaymentReceivedStore((state) => state.payments);
  const deletePayment = usePaymentReceivedStore((state) => state.deletePayment);

  return (
    <div className="max-w-5xl mx-auto rounded-lg shadow p-4 sm:p-8 bg-[var(--color-card)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-[var(--color-card-foreground)]">
          Payment Received
        </h1>
        <Link href="/dashboard/payment-received/create">
          <Button>+ New Payment Received</Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead className="bg-[var(--color-muted)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Payment #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Customer
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
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-[var(--color-muted-foreground)] text-lg"
                >
                  No payment receipts found. <br />
                  <Link
                    href="/dashboard/payment-received/create"
                    className="text-[var(--color-primary)] underline"
                  >
                    Create your first payment receipt
                  </Link>
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr
                  key={payment._id}
                  className="transition hover:bg-[var(--color-muted)]/40 focus-within:bg-[var(--color-muted)]/60"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-[var(--color-card-foreground)]">
                    {payment.paymentNo || payment._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-card-foreground)]">
                    {typeof payment.clientId === "string"
                      ? payment.clientId
                      : payment.clientId?.businessName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-card-foreground)]">
                    {payment.receiptDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--color-card-foreground)]">
                    {payment.totalAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/user/finance/payment-received/edit/${payment._id}`}
                      className="px-3 py-2 rounded hover:bg-[var(--color-muted)] text-[var(--color-primary)] text-sm mr-2"
                    >
                      Edit
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePayment(payment._id)}
                    >
                      Delete
                    </Button>
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
