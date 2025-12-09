"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { FiMoreHorizontal } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useDebitNotesStore } from "@/stores/financeStore/useDebitNotesStore";

export default function DebitNotesPage() {
  const router = useRouter();
  const debitNotes = useDebitNotesStore((state) => state.getDebitNotes());
  return (
    <div className="min-h-screen w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Debit Notes</h1>
          <Button
            className="rounded-lg px-6 py-2 text-base font-semibold border border-[var(--color-primary)] hover:opacity-90 transition shadow-sm"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            onClick={() => router.push("/dashboard/debit-notes/create")}
          >
            + Create Debit Note
          </Button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {debitNotes.length === 0 ? (
            <div className="text-center text-gray-500 py-16 text-lg">No debit notes found.</div>
          ) : (
            <div className="overflow-x-auto md:overflow-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Number</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Vendor</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {debitNotes.map((note, idx) => (
                    <tr key={note.debitNoteNo || idx} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 font-medium">{note.debitNoteNo}</td>
                      <td className="px-4 py-2">{note.debitNoteDate}</td>
                      <td className="px-4 py-2">{note.vendorDetails?.name || note.vendorId}</td>
                      <td className="px-4 py-2">₹{note.items?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)}</td>
                      <td className="px-4 py-2">Open</td>
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
