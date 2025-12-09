"use client";

import React, { useState } from "react";
import { useExpenseStore } from "@/stores/financeStore/useExpenseStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FiMoreHorizontal } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function ExpensesListPage() {
  const expenses = useExpenseStore((state) => state.expenses);
  const removeExpense = useExpenseStore((state) => state.removeExpense);
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = (expenseNo: string) => {
    removeExpense(expenseNo);
    setShowConfirm(false);
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Expenses</h1>
          <Button
            className="rounded-lg px-6 py-2 text-base font-semibold border border-[var(--color-primary)] hover:opacity-90 transition shadow-sm"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            onClick={() => router.push("/finance/expenses/create")}
          >
            + Add Expense
          </Button>
        </div>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {expenses.length === 0 ? (
            <div className="text-center text-gray-500 py-16 text-lg">
              No expenses found. Click "Add Expense" to add your first expense.
            </div>
          ) : (
            <div className="overflow-x-auto md:overflow-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Expense No</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Invoice No</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Vendor</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Purchase Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Due Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {expenses.map((exp) => {
                    const total = (exp.items || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0) + (Number(exp.shipping) || 0);
                    return (
                      <tr key={exp.expenseNo} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2 font-medium">{exp.expenseNo}</td>
                        <td className="px-4 py-2">{exp.invoiceNo}</td>
                        <td className="px-4 py-2">{exp.vendorDetails?.name || "-"}</td>
                        <td className="px-4 py-2">{exp.purchaseDate}</td>
                        <td className="px-4 py-2">{exp.dueDate || "-"}</td>
                        <td className="px-4 py-2">₹{total.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <FiMoreHorizontal className="text-xl text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/finance/expenses/edit/${exp.expenseNo}`)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => { setShowConfirm(true); setDeleteId(exp.expenseNo); }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Confirm Delete Dialog */}
              {showConfirm && deleteId !== null && (
                <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Expense?</DialogTitle>
                    </DialogHeader>
                    <div className="mb-6 text-gray-600">Are you sure you want to delete this expense? This action cannot be undone.</div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => { setShowConfirm(false); setDeleteId(null); }}>Cancel</Button>
                      <Button variant="destructive" onClick={() => handleDelete(deleteId!)}>Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
