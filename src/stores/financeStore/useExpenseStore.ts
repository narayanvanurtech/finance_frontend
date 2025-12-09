import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExpenseFormValues } from "@/finance/expenses/ExpenseForm";

interface ExpenseStore {
  expenses: ExpenseFormValues[];
  createExpense: (expense: ExpenseFormValues) => void;
  updateExpense: (
    expenseNo: string,
    updated: Partial<ExpenseFormValues>
  ) => void;
  removeExpense: (expenseNo: string) => void;
  getExpenses: () => ExpenseFormValues[];
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],
      createExpense: (expense) => {
        set((state) => ({ expenses: [...state.expenses, expense] }));
      },
      updateExpense: (expenseNo, updated) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.expenseNo === expenseNo ? { ...e, ...updated } : e
          ),
        })),
      removeExpense: (expenseNo) =>
        set((state) => ({
          expenses: state.expenses.filter(
            (e) => e.expenseNo !== expenseNo
          ),
        })),
      getExpenses: () => get().expenses,
    }),
    {
      name: "expense-storage",
      partialize: (state) => ({ expenses: state.expenses }),
    }
  )
);
