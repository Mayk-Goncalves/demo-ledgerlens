import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, Text, View, type LayoutChangeEvent } from "react-native";

import { formatCents } from "@/lib/format";

interface BalanceCardProps {
  /** Net balance in cents (income − expenses). */
  readonly balanceCents: number;
  /** Total income in cents for the month. */
  readonly incomeCents: number;
  /** Total expenses in cents for the month. */
  readonly expensesCents: number;
  /** Called once the card measures itself, with the bleed offset in px. */
  readonly onBleedMeasured?: (bleed: number) => void;
}

/** Parent's top padding (p-6 = 24px). Subtracted so the card truly sits 50 % above the content edge. */
const PARENT_PADDING_TOP = 24;

/** A single summary line inside the card. */
function SummaryItem({
  label,
  cents,
  visible,
  color,
}: {
  readonly label: string;
  readonly cents: number;
  readonly visible: boolean;
  readonly color: string;
}) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-xs text-emerald-200">{label}</Text>
      <Text className={`mt-0.5 text-sm font-semibold ${color}`}>
        {visible ? formatCents(cents) : "••••"}
      </Text>
    </View>
  );
}

/**
 * Credit-card-style balance display with monthly breakdown.
 * Bleeds upward by 50 % of its own height into the header zone.
 */
export function BalanceCard({
  balanceCents,
  incomeCents,
  expensesCents,
  onBleedMeasured,
}: BalanceCardProps) {
  const [visible, setVisible] = useState(true);
  const [cardHeight, setCardHeight] = useState(0);
  const router = useRouter();

  const bleed = cardHeight ? cardHeight / 2 + PARENT_PADDING_TOP : 0;

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const height = e.nativeEvent.layout.height;
      setCardHeight(height);
      onBleedMeasured?.(height / 2 + PARENT_PADDING_TOP);
    },
    [onBleedMeasured],
  );

  return (
    <View
      onLayout={handleLayout}
      className="rounded-2xl bg-emerald-600 p-6"
      style={{ marginTop: bleed ? -bleed : 0 }}
    >
      {/* Balance header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-emerald-200">Balance</Text>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => setVisible((v) => !v)}
            className="items-center justify-center w-8 h-8 rounded-full bg-emerald-500/30 active:bg-emerald-500/50"
            hitSlop={6}
          >
            <MaterialCommunityIcons
              name={visible ? "eye-outline" : "eye-off-outline"}
              size={16}
              color="#a7f3d0"
            />
          </Pressable>
          <Pressable
            onPress={() => router.push("/analytics")}
            className="items-center justify-center w-8 h-8 rounded-full bg-emerald-500/30 active:bg-emerald-500/50"
            hitSlop={6}
          >
            <MaterialCommunityIcons
              name="chart-bar"
              size={16}
              color="#a7f3d0"
            />
          </Pressable>
        </View>
      </View>
      <Text className="mt-1 text-4xl font-bold text-white">
        {visible ? formatCents(balanceCents) : "••••••"}
      </Text>

      {/* Monthly breakdown */}
      <View className="mt-4 flex-row border-t border-emerald-500/40 pt-4">
        <SummaryItem
          label="Income"
          cents={incomeCents}
          visible={visible}
          color="text-white"
        />
        <SummaryItem
          label="Expenses"
          cents={expensesCents}
          visible={visible}
          color="text-white"
        />
      </View>
    </View>
  );
}
