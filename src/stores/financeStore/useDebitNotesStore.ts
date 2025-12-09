import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DebitNoteFormValues } from "@/finance/debitNotes/DebitNotesForm";

interface DebitNotesStore {
  debitNotes: DebitNoteFormValues[];
  createDebitNote: (debitNote: DebitNoteFormValues) => void;
  updateDebitNote: (
    debitNoteNo: string,
    updated: Partial<DebitNoteFormValues>
  ) => void;
  removeDebitNote: (debitNoteNo: string) => void;
  getDebitNotes: () => DebitNoteFormValues[];
}

export const useDebitNotesStore = create<DebitNotesStore>()(
  persist(
    (set, get) => ({
      debitNotes: [],
      createDebitNote: (debitNote) => {
        set((state) => ({ debitNotes: [...state.debitNotes, debitNote] }));
      },
      updateDebitNote: (debitNoteNo, updated) =>
        set((state) => ({
          debitNotes: state.debitNotes.map((note) =>
            note.debitNoteNo === debitNoteNo ? { ...note, ...updated } : note
          ),
        })),
      removeDebitNote: (debitNoteNo) =>
        set((state) => ({
          debitNotes: state.debitNotes.filter(
            (note) => note.debitNoteNo !== debitNoteNo
          ),
        })),
      getDebitNotes: () => get().debitNotes,
    }),
    {
      name: "debit-notes-storage",
      partialize: (state) => ({ debitNotes: state.debitNotes }),
    }
  )
);
