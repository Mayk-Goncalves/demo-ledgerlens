import { MaterialCommunityIcons } from "@expo/vector-icons";
import { memo, useCallback, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { formatCents } from "@/lib/format";
import type { Transaction } from "@/types/transaction";

import { ReceiptImageModal } from "./ReceiptImageModal";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

/** Icon name for a given transaction category. */
const CATEGORY_ICONS: Record<string, IconName> = {
  food: "food",
  transport: "car",
  entertainment: "movie-open-outline",
  shopping: "shopping-outline",
  salary: "cash-multiple",
  freelance: "briefcase-outline",
  housing: "home-outline",
  utilities: "lightning-bolt-outline",
  health: "heart-pulse",
  education: "school-outline",
  other: "swap-horizontal",
};

const DEFAULT_ICON: IconName = "swap-horizontal";

/** Sign prefix by transaction type. */
const SIGN: Record<string, string> = {
  income: "+",
  expense: "-",
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
  const [showReceipt, setShowReceipt] = useState(false);

  const handleReceiptPress = useCallback(() => setShowReceipt(true), []);
  const handleReceiptClose = useCallback(() => setShowReceipt(false), []);

  return (
    <View className="mb-2.5 flex-row items-center rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm">
      <View className="items-center justify-center w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30">
        <MaterialCommunityIcons name={icon} size={20} color="#059669" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-sm font-medium text-gray-800 dark:text-gray-100 capitalize">
          {transaction.category}
        </Text>
        {transaction.note ? (
          <Text className="mt-0.5 text-xs text-gray-400">
            {transaction.note}
          </Text>
        ) : null}
      </View>
      {transaction.receiptUri ? (
        <Pressable
          onPress={handleReceiptPress}
          hitSlop={10}
          className="items-center justify-center w-9 h-9 mr-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
        >
          <MaterialCommunityIcons
            name="camera-outline"
            size={18}
            color="#6b7280"
          />
        </Pressable>
      ) : null}
      <View className="items-end">
        <Text
          className={`text-sm font-semibold ${isIncome ? "text-emerald-600" : "text-gray-900 dark:text-gray-100"}`}
        >
          {sign}
          {formatCents(transaction.amount)}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-300 dark:text-gray-500">
          {new Date(transaction.createdAt).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </Text>
      </View>

      {transaction.receiptUri ? (
        <ReceiptImageModal
          visible={showReceipt}
          uri={transaction.receiptUri}
          onClose={handleReceiptClose}
        />
      ) : null}
    </View>
  );
});
