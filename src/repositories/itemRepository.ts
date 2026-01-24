import { executeSql } from "../db/queries";
import { ItemRecord } from "../utils/types";

const mapRow = (row: any): ItemRecord => ({
  id: row.id,
  listId: row.listId,
  name: row.name,
  quantity: row.quantity ?? null,
  note: row.note ?? null,
  isChecked: row.isChecked === 1,
  position: row.position,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  checkedAt: row.checkedAt ?? null,
});

export const itemRepository = {
  async getByListId(listId: string): Promise<ItemRecord[]> {
    const result = await executeSql(
      "SELECT * FROM items WHERE listId = ? ORDER BY position ASC",
      [listId]
    );
    return result.rows._array.map(mapRow);
  },
  async getCounts(listId: string): Promise<{ total: number; checked: number }> {
    const result = await executeSql(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN isChecked = 1 THEN 1 ELSE 0 END) as checked
      FROM items WHERE listId = ?`,
      [listId]
    );
    const row = result.rows._array[0];
    return { total: row.total ?? 0, checked: row.checked ?? 0 };
  },

  async create(item: ItemRecord): Promise<void> {
    await executeSql(
      `INSERT INTO items (id, listId, name, quantity, note, isChecked, position, createdAt, updatedAt, checkedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.listId,
        item.name,
        item.quantity,
        item.note,
        item.isChecked ? 1 : 0,
        item.position,
        item.createdAt,
        item.updatedAt,
        item.checkedAt,
      ]
    );
  },

  async update(item: ItemRecord): Promise<void> {
    await executeSql(
      `UPDATE items
       SET name = ?, quantity = ?, note = ?, isChecked = ?, position = ?, updatedAt = ?, checkedAt = ?
       WHERE id = ?`,
      [
        item.name,
        item.quantity,
        item.note,
        item.isChecked ? 1 : 0,
        item.position,
        item.updatedAt,
        item.checkedAt,
        item.id,
      ]
    );
  },

  async delete(id: string): Promise<void> {
    await executeSql("DELETE FROM items WHERE id = ?", [id]);
  },
  async deleteByListId(listId: string): Promise<void> {
    await executeSql("DELETE FROM items WHERE listId = ?", [listId]);
  },
};
