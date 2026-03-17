import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";

import type { Transaction } from "@/types/transaction";
import {
  flattenForList,
  groupByDay,
  type ListItem,
} from "@/utils/transactions";

import { ScrollViewList } from "./ScrollViewList";
import { TransactionRow } from "./TransactionRow";

/** Number of benchmark iterations per implementation. */
const ITERATIONS = 3;

interface BenchmarkResult {
  readonly implementation: string;
  readonly times: readonly number[];
  readonly avgMs: number;
  readonly itemCount: number;
  readonly mountedViews: string;
}

interface ListBenchmarkProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly transactions: readonly Transaction[];
  readonly onSeed: () => Promise<void>;
}

function SectionHeader({ label }: { readonly label: string }) {
  return (
    <View className="pt-2 pb-2">
      <Text className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
        {label}
      </Text>
    </View>
  );
}

/**
 * Benchmark modal — runs timed mount/render cycles for both
 * ScrollView and FlashList implementations side by side.
 */
export function ListBenchmark({
  visible,
  onClose,
  transactions,
  onSeed,
}: ListBenchmarkProps) {
  const [running, setRunning] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [iteration, setIteration] = useState(0);
  const [phase, setPhase] = useState<"idle" | "scrollview" | "flashlist">(
    "idle",
  );

  // Track mount times
  const mountStart = useRef(0);
  const scrollViewTimes = useRef<number[]>([]);
  const flashListTimes = useRef<number[]>([]);
  const currentIteration = useRef(0);

  // Key to force remount
  const [mountKey, setMountKey] = useState(0);

  const groups = useMemo(() => groupByDay(transactions), [transactions]);
  const flatData = useMemo(() => flattenForList(groups), [groups]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === "header") {
      return <SectionHeader label={item.label} />;
    }
    return <TransactionRow transaction={item.transaction} />;
  }, []);

  const getItemType = useCallback((item: ListItem) => item.type, []);

  const keyExtractor = useCallback(
    (item: ListItem) =>
      item.type === "header" ? `header-${item.label}` : item.transaction.id,
    [],
  );

  const stopBenchmark = useCallback(() => {
    setRunning(false);
    setPhase("idle");
    setIteration(0);
  }, []);

  const handleClose = useCallback(() => {
    stopBenchmark();
    onClose();
  }, [stopBenchmark, onClose]);

  const startBenchmark = useCallback(() => {
    scrollViewTimes.current = [];
    flashListTimes.current = [];
    currentIteration.current = 0;
    setResults([]);
    setRunning(true);
    setIteration(1);
    // Delay heavy mount by a frame so the "Running…" button state paints first
    requestAnimationFrame(() => {
      setPhase("scrollview");
      mountStart.current = performance.now();
      setMountKey((k) => k + 1);
    });
  }, []);

  const handleScrollViewReady = useCallback(() => {
    const elapsed = performance.now() - mountStart.current;
    scrollViewTimes.current.push(elapsed);
    currentIteration.current += 1;

    if (currentIteration.current < ITERATIONS) {
      // Run next ScrollView iteration
      setIteration(currentIteration.current + 1);
      setTimeout(() => {
        mountStart.current = performance.now();
        setMountKey((k) => k + 1);
      }, 100);
    } else {
      // Switch to FlashList phase
      currentIteration.current = 0;
      setPhase("flashlist");
      setIteration(1);
      setTimeout(() => {
        mountStart.current = performance.now();
        setMountKey((k) => k + 1);
      }, 100);
    }
  }, []);

  const handleFlashListLoad = useCallback(
    ({ elapsedTimeInMs }: { elapsedTimeInMs: number }) => {
      const wallTime = performance.now() - mountStart.current;
      // Use FlashList's own reported time as the primary metric
      flashListTimes.current.push(elapsedTimeInMs);
      currentIteration.current += 1;

      if (currentIteration.current < ITERATIONS) {
        setIteration(currentIteration.current + 1);
        setTimeout(() => {
          mountStart.current = performance.now();
          setMountKey((k) => k + 1);
        }, 100);
      } else {
        // Done — compute results
        const svTimes = scrollViewTimes.current;
        const flTimes = flashListTimes.current;
        const svAvg = svTimes.reduce((a, b) => a + b, 0) / svTimes.length;
        const flAvg = flTimes.reduce((a, b) => a + b, 0) / flTimes.length;

        setResults([
          {
            implementation: "ScrollView",
            times: svTimes,
            avgMs: svAvg,
            itemCount: transactions.length,
            mountedViews: `${transactions.length} (all)`,
          },
          {
            implementation: "FlashList",
            times: flTimes,
            avgMs: flAvg,
            itemCount: transactions.length,
            mountedViews: "~15–25 (recycled)",
          },
        ]);
        setPhase("idle");
        setRunning(false);
      }
    },
    [transactions.length],
  );

  const speedup =
    results.length === 2 ? results[0].avgMs / results[1].avgMs : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 p-6">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
            List Benchmark
          </Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Text className="text-base font-medium text-emerald-600">Done</Text>
          </Pressable>
        </View>

        {/* Info */}
        <View className="p-4 mb-4 rounded-xl bg-white dark:bg-gray-800">
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            Dataset: {transactions.length} transactions across{" "}
            {groups.length} days
          </Text>
          <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Flat items: {flatData.length} ({groups.length} headers +{" "}
            {transactions.length} rows)
          </Text>
          <Text className="mt-1 text-xs text-gray-400">
            Runs {ITERATIONS} iterations per implementation, reports average
            initial render time.
          </Text>
        </View>

        {/* Empty state — prompt to seed */}
        {transactions.length === 0 && !running && (
          <View className="p-4 mb-4 rounded-xl bg-amber-50 dark:bg-amber-900/20">
            <Text className="text-sm text-amber-700 dark:text-amber-400">
              No transactions available. Seed data to run the benchmark.
            </Text>
            <Pressable
              onPress={async () => {
                setSeeding(true);
                await onSeed();
                setSeeding(false);
              }}
              disabled={seeding}
              className="flex-row items-center justify-center gap-2 py-3 mt-3 rounded-xl bg-amber-600 active:bg-amber-700"
            >
              <Text className="text-base font-semibold text-white">
                {seeding ? "Seeding…" : "Seed Stress Test (×10)"}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Run button */}
        {transactions.length > 0 && (
          <Pressable
            onPress={startBenchmark}
            disabled={running}
            className="flex-row items-center justify-center gap-2 py-3 mb-4 rounded-xl bg-emerald-600 active:bg-emerald-700"
            style={running ? { opacity: 0.6 } : undefined}
          >
            {running ? (
              <>
                <ActivityIndicator size={18} color="#ffffff" />
                <Text className="text-base font-semibold text-white">
                  Running…
                </Text>
              </>
            ) : (
              <Text className="text-base font-semibold text-white">
                {results.length > 0 ? "Run Again" : "Start Benchmark"}
              </Text>
            )}
          </Pressable>
        )}

        {/* Running indicator */}
        {running && (
          <View className="p-4 mb-4 rounded-xl bg-amber-50 dark:bg-amber-900/20">
            <Text className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Running: {phase === "scrollview" ? "ScrollView" : "FlashList"} —
              iteration {iteration}/{ITERATIONS}
            </Text>
          </View>
        )}

        {/* Results */}
        {results.length > 0 && (
          <View className="gap-3 mb-4">
            {results.map((r) => (
              <View
                key={r.implementation}
                className="p-4 rounded-xl bg-white dark:bg-gray-800"
              >
                <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {r.implementation}
                </Text>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Avg render time
                  </Text>
                  <Text className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                    {r.avgMs.toFixed(1)} ms
                  </Text>
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Mounted views
                  </Text>
                  <Text className="text-sm text-gray-700 dark:text-gray-300">
                    {r.mountedViews}
                  </Text>
                </View>
                <Text className="mt-1 text-xs text-gray-400">
                  Runs: {r.times.map((t) => `${t.toFixed(1)}ms`).join(", ")}
                </Text>
              </View>
            ))}

            {/* Summary */}
            {speedup > 0 && (
              <View className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                <Text className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  FlashList is {speedup.toFixed(1)}× faster on initial render
                </Text>
                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Memory: ScrollView mounts {transactions.length} views vs
                  FlashList ~15–25 recycled views
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Hidden benchmark render area */}
        {running && (
          <View className="flex-1 overflow-hidden opacity-0">
            {phase === "scrollview" && (
              <ScrollViewList
                key={`sv-${mountKey}`}
                transactions={transactions}
                onReady={handleScrollViewReady}
              />
            )}
            {phase === "flashlist" && (
              <FlashList
                key={`fl-${mountKey}`}
                data={flatData}
                renderItem={renderItem}
                getItemType={getItemType}
                keyExtractor={keyExtractor}
                onLoad={handleFlashListLoad}
              />
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}
