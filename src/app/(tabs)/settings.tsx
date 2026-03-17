import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ListBenchmark } from "@/features/transactions/components/ListBenchmark";
import { resetDatabase } from "@/lib/database";
import { seedMonth } from "@/lib/seed";
import { useFinanceStore } from "@/stores/finance";

type BusyAction = "seed" | "stress" | "clear" | null;

export default function SettingsTab() {
  const insets = useSafeAreaInsets();
  const reload = useFinanceStore((s) => s.reload);
  const year = useFinanceStore((s) => s.year);
  const month = useFinanceStore((s) => s.month);
  const transactions = useFinanceStore((s) => s.transactions);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [busy, setBusy] = useState<BusyAction>(null);

  const handleSeedMonth = useCallback(async () => {
    setBusy("seed");
    const count = await seedMonth(year, month);
    await reload();
    setBusy(null);
    Alert.alert("Done", `Added ${count} sample transactions.`);
  }, [year, month, reload]);

  const handleStressTest = useCallback(async () => {
    setBusy("stress");
    const count = await seedMonth(year, month, 10);
    await reload();
    setBusy(null);
    Alert.alert("Stress Test", `Added ${count} transactions for profiling.`);
  }, [year, month, reload]);

  const handleClearDatabase = useCallback(() => {
    Alert.alert(
      "Clear Database",
      "This will delete all transactions. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setBusy("clear");
            await resetDatabase();
            await reload();
            setBusy(null);
          },
        },
      ],
    );
  }, [reload]);

  return (
    <View className="flex-1 bg-gray-900 dark:bg-gray-100">
      <View className="px-6" style={{ paddingTop: insets.top + 12 }}>
        <Text className="mb-4 text-2xl font-bold text-white dark:text-gray-900">Settings</Text>
      </View>

      <View className="flex-1 p-6 rounded-t-3xl bg-gray-50 dark:bg-gray-900">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Profile */}
          <View className="items-center gap-3 py-6">
            <View className="items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={48}
                color="#059669"
              />
            </View>
            <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              John Doe
            </Text>
          </View>

          {/* Appearance */}
          <Text className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Appearance
          </Text>
          <Pressable
            onPress={toggleColorScheme}
            className="flex-row items-center justify-between px-4 py-3 mb-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <View className="flex-row items-center gap-3">
              <MaterialCommunityIcons
                name={colorScheme === "dark" ? "moon-waning-crescent" : "white-balance-sunny"}
                size={20}
                color={colorScheme === "dark" ? "#9ca3af" : "#f59e0b"}
              />
              <Text className="text-base font-medium text-gray-800 dark:text-gray-100">
                Dark Mode
              </Text>
            </View>
            <View
              className={`w-12 h-7 rounded-full p-0.5 ${
                colorScheme === "dark" ? "bg-emerald-600" : "bg-gray-300"
              }`}
            >
              <View
                className={`w-6 h-6 rounded-full bg-white shadow-sm ${
                  colorScheme === "dark" ? "ml-auto" : ""
                }`}
              />
            </View>
          </Pressable>

          {/* Dev Tools */}
          <Text className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Developer Tools
          </Text>
          <View className="gap-3">
            <Pressable
              className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 active:bg-emerald-100 dark:active:bg-emerald-900/40"
              onPress={handleSeedMonth}
              disabled={busy !== null}
              style={busy && busy !== "seed" ? { opacity: 0.4 } : undefined}
            >
              {busy === "seed" ? (
                <ActivityIndicator size={22} color="#059669" />
              ) : (
                <MaterialCommunityIcons
                  name="database-plus-outline"
                  size={22}
                  color="#059669"
                />
              )}
              <Text className="text-base font-medium text-emerald-700 dark:text-emerald-400">
                {busy === "seed" ? "Seeding…" : "Seed Current Month"}
              </Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 active:bg-amber-100 dark:active:bg-amber-900/40"
              onPress={handleStressTest}
              disabled={busy !== null}
              style={busy && busy !== "stress" ? { opacity: 0.4 } : undefined}
            >
              {busy === "stress" ? (
                <ActivityIndicator size={22} color="#d97706" />
              ) : (
                <MaterialCommunityIcons
                  name="speedometer"
                  size={22}
                  color="#d97706"
                />
              )}
              <Text className="text-base font-medium text-amber-700 dark:text-amber-400">
                {busy === "stress" ? "Seeding…" : "Stress Test (×10)"}
              </Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 active:bg-indigo-100 dark:active:bg-indigo-900/40"
              onPress={() => setShowBenchmark(true)}
              disabled={busy !== null}
              style={busy ? { opacity: 0.4 } : undefined}
            >
              <MaterialCommunityIcons
                name="chart-timeline-variant-shimmer"
                size={22}
                color="#6366f1"
              />
              <Text className="text-base font-medium text-indigo-700 dark:text-indigo-400">
                List Benchmark
              </Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/40"
              onPress={handleClearDatabase}
              disabled={busy !== null}
              style={busy && busy !== "clear" ? { opacity: 0.4 } : undefined}
            >
              {busy === "clear" ? (
                <ActivityIndicator size={22} color="#dc2626" />
              ) : (
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={22}
                  color="#dc2626"
                />
              )}
              <Text className="text-base font-medium text-red-600 dark:text-red-400">
                {busy === "clear" ? "Clearing…" : "Clear Database"}
              </Text>
            </Pressable>
          </View>

          {/* About */}
          <Text className="mt-8 mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            About
          </Text>
          <View className="gap-0.5 rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm">
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">App</Text>
              <Text className="text-sm font-medium text-gray-800 dark:text-gray-100">
                LedgerLens
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Version</Text>
              <Text className="text-sm font-medium text-gray-800 dark:text-gray-100">1.0.0</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Framework</Text>
              <Text className="text-sm font-medium text-gray-800 dark:text-gray-100">
                Expo SDK 54
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Architecture</Text>
              <Text className="text-sm font-medium text-gray-800 dark:text-gray-100">
                New Architecture
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <ListBenchmark
        visible={showBenchmark}
        onClose={() => setShowBenchmark(false)}
        transactions={transactions}
        onSeed={async () => {
          await seedMonth(year, month, 10);
          await reload();
        }}
      />
    </View>
  );
}
