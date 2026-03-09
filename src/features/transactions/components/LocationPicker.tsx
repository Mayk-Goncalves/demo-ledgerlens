import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import type { TransactionLocation } from "@/types/transaction";

interface LocationPickerProps {
  /** Current location value, or undefined if not set. */
  readonly value?: TransactionLocation;
  /** Called with the updated location or undefined when cleared. */
  readonly onChange: (location: TransactionLocation | undefined) => void;
}

/** Format coordinates to a compact display string. */
function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/**
 * Combined place name input + GPS capture.
 * The text field accepts a manual store/place name. The GPS button
 * captures coordinates alongside it. Prepares for future Places API
 * integration where the text input becomes a search field.
 */
export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);

  const handlePlaceNameChange = useCallback(
    (text: string) => {
      const trimmed = text.length === 0 ? undefined : text;
      if (!trimmed && !value?.latitude) {
        // Both empty — clear entirely
        onChange(undefined);
        return;
      }
      onChange({ ...value, placeName: trimmed });
    },
    [value, onChange],
  );

  const handleGetLocation = useCallback(async () => {
    setLoading(true);
    try {
      const { status, canAskAgain } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        if (!canAskAgain) {
          Alert.alert(
            "Location Permission",
            "Location access was denied. Please enable it in Settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ],
          );
        } else {
          Alert.alert(
            "Location Permission",
            "Location access is needed to tag your transaction.",
          );
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      onChange({
        ...value,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      Alert.alert("Location Error", "Could not get your current location.");
    } finally {
      setLoading(false);
    }
  }, [value, onChange]);

  const handleClearCoords = useCallback(() => {
    if (!value?.placeName) {
      onChange(undefined);
    } else {
      onChange({ placeName: value.placeName });
    }
  }, [value, onChange]);

  const hasCoords = value?.latitude != null && value?.longitude != null;

  return (
    <View className="gap-1.5">
      {/* Place name input + GPS button */}
      <View className="flex-row items-center gap-2">
        <View className="flex-1 flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
          <MaterialCommunityIcons
            name="store-outline"
            size={16}
            color="#9ca3af"
            style={{ marginRight: 8 }}
          />
          <TextInput
            className="flex-1 p-0 text-sm text-gray-900"
            placeholder="e.g. Costco, Amazon…"
            placeholderTextColor="#9ca3af"
            value={value?.placeName ?? ""}
            onChangeText={handlePlaceNameChange}
            maxLength={100}
          />
        </View>
        <Pressable
          onPress={handleGetLocation}
          disabled={loading}
          className={`items-center justify-center rounded-lg border px-3 py-2.5 ${
            hasCoords
              ? "border-emerald-400 bg-emerald-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#9ca3af" />
          ) : (
            <MaterialCommunityIcons
              name={hasCoords ? "map-marker" : "map-marker-outline"}
              size={18}
              color={hasCoords ? "#059669" : "#9ca3af"}
            />
          )}
        </Pressable>
      </View>

      {/* Coordinates subtitle when GPS is captured */}
      {hasCoords && (
        <View className="flex-row items-center gap-1 px-1">
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={12}
            color="#9ca3af"
          />
          <Text className="flex-1 text-xs text-gray-400">
            {formatCoords(value.latitude!, value.longitude!)}
          </Text>
          <Pressable onPress={handleClearCoords} hitSlop={8}>
            <MaterialCommunityIcons name="close" size={14} color="#9ca3af" />
          </Pressable>
        </View>
      )}
    </View>
  );
}
