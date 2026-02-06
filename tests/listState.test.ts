import {
  calculateProgress,
  createItemRecord,
  createListRecord,
  createStoreRef,
  toggleItemChecked,
} from "../src/utils/listState";

describe("list state helpers", () => {
  it("creates list records with defaults", () => {
    const list = createListRecord("Target", null, 1000);
    expect(list.name).toBe("Target");
    expect(list.isArchived).toBe(false);
    expect(list.isActive).toBe(true);
    expect(list.createdAt).toBe(1000);
  });

  it("creates store references", () => {
    const store = createStoreRef("Trader Joe's");
    expect(store).toEqual({ id: "store-trader-joe's", name: "Trader Joe's" });
  });

  it("creates items and toggles check state", () => {
    const item = createItemRecord("list-1", "Milk", 1, 2000, { isRecommended: true });
    expect(item.isChecked).toBe(false);
    expect(item.isRecommended).toBe(true);
    expect(item.isSuggested).toBe(false);
    const checked = toggleItemChecked(item, 3000);
    expect(checked.isChecked).toBe(true);
    expect(checked.checkedAt).toBe(3000);
  });

  it("calculates progress", () => {
    const items = [
      createItemRecord("list-1", "Milk", 1, 1),
      { ...createItemRecord("list-1", "Eggs", 2, 1), isChecked: true },
    ];
    const progress = calculateProgress(items);
    expect(progress.total).toBe(2);
    expect(progress.checked).toBe(1);
  });
});
