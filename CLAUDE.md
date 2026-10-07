# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:8888
npm run build     # Type-check + production build
npm run lint      # Run ESLint
npm run format    # Run Prettier
npm run preview   # Preview production build
```

Environment variables (copy `.env.example` to `.env`):
- `PLACES_API_URL` — backend API (default: `http://localhost:8080`)
- `TILES_API_URL` — tile server (default: `http://localhost:4000`)

## Architecture

A Vue 3 + TypeScript SPA for visualizing and managing barbershop/gym locations in Sofia, Bulgaria.

**Data flow:**
1. `main.ts` initializes Clerk auth, then mounts the app with Pinia + Vue Router + i18n
2. `App.vue` guards rendering behind auth check
3. `HomeView.vue` → `InteractiveMap.vue` is the single route and core component
4. All map interactions (filtering, clustering, CRUD) live in `InteractiveMap.vue`, delegating to composables

**Key layers:**

| Layer | Files |
|-------|-------|
| Map rendering | `@vue-leaflet/vue-leaflet` + `leaflet.markercluster` + `leaflet.vectorgrid` |
| Business logic | `src/composables/` — each composable owns one domain (barbershops, gyms, metro lines/stops, analysis grid, population layers, shop management) |
| API | `src/api/` — `httpClient.ts` injects Bearer token; `places.ts`, `metro.ts`, `tiles.ts` define endpoints |
| Auth | Clerk (hosted at `clerk.lonctus.com`) |
| State | `src/stores/mapViewStore.ts` (zoom/center), `src/stores/mapConfig.ts` |
| i18n | `src/locales/en.json` + `src/locales/bg.json` via Vue-i18n |

**Dev server proxy** (configured in `vite.config.ts`):
- `/api/places` → `PLACES_API_URL:8080`
- `/api/metro` → `PLACES_API_URL:8080`
- `/api/tiles` → `TILES_API_URL:4000` (path prefix stripped)

## Vue conventions

- **Prefer components over plain HTML.** Repeated markup patterns (headers, rows, stat blocks, buttons) must be extracted into a component. Use plain HTML elements only when no meaningful abstraction exists or when a wrapper would add complexity without benefit.
- **Shared UI components live in `src/components/ui/`.** Domain-specific components (map panels, modals) live in `src/components/map/`.
- **Use `defineProps` with TypeScript generics** (`defineProps<{ ... }>()`), never the options-style object syntax.
- **Use `withDefaults`** for props that need default values.
- **Emit events with typed `defineEmits`** (`defineEmits<{ close: [] }>()`).
- **Scoped styles always.** All `<style>` blocks must be `<style scoped>`. Use `:slotted()` to style slot content from inside a child component, and CSS custom properties (`--var`) to expose theming hooks to parent contexts.
- **No `v-if` + `v-for` on the same element.** Use a wrapping `<template>` tag for the `v-for`.
- **`script setup` syntax only.** Never use the Options API or `export default { setup() {} }` form.
