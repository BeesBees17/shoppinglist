import * as SQLite from "expo-sqlite";
import { executeSql } from "./queries";
import { schema } from "./schema";

let db: SQLite.SQLiteDatabase | null = null;

export const getDb = () => {
  if (!db) {
    db = SQLite.openDatabase("shoppinglist.db");
  }
  return db;
};

const ensureColumn = async (
  table: string,
  column: string,
  definition: string,
  defaultValue?: number | string | null
) => {
  const result = await executeSql(`PRAGMA table_info(${table})`);
  const columns = result.rows._array.map((row) => row.name);
  if (columns.includes(column)) {
    return;
  }
  await executeSql(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  if (defaultValue !== undefined) {
    await executeSql(`UPDATE ${table} SET ${column} = ? WHERE ${column} IS NULL`, [
      defaultValue,
    ]);
  }
};

export const initializeDb = async () => {
  for (const statement of schema) {
    await executeSql(statement);
  }

  await ensureColumn("lists", "storeId", "TEXT", null);
  await ensureColumn("lists", "storeName", "TEXT", null);
  await ensureColumn("lists", "isActive", "INTEGER NOT NULL DEFAULT 1", 1);
  await executeSql("UPDATE lists SET isActive = 0 WHERE isArchived = 1");

  await ensureColumn("items", "isRecommended", "INTEGER NOT NULL DEFAULT 0", 0);
  await ensureColumn("items", "isSuggested", "INTEGER NOT NULL DEFAULT 0", 0);
};
