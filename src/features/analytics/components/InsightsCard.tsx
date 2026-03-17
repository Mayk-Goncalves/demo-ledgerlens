import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { formatCents } from "@/lib/format";
import type { MonthInsights } from "@/utils/analytics";

interface InsightsCardProps {
  readonly insights: MonthInsights;
}

function InsightRow({
  icon,
  label,
  value,
  color,
}: {
  readonly icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  readonly label: string;
  readonly value: string;
  readonly color: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center gap-3">
        <View
          className="items-center justify-center w-9 h-9 rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <MaterialCommunityIcons name={icon} size={18} color={color} />
        </View>
        <Text className="text-sm text-gray-600 dark:text-gray-400">{label}</Text>
      </View>
      <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">{value}</Text>
    </View>
  );
}

export function InsightsCard({ insights }: InsightsCardProps) {
  return (
    <View className="rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm">
      <Text className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-100">
        Insights
      </Text>

      <InsightRow
        icon="calendar-today"
        label="Daily Average"
        value={formatCents(insights.dailyAvgCents)}
        color="#6366f1"
      />

      {insights.topSpendingDay ? (
        <InsightRow
          icon="fire"
          label={`Top Day (${insights.topSpendingDay.day}${ordinal(insights.topSpendingDay.day)})`}
          value={formatCents(insights.topSpendingDay.totalCents)}
          color="#f97316"
        />
      ) : null}

      <InsightRow
        icon="receipt"
        label="Transactions"
        value={`${insights.transactionCount} total`}
        color="#10b981"
      />

      <InsightRow
        icon="cart-outline"
        label="Expenses"
        value={`${insights.expenseCount} transactions`}
        color="#ef4444"
      />
    </View>
  );
}

/** Simple ordinal suffix for day numbers: 1st, 2nd, 3rd, 4th, etc. */
function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
