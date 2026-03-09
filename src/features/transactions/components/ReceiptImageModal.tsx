import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Modal, Pressable, View } from "react-native";

interface ReceiptImageModalProps {
  readonly visible: boolean;
  readonly uri: string;
  readonly onClose: () => void;
}

export function ReceiptImageModal({
  visible,
  uri,
  onClose,
}: ReceiptImageModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="items-center justify-center flex-1 bg-black/90">
        <Pressable
          onPress={onClose}
          className="absolute z-10 p-2 rounded-full top-14 right-5 bg-white/20"
          hitSlop={12}
        >
          <MaterialCommunityIcons name="close" size={24} color="#fff" />
        </Pressable>

        <Image
          source={{ uri }}
          style={{ width: "90%", height: "70%" }}
          contentFit="contain"
          transition={200}
        />
      </View>
    </Modal>
  );
}
