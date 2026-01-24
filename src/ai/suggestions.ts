export async function getSuggestions(
  currentItems: string[],
  shopName: string
): Promise<string[]> {
  if (currentItems.length < 3) {
    return [];
  }
  const normalizedShop = shopName.toLowerCase();
  if (normalizedShop.includes("farm")) {
    return ["Apples", "Kale", "Greek Yogurt"];
  }
  return ["Milk", "Eggs", "Bread"];
}
