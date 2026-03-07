import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";

interface NotificationsModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

export function NotificationsModal({
  visible,
  onClose,
}: NotificationsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white px-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center justify-between pb-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900">
            Notifications
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
          </Pressable>
        </View>

        {/* Empty state */}
        <View className="flex-1 items-center justify-center gap-3">
          <MaterialCommunityIcons
            name="bell-off-outline"
            size={48}
            color="#d1d5db"
          />
          <Text className="text-base text-gray-400">No notifications</Text>
        </View>
      </View>
    </Modal>
  );
}
