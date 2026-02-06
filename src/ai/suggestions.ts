export async function getSuggestions(
  currentItems: string[],
  storeContext: string
): Promise<string[]> {
  if (currentItems.length < 3) {
    return [];
  }
  const normalizedStore = storeContext.toLowerCase();
  if (normalizedStore.includes("farm")) {
    return ["Apples", "Kale", "Greek Yogurt"];
  }
  return ["Milk", "Eggs", "Bread"];
}
