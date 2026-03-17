import { insertTransaction } from "@/features/transactions/storage";
import type { TransactionCategory, TransactionType } from "@/types/transaction";

interface SeedEntry {
  readonly type: TransactionType;
  readonly category: TransactionCategory;
  readonly minCents: number;
  readonly maxCents: number;
  /** Pool of possible notes — one is picked at random per occurrence. */
  readonly notes: readonly string[];
  /** Min occurrences per month at scale=1. */
  readonly minPerMonth: number;
  /** Max occurrences per month at scale=1. */
  readonly maxPerMonth: number;
}

/** Random integer between min and max (inclusive). */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from an array. */
function pickRandom<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

const SEED_POOL: readonly SeedEntry[] = [
  // Income
  {
    type: "income",
    category: "salary",
    minCents: 450000,
    maxCents: 620000,
    notes: ["Monthly salary", "Paycheck deposit", "Salary transfer"],
    minPerMonth: 1,
    maxPerMonth: 1,
  },
  {
    type: "income",
    category: "freelance",
    minCents: 25000,
    maxCents: 150000,
    notes: [
      "Logo design project",
      "Website audit",
      "App consultation",
      "UI review",
      "Brand identity work",
    ],
    minPerMonth: 0,
    maxPerMonth: 2,
  },
  {
    type: "income",
    category: "other",
    minCents: 5000,
    maxCents: 30000,
    notes: ["Sold old monitor", "Cashback reward", "Refund from return"],
    minPerMonth: 0,
    maxPerMonth: 1,
  },

  // Expenses
  {
    type: "expense",
    category: "food",
    minCents: 4000,
    maxCents: 9500,
    notes: [
      "Grocery run",
      "Whole Foods haul",
      "Weekly groceries",
      "Costco trip",
      "Trader Joe's",
    ],
    minPerMonth: 3,
    maxPerMonth: 6,
  },
  {
    type: "expense",
    category: "food",
    minCents: 800,
    maxCents: 4500,
    notes: [
      "Lunch with coworker",
      "Morning coffee & pastry",
      "Dinner takeout",
      "Sushi delivery",
      "Coffee shop",
      "Chipotle",
      "Pizza night",
      "Bakery",
    ],
    minPerMonth: 4,
    maxPerMonth: 12,
  },
  {
    type: "expense",
    category: "transport",
    minCents: 3000,
    maxCents: 7000,
    notes: ["Gas fill-up", "Gas station", "Fuel top-off"],
    minPerMonth: 1,
    maxPerMonth: 4,
  },
  {
    type: "expense",
    category: "transport",
    minCents: 800,
    maxCents: 4000,
    notes: [
      "Subway pass reload",
      "Uber ride",
      "Lyft to airport",
      "Bus fare",
      "Parking meter",
    ],
    minPerMonth: 1,
    maxPerMonth: 5,
  },
  {
    type: "expense",
    category: "housing",
    minCents: 120000,
    maxCents: 180000,
    notes: ["Monthly rent"],
    minPerMonth: 1,
    maxPerMonth: 1,
  },
  {
    type: "expense",
    category: "utilities",
    minCents: 4000,
    maxCents: 15000,
    notes: [
      "Electric bill",
      "Internet service",
      "Water bill",
      "Gas bill",
      "Phone plan",
    ],
    minPerMonth: 2,
    maxPerMonth: 4,
  },
  {
    type: "expense",
    category: "entertainment",
    minCents: 999,
    maxCents: 3500,
    notes: [
      "Streaming subscription",
      "Movie tickets",
      "Concert tickets",
      "Game purchase",
      "Spotify",
      "Netflix",
    ],
    minPerMonth: 1,
    maxPerMonth: 4,
  },
  {
    type: "expense",
    category: "health",
    minCents: 1500,
    maxCents: 8000,
    notes: [
      "Pharmacy",
      "Gym membership",
      "Doctor copay",
      "Vitamins",
      "Dentist visit",
    ],
    minPerMonth: 1,
    maxPerMonth: 3,
  },
  {
    type: "expense",
    category: "shopping",
    minCents: 1500,
    maxCents: 15000,
    notes: [
      "New running shoes",
      "Amazon order",
      "Clothes shopping",
      "Kitchen gadget",
      "Book purchase",
      "Home decor",
    ],
    minPerMonth: 1,
    maxPerMonth: 4,
  },
  {
    type: "expense",
    category: "education",
    minCents: 1500,
    maxCents: 5000,
    notes: [
      "Online course",
      "Udemy class",
      "Technical book",
      "Workshop fee",
    ],
    minPerMonth: 0,
    maxPerMonth: 2,
  },
  {
    type: "expense",
    category: "other",
    minCents: 500,
    maxCents: 5000,
    notes: [
      "Dry cleaning",
      "Haircut",
      "Pet supplies",
      "Gift for friend",
      "Charity donation",
      "ATM withdrawal",
    ],
    minPerMonth: 1,
    maxPerMonth: 3,
  },
];

/**
 * Insert a batch of realistic sample transactions spread across the given month.
 *
 * @param year  Full year (e.g. 2026)
 * @param month 1-indexed month
 * @param scale Multiplier for occurrence counts. 1 = normal (~30-50 txns),
 *              5 = moderate load (~150-250), 10+ = stress test (~300-500+)
 * @returns Number of transactions inserted
 */
export async function seedMonth(
  year: number,
  month: number,
  scale = 1,
): Promise<number> {
  const daysInMonth = new Date(year, month, 0).getDate();
  const promises: Promise<unknown>[] = [];

  for (const entry of SEED_POOL) {
    const occurrences = randInt(
      Math.max(1, Math.round(entry.minPerMonth * scale)),
      Math.max(1, Math.round(entry.maxPerMonth * scale)),
    );

    for (let i = 0; i < occurrences; i++) {
      const day = randInt(1, daysInMonth);
      const hour = randInt(7, 22);
      const minute = randInt(0, 59);
      const date = new Date(year, month - 1, day, hour, minute);

      promises.push(
        insertTransaction({
          type: entry.type,
          amount: randInt(entry.minCents, entry.maxCents),
          category: entry.category,
          note: pickRandom(entry.notes),
          createdAt: date.getTime(),
        }),
      );
    }
  }

  await Promise.all(promises);
  return promises.length;
}
