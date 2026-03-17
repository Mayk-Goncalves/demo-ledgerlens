import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { resetDatabase } from "@/lib/database";
import { seedMonth } from "@/lib/seed";
import { useFinanceStore } from "@/stores/finance";

export default function SettingsTab() {
  const insets = useSafeAreaInsets();
  const reload = useFinanceStore((s) => s.reload);
  const year = useFinanceStore((s) => s.year);
  const month = useFinanceStore((s) => s.month);
  const { colorScheme, toggleColorScheme } = useColorScheme();

  async function handleSeedMonth() {
    const count = await seedMonth(year, month);
    await reload();
    Alert.alert("Done", `Added ${count} sample transactions.`);
  }

  async function handleStressTest() {
    const count = await seedMonth(year, month, 10);
    await reload();
    Alert.alert("Stress Test", `Added ${count} transactions for profiling.`);
  }

  function handleClearDatabase() {
    Alert.alert(
      "Clear Database",
      "This will delete all transactions. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await resetDatabase();
            await reload();
          },
        },
      ],
    );
  }

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
            >
              <MaterialCommunityIcons
                name="database-plus-outline"
                size={22}
                color="#059669"
              />
              <Text className="text-base font-medium text-emerald-700 dark:text-emerald-400">
                Seed Current Month
              </Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 active:bg-amber-100 dark:active:bg-amber-900/40"
              onPress={handleStressTest}
            >
              <MaterialCommunityIcons
                name="speedometer"
                size={22}
                color="#d97706"
              />
              <Text className="text-base font-medium text-amber-700 dark:text-amber-400">
                Stress Test (×10)
              </Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/40"
              onPress={handleClearDatabase}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={22}
                color="#dc2626"
              />
              <Text className="text-base font-medium text-red-600 dark:text-red-400">
                Clear Database
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
    </View>
  );
}
