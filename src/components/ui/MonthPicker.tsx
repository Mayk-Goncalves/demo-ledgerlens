import { Pressable, Text, View } from "react-native";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

interface MonthPickerProps {
  readonly year: number;
  /** 1-indexed month (1 = January). */
  readonly month: number;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  /** Called when the label is tapped — navigates back to current month. */
  readonly onReset: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();

/** Horizontal month selector with chevron arrows. */
export function MonthPicker({
  year,
  month,
  onPrev,
  onNext,
  onReset,
}: MonthPickerProps) {
  const label =
    year === CURRENT_YEAR
      ? MONTH_NAMES[month - 1]
      : `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <View className="flex-row items-center justify-center mt-2 gap-4">
      <Pressable
        onPress={onPrev}
        hitSlop={12}
        accessibilityLabel="Previous month"
      >
        <Text className="text-lg font-semibold text-white/70 dark:text-gray-500">‹</Text>
      </Pressable>

      <Pressable
        onPress={onReset}
        hitSlop={8}
        accessibilityLabel="Go to current month"
      >
        <Text className="text-xl font-semibold text-emerald-100 dark:text-emerald-700 min-w-[130px] text-center">
          {label}
        </Text>
      </Pressable>

      <Pressable onPress={onNext} hitSlop={12} accessibilityLabel="Next month">
        <Text className="text-lg font-semibold text-white/70 dark:text-gray-500">›</Text>
      </Pressable>
    </View>
  );
}
