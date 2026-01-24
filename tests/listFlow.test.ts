import { calculateProgress, createItemRecord, toggleItemChecked } from "../src/utils/listState";

describe("shopping flow integration", () => {
  it("adds items and checks one off", () => {
    const items = [
      createItemRecord("list-1", "Milk", 1, 1),
      createItemRecord("list-1", "Eggs", 2, 1),
    ];

    const toggled = toggleItemChecked(items[0], 10);
    const updatedItems = [toggled, items[1]];

    const progress = calculateProgress(updatedItems);
    expect(progress).toEqual({ total: 2, checked: 1 });
  });
});
