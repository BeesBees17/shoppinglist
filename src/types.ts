export type ShoppingItem = {
  id: string;
  text: string;
  isChecked: boolean;
  createdAt: number;
  updatedAt: number;
  checkedAt: number | null;
};

export type ShoppingList = {
  id: string;
  name: string;
  store: string;
  isArchived: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  items: ShoppingItem[];
};

export type AppState = {
  schemaVersion: number;
  lists: ShoppingList[];
};
