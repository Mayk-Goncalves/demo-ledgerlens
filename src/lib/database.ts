/**
 * Database initialization for LedgerLens.
 *
 * Uses expo-sqlite's synchronous open (the DB file is created lazily)
 * and async DDL execution. The singleton pattern ensures we reuse
 * one connection and only run CREATE TABLE once per app session.
 *
 * Future tables (income, accounts) can be added here as additional
 * CREATE TABLE statements — no migration framework needed until
 * we ship schema changes to existing users.
 */

import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";

const DB_NAME = "ledgerlens.db";

const TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS transactions (
    id          TEXT PRIMARY KEY NOT NULL,
    type        TEXT NOT NULL DEFAULT 'expense',
    amount      INTEGER NOT NULL,
    currency    TEXT NOT NULL DEFAULT 'USD',
    category    TEXT NOT NULL,
    note        TEXT,
    receipt_uri TEXT,
    place_name  TEXT,
    latitude    REAL,
    longitude   REAL,
    created_at  INTEGER NOT NULL
  );
`;

let db: SQLiteDatabase | null = null;
let initialized = false;

/** Get the shared database instance. */
export function getDatabase(): SQLiteDatabase {
  if (!db) {
    db = openDatabaseSync(DB_NAME);
  }
  return db;
}

/**
 * Initialize the database schema.
 * Safe to call multiple times — only executes DDL once per session.
 */
export async function initDatabase(): Promise<void> {
  if (initialized) return;

  const database = getDatabase();
  await database.execAsync(TRANSACTIONS_TABLE);

  initialized = true;
}

/**
 * Drop and recreate all tables.
 * Useful during development when the schema changes.
 */
export async function resetDatabase(): Promise<void> {
  const database = getDatabase();
  await database.execAsync("DROP TABLE IF EXISTS transactions;");
  await database.execAsync("DROP TABLE IF EXISTS expenses;"); // legacy cleanup
  initialized = false;
  await initDatabase();
}
