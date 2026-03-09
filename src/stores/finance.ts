/**
 * Monthly finance store — Zustand.
 *
 * Owns the selected month, transactions for that month, and derived
 * summaries (income, expenses, credit card, balance). All amounts in cents.
 *
 * Components call `loadMonth()` to fetch data from SQLite. The store
 * keeps the month scope so every consumer sees the same period.
 */

import { create } from "zustand";

import { getTransactionsByMonth } from "@/features/transactions/storage";
import type { Transaction } from "@/types/transaction";

interface MonthlySummary {
  readonly income: number; // total income cents
  readonly expenses: number; // total expense cents
  readonly balance: number; // income - expenses
}

interface FinanceState {
  /** Currently selected year. */
  readonly year: number;
  /** Currently selected month (1-indexed). */
  readonly month: number;
  /** Transactions for the selected month. */
  readonly transactions: readonly Transaction[];
  /** Derived monthly totals. */
  readonly summary: MonthlySummary;
  /** Whether data is currently loading. */
  readonly loading: boolean;

  /** Switch to a different month and reload. */
  setMonth: (year: number, month: number) => Promise<void>;
  /** Reload transactions for the current month. */
  reload: () => Promise<void>;
}

function computeSummary(transactions: readonly Transaction[]): MonthlySummary {
  let income = 0;
  let expenses = 0;

  for (const tx of transactions) {
    switch (tx.type) {
      case "income":
        income += tx.amount;
        break;
      case "expense":
        expenses += tx.amount;
        break;
    }
  }

  return {
    income,
    expenses,
    balance: income - expenses,
  };
}

const now = new Date();

export const useFinanceStore = create<FinanceState>((set, get) => ({
  year: now.getFullYear(),
  month: now.getMonth() + 1, // 1-indexed
  transactions: [],
  summary: { income: 0, expenses: 0, balance: 0 },
  loading: false,

  async setMonth(year, month) {
    set({ year, month, loading: true });
    const transactions = await getTransactionsByMonth(year, month);
    set({
      transactions,
      summary: computeSummary(transactions),
      loading: false,
    });
  },

  async reload() {
    const { year, month } = get();
    set({ loading: true });
    const transactions = await getTransactionsByMonth(year, month);
    set({
      transactions,
      summary: computeSummary(transactions),
      loading: false,
    });
  },
}));
