import { SQLResultSet } from "expo-sqlite";
import { getDb } from "./index";

export const executeSql = (
  sql: string,
  params: (string | number | null)[] = []
): Promise<SQLResultSet> => {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};
