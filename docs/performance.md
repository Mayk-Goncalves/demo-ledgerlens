# Phase 6 — Performance & Bundle Optimization

> Living document tracking every step, decision, and metric throughout Phase 6.
> Each section is written as work progresses — not retroactively polished.

---

## Table of Contents

1. [Step 1 — Bundle Analysis (Expo Atlas)](#step-1--bundle-analysis-expo-atlas)
2. [Step 2 — Dependency Cleanup](#step-2--dependency-cleanup)
3. [Step 3 — FlashList Migration](#step-3--flashlist-migration)
4. [Step 4 — Scroll Performance Benchmarking](#step-4--scroll-performance-benchmarking)
5. [Step 5 — Final Metrics & Summary](#step-5--final-metrics--summary)

---

## Step 1 — Bundle Analysis (Expo Atlas)

### Why

Before optimizing anything, you need a baseline. Expo Atlas generates a module-level
breakdown of the JS bundle — showing exactly where bytes go. Without this, optimization
is guesswork.

### How

```bash
EXPO_ATLAS=1 npx expo export --platform android
```

This produces `.expo/atlas.jsonl` — a line-delimited JSON file containing every module
in the bundle with its byte size, package name, and file path.

### Results — Baseline (pre-optimization)

| Metric       | Value       |
| ------------ | ----------- |
| Total JS     | 6.6 MB      |
| Compiled HBC | 4.33 MB     |
| Modules      | 1,475       |

#### Package Breakdown (top contributors)

| Package                  | Size    | % of Bundle |
| ------------------------ | ------- | ----------- |
| react-native             | 1.88 MB | 28.5%       |
| react-native-reanimated  | 1.49 MB | 22.6%       |
| @expo/vector-icons       | 613 KB  | 9.1%        |
| expo-router              | 417 KB  | 6.2%        |
| **App code (src/)**      | 184 KB  | 2.7%        |

### Takeaways

- **App code is only 2.7% of the bundle.** The app is lean — bloat lives in framework
  and library code, not our source.
- **react-native + reanimated = 51% of the bundle.** These are non-negotiable framework
  costs. They can't be tree-shaken or replaced.
- **@expo/vector-icons at 9.1%** is notable but expected — MaterialCommunityIcons is the
  main icon set used across the app. Switching to a custom icon font could save ~500 KB,
  but that's a tradeoff against DX and Expo ecosystem alignment.
- **No quick wins in large unused dependencies.** The bundle is already reasonably tight
  for an Expo app.

---

## Step 2 — Dependency Cleanup

### Why

Even if a dependency isn't imported at runtime, having it in `package.json` adds
install weight, CI time, and cognitive overhead. More importantly, some unused deps
_do_ end up in the bundle via transitive imports or auto-linking.

### Process

1. **Grep the bundle data** — checked which installed packages had zero modules in the
   Atlas output.
2. **Grep src/ for imports** — confirmed no source file imports these packages.
3. **Removed** the unused dependencies.

### Packages Removed

| Package            | Reason for removal                                   |
| ------------------ | ---------------------------------------------------- |
| `expo-haptics`     | Installed by template, never used. No haptic UX yet. |
| `expo-symbols`     | SF Symbols — iOS only, not used anywhere.             |
| `expo-web-browser` | Never used. No external link flows.                   |
| `react-native-web` | Web is not a target platform for this app.            |

### Packages Kept (considered but retained)

| Package     | Reason kept                                    |
| ----------- | ---------------------------------------------- |
| `react-dom` | Required as peer dependency by `expo-router`.  |

### Verification

```bash
npx tsc --noEmit  # ✅ Clean — no type errors after removal
```

---

## Step 3 — FlashList Migration

### Why

The transactions feed currently uses `ScrollView` + `.map()`. This renders **all items
at once** — every transaction row is mounted, laid out, and kept in memory regardless
of whether it's visible on screen.

For tens of transactions this is fine. But at 500–1,000+ items (the target scale for
this portfolio demo), this has real costs:

- **Memory**: every row's React tree, native views, and receipt image refs live in
  memory simultaneously.
- **Initial render**: mounting 1,000 rows blocks the JS thread, causing visible jank
  when navigating to the tab or pulling to refresh.
- **No recycling**: scrolled-off rows are never unmounted. The view count only grows.

`FlashList` (from Shopify) solves this with view recycling — it reuses off-screen row
components for new data, keeping only ~20–30 views alive at any time.

### Decision: Flat Array with Interleaved Headers (Option A)

FlashList works best with a single flat array. Our data is grouped by day, so we have
two options:

| Option | Approach | Tradeoffs |
| ------ | -------- | --------- |
| **A — Flat array** | Interleave `{ type: "header" }` and `{ type: "transaction" }` items in one array | Clean FlashList integration, `getItemType` enables recycling pools, `stickyHeaderIndices` works natively |
| **B — Nested SectionList** | Use FlashList's experimental section support or fall back to SectionList | Less mature API, harder to tune `estimatedItemSize`, section recycling is limited |

**Chosen: Option A** — it's the documented best practice from Shopify, gives maximum
recycling efficiency, and keeps the implementation straightforward.

### Implementation

#### 1. Installed `@shopify/flash-list@2.3.0`

FlashList v2 is a ground-up rewrite for React Native New Architecture (Fabric).
Key differences from v1:

- **No `estimatedItemSize` prop** — v2 auto-measures items; the old prop is removed.
- **No `stickyHeaderIndices`** — not supported in v2. Section headers scroll with content.
- **Built-in `onRefresh` / `refreshing`** — no need for custom `RefreshControl` wrapper.
- **View recycling via `getItemType`** — still the core optimization; returns the item's
  discriminant (`"header"` or `"transaction"`) so FlashList maintains separate recycling
  pools per type.

#### 2. Flatten Utility (`src/utils/transactions.ts`)

```ts
// Discriminated union for flat list items
type ListItem =
  | { type: "header"; label: string }
  | { type: "transaction"; transaction: Transaction };

function flattenForList(groups: DayGroup[]): ListItem[]
```

Takes the output of `groupByDay()` and interleaves header items before each day's
transactions. This produces a single flat array that FlashList can virtualize efficiently.

#### 3. Component Migration (`TransactionList.tsx`)

**Before:** `ScrollView` + `groups.map()` + nested `group.transactions.map()`
- Renders all items at mount time
- No recycling — off-screen rows stay mounted
- Pull-to-refresh via custom `RefreshControl`

**After:** `FlashList` with flat data
- Only visible rows (+ draw distance buffer) are mounted
- `getItemType` enables separate recycling pools for headers vs rows
- `keyExtractor` uses transaction ID (stable, unique) or header label
- Pull-to-refresh via built-in `refreshing` / `onRefresh` props
- `ListHeader` and `EmptyState` extracted as standalone components (one component per file principle)

#### 4. Type Safety

- Full discriminated union on `ListItem` — `renderItem` narrows via `item.type`
- `readonly` arrays throughout the flatten pipeline
- `npx tsc --noEmit` passes cleanly

---

## Step 4 — Scroll Performance Benchmarking

### Methodology

A built-in **List Benchmark** tool was added to `Settings > Developer Tools`. It runs
a controlled comparison between the old `ScrollView` implementation and the new
`FlashList` implementation using the same dataset.

#### How it works

1. The legacy `ScrollViewList` component is preserved in
   `src/features/transactions/components/ScrollViewList.tsx` — identical to the pre-migration
   code, used only for benchmark comparison.
2. The `ListBenchmark` modal (`ListBenchmark.tsx`) mounts each implementation 3 times
   in a hidden (opacity: 0) view, measuring:
   - **ScrollView**: time from mount to `onLayout` callback (= all items rendered)
   - **FlashList**: `onLoad` callback's `elapsedTimeInMs` (= visible batch rendered)
3. Results show average render time, per-run breakdown, mounted view count, and speedup ratio.

#### What it measures

| Metric | ScrollView | FlashList |
| ------ | ---------- | --------- |
| Initial render time | Time to mount + layout ALL rows | Time to mount + layout VISIBLE rows only |
| Mounted views | N (one per transaction + headers) | ~15–25 (recycling pool) |
| Memory | O(n) — all rows in memory | O(viewport) — constant |

#### How to reproduce

1. Go to Settings → Developer Tools
2. Tap **Stress Test (×10)** to seed 300–500+ transactions
3. Tap **List Benchmark** to open the comparison modal
4. Tap **Start Benchmark** — runs 3 iterations per implementation
5. Review the results card with avg render time + speedup ratio

### Results

**Device:** Android physical device (New Architecture / Fabric)
**Dataset:** 373 transactions across 31 days (404 flat items: 31 headers + 373 rows)
**Iterations:** 3 per implementation

| Metric | ScrollView | FlashList |
| ------ | ---------- | --------- |
| Avg render time | **2,922.5 ms** | **188.3 ms** |
| Run 1 | 2,936.1 ms | 275.0 ms |
| Run 2 | 2,922.8 ms | 142.0 ms |
| Run 3 | 2,908.4 ms | 148.0 ms |
| Mounted views | 373 (all) | ~15–25 (recycled) |

**FlashList is 15.5× faster on initial render.**

### Analysis

- **ScrollView** consistently takes ~2.9 seconds to mount all 373 rows. This is
  blocking — the JS thread is frozen during this time, meaning no touch handling,
  no animations, no navigation.
- **FlashList** renders visible content in ~188 ms on average (first run is 275 ms
  due to cold pool, subsequent runs drop to ~145 ms as recycling kicks in).
- **Memory**: ScrollView keeps all 373 native views alive simultaneously.
  FlashList maintains only ~15–25 views in its recycling pool — an order of
  magnitude reduction in view count.
- The 15.5× speedup is measured at 373 items. At 1,000+ items the gap would widen
  further since ScrollView scales linearly while FlashList stays constant.

---

## Step 5 — Final Metrics & Summary

### Before vs After

| Metric | Before (Phase 5) | After (Phase 6) | Change |
| ------ | ----------------- | ---------------- | ------ |
| Unused deps | 4 packages | 0 | −4 removed |
| List implementation | ScrollView + .map() | FlashList v2 (recycled) | Virtualized |
| Initial render (373 items) | ~2,922 ms | ~188 ms | **15.5× faster** |
| Mounted views (373 items) | 373 (all) | ~15–25 (recycled) | **~93% fewer views** |
| Bundle size (JS) | 6.6 MB | 6.6 MB | Negligible (FlashList is ~6 KB) |
| App code (src/) | 184 KB (2.7%) | ~190 KB (2.8%) | +6 KB (benchmark tool) |

### Key Takeaways

1. **The biggest win is FlashList.** A 15.5× render speedup with 373 items transforms
   the UX from a multi-second freeze to near-instant tab display.
2. **View recycling is the mechanism.** The speedup comes from rendering only visible
   rows (~15–25) instead of all rows (373). Memory usage drops proportionally.
3. **Bundle size is framework-dominated.** App code is <3% of the bundle. react-native
   + reanimated alone are 51%. Optimization efforts at the app level have diminishing
   returns — the real gains are in runtime performance.
4. **Dependency hygiene matters for maintenance, not size.** Removing 4 unused deps
   didn't measurably shrink the bundle (they weren't imported), but it reduces install
   time, avoids phantom auto-linking issues, and keeps the dependency surface clean.
5. **Built-in benchmarking enables reproducibility.** The List Benchmark tool in
   Settings lets anyone re-run these measurements on any device, any dataset size.
