import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Text, View } from "react-native";

import { formatCents } from "@/lib/format";
import type { Transaction } from "@/types/transaction";
import { computeCategoryBreakdown } from "@/utils/analytics";

import { CategoryBar } from "./CategoryBar";

/** Map category value → display label. */
const CATEGORY_LABELS: Record<string, string> = {
  food: "Food",
  transport: "Transport",
  housing: "Housing",
  utilities: "Utilities",
  entertainment: "Entertainment",
  health: "Health",
  shopping: "Shopping",
  education: "Education",
  other: "Other",
};

interface SpendingSummaryProps {
  readonly transactions: readonly Transaction[];
  readonly totalExpensesCents: number;
}

export function SpendingSummary({
  transactions,
  totalExpensesCents,
}: SpendingSummaryProps) {
  const breakdown = useMemo(
    () => computeCategoryBreakdown(transactions),
    [transactions],
  );

  if (breakdown.length === 0) {
    return (
      <View className="items-center justify-center rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-sm">
        <MaterialCommunityIcons
          name="chart-bar"
          size={40}
          color="#d1d5db"
        />
        <Text className="mt-3 text-sm text-gray-400">
          No expenses this month
        </Text>
      </View>
    );
  }

  return (
    <View className="rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm">
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-base font-semibold text-gray-800 dark:text-gray-100">
          Spending by Category
        </Text>
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {formatCents(totalExpensesCents)}
        </Text>
      </View>

      {breakdown.map((item) => (
        <CategoryBar
          key={item.category}
          category={item.category}
          label={CATEGORY_LABELS[item.category] ?? item.category}
          amountText={formatCents(item.totalCents)}
          ratio={item.ratio}
          percentage={item.percentage}
        />
      ))}
    </View>
  );
}
