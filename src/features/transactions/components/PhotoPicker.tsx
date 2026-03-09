import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";

import { persistReceipt } from "@/lib/receipts";

interface ReceiptPhotoPickerProps {
  /** Current image URI, or undefined if no photo selected. */
  readonly value?: string;
  /** Called with the new URI or undefined when removed. */
  readonly onChange: (uri: string | undefined) => void;
}

/**
 * Receipt photo picker with camera + gallery options.
 * Handles camera permissions, including deep-linking to Settings when denied.
 */
export function PhotoPicker({ value, onChange }: ReceiptPhotoPickerProps) {
  const handleTakePhoto = useCallback(async () => {
    const { status, canAskAgain } =
      await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      if (!canAskAgain) {
        Alert.alert(
          "Camera Permission",
          "Camera access was denied. Please enable it in Settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ],
        );
      } else {
        Alert.alert(
          "Camera Permission",
          "Camera access is needed to take receipt photos.",
        );
      }
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const permanent = await persistReceipt(result.assets[0].uri);
      onChange(permanent);
    }
  }, [onChange]);

  const handlePickFromGallery = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const permanent = await persistReceipt(result.assets[0].uri);
      onChange(permanent);
    }
  }, [onChange]);

  if (value) {
    return (
      <View className="relative">
        <Image
          source={{ uri: value }}
          style={{ height: 160 }}
          className="rounded-lg"
          contentFit="cover"
        />
        <View className="absolute flex-row gap-2 top-2 right-2">
          <Pressable
            onPress={handleTakePhoto}
            className="items-center justify-center w-8 h-8 rounded-full bg-black/50"
          >
            <MaterialCommunityIcons
              name="camera-retake-outline"
              size={16}
              color="#ffffff"
            />
          </Pressable>
          <Pressable
            onPress={() => onChange(undefined)}
            className="items-center justify-center w-8 h-8 rounded-full bg-black/50"
          >
            <MaterialCommunityIcons name="close" size={16} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row gap-2">
      <Pressable
        onPress={handleTakePhoto}
        className="flex-1 flex-row items-center gap-2 rounded-lg border border-gray-200 border-dashed bg-gray-50 px-3 py-4 justify-center"
      >
        <MaterialCommunityIcons
          name="camera-outline"
          size={18}
          color="#9ca3af"
        />
        <Text className="text-sm text-gray-400">Camera</Text>
      </Pressable>
      <Pressable
        onPress={handlePickFromGallery}
        className="flex-1 flex-row items-center gap-2 rounded-lg border border-gray-200 border-dashed bg-gray-50 px-3 py-4 justify-center"
      >
        <MaterialCommunityIcons
          name="image-outline"
          size={18}
          color="#9ca3af"
        />
        <Text className="text-sm text-gray-400">Gallery</Text>
      </Pressable>
    </View>
  );
}
