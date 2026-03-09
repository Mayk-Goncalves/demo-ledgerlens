import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import type { Transaction } from "@/types/transaction";
import { groupByDay } from "@/utils/transactions";

import { TransactionRow } from "./TransactionRow";

interface TransactionListProps {
  readonly transactions: readonly Transaction[];
  readonly loading: boolean;
  readonly onRefresh: () => void;
}

/** Scrollable feed of recent transactions grouped by day. */
export function TransactionList({
  transactions,
  loading,
  onRefresh,
}: TransactionListProps) {
  const groups = useMemo(() => groupByDay(transactions), [transactions]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={loading}
        onRefresh={onRefresh}
        tintColor="#059669"
        colors={["#059669"]}
      />
    ),
    [loading, onRefresh],
  );

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

      <ScrollView
        className="flex-1 mt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
        refreshControl={refreshControl}
      >
        {groups.map((group) => (
          <View key={group.label} className="mb-2">
            <Text className="mb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">
              {group.label}
            </Text>
            {group.transactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </View>
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
