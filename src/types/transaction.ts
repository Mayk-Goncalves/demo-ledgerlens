/**
 * Core transaction types for LedgerLens.
 *
 * Design notes:
 * - A "transaction" covers incomes, expenses, and credit card charges.
 * - Amount is always stored as positive integer cents. The `type` field
 *   determines the sign when computing balances.
 * - Currency uses ISO 4217 codes (e.g. 'USD', 'EUR') for i18n readiness.
 * - Location is grouped into its own type so it can later be extended
 *   with place name, address, or Google Maps place ID.
 * - UUID strings are used for IDs to avoid auto-increment coupling.
 */

/** The kind of transaction. Determines how it affects the monthly balance. */
export const TRANSACTION_TYPES = ["income", "expense", "credit_card"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

/** Transaction categories available in V1. */
export const TRANSACTION_CATEGORIES = [
  "food",
  "transport",
  "housing",
  "utilities",
  "entertainment",
  "health",
  "shopping",
  "education",
  "salary",
  "freelance",
  "other",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

/** Default currency for new transactions. */
export const DEFAULT_CURRENCY = "USD";

/**
 * Location data attached to a transaction.
 * Extensible — could later include placeName, address, or placeId.
 */
export interface TransactionLocation {
  readonly latitude: number;
  readonly longitude: number;
}

/** A persisted transaction record. */
export interface Transaction {
  readonly id: string;
  readonly type: TransactionType;
  readonly amount: number; // positive integer cents (e.g. 1250 = $12.50)
  readonly currency: string; // ISO 4217 (e.g. 'USD')
  readonly category: TransactionCategory;
  readonly note?: string;
  readonly receiptUri?: string;
  readonly location?: TransactionLocation;
  readonly createdAt: number; // Unix timestamp in ms
}

/** Input for creating a new transaction. id and createdAt are generated automatically. */
export interface CreateTransactionInput {
  readonly type: TransactionType;
  readonly amount: number; // positive integer cents
  readonly currency?: string; // defaults to DEFAULT_CURRENCY
  readonly category: TransactionCategory;
  readonly note?: string;
  readonly receiptUri?: string;
  readonly location?: TransactionLocation;
}

/** Raw row shape returned from SQLite. Snake_case matches DB columns. */
export interface TransactionRow {
  readonly id: string;
  readonly type: string;
  readonly amount: number; // positive integer cents
  readonly currency: string;
  readonly category: string;
  readonly note: string | null;
  readonly receipt_uri: string | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly created_at: number; // Unix timestamp in ms
}
