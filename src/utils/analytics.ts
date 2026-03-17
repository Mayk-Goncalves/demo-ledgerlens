import type { Transaction, TransactionCategory } from "@/types/transaction";

export interface CategorySpending {
  readonly category: TransactionCategory;
  readonly totalCents: number;
  /** 0–1 fraction of the category's share relative to the largest category. */
  readonly ratio: number;
  /** Percentage of total expenses (0–100). */
  readonly percentage: number;
}

/**
 * Compute expense spending grouped by category, sorted descending by amount.
 * Each entry includes a `ratio` relative to the highest-spending category
 * (the top category always has ratio = 1) and a `percentage` of total expenses.
 */
export function computeCategoryBreakdown(
  transactions: readonly Transaction[],
): readonly CategorySpending[] {
  const totals = new Map<TransactionCategory, number>();
  let totalExpenses = 0;

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
    totalExpenses += tx.amount;
  }

  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] ?? 1;

  return sorted.map(([category, totalCents]) => ({
    category,
    totalCents,
    ratio: totalCents / max,
    percentage: totalExpenses > 0 ? (totalCents / totalExpenses) * 100 : 0,
  }));
}

export interface DailySpending {
  readonly day: number;
  readonly totalCents: number;
}

export interface MonthInsights {
  readonly dailyAvgCents: number;
  readonly topSpendingDay: DailySpending | null;
  readonly transactionCount: number;
  readonly expenseCount: number;
}

/**
 * Compute monthly insights: daily average expense, top spending day,
 * and transaction counts.
 */
export function computeMonthInsights(
  transactions: readonly Transaction[],
  year: number,
  month: number,
): MonthInsights {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyTotals = new Map<number, number>();
  let totalExpenses = 0;
  let expenseCount = 0;

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    expenseCount++;
    totalExpenses += tx.amount;
    const day = new Date(tx.createdAt).getDate();
    dailyTotals.set(day, (dailyTotals.get(day) ?? 0) + tx.amount);
  }

  let topSpendingDay: DailySpending | null = null;
  for (const [day, totalCents] of dailyTotals) {
    if (!topSpendingDay || totalCents > topSpendingDay.totalCents) {
      topSpendingDay = { day, totalCents };
    }
  }

  return {
    dailyAvgCents: daysInMonth > 0 ? Math.round(totalExpenses / daysInMonth) : 0,
    topSpendingDay,
    transactionCount: transactions.length,
    expenseCount,
  };
}
