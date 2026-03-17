import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";

import type { Transaction } from "@/types/transaction";
import { groupByDay } from "@/utils/transactions";

import { TransactionRow } from "./TransactionRow";

interface ScrollViewListProps {
  readonly transactions: readonly Transaction[];
  readonly onReady: () => void;
}

/**
 * Legacy ScrollView-based transaction list — kept only for benchmark
 * comparison against FlashList. Not used in production UI.
 */
export function ScrollViewList({
  transactions,
  onReady,
}: ScrollViewListProps) {
  const groups = useMemo(() => groupByDay(transactions), [transactions]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 16 }}
      onLayout={onReady}
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

      {transactions.length === 0 && (
        <View className="items-center py-12">
          <MaterialCommunityIcons
            name="inbox-outline"
            size={48}
            color="#9ca3af"
          />
          <Text className="mt-3 text-sm text-gray-400">No data</Text>
        </View>
      )}
    </ScrollView>
  );
}
