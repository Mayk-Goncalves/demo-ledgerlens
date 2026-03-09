import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, Modal, Pressable, Text, View } from "react-native";

import { resetDatabase } from "@/lib/database";
import { seedMonth } from "@/lib/seed";
import { useFinanceStore } from "@/stores/finance";

interface AccountModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

export function AccountModal({ visible, onClose }: AccountModalProps) {
  const reload = useFinanceStore((s) => s.reload);
  const year = useFinanceStore((s) => s.year);
  const month = useFinanceStore((s) => s.month);

  async function handleSeedMonth() {
    const count = await seedMonth(year, month);
    await reload();
    Alert.alert("Done", `Added ${count} sample transactions.`);
  }

  function handleClearDatabase() {
    Alert.alert(
      "Clear Database",
      "This will delete all transactions. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await resetDatabase();
            await reload();
            onClose();
          },
        },
      ],
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 px-6 pt-4 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between pb-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900">Account</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
          </Pressable>
        </View>

        {/* Profile */}
        <View className="items-center gap-3 py-8">
          <View className="items-center justify-center w-20 h-20 rounded-full bg-emerald-100">
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={48}
              color="#059669"
            />
          </View>
          <Text className="text-xl font-semibold text-gray-900">John Doe</Text>
        </View>

        {/* Actions */}
        <View className="gap-3">
          {/* Seed Month */}
          <Pressable
            className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50"
            onPress={handleSeedMonth}
          >
            <MaterialCommunityIcons
              name="database-plus-outline"
              size={22}
              color="#059669"
            />
            <Text className="text-base font-medium text-emerald-700">
              Seed Current Month
            </Text>
          </Pressable>

          {/* Clear Database */}
          <Pressable
            className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-red-50"
            onPress={handleClearDatabase}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={22}
              color="#dc2626"
            />
            <Text className="text-base font-medium text-red-600">
              Clear Database
            </Text>
          </Pressable>

          {/* Log Out — disabled */}
          <View className="flex-row items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl opacity-40">
            <MaterialCommunityIcons name="logout" size={22} color="#6b7280" />
            <Text className="text-base font-medium text-gray-500">Log Out</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
