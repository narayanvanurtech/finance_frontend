"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { FiMoreHorizontal } from "react-icons/fi";
import { useRouter } from "next/navigation";

type CreditNote = {
  id: number;
  number: string;
  date: string;
  customer: string;
  amount: number;
  status: string;
};
// Mock data for credit notes
const creditNotes: CreditNote[] = [
  // { id: 1, number: 'CN-001', date: '2024-06-01', customer: 'Acme Corp', amount: 1200, status: 'Open' },
];

export default function CreditNotesPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Credit Notes</h1>
          <Button
            className="rounded-lg px-6 py-2 text-base font-semibold border border-[var(--color-primary)] hover:opacity-90 transition shadow-sm"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            onClick={() => router.push("/dashboard/credit-notes/create")}
          >
            + Create Credit Note
          </Button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {creditNotes.length === 0 ? (
            <div className="text-center text-gray-500 py-16 text-lg">No credit notes found.</div>
          ) : (
            <div className="overflow-x-auto md:overflow-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Number</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {creditNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 font-medium">{note.number}</td>
                      <td className="px-4 py-2">{note.date}</td>
                      <td className="px-4 py-2">{note.customer}</td>
                      <td className="px-4 py-2">₹{note.amount}</td>
                      <td className="px-4 py-2">{note.status}</td>
                      <td className="px-4 py-2">
                        <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <FiMoreHorizontal className="text-xl text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 