export const schema = [
  `CREATE TABLE IF NOT EXISTS lists (
    id TEXT PRIMARY KEY NOT NULL,
    shopName TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    isArchived INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY NOT NULL,
    listId TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity TEXT,
    note TEXT,
    isChecked INTEGER NOT NULL,
    position INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    checkedAt INTEGER,
    FOREIGN KEY(listId) REFERENCES lists(id)
  );`,
];
