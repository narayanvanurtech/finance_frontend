import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentsMadeFormValues } from "@/finance/paymentsMade/PaymentsMadeForm";

export type PaymentMade = PaymentsMadeFormValues & { id: string };

interface PaymentsMadeStore {
  payments: PaymentMade[];
  createPayment: (payment: PaymentMade) => void;
  updatePayment: (id: string, updated: Partial<PaymentMade>) => void;
  removePayment: (id: string) => void;
  getPayment: (id: string) => PaymentMade | undefined;
  getPayments: () => PaymentMade[];
}

export const usePaymentsMadeStore = create<PaymentsMadeStore>()(
  persist(
    (set, get) => ({
      payments: [],
      createPayment: (payment) => {
        set((state) => ({ payments: [...state.payments, payment] }));
      },
      updatePayment: (id, updated) =>
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === id ? { ...p, ...updated } : p
          ),
        })),
      removePayment: (id) =>
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== id),
        })),
      getPayment: (id) => get().payments.find((p) => p.id === id),
      getPayments: () => get().payments,
    }),
    {
      name: "payments-made-storage",
      partialize: (state) => ({ payments: state.payments }),
    }
  )
);
