# Shopping List status

## Last completed TODOs

1. Fully migrated from Expo/React Native to a Vite + React web app.
2. Preserved core shopping workflows (CRUD, archive/unarchive, undo, suggestions, validation, loading/empty states).
3. Retained CI/test emphasis with migration and behavior test coverage.

## Current state

- Runs locally in browser on desktop without emulator.
- Uses `localStorage` persistence and migration to schema version 2.
- Supports optional network suggestion provider with deterministic local fallback.

## Next suggested steps

1. Add component-level tests with React Testing Library.
2. Add import/export for backups (JSON).
3. Add multi-user sync if cloud support is needed.
