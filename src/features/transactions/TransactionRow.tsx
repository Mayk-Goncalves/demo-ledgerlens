import { memo } from "react";
import { Text, View } from "react-native";

import { formatCents } from "@/lib/format";
import type { Transaction } from "@/types/transaction";

/** Emoji icon for a given transaction category. */
const CATEGORY_ICONS: Record<string, string> = {
  food: "🍔",
  transport: "🚗",
  entertainment: "🎬",
  shopping: "🛍️",
  salary: "💰",
  freelance: "💼",
};

const DEFAULT_ICON = "💸";

/** Sign prefix by transaction type. */
const SIGN: Record<string, string> = {
  income: "+",
  expense: "-",
  credit_card: "-",
};

interface TransactionRowProps {
  readonly transaction: Transaction;
}

/** A single transaction row in the feed. Memoized to avoid list re-render churn. */
export const TransactionRow = memo(function TransactionRow({
  transaction,
}: TransactionRowProps) {
  const icon = CATEGORY_ICONS[transaction.category] ?? DEFAULT_ICON;
  const sign = SIGN[transaction.type] ?? "";
  const isIncome = transaction.type === "income";

  return (
    <View className="mb-2.5 flex-row items-center rounded-xl bg-white p-4 shadow-sm">
      <View className="items-center justify-center w-10 h-10 rounded-full bg-emerald-50">
        <Text className="text-lg">{icon}</Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-sm font-medium text-gray-800 capitalize">
          {transaction.category}
        </Text>
        {transaction.note ? (
          <Text className="mt-0.5 text-xs text-gray-400">
            {transaction.note}
          </Text>
        ) : null}
      </View>
      <View className="items-end">
        <Text
          className={`text-sm font-semibold ${isIncome ? "text-emerald-600" : "text-gray-900"}`}
        >
          {sign}
          {formatCents(transaction.amount)}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-300">
          {new Date(transaction.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
});
