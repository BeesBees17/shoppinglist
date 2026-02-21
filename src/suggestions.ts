import { features } from './features';

const localSuggestions = (items: string[], store: string): string[] => {
  if (items.length < 3) return [];
  if (store.toLowerCase().includes('farm')) return ['Apples', 'Kale', 'Greek Yogurt'];
  return ['Milk', 'Eggs', 'Bread'];
};

export const getSuggestions = async (items: string[], store: string): Promise<string[]> => {
  if (features.networkSuggestionsEnabled) {
    try {
      const res = await fetch('https://example.com/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, store }),
      });
      const payload = (await res.json()) as { suggestions?: string[] };
      if (res.ok && Array.isArray(payload.suggestions) && payload.suggestions.length > 0) {
        return payload.suggestions;
      }
    } catch {
      // fallback below
    }
  }
  return localSuggestions(items, store);
};
