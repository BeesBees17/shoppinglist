import { ShoppingItem, ShoppingList, StoreRef } from "./types";

export const createStoreRef = (name: string): StoreRef => ({
  id: `store-${name.trim().toLowerCase().replace(/\s+/g, "-")}`,
  name: name.trim(),
});

export const createListRecord = (
  name: string,
  store: StoreRef | null,
  now = Date.now()
): ShoppingList => ({
  id: `list-${now}`,
  name,
  store,
  createdAt: now,
  updatedAt: now,
  isArchived: false,
  isActive: true,
});

export const createItemRecord = (
  listId: string,
  text: string,
  position: number,
  now = Date.now(),
  options?: { isRecommended?: boolean; isSuggested?: boolean }
): ShoppingItem => ({
  id: `item-${listId}-${now}-${position}`,
  listId,
  text,
  quantity: null,
  note: null,
  isRecommended: options?.isRecommended ?? false,
  isSuggested: options?.isSuggested ?? false,
  isChecked: false,
  position,
  createdAt: now,
  updatedAt: now,
  checkedAt: null,
});

export const toggleItemChecked = (item: ShoppingItem, now = Date.now()): ShoppingItem => ({
  ...item,
  isChecked: !item.isChecked,
  checkedAt: !item.isChecked ? now : null,
  updatedAt: now,
});

export const sortItemsForDisplay = (items: ShoppingItem[]): ShoppingItem[] => {
  const unchecked = items.filter((item) => !item.isChecked);
  const checked = items.filter((item) => item.isChecked);
  return [...unchecked, ...checked];
};

export const calculateProgress = (items: ShoppingItem[]) => {
  const total = items.length;
  const checked = items.filter((item) => item.isChecked).length;
  return { total, checked };
};
