export type ListRecord = {
  id: string;
  shopName: string;
  createdAt: number;
  updatedAt: number;
  isArchived: boolean;
};

export type ItemRecord = {
  id: string;
  listId: string;
  name: string;
  quantity: string | null;
  note: string | null;
  isChecked: boolean;
  position: number;
  createdAt: number;
  updatedAt: number;
  checkedAt: number | null;
};
