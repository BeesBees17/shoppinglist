import { ItemRecord, ListRecord } from "./types";

export const createListRecord = (shopName: string, now = Date.now()): ListRecord => ({
  id: `list-${now}`,
  shopName,
  createdAt: now,
  updatedAt: now,
  isArchived: false,
});

export const createItemRecord = (
  listId: string,
  name: string,
  position: number,
  now = Date.now()
): ItemRecord => ({
  id: `item-${listId}-${now}-${position}`,
  listId,
  name,
  quantity: null,
  note: null,
  isChecked: false,
  position,
  createdAt: now,
  updatedAt: now,
  checkedAt: null,
});

export const toggleItemChecked = (item: ItemRecord, now = Date.now()): ItemRecord => ({
  ...item,
  isChecked: !item.isChecked,
  checkedAt: !item.isChecked ? now : null,
  updatedAt: now,
});

export const sortItemsForDisplay = (items: ItemRecord[]): ItemRecord[] => {
  const unchecked = items.filter((item) => !item.isChecked);
  const checked = items.filter((item) => item.isChecked);
  return [...unchecked, ...checked];
};

export const calculateProgress = (items: ItemRecord[]) => {
  const total = items.length;
  const checked = items.filter((item) => item.isChecked).length;
  return { total, checked };
};
