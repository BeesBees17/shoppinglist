import { executeSql } from "../db/queries";
import { ShoppingItem } from "../utils/types";

const mapRow = (row: any): ShoppingItem => ({
  id: row.id,
  listId: row.listId,
  text: row.name,
  quantity: row.quantity ?? null,
  note: row.note ?? null,
  isRecommended: row.isRecommended === 1,
  isSuggested: row.isSuggested === 1,
  isChecked: row.isChecked === 1,
  position: row.position,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  checkedAt: row.checkedAt ?? null,
});

export const itemRepository = {
  async getByListId(listId: string): Promise<ShoppingItem[]> {
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

  async create(item: ShoppingItem): Promise<void> {
    await executeSql(
      `INSERT INTO items (id, listId, name, quantity, note, isRecommended, isSuggested, isChecked, position, createdAt, updatedAt, checkedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.listId,
        item.text,
        item.quantity,
        item.note,
        item.isRecommended ? 1 : 0,
        item.isSuggested ? 1 : 0,
        item.isChecked ? 1 : 0,
        item.position,
        item.createdAt,
        item.updatedAt,
        item.checkedAt,
      ]
    );
  },

  async update(item: ShoppingItem): Promise<void> {
    await executeSql(
      `UPDATE items
       SET name = ?, quantity = ?, note = ?, isRecommended = ?, isSuggested = ?, isChecked = ?, position = ?, updatedAt = ?, checkedAt = ?
       WHERE id = ?`,
      [
        item.text,
        item.quantity,
        item.note,
        item.isRecommended ? 1 : 0,
        item.isSuggested ? 1 : 0,
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
