export type StoreRef = {
  id: string;
  name: string;
};

export type ShoppingList = {
  id: string;
  name: string;
  store: StoreRef | null;
  createdAt: number;
  updatedAt: number;
  isArchived: boolean;
  isActive: boolean;
};

export type ShoppingItem = {
  id: string;
  listId: string;
  text: string;
  quantity: string | null;
  note: string | null;
  isRecommended: boolean;
  isSuggested: boolean;
  isChecked: boolean;
  position: number;
  createdAt: number;
  updatedAt: number;
  checkedAt: number | null;
};
