import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import type { TransactionCategory } from "@/types/transaction";

/** Distinct colors for category bars. */
const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  food: "#f97316",
  transport: "#3b82f6",
  housing: "#8b5cf6",
  utilities: "#eab308",
  entertainment: "#ec4899",
  health: "#ef4444",
  shopping: "#14b8a6",
  education: "#6366f1",
  salary: "#10b981",
  freelance: "#06b6d4",
  other: "#6b7280",
};

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const CATEGORY_ICONS: Record<TransactionCategory, IconName> = {
  food: "food",
  transport: "car",
  housing: "home-outline",
  utilities: "lightning-bolt-outline",
  entertainment: "movie-open-outline",
  health: "heart-pulse",
  shopping: "shopping-outline",
  education: "school-outline",
  salary: "cash-multiple",
  freelance: "briefcase-outline",
  other: "swap-horizontal",
};

interface CategoryBarProps {
  readonly category: TransactionCategory;
  readonly label: string;
  readonly amountText: string;
  /** 0–1 fill ratio relative to the top-spending category. */
  readonly ratio: number;
  /** Percentage of total expenses (0–100). */
  readonly percentage: number;
}

export function CategoryBar({
  category,
  label,
  amountText,
  ratio,
  percentage,
}: CategoryBarProps) {
  const color = CATEGORY_COLORS[category];
  const icon = CATEGORY_ICONS[category];

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-row items-center gap-2">
          <View
            className="items-center justify-center w-7 h-7 rounded-full"
            style={{ backgroundColor: `${color}18` }}
          >
            <MaterialCommunityIcons name={icon} size={14} color={color} />
          </View>
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">
            {label}
          </Text>
          <Text className="text-xs text-gray-400">
            {Math.round(percentage)}%
          </Text>
        </View>
        <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {amountText}
        </Text>
      </View>
      <View className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <View
          className="h-full rounded-full"
          style={{
            width: `${Math.max(ratio * 100, 2)}%`,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}
