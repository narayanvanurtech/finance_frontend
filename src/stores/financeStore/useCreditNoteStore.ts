import { create } from "zustand";
import { creditNoteApi } from "@/api/finance/creditNoteApi";

interface CreditNoteStore {
  creditNotes: any[];
  fetchAll: (companyId: string) => Promise<void>;
  createNote: (payload: any, companyId: string) => Promise<void>;
  updateNote: (id: string, payload: any, companyId: string) => Promise<void>;
  deleteNote: (id: string, companyId: string) => Promise<void>;
}

export const useCreditNoteStore = create<CreditNoteStore>((set, get) => ({
  creditNotes: [],

  fetchAll: async (companyId) => {
    const data = await creditNoteApi.getAll(companyId);
    set({ creditNotes: data?.data ?? data });
  },

  createNote: async (payload, companyId) => {
    const res = await creditNoteApi.create(payload, companyId);
    set({ creditNotes: [...get().creditNotes, res.data || res] });
  },

  updateNote: async (id, payload, companyId) => {
    const updated = await creditNoteApi.update(id, payload, companyId);
    set({
      creditNotes: get().creditNotes.map((n) =>
        n._id === id ? updated.data || updated : n
      ),
    });
  },

  deleteNote: async (id, companyId) => {
    await creditNoteApi.delete(id, companyId);
    set({ creditNotes: get().creditNotes.filter((n) => n._id !== id) });
  },
}));
