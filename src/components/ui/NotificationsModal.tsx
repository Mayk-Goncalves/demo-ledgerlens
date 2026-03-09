import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { useNotificationsStore } from "@/stores/notifications";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

interface NotificationsModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

export function NotificationsModal({
  visible,
  onClose,
}: NotificationsModalProps) {
  const notifications = useNotificationsStore((s) => s.notifications);
  const readIds = useNotificationsStore((s) => s.readIds);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);

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

        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3">
            <MaterialCommunityIcons
              name="bell-off-outline"
              size={48}
              color="#d1d5db"
            />
            <Text className="text-base text-gray-400">No notifications</Text>
          </View>
        ) : (
          <ScrollView className="flex-1 mt-4">
            {notifications.map((n) => {
              const isRead = readIds.has(n.id);
              return (
                <View
                  key={n.id}
                  className={`mb-3 rounded-xl p-4 ${isRead ? "bg-gray-50" : "bg-emerald-50 border border-emerald-200"}`}
                >
                  <View className="flex-row items-center gap-2 mb-2">
                    <MaterialCommunityIcons
                      name={n.icon as IconName}
                      size={20}
                      color={isRead ? "#9ca3af" : "#059669"}
                    />
                    <Text
                      className={`flex-1 text-sm font-semibold ${isRead ? "text-gray-500" : "text-gray-900"}`}
                    >
                      {n.title}
                    </Text>
                    {!isRead && (
                      <View className="h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </View>
                  <Text
                    className={`text-sm leading-5 ${isRead ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {n.body}
                  </Text>
                  {!isRead && (
                    <Pressable
                      onPress={() => markAsRead(n.id)}
                      className="mt-3 self-start rounded-lg bg-emerald-600 px-3 py-1.5 active:bg-emerald-700"
                    >
                      <Text className="text-xs font-medium text-white">
                        Mark as read
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}
