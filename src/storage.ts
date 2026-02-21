import { AppState, ShoppingList } from './types';

const STORAGE_KEY = 'shoppinglist:web:v2';
const CURRENT_VERSION = 2;

const emptyState = (): AppState => ({ schemaVersion: CURRENT_VERSION, lists: [] });

const migrate = (raw: unknown): AppState => {
  if (!raw || typeof raw !== 'object') return emptyState();
  const data = raw as any;

  if (!data.schemaVersion) {
    const lists = (data.lists ?? []).map((l: any): ShoppingList => ({
      ...l,
      store: l.store ?? '',
      isActive: l.isArchived ? false : (l.isActive ?? true),
      items: (l.items ?? []).map((i: any) => ({ ...i, checkedAt: i.checkedAt ?? null })),
    }));
    return { schemaVersion: CURRENT_VERSION, lists };
  }

  if (data.schemaVersion < CURRENT_VERSION) {
    return {
      schemaVersion: CURRENT_VERSION,
      lists: (data.lists ?? []).map((l: any) => ({
        ...l,
        store: l.store ?? '',
        isActive: l.isArchived ? false : (l.isActive ?? true),
      })),
    };
  }

  return data as AppState;
};

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    return emptyState();
  }
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
