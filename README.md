# Shopping List (Web, Vite + React)

This project was fully redone to run as a **browser-first web app** (no Expo, no emulator required).

## Run locally on Windows (no Expo)

1. Install **Node.js 20+**.
2. Open PowerShell in the project folder.
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Start dev server:
   ```powershell
   npm run dev
   ```
5. Open the URL shown in terminal (typically `http://localhost:5173`).

## Build for production

```powershell
npm run build
npm run preview
```

## What this app includes

- Shopping list + item CRUD.
- Archive/unarchive list workflows.
- Undo for archive/delete/check-all/item-delete actions.
- Loading/empty/validation states.
- Deterministic suggestion fallback plus optional network suggestions via feature flag.
- Local persistence with schema migration support in browser `localStorage`.

## Tests

```powershell
npm run test
```
