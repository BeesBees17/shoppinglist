import * as SQLite from "expo-sqlite";
import { schema } from "./schema";

let db: SQLite.SQLiteDatabase | null = null;

export const getDb = () => {
  if (!db) {
    db = SQLite.openDatabase("shoppinglist.db");
  }
  return db;
};

export const initializeDb = () => {
  const database = getDb();
  database.transaction((tx) => {
    schema.forEach((statement) => {
      tx.executeSql(statement);
    });
  });
};
