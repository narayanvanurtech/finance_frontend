"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePaymentsMadeStore } from "@/stores/financeStore/usePaymentsMadeStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, FileText } from "lucide-react";

export default function PaymentsMadeListPage() {
  const payments = usePaymentsMadeStore((state) => state.payments);
  const removePayment = usePaymentsMadeStore((state) => state.removePayment);
  const vendors = useVendorStore((state) => state.vendors);
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    payment: any | null;
    loading: boolean;
  }>({
    open: false,
    payment: null,
    loading: false,
  });

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find((v) => String(v._id) === String(vendorId));
    return vendor ? vendor.name : vendorId || "-";
  };

  const handleDeleteClick = (payment: any) => {
    setDeleteDialog({
      open: true,
      payment,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.payment) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    removePayment(deleteDialog.payment.id);
    setDeleteDialog({ open: false, payment: null, loading: false });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, payment: null, loading: false });
  };

  return (
    <div className="max-w-5xl mx-auto rounded-lg shadow p-4 sm:p-8 bg-[var(--color-card)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-[var(--color-card-foreground)]">
          Payments Made
        </h1>
        <Link href="/dashboard/payments-made/create">
          <Button>+ New Payment Made</Button>
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
                Vendor
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
                  No payments made found. <br />
                  <Link
                    href="/dashboard/payments-made/create"
                    className="text-[var(--color-primary)] underline"
                  >
                    Create your first payment made
                  </Link>
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="transition hover:bg-[var(--color-muted)]/40 focus-within:bg-[var(--color-muted)]/60"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-[var(--color-card-foreground)]">
                    {payment.paymentNo || payment.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-card-foreground)]">
                    {getVendorName(payment.vendorId || "")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-card-foreground)]">
                    {payment.paymentDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--color-card-foreground)]">
                    {payment.amountPaid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                          aria-label="Payment actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/user/finance/payments-made/view/${payment.id}`
                            )
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/user/finance/payments-made/edit/${payment.id}`
                            )
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteClick(payment)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete payment{" "}
              <span className="font-semibold">
                {deleteDialog.payment?.paymentNo || deleteDialog.payment?.id}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleteDialog.loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteDialog.loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleteDialog.loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Payment
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
