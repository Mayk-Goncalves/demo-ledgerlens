import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo } from "react";
import { Text, View } from "react-native";

import type { Transaction } from "@/types/transaction";
import {
  flattenForList,
  groupByDay,
  type ListItem,
} from "@/utils/transactions";

import { TransactionRow } from "./TransactionRow";

interface TransactionListProps {
  readonly transactions: readonly Transaction[];
  readonly loading: boolean;
  readonly onRefresh: () => void;
}

function ListHeader({ count }: { readonly count: number }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Recent Transactions
      </Text>
      <Text className="text-sm text-emerald-600">{count} total</Text>
    </View>
  );
}

function SectionHeader({ label }: { readonly label: string }) {
  return (
    <View className="pt-2 pb-2 bg-gray-50 dark:bg-gray-900">
      <Text className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase">
        {label}
      </Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="items-center py-12">
      <MaterialCommunityIcons name="inbox-outline" size={48} color="#9ca3af" />
      <Text className="mt-3 text-sm text-gray-400">
        No transactions yet. Tap Add above.
      </Text>
    </View>
  );
}

/** Scrollable feed of recent transactions grouped by day (FlashList). */
export function TransactionList({
  transactions,
  loading,
  onRefresh,
}: TransactionListProps) {
  const groups = useMemo(() => groupByDay(transactions), [transactions]);
  const data = useMemo(() => flattenForList(groups), [groups]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === "header") {
      return <SectionHeader label={item.label} />;
    }
    return <TransactionRow transaction={item.transaction} />;
  }, []);

  const getItemType = useCallback(
    (item: ListItem) => item.type,
    [],
  );

  return (
    <View className="flex-1 mt-6 px-2">
      <ListHeader count={transactions.length} />

      {transactions.length === 0 && !loading ? (
        <EmptyState />
      ) : (
        <FlashList
          data={data}
          renderItem={renderItem}
          getItemType={getItemType}
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={onRefresh}
          keyExtractor={keyExtractor}
        />
      )}

      {loading && transactions.length === 0 && (
        <View className="items-center py-12">
          <Text className="text-sm text-gray-400">Loading…</Text>
        </View>
      )}
    </View>
  );
}

function keyExtractor(item: ListItem, index: number): string {
  if (item.type === "header") {
    return `header-${item.label}`;
  }
  return item.transaction.id;
}
