import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { InsightsCard } from "@/features/analytics/components/InsightsCard";
import { MonthOverview } from "@/features/analytics/components/MonthOverview";
import { SpendingSummary } from "@/features/analytics/components/SpendingSummary";
import { useFinanceStore } from "@/stores/finance";
import { computeMonthInsights } from "@/utils/analytics";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export default function Analytics() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { year, month, transactions, summary } = useFinanceStore();

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;
  const insights = useMemo(
    () => computeMonthInsights(transactions, year, month),
    [transactions, year, month],
  );

  return (
    <View className="flex-1 bg-gray-900">
      <View className="px-6" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="flex-row items-center gap-1"
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color="#ffffff"
            />
            <Text className="text-base text-white">Home</Text>
          </Pressable>
          <Text className="text-base font-semibold text-white">Analytics</Text>
          <View style={{ width: 60 }} />
        </View>
      </View>

      <View className="flex-1 p-6 rounded-t-3xl bg-gray-50">
        <Text className="mb-4 text-lg font-semibold text-gray-800">
          {monthLabel}
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
        >
          <MonthOverview
            incomeCents={summary.income}
            expensesCents={summary.expenses}
            balanceCents={summary.balance}
          />

          <SpendingSummary
            transactions={transactions}
            totalExpensesCents={summary.expenses}
          />

          <InsightsCard insights={insights} />
        </ScrollView>
      </View>
    </View>
  );
}
