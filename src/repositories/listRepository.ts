import { executeSql } from "../db/queries";
import { ListRecord } from "../utils/types";

const mapRow = (row: any): ListRecord => ({
  id: row.id,
  shopName: row.shopName,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  isArchived: row.isArchived === 1,
});

export const listRepository = {
  async getAll(isArchived: boolean): Promise<ListRecord[]> {
    const result = await executeSql(
      "SELECT * FROM lists WHERE isArchived = ? ORDER BY updatedAt DESC",
      [isArchived ? 1 : 0]
    );
    return result.rows._array.map(mapRow);
  },

  async getById(id: string): Promise<ListRecord | null> {
    const result = await executeSql("SELECT * FROM lists WHERE id = ?", [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return mapRow(result.rows._array[0]);
  },

  async create(list: ListRecord): Promise<void> {
    await executeSql(
      `INSERT INTO lists (id, shopName, createdAt, updatedAt, isArchived)
       VALUES (?, ?, ?, ?, ?)` ,
      [
        list.id,
        list.shopName,
        list.createdAt,
        list.updatedAt,
        list.isArchived ? 1 : 0,
      ]
    );
  },

  async update(list: ListRecord): Promise<void> {
    await executeSql(
      `UPDATE lists SET shopName = ?, updatedAt = ?, isArchived = ? WHERE id = ?`,
      [list.shopName, list.updatedAt, list.isArchived ? 1 : 0, list.id]
    );
  },
  async delete(id: string): Promise<void> {
    await executeSql("DELETE FROM lists WHERE id = ?", [id]);
  },
};
