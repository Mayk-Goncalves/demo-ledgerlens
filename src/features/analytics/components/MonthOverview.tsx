import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { formatCents } from "@/lib/format";

interface MonthOverviewProps {
  readonly incomeCents: number;
  readonly expensesCents: number;
  readonly balanceCents: number;
}

export function MonthOverview({
  incomeCents,
  expensesCents,
  balanceCents,
}: MonthOverviewProps) {
  const total = incomeCents + expensesCents;
  const incomeRatio = total > 0 ? incomeCents / total : 0.5;

  return (
    <View className="rounded-2xl bg-white p-5 shadow-sm">
      <Text className="mb-4 text-base font-semibold text-gray-800">
        Income vs Expenses
      </Text>

      {/* Stacked bar */}
      <View className="h-4 flex-row overflow-hidden rounded-full bg-gray-100">
        <View
          className="h-full rounded-l-full"
          style={{
            width: `${Math.max(incomeRatio * 100, 2)}%`,
            backgroundColor: "#10b981",
          }}
        />
        <View
          className="h-full rounded-r-full"
          style={{
            width: `${Math.max((1 - incomeRatio) * 100, 2)}%`,
            backgroundColor: "#f43f5e",
          }}
        />
      </View>

      {/* Legend */}
      <View className="flex-row justify-between mt-4">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-emerald-500" />
          <View>
            <Text className="text-xs text-gray-400">Income</Text>
            <Text className="text-sm font-semibold text-gray-800">
              {formatCents(incomeCents)}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-rose-500" />
          <View>
            <Text className="text-xs text-gray-400">Expenses</Text>
            <Text className="text-sm font-semibold text-gray-800">
              {formatCents(expensesCents)}
            </Text>
          </View>
        </View>
      </View>

      {/* Balance */}
      <View className="flex-row items-center justify-between pt-4 mt-4 border-t border-gray-100">
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            name={balanceCents >= 0 ? "trending-up" : "trending-down"}
            size={18}
            color={balanceCents >= 0 ? "#10b981" : "#f43f5e"}
          />
          <Text className="text-sm text-gray-500">Net Balance</Text>
        </View>
        <Text
          className={`text-base font-bold ${balanceCents >= 0 ? "text-emerald-600" : "text-rose-600"}`}
        >
          {formatCents(Math.abs(balanceCents))}
        </Text>
      </View>
    </View>
  );
}
