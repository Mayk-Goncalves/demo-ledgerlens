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
| Camera         | expo-camera _(when needed)_       |
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
│   └── copilot-instructions.md   # AI pair-programming guidelines
├── src/
│   ├── app/                      # Expo Router (file-based routing)
│   ├── assets/                   # Images, fonts, icons
│   ├── components/               # Reusable UI components
│   ├── constants/                # Theme, config values
│   └── hooks/                    # Custom React hooks
├── app.json                      # Expo config
├── babel.config.js               # Babel + NativeWind preset
├── metro.config.js               # Metro + NativeWind
├── tailwind.config.js            # Tailwind CSS config
└── tsconfig.json                 # TypeScript strict config
```

---

## Development Roadmap

### Phase 1 — Foundation ✅

> Project scaffolding, tooling, and base configuration.

- [x] Initialize Expo project (SDK 54, New Architecture)
- [x] Configure Yarn 4 with `node_modules` linker
- [x] Set up TypeScript strict mode
- [x] Configure Expo Router (file-based routing)
- [x] Move source code to `src/` directory
- [x] Set up NativeWind v4 + Tailwind CSS
- [x] Create landing screen with LedgerLens branding
- [x] Set up Copilot instructions for AI-assisted development

### Phase 2 — Data Layer & Core Types 🔲

> Define the domain model, local storage, and state management.

- [ ] Define core TypeScript types (Transaction, Receipt, Category, Location)
- [ ] Set up expo-sqlite for local persistence
- [ ] Create Zustand store for transaction state
- [ ] Implement database service layer (CRUD operations)
- [ ] Add seed data for development

### Phase 3 — Add Expense Flow 🔲

> Vertical slice of the primary feature.

- [ ] Create Add Expense form screen
- [ ] Implement category picker
- [ ] Integrate expo-camera for receipt capture
- [ ] Integrate expo-location for auto location
- [ ] Implement local image storage (expo-file-system)
- [ ] Wire form to Zustand store + SQLite

### Phase 4 — Transactions Feed 🔲

> High-performance scrollable list with receipt previews.

- [ ] Implement transaction list screen
- [ ] Integrate FlashList for performance
- [ ] Benchmark FlatList vs FlashList (document results)
- [ ] Add receipt thumbnail previews (expo-image)
- [ ] Target 60 FPS scroll performance
- [ ] Implement pull-to-refresh and empty states

### Phase 5 — Analytics Screen 🔲

> Lightweight data visualization.

- [ ] Monthly spending summary
- [ ] Category breakdown view
- [ ] Lightweight chart implementation (minimal library)
- [ ] Date range filtering

### Phase 6 — Tab Navigation & Polish 🔲

> Wire screens together with proper navigation.

- [ ] Set up bottom tab navigation
- [ ] Add screen transitions
- [ ] Implement dark mode support
- [ ] Polish UI details and edge cases

### Phase 7 — Performance & Bundle Optimization 🔲

> Measure, analyze, and optimize.

- [ ] Run Expo Atlas for bundle analysis
- [ ] Identify and remove heavy dependencies
- [ ] Implement dynamic imports where beneficial
- [ ] Document performance benchmarks

### Phase 8 — CI/CD & Deployment 🔲

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
