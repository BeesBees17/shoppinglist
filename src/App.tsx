import { useEffect, useMemo, useState } from 'react';
import { features } from './features';
import { getSuggestions } from './suggestions';
import { loadState, saveState } from './storage';
import { ShoppingItem, ShoppingList } from './types';

type View = 'home' | 'new' | 'detail' | 'archived';

type UndoState =
  | { type: 'archive'; list: ShoppingList }
  | { type: 'delete'; list: ShoppingList }
  | { type: 'checkAll'; listId: string; snapshot: ShoppingItem[] }
  | { type: 'itemDelete'; listId: string; item: ShoppingItem }
  | null;

const nowId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function App() {
  const [state, setState] = useState(loadState());
  const [view, setView] = useState<View>('home');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [undo, setUndo] = useState<UndoState>(null);
  const [loading] = useState(false);

  useEffect(() => saveState(state), [state]);

  const lists = state.lists;
  const selected = lists.find((l) => l.id === selectedListId) ?? null;

  const upsertList = (list: ShoppingList) => {
    setState((prev) => ({ ...prev, lists: prev.lists.map((l) => (l.id === list.id ? list : l)) }));
  };

  const createList = (name: string, store: string, items: string[]) => {
    const t = Date.now();
    const list: ShoppingList = {
      id: nowId(), name, store, isArchived: false, isActive: true, createdAt: t, updatedAt: t,
      items: items.filter(Boolean).map((text, i) => ({ id: nowId(), text: text.trim(), isChecked: false, checkedAt: null, createdAt: t + i, updatedAt: t + i }))
    };
    setState((prev) => ({ ...prev, lists: [list, ...prev.lists] }));
    setView('home');
  };

  const filtered = useMemo(() => lists.filter((l) => !l.isArchived && l.name.toLowerCase().includes(query.toLowerCase())), [lists, query]);
  const archived = lists.filter((l) => l.isArchived);

  const undoLast = () => {
    if (!undo) return;
    if (undo.type === 'archive') upsertList({ ...undo.list, isArchived: false, isActive: true, updatedAt: Date.now() });
    if (undo.type === 'delete') setState((p) => ({ ...p, lists: [undo.list, ...p.lists] }));
    if (undo.type === 'checkAll') {
      const list = lists.find((l) => l.id === undo.listId);
      if (list) upsertList({ ...list, items: undo.snapshot, updatedAt: Date.now() });
    }
    if (undo.type === 'itemDelete') {
      const list = lists.find((l) => l.id === undo.listId);
      if (list) upsertList({ ...list, items: [...list.items, undo.item], updatedAt: Date.now() });
    }
    setUndo(null);
  };

  return (
    <div className="container">
      <h1>Shopping Lists</h1>
      <div className="row">
        <button className="primary" onClick={() => setView('new')}>New list</button>
        <button onClick={() => setView('home')}>Home</button>
        <button onClick={() => setView('archived')}>Archived</button>
      </div>

      {undo && <div className="banner"><button onClick={undoLast}>Undo last action</button></div>}

      {view === 'home' && (
        <div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search lists" />
          {loading && <p className='muted'>Loading…</p>}
          {filtered.length === 0 && <p className='muted'>No active lists yet.</p>}
          {filtered.map((l) => (
            <div key={l.id} className="card">
              <div className="row">
                <strong>{l.name}</strong>
                <span className="muted">{l.store || 'No store'}</span>
                <span className="muted">{l.items.filter((i) => i.isChecked).length}/{l.items.length} checked</span>
              </div>
              <div className="row">
                <button onClick={() => { setSelectedListId(l.id); setView('detail'); }}>Open</button>
                <button onClick={() => { const n = { ...l, isArchived: true, isActive: false, updatedAt: Date.now() }; upsertList(n); setUndo({ type: 'archive', list: l }); }}>Archive</button>
                <button className="danger" onClick={() => { setState((p) => ({ ...p, lists: p.lists.filter((x) => x.id !== l.id) })); setUndo({ type: 'delete', list: l }); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'archived' && (
        <div>
          {archived.length === 0 && <p className='muted'>No archived lists.</p>}
          {archived.map((l) => (
            <div key={l.id} className='card'>
              <div className='row'><strong>{l.name}</strong><span className='muted'>{l.store || 'No store'}</span></div>
              <button onClick={() => upsertList({ ...l, isArchived: false, isActive: true, updatedAt: Date.now() })}>Unarchive</button>
            </div>
          ))}
        </div>
      )}

      {view === 'new' && <NewList onCreate={createList} />}

      {view === 'detail' && selected && (
        <Detail
          list={selected}
          onBack={() => setView('home')}
          onUpdate={upsertList}
          onUndoState={setUndo}
        />
      )}

      <p className='muted'>Suggestions enabled: {features.suggestionsEnabled ? 'yes' : 'no'}</p>
    </div>
  );
}

function NewList({ onCreate }: { onCreate: (n: string, s: string, items: string[]) => void }) {
  const [name, setName] = useState('');
  const [store, setStore] = useState('');
  const [item, setItem] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [validation, setValidation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!features.suggestionsEnabled) return;
    getSuggestions(items, store || name).then(setSuggestions);
  }, [items, store, name]);

  return (
    <div className='card'>
      <h3>New list</h3>
      <input value={name} onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) setValidation(''); }} placeholder='List name' />
      {validation && <p className='muted' style={{ color: '#ef4444' }}>{validation}</p>}
      <input value={store} onChange={(e) => setStore(e.target.value)} placeholder='Store (optional)' />
      <div className='row'>
        <input value={item} onChange={(e) => setItem(e.target.value)} placeholder='Add item' />
        <button onClick={() => { if (!item.trim()) return; setItems((p) => [...p, item.trim()]); setItem(''); }}>Add</button>
      </div>
      <div className='row'>{items.map((i) => <span key={`${i}-${Math.random()}`} className='muted'>{i}</span>)}</div>
      {suggestions.length > 0 && <div className='row'>{suggestions.map((s) => <button key={s} onClick={() => setItems((p) => [...p, s])}>{s}</button>)}</div>}
      <button className='success' onClick={() => { if (!name.trim()) return setValidation('List name is required.'); onCreate(name.trim(), store.trim(), items); }}>Save list</button>
    </div>
  );
}

function Detail({ list, onBack, onUpdate, onUndoState }: {
  list: ShoppingList;
  onBack: () => void;
  onUpdate: (list: ShoppingList) => void;
  onUndoState: (u: UndoState) => void;
}) {
  const [name, setName] = useState(list.name);
  const [store, setStore] = useState(list.store);
  const [itemText, setItemText] = useState('');
  const [error, setError] = useState('');

  const saveMeta = () => {
    if (!name.trim()) return setError('List name cannot be empty.');
    onUpdate({ ...list, name: name.trim(), store: store.trim(), updatedAt: Date.now() });
    setError('');
  };

  const checkAll = () => {
    const snapshot = list.items;
    const t = Date.now();
    const items = list.items.map((i) => ({ ...i, isChecked: true, checkedAt: t, updatedAt: t }));
    onUpdate({ ...list, items, updatedAt: t });
    onUndoState({ type: 'checkAll', listId: list.id, snapshot });
  };

  return (
    <div className='card'>
      <h3>List detail</h3>
      <div className='row'>
        <input value={name} onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) setError(''); }} />
        <input value={store} onChange={(e) => setStore(e.target.value)} placeholder='Store' />
        <button onClick={saveMeta}>Save</button>
        <button onClick={onBack}>Back</button>
      </div>
      {error && <p className='muted' style={{ color: '#ef4444' }}>{error}</p>}
      <div className='row'>
        <input value={itemText} onChange={(e) => setItemText(e.target.value)} placeholder='Add item' />
        <button onClick={() => {
          if (!itemText.trim()) return;
          const t = Date.now();
          onUpdate({ ...list, updatedAt: t, items: [...list.items, { id: nowId(), text: itemText.trim(), isChecked: false, checkedAt: null, createdAt: t, updatedAt: t }] });
          setItemText('');
        }}>Add</button>
        <button onClick={checkAll}>Check all</button>
      </div>
      {list.items.length === 0 && <p className='muted'>No items yet.</p>}
      {list.items.map((i) => (
        <div key={i.id} className='row'>
          <input type='checkbox' checked={i.isChecked} onChange={() => {
            const t = Date.now();
            const next = list.items.map((x) => x.id === i.id ? { ...x, isChecked: !x.isChecked, checkedAt: !x.isChecked ? t : null, updatedAt: t } : x);
            onUpdate({ ...list, items: next, updatedAt: t });
          }} />
          <span style={{ textDecoration: i.isChecked ? 'line-through' : 'none' }}>{i.text}</span>
          <button className='danger' onClick={() => {
            onUpdate({ ...list, items: list.items.filter((x) => x.id !== i.id), updatedAt: Date.now() });
            onUndoState({ type: 'itemDelete', listId: list.id, item: i });
          }}>Delete</button>
        </div>
      ))}
    </div>
  );
}
