import { loadState, saveState } from '../src/storage';

describe('storage migrations', () => {
  beforeEach(() => {
    const mem: Record<string, string> = {};
    // @ts-ignore
    global.localStorage = {
      getItem: (k: string) => mem[k] ?? null,
      setItem: (k: string, v: string) => { mem[k] = v; },
      clear: () => Object.keys(mem).forEach((k) => delete mem[k]),
    };
    global.localStorage.clear();
  });

  it('migrates legacy shape into current schema', () => {
    global.localStorage.setItem('shoppinglist:web:v2', JSON.stringify({ lists: [{ id: '1', name: 'A', isArchived: true, items: [] }] }));
    const state = loadState();
    expect(state.schemaVersion).toBe(2);
    expect(state.lists[0].isActive).toBe(false);
    expect(state.lists[0].store).toBe('');
  });

  it('persists state', () => {
    saveState({ schemaVersion: 2, lists: [] });
    expect(loadState().schemaVersion).toBe(2);
  });
});
