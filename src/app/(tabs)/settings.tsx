import { MaterialCommunityIcons } from "@expo/vector-icons";
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
    <View className="flex-1 bg-gray-900">
      <View className="px-6" style={{ paddingTop: insets.top + 12 }}>
        <Text className="mb-4 text-2xl font-bold text-white">Settings</Text>
      </View>

      <View className="flex-1 p-6 rounded-t-3xl bg-gray-50">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Profile */}
          <View className="items-center gap-3 py-6">
            <View className="items-center justify-center w-20 h-20 rounded-full bg-emerald-100">
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={48}
                color="#059669"
              />
            </View>
            <Text className="text-xl font-semibold text-gray-900">
              John Doe
            </Text>
          </View>

          {/* Dev Tools */}
          <Text className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Developer Tools
          </Text>
          <View className="gap-3">
            <Pressable
              className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 active:bg-emerald-100"
              onPress={handleSeedMonth}
            >
              <MaterialCommunityIcons
                name="database-plus-outline"
                size={22}
                color="#059669"
              />
              <Text className="text-base font-medium text-emerald-700">
                Seed Current Month
              </Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 active:bg-amber-100"
              onPress={handleStressTest}
            >
              <MaterialCommunityIcons
                name="speedometer"
                size={22}
                color="#d97706"
              />
              <Text className="text-base font-medium text-amber-700">
                Stress Test (×10)
              </Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-red-50 active:bg-red-100"
              onPress={handleClearDatabase}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={22}
                color="#dc2626"
              />
              <Text className="text-base font-medium text-red-600">
                Clear Database
              </Text>
            </Pressable>
          </View>

          {/* About */}
          <Text className="mt-8 mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            About
          </Text>
          <View className="gap-0.5 rounded-xl bg-white p-4 shadow-sm">
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-500">App</Text>
              <Text className="text-sm font-medium text-gray-800">
                LedgerLens
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-500">Version</Text>
              <Text className="text-sm font-medium text-gray-800">1.0.0</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-500">Framework</Text>
              <Text className="text-sm font-medium text-gray-800">
                Expo SDK 54
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-500">Architecture</Text>
              <Text className="text-sm font-medium text-gray-800">
                New Architecture
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
