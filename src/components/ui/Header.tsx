import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  readonly children?: React.ReactNode;
  /** Extra bottom padding to reserve space for overlapping content (e.g. BalanceCard bleed). */
  readonly bottomPadding?: number;
}

/** Top header bar with LedgerLens branding and action icons. */
export function Header({ children, bottomPadding = 0 }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="px-6 pb-2"
      style={{ paddingTop: insets.top + 12, paddingBottom: bottomPadding }}
    >
      {/* Top row: branding + icons */}
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl">
          <Text className="font-bold text-white">Ledger</Text>
          <Text className="font-light text-emerald-200">Lens</Text>
        </Text>
        <View className="flex-row items-center gap-4">
          <MaterialCommunityIcons
            name="bell-outline"
            size={22}
            color="#ffffff"
          />
          <View className="items-center justify-center rounded-full h-9 w-9 bg-white/20">
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={20}
              color="#ffffff"
            />
          </View>
        </View>
      </View>

      {children}
    </View>
  );
}
