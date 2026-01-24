import { calculateProgress, createItemRecord, createListRecord, toggleItemChecked } from "../src/utils/listState";

describe("list state helpers", () => {
  it("creates list records with defaults", () => {
    const list = createListRecord("Target", 1000);
    expect(list.shopName).toBe("Target");
    expect(list.isArchived).toBe(false);
    expect(list.createdAt).toBe(1000);
  });

  it("creates items and toggles check state", () => {
    const item = createItemRecord("list-1", "Milk", 1, 2000);
    expect(item.isChecked).toBe(false);
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
