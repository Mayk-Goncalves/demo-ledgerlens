import { View } from "react-native";

/** Dashed horizontal rule mimicking a receipt tear/separator. */
export function ReceiptDivider() {
  return (
    <View className="py-4">
      <View className="border-b border-gray-300 border-dashed" />
    </View>
  );
}
