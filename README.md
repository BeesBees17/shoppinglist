# Shopping List (Expo + React Native)

A fast, offline-first shopping list app focused on one-handed use in the aisle. Lists are stored locally in SQLite and the UI is built for speed.

## Setup

```bash
npm install
npm run start
```

## Architecture

- `src/db/` initializes SQLite and provides a small query helper.
- `src/repositories/` exposes CRUD operations for lists and items (repository pattern).
- `src/hooks/` contains data loading hooks for screens.
- `src/design/` holds the theme (spacing, typography, colors).
- `src/ai/` is a future-facing module for suggestions (MVP returns deterministic values).

## AI suggestions

The placeholder module in `src/ai/suggestions.ts` returns deterministic suggestions without any network calls. Swap the implementation of `getSuggestions` to plug in real AI later.

## Tests

```bash
npm run test
```

Tests cover core list logic and a lightweight integration flow for adding/checking items.
