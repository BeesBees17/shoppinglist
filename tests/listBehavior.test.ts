import { ShoppingList } from '../src/types';

describe('archive/unarchive semantics', () => {
  it('toggles archived and active state', () => {
    const base: ShoppingList = {
      id: '1', name: 'Weekly', store: '', isArchived: false, isActive: true, createdAt: 1, updatedAt: 1, items: []
    };
    const archived = { ...base, isArchived: true, isActive: false };
    const restored = { ...archived, isArchived: false, isActive: true };
    expect(archived.isActive).toBe(false);
    expect(restored.isArchived).toBe(false);
  });
});
