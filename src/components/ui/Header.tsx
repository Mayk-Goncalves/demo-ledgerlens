import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AccountModal } from "@/components/ui/AccountModal";
import { NotificationsModal } from "@/components/ui/NotificationsModal";

interface HeaderProps {
  readonly children?: React.ReactNode;
  /** Extra bottom padding to reserve space for overlapping content (e.g. BalanceCard bleed). */
  readonly bottomPadding?: number;
}

/** Top header bar with LedgerLens branding and action icons. */
export function Header({ children, bottomPadding = 0 }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

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
          <Pressable onPress={() => setShowNotifications(true)} hitSlop={8}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={22}
              color="#ffffff"
            />
          </Pressable>
          <Pressable onPress={() => setShowAccount(true)} hitSlop={8}>
            <View className="items-center justify-center rounded-full h-9 w-9 bg-white/20">
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={20}
                color="#ffffff"
              />
            </View>
          </Pressable>
        </View>
      </View>

      {children}

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      <AccountModal
        visible={showAccount}
        onClose={() => setShowAccount(false)}
      />
    </View>
  );
}
