/**
 * Storage layer for transactions.
 *
 * Maps between the app's camelCase domain types and the DB's
 * snake_case columns. All SQL is inline and readable — no query
 * builders or generic abstractions.
 *
 * Amount is always positive integer cents — the `type` field
 * determines sign when computing balances.
 */

import { getDatabase } from "@/lib/database";
import {
  DEFAULT_CURRENCY,
  type CreateTransactionInput,
  type Transaction,
  type TransactionRow,
} from "@/types/transaction";

const TABLE = "transactions";

/** Generate a simple unique ID. Sufficient for local-only storage. */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

/** Map a raw DB row to a Transaction domain object. */
function mapRowToTransaction(row: TransactionRow): Transaction {
  const location =
    row.latitude != null && row.longitude != null
      ? { latitude: row.latitude, longitude: row.longitude }
      : undefined;

  return {
    id: row.id,
    type: row.type as Transaction["type"],
    amount: row.amount,
    currency: row.currency,
    category: row.category as Transaction["category"],
    note: row.note ?? undefined,
    receiptUri: row.receipt_uri ?? undefined,
    location,
    createdAt: row.created_at,
  };
}

/** Insert a new transaction into the database. */
export async function insertTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const db = getDatabase();
  const id = generateId();
  const createdAt = Date.now();
  const currency = input.currency ?? DEFAULT_CURRENCY;

  await db.runAsync(
    `INSERT INTO ${TABLE} (id, type, amount, currency, category, note, receipt_uri, latitude, longitude, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.type,
    input.amount,
    currency,
    input.category,
    input.note ?? null,
    input.receiptUri ?? null,
    input.location?.latitude ?? null,
    input.location?.longitude ?? null,
    createdAt,
  );

  return {
    id,
    type: input.type,
    amount: input.amount,
    currency,
    category: input.category,
    note: input.note,
    receiptUri: input.receiptUri,
    location: input.location,
    createdAt,
  };
}

/** Fetch all transactions, most recent first. */
export async function getAllTransactions(): Promise<Transaction[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<TransactionRow>(
    `SELECT * FROM ${TABLE} ORDER BY created_at DESC`,
  );
  return rows.map(mapRowToTransaction);
}

/**
 * Fetch transactions for a specific month.
 * @param year  Full year (e.g. 2026)
 * @param month 1-indexed month (1 = January)
 */
export async function getTransactionsByMonth(
  year: number,
  month: number,
): Promise<Transaction[]> {
  const db = getDatabase();
  const start = new Date(year, month - 1, 1).getTime();
  const end = new Date(year, month, 1).getTime();

  const rows = await db.getAllAsync<TransactionRow>(
    `SELECT * FROM ${TABLE}
     WHERE created_at >= ? AND created_at < ?
     ORDER BY created_at DESC`,
    start,
    end,
  );
  return rows.map(mapRowToTransaction);
}

/** Delete a transaction by ID. */
export async function deleteTransaction(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync(`DELETE FROM ${TABLE} WHERE id = ?`, id);
}
