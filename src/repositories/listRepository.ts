import { executeSql } from "../db/queries";
import { ShoppingList } from "../utils/types";

const mapRow = (row: any): ShoppingList => {
  const storeId = row.storeId ?? null;
  const storeName = row.storeName ?? null;
  return {
    id: row.id,
    name: row.shopName,
    store: storeId && storeName ? { id: storeId, name: storeName } : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    isArchived: row.isArchived === 1,
    isActive: row.isActive === 1,
  };
};

export const listRepository = {
  async getAll(isArchived: boolean): Promise<ShoppingList[]> {
    const result = await executeSql(
      "SELECT * FROM lists WHERE isArchived = ? ORDER BY updatedAt DESC",
      [isArchived ? 1 : 0]
    );
    return result.rows._array.map(mapRow);
  },

  async getById(id: string): Promise<ShoppingList | null> {
    const result = await executeSql("SELECT * FROM lists WHERE id = ?", [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return mapRow(result.rows._array[0]);
  },

  async create(list: ShoppingList): Promise<void> {
    await executeSql(
      `INSERT INTO lists (id, shopName, storeId, storeName, createdAt, updatedAt, isArchived, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        list.id,
        list.name,
        list.store?.id ?? null,
        list.store?.name ?? null,
        list.createdAt,
        list.updatedAt,
        list.isArchived ? 1 : 0,
        list.isActive ? 1 : 0,
      ]
    );
  },

  async update(list: ShoppingList): Promise<void> {
    await executeSql(
      `UPDATE lists
       SET shopName = ?, storeId = ?, storeName = ?, updatedAt = ?, isArchived = ?, isActive = ?
       WHERE id = ?`,
      [
        list.name,
        list.store?.id ?? null,
        list.store?.name ?? null,
        list.updatedAt,
        list.isArchived ? 1 : 0,
        list.isActive ? 1 : 0,
        list.id,
      ]
    );
  },
  async delete(id: string): Promise<void> {
    await executeSql("DELETE FROM lists WHERE id = ?", [id]);
  },
};
