# LedgerLens®

A modern personal finance mobile app built with **Expo** and **TypeScript**.

> **Portfolio-grade architecture demo** — not a startup MVP or SaaS product.

## Purpose

Demonstrate senior-level React Native + Expo capabilities including:

- Config plugins & native permissions
- Performance optimization (FlashList benchmarks, 60 FPS targets)
- Bundle analysis & optimization
- CI/CD with EAS Build + EAS Update
- Offline-first architecture (local SQLite storage)
- Image handling & optimization (receipt capture)

## Tech Stack

| Layer          | Choice                            |
| -------------- | --------------------------------- |
| Framework      | Expo SDK 54 (New Architecture)    |
| Language       | TypeScript (strict mode)          |
| Navigation     | Expo Router (file-based)          |
| Styling        | NativeWind v4 + Tailwind CSS 3.4  |
| State          | Zustand _(when needed)_           |
| Lists          | FlashList _(when needed)_         |
| Camera         | expo-image-picker                 |
| Location       | expo-location _(when needed)_     |
| Images         | expo-image                        |
| Storage        | expo-sqlite _(when needed)_       |
| Build & Deploy | EAS Build + EAS Update            |
| CI             | GitHub Actions (free tier)        |
| Package Mgr    | Yarn 4 (Berry, node_modules mode) |

## Getting Started

```bash
# Install dependencies
yarn install

# Start dev server
yarn start

# Start with tunnel (for physical device testing)
yarn start:tunnel
```

## Project Structure

```
├── .github/
│   └── copilot-instructions.md      # AI pair-programming guidelines
├── src/
│   ├── app/                         # Expo Router (file-based routing)
│   ├── assets/images/               # Icons, splash, branding
│   ├── components/ui/               # Reusable UI primitives
│   ├── constants/                   # Categories, config values
│   ├── features/transactions/       # Transaction feature
│   │   ├── components/              # Feature-specific UI
│   │   ├── modals/                  # Form modal entry points
│   │   └── storage.ts              # SQLite CRUD
│   ├── lib/                         # Infrastructure (database, format, seed)
│   ├── stores/                      # Zustand stores
│   ├── types/                       # Domain types
│   └── utils/                       # Pure utility functions
├── app.json                         # Expo config
├── babel.config.js                  # Babel + NativeWind preset
├── metro.config.js                  # Metro + NativeWind
├── tailwind.config.js               # Tailwind CSS config
└── tsconfig.json                    # TypeScript strict config
```

---

## Development Roadmap

### Phase 1 — Foundation ✅

#### Step 1 — Project Scaffolding ✅

> Tooling, configuration, and base setup.

- [x] Initialize Expo project (SDK 54, New Architecture)
- [x] Configure Yarn 4 with `node_modules` linker
- [x] Set up TypeScript strict mode
- [x] Configure Expo Router (file-based routing)
- [x] Move source code to `src/` directory
- [x] Set up NativeWind v4 + Tailwind CSS
- [x] Create landing screen with LedgerLens branding
- [x] Set up Copilot instructions for AI-assisted development
- [x] Clean `expo prebuild` execution with zero manual native edits (config plugins for camera, photos, location permissions)

#### Step 2 — Data Layer & Core Types ✅

> Domain model, local storage, and type foundation.

- [x] Define core TypeScript types (Transaction, CreateTransactionInput, TransactionLocation)
- [x] Amount as integer cents with currency (ISO 4217) for i18n readiness
- [x] Grouped location type (extensible for future place data)
- [x] Set up expo-sqlite for local persistence
- [x] Implement storage layer (insert, getByMonth, delete)
- [x] Create Zustand store for transaction state (finance + notifications)
- [x] Preload icon fonts during splash screen

### Phase 2 — Add Transaction Flow ✅

> Vertical slice of the primary feature — income & expense entry.

- [x] Create Add Income / Add Expense form modals (shared receipt-style TransactionFormModal)
- [x] Implement category picker (3 income + 9 expense categories with icons)
- [x] Integrate expo-image-picker for receipt capture (camera + gallery)
- [x] Integrate expo-location for auto-location capture (GPS + place name)
- [x] Persist receipt images to app storage (expo-file-system)
- [x] Wire form to Zustand store + SQLite
- [x] Dev seed utility for sample data generation

### Phase 3 — Transactions Feed ✅

> High-performance scrollable list with receipt previews.

- [x] Implement transaction list screen (grouped by day with section headers)
- [x] Memoized transaction rows
- [x] Empty state UI
- [x] Add receipt indicator with full-image modal in transaction rows (expo-image)
- [x] Implement pull-to-refresh

> **Note:** FlashList migration, FlatList vs FlashList benchmarking, and 60 FPS profiling moved to Phase 6. The current dataset (tens to low hundreds of transactions per month) doesn't stress ScrollView — profiling should happen alongside bundle analysis with a large seeded dataset to produce meaningful before/after metrics.

### Phase 4 — Analytics Screen ✅

> Lightweight data visualization — no chart libraries, pure View-based rendering.

- [x] Monthly spending summary (category breakdown with horizontal bar chart + percentages)
- [x] Category breakdown view (color-coded bars, icons, sorted by spend)
- [x] Income vs Expenses stacked bar with net balance
- [x] Monthly insights (daily average, top spending day, transaction counts)
- [x] Navigate to analytics from BalanceCard chart icon

> **Note:** Date range filtering beyond month navigation is not needed — the MonthPicker on the home screen already scopes all data by month, and the analytics screen reads from the same store.

### Phase 5 — Tab Navigation & Polish ✅

> Wire screens together with proper navigation.

- [x] Set up bottom tab navigation (Home, Analytics, Settings)
- [x] Move home and analytics screens into tab layout
- [x] Create Settings screen (profile, dev tools, about section)
- [x] Remove push-based analytics navigation (now a tab)
- [x] Polish MonthPicker text size and transactions padding
- [x] Add screen transitions (fade on stack + tabs)
- [x] Implement dark mode support (NativeWind useColorScheme, light/dark/system toggle in Settings)

### Phase 6 — Performance & Bundle Optimization ✅

> Measure, analyze, and optimize. See [docs/performance.md](docs/performance.md) for detailed metrics and rationale.

- [x] Run Expo Atlas for bundle analysis
- [x] Identify and remove heavy dependencies
- [x] ~~Implement dynamic imports where beneficial~~ — N/A: app code is 2.7% of bundle; framework code (51%) dominates. No lazy-loadable boundaries exist.
- [x] Integrate FlashList for virtualized list performance
- [x] Benchmark ScrollView vs FlashList with 1,000+ seeded transactions
- [x] Target and verify 60 FPS scroll performance (profile and document)
- [x] Document performance benchmarks

### Phase 7 — CI/CD & Deployment 🔲

> Production-grade build and delivery pipeline.

- [ ] Configure EAS Build
- [ ] Configure EAS Update (OTA)
- [ ] Set up GitHub Action: push to staging → OTA update
- [ ] Document deployment workflow

---

## Constraints

- Free/open-source libraries only
- No backend, authentication, or cloud APIs
- Everything runs locally on-device
- Expo managed workflow only (no native ejecting)

## License

MIT
