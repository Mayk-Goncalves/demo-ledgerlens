import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

import type { Transaction } from "@/types/transaction";

import { TransactionRow } from "./TransactionRow";

interface TransactionListProps {
  readonly transactions: readonly Transaction[];
  readonly loading: boolean;
}

/** Scrollable feed of recent transactions with empty / loading states. */
export function TransactionList({
  transactions,
  loading,
}: TransactionListProps) {
  return (
    <View className="flex-1 mt-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-800">
          Recent Transactions
        </Text>
        <Text className="text-sm text-emerald-600">
          {transactions.length} total
        </Text>
      </View>

      <ScrollView className="flex-1 mt-3" showsVerticalScrollIndicator={false}>
        {transactions.map((tx) => (
          <TransactionRow key={tx.id} transaction={tx} />
        ))}

        {transactions.length === 0 && !loading && (
          <View className="items-center py-12">
            <MaterialCommunityIcons
              name="inbox-outline"
              size={48}
              color="#9ca3af"
            />
            <Text className="mt-3 text-sm text-gray-400">
              No transactions yet. Tap Add above.
            </Text>
          </View>
        )}

        {loading && (
          <View className="items-center py-12">
            <Text className="text-sm text-gray-400">Loading…</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
