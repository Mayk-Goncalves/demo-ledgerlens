import { insertTransaction } from "@/features/transactions/storage";
import type { TransactionCategory, TransactionType } from "@/types/transaction";

interface SeedEntry {
  readonly type: TransactionType;
  readonly category: TransactionCategory;
  /** Min amount in cents (inclusive). */
  readonly minCents: number;
  /** Max amount in cents (inclusive). */
  readonly maxCents: number;
  readonly note: string;
}

/** Random integer between min and max (inclusive). */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SEED_POOL: readonly SeedEntry[] = [
  // Income
  {
    type: "income",
    category: "salary",
    minCents: 450000,
    maxCents: 620000,
    note: "Monthly salary",
  },
  {
    type: "income",
    category: "freelance",
    minCents: 50000,
    maxCents: 150000,
    note: "Logo design project",
  },
  {
    type: "income",
    category: "freelance",
    minCents: 25000,
    maxCents: 80000,
    note: "Website audit",
  },

  // Expenses
  {
    type: "expense",
    category: "food",
    minCents: 4000,
    maxCents: 9500,
    note: "Grocery run",
  },
  {
    type: "expense",
    category: "food",
    minCents: 1500,
    maxCents: 4500,
    note: "Lunch with coworker",
  },
  {
    type: "expense",
    category: "food",
    minCents: 350,
    maxCents: 2200,
    note: "Morning coffee & pastry",
  },
  {
    type: "expense",
    category: "transport",
    minCents: 3000,
    maxCents: 7000,
    note: "Gas fill-up",
  },
  {
    type: "expense",
    category: "transport",
    minCents: 1500,
    maxCents: 4000,
    note: "Subway pass reload",
  },
  {
    type: "expense",
    category: "housing",
    minCents: 120000,
    maxCents: 180000,
    note: "Monthly rent",
  },
  {
    type: "expense",
    category: "utilities",
    minCents: 8000,
    maxCents: 15000,
    note: "Electric bill",
  },
  {
    type: "expense",
    category: "utilities",
    minCents: 4000,
    maxCents: 8000,
    note: "Internet service",
  },
  {
    type: "expense",
    category: "entertainment",
    minCents: 999,
    maxCents: 1999,
    note: "Streaming subscription",
  },
  {
    type: "expense",
    category: "entertainment",
    minCents: 1500,
    maxCents: 3500,
    note: "Movie tickets",
  },
  {
    type: "expense",
    category: "health",
    minCents: 1500,
    maxCents: 6000,
    note: "Pharmacy",
  },
  {
    type: "expense",
    category: "shopping",
    minCents: 3000,
    maxCents: 12000,
    note: "New running shoes",
  },
  {
    type: "expense",
    category: "education",
    minCents: 1500,
    maxCents: 5000,
    note: "Online course",
  },
  {
    type: "expense",
    category: "other",
    minCents: 800,
    maxCents: 3000,
    note: "Dry cleaning",
  },
];

/** Insert a batch of realistic sample transactions spread across the given month. */
export async function seedMonth(year: number, month: number): Promise<number> {
  const daysInMonth = new Date(year, month, 0).getDate();

  const promises = SEED_POOL.map((entry) => {
    const day = randInt(1, daysInMonth);
    const hour = randInt(7, 22);
    const minute = randInt(0, 59);
    const date = new Date(year, month - 1, day, hour, minute);

    return insertTransaction({
      type: entry.type,
      amount: randInt(entry.minCents, entry.maxCents),
      category: entry.category,
      note: entry.note,
      createdAt: date.getTime(),
    });
  });

  await Promise.all(promises);
  return SEED_POOL.length;
}
